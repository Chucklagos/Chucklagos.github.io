---
title: "How to Install and Configure CSF and LFD on Ubuntu with cPanel/WHM"
description: "Install cpanel-csf from verified repositories, test service-specific firewall rules, configure LFD alerts, and plan targeted recovery."
tags: ["Linux", "Infrastructure", "Security", "Ubuntu", "cPanel", "CSF"]
draft: false
updated: 2026-11-08
---
A hosting server needs a firewall policy that matches its actual services. CSF manages packet-filtering rules; its Login Failure Daemon (LFD) monitors configured logs and can respond to repeated authentication failures. Neither replaces application patching or malware scanning.

This lab covers Ubuntu Server 24.04 with an already supported cPanel/WHM installation. The current cPanel-maintained CSF package is `cpanel-csf`; availability depends on the installed cPanel version and configured repositories. Check the [Ubuntu requirements](https://docs.cpanel.net/installation-guide/system-requirements-ubuntu/) and [official CSF installation procedure](https://docs.cpanel.net/knowledge-base/third-party/how-to-install-csf/) before proceeding.

## Prerequisites and maintenance window

You need a tested [sudo administrator and console](/blog/ubuntu-admin-user/), working [SSH keys](/blog/ubuntu-ssh-ed25519/), a configuration backup, and an inventory of hosting services. Use a lab clone first if another firewall already manages the host.

> Keep the provider console open. Installing a firewall package can change filtering before your final configuration. A surviving SSH session does not prove that new connections will work.

CSF is a firewall manager. LFD adds log-driven detection. cPHulk protects supported authentication services. ImunifyAV scans files. Their responsibilities overlap only partially.

## Step 1: Inventory listeners and firewall managers

```bash
sudo ss -lntup
sudo systemctl is-active ufw firewalld nftables
sudo iptables --version
sudo ip6tables --version
sudo update-alternatives --display iptables
sudo nft list ruleset
```

`ss` shows listening sockets and processes. Service checks can legitimately return inactive or not found; that is not evidence that no filtering exists. Inspect provider security groups, persistent-rule loaders, container networking, and any Imunify360 firewall integration as well.

`iptables-nft` uses the iptables command interface with the nf_tables kernel backend; `iptables-legacy` uses the older backend. Native `nft` rules and iptables-nft rules can coexist in the same framework, but independent managers may overwrite rules or create unexpected ordering. Legacy rules can form a separate filtering path. **Do not switch alternatives as a troubleshooting shortcut.**

For background, see [Ubuntu's iptables manual](https://manpages.ubuntu.com/manpages/noble/man8/iptables.8.html) and the [nftables project documentation](https://wiki.nftables.org/wiki-nftables/index.php/Main_Page).

cPanel documents a conflict with firewalld. Do not run CSF alongside firewalld or another independently managed host firewall. If a conflicting manager is present, stop here and prepare a console-backed migration that translates its rules and preserves protection. This tutorial does not prescribe disabling or uninstalling the existing firewall remotely.

## Step 2: Back up the existing policy

In a root shell opened with `sudo -i`:

```bash
umask 077
firewall_backup=$(mktemp -d /root/firewall-before-csf.XXXXXX)
iptables-save > "$firewall_backup/iptables.v4"
ip6tables-save > "$firewall_backup/iptables.v6"
nft list ruleset > "$firewall_backup/nftables.txt"
cp -a /etc/ssh "$firewall_backup/ssh"
```

These export the selected iptables backends and the nftables ruleset into a unique protected directory. Check each command's exit status and files before continuing. If both legacy and nft variants contain rules, export both with their explicit `*-save` commands where installed. Copy the active manager's configuration separately, and back up `/etc/csf/` if CSF already exists.

Record provider firewall rules outside the VPS. Exit the root shell when finished. These exports are recovery evidence, not a universal restore script: blindly restoring a snapshot can conflict with later container, panel, or dynamic firewall state.

## Step 3: Verify the repository package before installing

```bash
sudo apt update
apt-cache policy cpanel-csf
apt-cache show cpanel-csf
sudo apt-get --simulate install cpanel-csf
```

Confirm a candidate version, the intended official cPanel repository origin, and a reasonable dependency plan. If no candidate exists, do not add a random repository or use an old download script. Check the installed cPanel release and the current vendor instructions first.

Only after those checks:

```bash
sudo apt install cpanel-csf
sudo csf -v
sudo csf --help
sudo perl /usr/local/csf/bin/csftest.pl
```

The test script checks relevant kernel/iptables capabilities; it does not certify your port policy. Confirm the script's packaged path if it differs. Use WHM → Plugins → ConfigServer Security & Firewall to inspect the installation. Keep the installed `/etc/csf/csf.conf` comments as the version-specific reference.

## Step 4: Review TESTING and port policy

Back up `/etc/csf/` before edits. In `/etc/csf/csf.conf`, confirm:

```ini
TESTING = "1"
```

Testing mode schedules periodic rule clearing to reduce lockout risk; inspect `TESTING_INTERVAL` and its scheduled mechanism on your version. It temporarily weakens enforcement and is not a production operating mode or a substitute for console access.

Do not copy a complete port list from another server. Build a service matrix:

| Service | Typical port/protocol | Decision |
| --- | --- | --- |
| SSH | TCP 22, or your configured port | Preserve new administrator connections. |
| WHM over TLS | TCP 2087 | Confirm access from the administration network. |
| Websites | TCP 80 and 443 | Permit only if hosting HTTP/HTTPS. |
| cPanel and Webmail over TLS | TCP 2083 and 2096 | Include when users need these interfaces. |
| Authoritative DNS | TCP and UDP 53 | Needed inbound only when serving DNS. |
| Mail and FTP | Depends on enabled roles | Inventory submission, delivery, retrieval, and passive FTP ranges. |

For the full dependency list consult [cPanel's firewall requirements](https://docs.cpanel.net/knowledge-base/general-systems-administration/how-to-configure-your-firewall-for-cpanel-services/). Outbound DNS, HTTPS updates, mail delivery, backups, license checks, monitoring, and time synchronization also need consideration.

Example **only for a reduced lab with SSH, websites, and WHM**, not a complete cPanel host:

```ini
TCP_IN = "22,80,443,2087"
TCP6_IN = "22,80,443,2087"
UDP_IN = ""
UDP6_IN = ""
```

An empty inbound UDP list is inappropriate for an authoritative DNS server. IPv6 needs its own verified policy and ICMPv6 behavior; do not assume IPv4 settings protect IPv6. Review CSF's `IPV6` setting and actual IPv6 connectivity.

Set `TCP_OUT`, `UDP_OUT`, `TCP6_OUT`, and `UDP6_OUT` from the outbound inventory. For example, DNS lookups normally need UDP and TCP 53; a server using NTP may need UDP 123. Opening TCP 443 alone does not cover these. Validate backup endpoints, nonstandard ports, and FTP behavior before restricting outbound traffic.

## Step 5: Apply a test and verify fresh connections

```bash
sudo csf -r
sudo csf -l
sudo csf -l6
```

These reload and inspect IPv4/IPv6 rules; consult `csf --help` if the installed release differs. Immediately test a new SSH connection and a new WHM session at `https://192.0.2.10:2087` using your actual lab endpoint and valid certificate hostname. Do not bypass certificate verification. Test while rules are active, before the testing timer clears them.

Verify websites, DNS, mail, backups, updates, and IPv6 where used. Test denied access only against your own lab and avoid repeated authentication failures. A port appearing in `TCP_IN` does not prove provider-level access or correct service binding.

## Step 6: Enable permanent enforcement and LFD

Only when fresh SSH and WHM connections work, set:

```ini
TESTING = "0"
LF_DAEMON = "1"
LF_ALERT_TO = "security@example.com"
```

The recipient is a documentation placeholder. Replace it with a monitored mailbox, preferably outside this host. Alert delivery also depends on enabled alert types and a working mail transport.

```bash
sudo csf -r
sudo systemctl restart lfd
sudo systemctl status lfd --no-pager
sudo journalctl -u lfd --since '-10 minutes' --no-pager
sudo tail -n 50 /var/log/lfd.log
```

Review the installed log location if it differs. LFD deliberately refuses to run with `TESTING` enabled, as shown in the [maintained LFD source](https://github.com/cpanel/cpanel-csf/blob/main/lfd.pl). After leaving testing mode, a failure needs investigation: inspect `LF_DAEMON`, `/etc/csf/csf.error`, log paths, dependencies, and backend compatibility.

Send an end-to-end test through the panel's available mail-testing facility or an already configured mail client. Verify receipt and transport logs; an address in `LF_ALERT_TO` alone is insufficient. Tune login thresholds against legitimate behavior, especially shared NAT users and automation.

## Syslog integrity and RESTRICT_SYSLOG

LFD decisions can depend on messages written to syslog. Untrusted local processes may inject misleading messages, so access to the logging socket and trusted logging pipeline matters.

Review `RESTRICT_SYSLOG`, `RESTRICT_SYSLOG_GROUP`, and related comments in the **installed** CSF configuration. Modes and group handling need version-specific review; do not copy a numeric setting without checking its meaning. Test mail, database, panel, and application logging after a change. Do not add website users to a privileged logging group simply to suppress errors. Restricting syslog access is separate from preventing privileged alteration of stored logs.

## Targeted recovery and troubleshooting

If a change blocks access, use the provider console. Inspect `csf -g` with your actual source address, the relevant allow/deny files, and temporary blocks. For example, with documentation addresses:

```bash
sudo csf -g 192.0.2.20
```

Use the installed `csf --help` to choose the specific permanent or temporary unblock command. Remove only a confirmed erroneous block; then correct the policy or restore the known-good `/etc/csf/` backup and reload. A missing SSH port requires fixing the port configuration, not merely removing an IP block. Check cPHulk and provider rules separately.

Do not use blanket `iptables -F`, `nft flush ruleset`, or firewall shutdown as a standard recovery procedure. If the rules look correct but services fail, inspect listener addresses, IPv6, outbound dependencies, and conflicting managers.

## Conclusion

A useful firewall policy is one you can explain, test, monitor, and recover. Retest fresh administrative connections after every change, keep LFD out of testing mode for normal operation, and review alerts regularly. Add [WHM account protections](/blog/cpanel-whm-hardening/) and [Auditd](/blog/linux-auditd-critical-changes/), or return to the [roadmap](/blog/ubuntu-server-hardening/).

## Official references

The cPanel installation, system requirements, service ports, Ubuntu iptables, nftables, and maintained LFD references are linked at their corresponding steps. For version-dependent CSF options, consult the comments and documentation shipped with the verified `cpanel-csf` package.
