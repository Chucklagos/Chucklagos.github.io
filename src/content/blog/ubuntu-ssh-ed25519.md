---
title: "How to Secure SSH on Ubuntu Server with ED25519 Keys"
description: "Configure passphrase-protected ED25519 SSH keys, validate Ubuntu SSH snippets, and safely disable password and root logins."
tags: ["Linux", "Infrastructure", "Security", "Ubuntu", "SSH"]
draft: false
updated: 2026-11-08
---
An SSH password is a reusable secret verified by the server. Public-key authentication proves possession of a private key without sending that private key to the server. A passphrase protects the private key at rest; it is different from the remote account password.

This lab targets Ubuntu Server 24.04 and a named administrator, `adminlab`, at the documentation address `192.0.2.10`. The workstation commands run on Linux; server commands are labeled separately.

## Prerequisites and lockout precautions

Create and test a [sudo administrator](/blog/ubuntu-admin-user/) first. You need OpenSSH client tools locally, OpenSSH Server on the VPS, a trusted host-key fingerprint, and provider-console access.

> Keep a working server session open throughout. Test a new connection before disabling any authentication method. Do not change the SSH port and authentication policy in the same maintenance step.

## Step 1: Generate the key on your workstation

```bash
ssh-keygen -t ed25519 -a 64 -f ~/.ssh/id_ed25519_vps_lab -C "vps-lab-admin"
```

Choose a strong passphrase at the interactive prompt. `-t` selects ED25519, `-a` sets private-key derivation rounds, `-f` chooses a distinct filename, and `-C` adds a descriptive comment. Do not overwrite an existing key. ED25519 support can depend on cryptographic policy, including FIPS restrictions; check local requirements before choosing an alternative.

The file without `.pub` is private and stays on your workstation. The `.pub` file is public and can be installed on the server. Never copy the private key into `authorized_keys`, a ticket, or a repository.

```bash
chmod 600 ~/.ssh/id_ed25519_vps_lab
ssh-keygen -lf ~/.ssh/id_ed25519_vps_lab.pub
```

These restrict local private-key access and display its fingerprint. Store an encrypted recovery copy separately from the VPS.

## Step 2: Install the public key

If password access still works, run on the workstation:

```bash
ssh-copy-id -i ~/.ssh/id_ed25519_vps_lab.pub adminlab@192.0.2.10
```

This appends the public key to the remote account's authorized keys. For a custom port, supply `-p` with the actual port.

If password access is unavailable, display the `.pub` file locally and use the existing administrative session or console. On the server:

```bash
sudo install -d -m 700 -o adminlab -g adminlab /home/adminlab/.ssh
sudo touch /home/adminlab/.ssh/authorized_keys
sudo chown adminlab:adminlab /home/adminlab/.ssh/authorized_keys
sudo chmod 600 /home/adminlab/.ssh/authorized_keys
sudo -u adminlab nano /home/adminlab/.ssh/authorized_keys
```

Append the complete public key as one line; preserve existing authorized keys. If `nano` is unavailable, use an installed editor. These paths assume the home directory created by `adduser`; confirm with `getent passwd adminlab`.

```bash
sudo stat -c '%U:%G %a %n' /home/adminlab/.ssh /home/adminlab/.ssh/authorized_keys
sudo namei -l /home/adminlab/.ssh/authorized_keys
```

Expect the account to own `.ssh` with mode `700` and `authorized_keys` with `600`. Parent directories must not be writable by unrelated users. Do not recursively change ownership of an entire home to fix a single file.

## Step 3: Prove key authentication works

From a second workstation terminal:

```bash
ssh -o ControlMaster=no -o ControlPath=none -i ~/.ssh/id_ed25519_vps_lab -o IdentitiesOnly=yes -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no adminlab@192.0.2.10
```

`-i` chooses the private key and `IdentitiesOnly` limits offered identities to configured keys instead of every agent identity. This attempt explicitly excludes password and keyboard-interactive fallback. `ControlPath=none` also prevents reuse of an existing multiplexed session, so authentication is tested again. Verify `sudo -v` after connecting; disabling SSH passwords does not eliminate the password needed by sudo.

Optionally save this workstation configuration in `~/.ssh/config`:

```ssh-config
Host vps-lab
    HostName 192.0.2.10
    User adminlab
    IdentityFile ~/.ssh/id_ed25519_vps_lab
    IdentitiesOnly yes
```

Then connect with `ssh vps-lab`. This is client configuration, not `sshd_config`.

## Step 4: Inspect configuration precedence

On the server:

