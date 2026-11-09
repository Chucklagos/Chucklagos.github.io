---
title: "How to Monitor Critical Linux Changes with Auditd"
description: "Build persistent Ubuntu Auditd rules for identities, SSH, sudo, cron, and systemd, then interpret events and monitor log capacity."
tags: ["Linux", "Infrastructure", "Security", "Ubuntu", "Auditd"]
draft: false
updated: 2026-11-08
---
Linux Audit Framework collects kernel audit events and records activity that matches configured rules. `auditd` writes those events to local logs. This makes it useful for investigating who changed sensitive configuration, provided rules were active and events were retained.

This Ubuntu Server 24.04 lab monitors a small set of critical paths. It uses fictional accounts and a harmless test directory; it does not simulate a real compromise.

## Prerequisites

You need sudo, available disk space, a kernel that supports audit, and a maintenance window. Containers may lack the required kernel access even when packages install successfully. Keep a separate administrative session and provider-console access while changing persistent rules.

Inspect existing policy before adding rules. An immutable audit configuration (`enabled 2`) requires a planned reboot to change; do not try to bypass it.

## Step 1: Install and inspect the service

```bash
sudo apt update
sudo apt install auditd audispd-plugins
sudo systemctl enable --now auditd
sudo systemctl status auditd --no-pager
sudo auditctl -s
sudo auditctl -l
```

`auditctl -s` shows kernel audit status; `-l` lists loaded rules. `audispd-plugins` supplies optional event-dispatch plugins, but installing it does not configure remote forwarding. Confirm the actual packages and service startup on the host.

