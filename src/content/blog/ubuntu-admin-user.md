---
title: "How to Create an Administrator User on Ubuntu Server and Stop Using Root"
description: "Create a named sudo administrator on Ubuntu Server 24.04, verify access, and prepare recovery before restricting root SSH logins."
tags: ["Linux", "Infrastructure", "Security", "Ubuntu"]
draft: false
updated: 2026-11-08
---
Using root for every SSH session makes routine mistakes more consequential and makes shared administrative activity harder to attribute. A named administrator lets you work without elevated privileges and request them for individual tasks.

This lab uses Ubuntu Server 24.04 LTS. `adminlab` is a fictional administrator and `192.0.2.10` is a documentation address. Replace examples only in your own environment. This is a configuration exercise, not an account of a security incident.

## Prerequisites and recovery plan

You need an existing root session or a working sudo administrator, SSH access, and access to the VPS provider's console. Confirm how the console authenticates: some providers require a local password; others offer a rescue environment with a separate workflow.

> Keep the original administrative session open. Do not change SSH authentication, remove users, or lock root until a separate connection with the new administrator succeeds.

On a cPanel server, create this as a system administrator, separately from website accounts. The Ubuntu `sudo` group does not automatically grant a user WHM reseller privileges or a WHM login.

## Step 1: Create a named user

From an existing sudo session:

```bash
sudo adduser adminlab
```

`adduser` creates the account, home directory, and primary group, and prompts interactively for a password and optional profile details. Use a unique password stored in a password manager. Do not put passwords in shell commands or scripts.

If the initial session is root, omit `sudo` from the administrative commands in this article. If the name already exists, inspect it with `getent passwd adminlab` rather than reusing an unfamiliar account.

## Step 2: Grant administrative privileges

```bash
sudo usermod -aG sudo adminlab
id adminlab
getent group sudo
```

`-aG` appends a supplementary group without removing other memberships. Omitting `-a` can replace existing supplementary groups. `id` should include `sudo`; numeric user and group IDs vary. `getent` queries the configured account database rather than assuming all identities are local files.

Ubuntu normally includes a sudoers rule for the `sudo` group. Verify the actual policy:

```bash
sudo visudo -c
sudo -l -U adminlab
```

The first command checks sudoers syntax. The second lists the target user's permitted commands and must be run by an authorized administrator. Group membership alone does not prove that an altered sudoers policy grants access.

## Step 3: Test a new SSH connection

From another terminal on your workstation:

```bash
ssh adminlab@192.0.2.10
```

Verify the server host-key fingerprint through the provider console or another trusted channel before accepting it. Use `-p` with the actual port if SSH is not listening on 22. If password SSH is already disabled, install the administrator's public key using the existing session as described in the [SSH key tutorial](/blog/ubuntu-ssh-ed25519/).

In the new remote session:

```bash
whoami
id
sudo -k
sudo -v
sudo -l
sudo whoami
```

`whoami` should report `adminlab`, and `sudo whoami` should report `root`. These are expected results, not captured lab output. `sudo -k` invalidates cached credentials; `sudo -v` verifies that authorization works with a fresh prompt. A new login also refreshes supplementary groups.

## Step 4: Use sudo deliberately

```bash
sudo systemctl status ssh --no-pager
```

This runs only the service inspection with elevated privileges. For a short sequence that genuinely needs a root login environment:

```bash
sudo -i
whoami
exit
```

`sudo -i` opens a root login shell. Leave it with `exit` when finished; commands inside that shell remain privileged. Prefer individual `sudo` commands for everyday maintenance. Do not add unrestricted `NOPASSWD` rules merely to avoid prompts.

Named accounts improve attribution, but sudo logging is not a complete record of every action inside a root shell. Add [Auditd monitoring](/blog/linux-auditd-critical-changes/) and off-host logs when stronger evidence is needed.

## Step 5: Restrict root SSH only after verification

Follow [SSH hardening with ED25519](/blog/ubuntu-ssh-ed25519/) to install keys, validate effective configuration, and set `PermitRootLogin no`. This prevents direct root SSH authentication; it does not delete root, remove sudo, or change WHM's separate authentication.

Do not run `passwd -l root` as a substitute for an SSH policy. Password locking has different effects and can affect recovery. Keep emergency access documented and restrict provider-console credentials with multifactor authentication.

## Troubleshooting and recovery

| Symptom | Check and remedy |
| --- | --- |
| User is not in the sudoers file | Inspect `id adminlab`, start a fresh login, and check `sudo -l -U adminlab` from the original session. |
| SSH rejects the password | Password authentication may already be disabled. Install a public key rather than weakening the working policy. |
| Sudo reports a syntax error | Use the original session or provider console and repair with `visudo`; never edit sudoers blindly. |
| All remote sessions fail | Use the provider console to inspect the account, SSH configuration, service, and firewall. If necessary, follow the provider's rescue-disk procedure. |

A console is useful only if you have tested its availability and know its authentication requirements. Keep an encrypted backup of relevant configuration and a record of administrative account ownership outside the VPS.

## Verification and conclusion

Before closing the original session, confirm a fresh SSH login, fresh sudo authorization, and access to the recovery console. Use separate named administrators for different people and review sudo membership periodically.

The result is a practical separation between ordinary work and privileged maintenance. Continue with [ED25519 keys](/blog/ubuntu-ssh-ed25519/) and the [complete hardening roadmap](/blog/ubuntu-server-hardening/).

## Official references

- [Ubuntu: user management](https://ubuntu.com/server/docs/how-to/security/user-management/).
- [Ubuntu: sudo manual](https://manpages.ubuntu.com/manpages/noble/man8/sudo.8.html).
- [Ubuntu: usermod manual](https://manpages.ubuntu.com/manpages/noble/man8/usermod.8.html).