```bash
sudo cp -a /etc/ssh /root/ssh-before-hardening
sudo grep -RnsE '^[[:space:]]*(Include|Match|PasswordAuthentication|KbdInteractiveAuthentication|PubkeyAuthentication|PermitRootLogin|AuthenticationMethods)' /etc/ssh/sshd_config /etc/ssh/sshd_config.d
```

Use a unique backup destination if that directory already exists. Ubuntu normally includes `sshd_config.d/*.conf` near the beginning of the main file. For most directives, the first obtained value wins; a file called `99-hardening.conf` does not necessarily override an earlier cloud configuration. Inspect `Include` placement and `Match` blocks, too. See the [Ubuntu 24.04 sshd_config manual](https://manpages.ubuntu.com/manpages/noble/man5/sshd_config.5.html).

Cloud images may generate files such as `50-cloud-init.conf`. Review the provisioning source, including `ssh_pwauth` and `disable_root`, rather than assuming a generated file will remain unchanged. Do not rerun cloud-init to test this. Its [module reference](https://docs.cloud-init.io/en/latest/reference/modules.html) documents these controls.

## Step 5: Add and validate the server policy

After checking precedence, create `/etc/ssh/sshd_config.d/00-local-hardening.conf` using `sudoedit`:

```ssh-config
PubkeyAuthentication yes
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
```

This example assumes key-only administration. If SSH uses PAM-based multifactor authentication, disabling keyboard-interactive can break that design; adapt the policy deliberately. Leave `UsePAM` unchanged. Inspect existing `AuthenticationMethods` requirements before proceeding.

```bash
sudo /usr/sbin/sshd -t
sudo /usr/sbin/sshd -T -C user=adminlab,host=workstation.example.com,addr=192.0.2.20 | grep -E '^(pubkeyauthentication|passwordauthentication|kbdinteractiveauthentication|permitrootlogin|authenticationmethods) '
```

`-t` checks syntax and host-key sanity and normally produces no output on success. `-T` prints effective settings; `-C` supplies a hypothetical connection to evaluate matching rules. Substitute the actual account and source context privately, and repeat for other relevant `Match` cases, including root. Add local-address and local-port context if your rules use them.

Expected effective values include `passwordauthentication no`, `kbdinteractiveauthentication no`, and `permitrootlogin no`. Do not reload if validation fails or values differ from your intent.

## Step 6: Reload and verify new sessions

```bash
sudo systemctl reload ssh
sudo systemctl status ssh --no-pager
sudo journalctl -u ssh --since '-10 minutes' --no-pager
```

A configuration reload preserves established sessions. Ubuntu 24.04 can use socket activation; inspect `ssh.socket` if troubleshooting listeners. Changing listening ports or addresses requires additional socket-activation handling and is outside this authentication-only change.

Repeat the key-only connection from Step 3. Also test that password-only access is rejected without repeated guesses:

```bash
ssh -o ControlMaster=no -o ControlPath=none -o PubkeyAuthentication=no -o PreferredAuthentications=password -o NumberOfPasswordPrompts=1 adminlab@192.0.2.10
```

A rejection is expected. Avoid repeated negative tests that trigger [LFD](/blog/csf-lfd-ubuntu-cpanel/) or [cPHulk](/blog/cpanel-whm-hardening/).

## Troubleshooting and recovery

- **Permission denied (publickey):** verify the username, full key line, ownership, home permissions, and effective `AuthorizedKeysFile`. Use `ssh -vv` locally; redact diagnostics before sharing.
- **Too many authentication failures:** use the explicit key and `IdentitiesOnly=yes`; inspect additional identities in client configuration.
- **Passwords still work:** inspect earlier snippets, `Match` rules, keyboard-interactive, and whether the successful test reused a multiplexed connection. Test a genuinely new connection.
- **Reload fails:** keep the old session and fix `sshd -t` errors first. Inspect the journal.
- **Access lost:** use the provider console, repair the specific snippet or restore the known-good configuration, validate, and reload. Check firewall rules separately rather than opening all ports.

## Conclusion and next steps

Key authentication reduces exposure to password guessing, but protecting the workstation and revoking unused keys remain essential. Record who owns each key, test recovery, and monitor changes to `authorized_keys` with [Auditd](/blog/linux-auditd-critical-changes/). Return to the [series roadmap](/blog/ubuntu-server-hardening/) for the next layer.

## Official references

- [Ubuntu: OpenSSH Server](https://ubuntu.com/server/docs/how-to/security/openssh-server/).
- [OpenSSH: ssh-keygen](https://man.openbsd.org/ssh-keygen), [client configuration](https://man.openbsd.org/ssh_config), and [sshd validation options](https://man.openbsd.org/sshd).
- The Ubuntu and cloud-init references linked at the relevant steps above. Use locally installed man pages when versions differ.