`auditctl` manages runtime rules, `augenrules` assembles persistent rule files, and `ausearch` queries recorded events. See the [Ubuntu auditd manual](https://manpages.ubuntu.com/manpages/noble/man8/auditd.8.html).

## Step 2: Prepare a persistent policy

Back up `/etc/audit/` into a protected, unique directory. Inspect it for existing rules, ordering, exclusions, and a final immutable directive. Create `/etc/audit/rules.d/50-critical-changes.rules` with `sudoedit`:

```text
-w /etc/passwd -p wa -k identity_changes
-w /etc/shadow -p wa -k identity_changes
-w /etc/group -p wa -k identity_changes
-w /etc/gshadow -p wa -k identity_changes
-w /etc/sudoers -p wa -k privilege_changes
-w /etc/sudoers.d/ -p wa -k privilege_changes
-w /etc/ssh/sshd_config -p wa -k ssh_changes
-w /etc/ssh/sshd_config.d/ -p wa -k ssh_changes
-w /etc/crontab -p wa -k schedule_changes
-w /etc/cron.d/ -p wa -k schedule_changes
-w /etc/systemd/system/ -p wa -k service_changes
```

`-w` watches a path, `-p wa` selects writes and attribute changes, and `-k` attaches a searchable key. Verify every path exists before loading. Directory watches include their subtree but do not automatically cover separate mounted filesystems. Add the daily, hourly, weekly, and monthly cron directories and `/var/spool/cron/crontabs/` where they exist. Add `/usr/lib/systemd/system/` if vendor-unit changes are in scope; package upgrades will generate expected events.

This compact lab uses supported watch syntax for readability. The [auditctl manual](https://manpages.ubuntu.com/manpages/noble/man8/auditctl.8.html) marks this style as deprecated in favor of syscall rules. For a larger deployment, use equivalent `-a always,exit` rules with `dir`/`path` and `perm` filters, select architecture correctly, and measure overhead. Do not paste architecture-specific syscall names into an unverified platform.

These rules identify changes; they do not block them, capture file contents, or cover every persistence mechanism.

## Step 3: Monitor SSH authorization files

Once the administrator's `.ssh` directory exists, add:

```text
-w /home/adminlab/.ssh/ -p wa -k authorized_keys_changes
```

Watching the directory helps observe file replacement and creation as well as edits to `authorized_keys`. Add a separate rule for `/root/.ssh/` if it exists and remains relevant. Inventory actual home directories and effective SSH authorization paths first; directory services and `AuthorizedKeysCommand` require a different scope.

Do not watch all of `/home` recursively without estimating volume. A home-directory rule does not cover keys stored on a separate filesystem elsewhere.

## Step 4: Assemble and load the rules

```bash
sudo chmod 640 /etc/audit/rules.d/50-critical-changes.rules
sudo chown root:root /etc/audit/rules.d/50-critical-changes.rules
sudo augenrules --check
sudo augenrules --load
sudo auditctl -l
```

`--check` reports whether the generated rule file needs updating; it is **not** a complete syntax validation. `--load` assembles and loads the policy. Check its errors and compare loaded rules with your file. Files must end in `.rules`; ordering is significant. See [augenrules](https://manpages.ubuntu.com/manpages/noble/man8/augenrules.8.html).

Do not add `-D` to erase an existing policy or `-e 2` to make a first experiment immutable. A load error can leave a partial policy, so inspect the actual loaded rules before declaring success.

## Step 5: Generate harmless CREATE and DELETE events

Create a dedicated directory and add a temporary runtime watch:

```bash
sudo install -d -m 700 /var/lib/audit-lab
sudo auditctl -w /var/lib/audit-lab/ -p wa -k lab_file_changes
sudo touch /var/lib/audit-lab/probe.txt
sudo rm -- /var/lib/audit-lab/probe.txt
sudo ausearch -k lab_file_changes -ts recent -i
```

The deletion affects only the empty test file just created. Do not test by editing `/etc/shadow`, sudoers, or active SSH configuration. The runtime watch is not persistent; remove only this watch after the exercise:

```bash
sudo auditctl -W /var/lib/audit-lab/ -p wa -k lab_file_changes
sudo rmdir /var/lib/audit-lab
```

`ausearch -i` interprets numeric fields for readability. Its [manual](https://manpages.ubuntu.com/manpages/noble/man8/ausearch.8.html) explains how records sharing an event ID are grouped. Look for `SYSCALL`, `CWD`, `PATH`, and related records with the same timestamp and serial.

In a successful create operation, a relevant `PATH` record can contain `nametype=CREATE`; removal can contain `nametype=DELETE`. These are path classifications, not standalone event types named CREATE and DELETE. Check `success=yes`, the syscall, target path, and associated records. `touch` on an existing file will not represent a new creation. Output varies by kernel, filesystem, and command implementation; no captured output is claimed here.

## Step 6: Attribute changes carefully

```bash
sudo ausearch -k identity_changes -ts today -i
sudo ausearch -k privilege_changes -ts today -i
sudo ausearch -k ssh_changes -ts today -i
```

`uid` is the real user ID of the process; `euid` is its effective identity used for many permission checks; `auid` is the login audit identity. A command run through sudo may have root process credentials while retaining the original login user's `auid`. Services without a login identity may show an unset audit ID.

Do not infer a human solely from `euid=0`. Correlate login session, executable, command context, time, and authorized maintenance. Interpreted usernames reflect the current account database; retain raw records for reliable long-term analysis.

## Step 7: Rotate logs and monitor pressure

Back up `/etc/audit/auditd.conf`. A modest **example**, requiring capacity planning:

```ini
max_log_file = 50
num_logs = 10
max_log_file_action = ROTATE
```

`max_log_file` is measured in MiB; these settings retain roughly a bounded set of local files, not a guaranteed time window. Configure `space_left`, `admin_space_left`, and low-space/error actions for your availability and retention requirements. Do not copy a halt-on-full policy into a hosting server without understanding its operational impact. See [auditd.conf](https://manpages.ubuntu.com/manpages/noble/man5/auditd.conf.5.html).

On Ubuntu's packaged service, reload supported settings and inspect the journal:

```bash
sudo systemctl reload auditd
sudo journalctl -u auditd --since '-10 minutes' --no-pager
sudo auditctl -s
sudo du -sh /var/log/audit
sudo df -h /var/log/audit
```

Confirm that the installed unit supports reload; some settings require a controlled restart. Track `lost`, `backlog`, and `backlog_limit`. A rising lost counter means audit evidence is incomplete. Check I/O pressure, noisy rules, queue limits, and daemon health before adjusting limits. Do not reset counters just to make status look healthy.

## Troubleshooting and limits

- **No events:** verify rules with `auditctl -l`, the watched path and filesystem, time filters, service state, and any exclusion such as `never,task` or `never,exit`. Review inherited policy before removing an exclusion.
- **Rule loading fails:** look for nonexistent paths, duplicate rules, syntax errors, and immutable status. Correct the source file and inspect the loaded result.
- **Too much noise:** narrow watched directories and distinguish package-maintenance events; avoid blanket collection without retention planning.
- **Logs fill the disk:** preserve evidence, tune scope and rotation, and investigate write volume. Do not delete active logs as a routine fix.

Root-level control can disable collection, alter local logs, or interfere with forwarding. Plan authenticated off-host collection with restricted access and independent retention. Even remote logs cannot recover events that were never collected.

## Conclusion

A small, tested audit policy provides useful evidence about identity, privilege, and persistence changes. Verify it after maintenance and reboots, monitor event loss, and protect copies outside the host. Combine it with [SSH hardening](/blog/ubuntu-ssh-ed25519/) and [WHM controls](/blog/cpanel-whm-hardening/). The [series guide](/blog/ubuntu-server-hardening/) places these measures in context.

## Official references

The Ubuntu 24.04 manuals for auditd, auditctl, augenrules, ausearch, and auditd.conf are linked in the corresponding steps. The [Linux Audit project](https://github.com/linux-audit/audit-userspace) maintains the userspace tools and additional documentation.
