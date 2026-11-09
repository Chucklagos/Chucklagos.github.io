---
title: "How to Use ImunifyAV and Prepare Safe Website Migrations"
description: "Verify ImunifyAV, update malware signatures, review scans, and restore PHP applications in a controlled environment with original backups preserved."
tags: ["Linux", "Infrastructure", "Security", "cPanel", "ImunifyAV"]
draft: false
updated: 2026-11-08
---
A malware scan is one input to a migration decision. It can identify known malicious patterns, but it cannot establish that every file, database row, credential, or runtime behavior is trustworthy.

This lab describes a cautious workflow for supported Ubuntu Server 24.04 and cPanel installations. `weblab` is a fictional website account. The examples inspect and scan files; they do not describe an actual incident or authorize automatic deletion.

## Prerequisites and product boundaries

Confirm operating-system, panel, architecture, and license support against the [ImunifyAV requirements](https://docs.imunify360.com/imunifyav/). You need sudo, available disk space, an installed supported agent, and a protected staging environment. Do not install an additional agent over an existing Imunify360 installation.

ImunifyAV focuses on malware scanning. AV+ adds licensed capabilities such as cleanup; Imunify360 provides a broader security suite, including additional traffic and runtime protections depending on platform and license. Do not assume the free scanner provides those layers. Review the [product documentation](https://docs.imunify360.com/) for the current feature matrix.

> Preserve an original backup before scanning or changing settings. Confirm that automatic cleanup and integration hooks are not enabled in the product actually installed. A scan-only procedure can coexist with separate automation that changes files.

## Step 1: Verify installation and agent health

```bash
command -v imunify-antivirus
sudo imunify-antivirus version
sudo systemctl status imunify-antivirus --no-pager
sudo journalctl -u imunify-antivirus --since '-30 minutes' --no-pager
```

The commands locate the CLI, report its version, and inspect service state and recent diagnostics. On a typical ImunifyAV installation the service is `imunify-antivirus`; verify actual installed units if the name differs. An installed CLI does not prove the agent is healthy or registered correctly.

```bash
dpkg-query -W imunify-antivirus
systemctl list-unit-files 'imunify*'
sudo imunify-antivirus --help
```

If the package is missing or the agent fails, stop and consult the vendor's installation workflow for the exact panel and OS. Do not execute an installer copied from an unrelated distribution. Imunify360 uses a different agent CLI; do not substitute commands blindly.

## Step 2: Update software and malware signatures

For an already installed APT package from the verified vendor repository:

```bash
sudo apt update
apt-cache policy imunify-antivirus
sudo apt-get install --only-upgrade imunify-antivirus
sudo imunify-antivirus update sign
```

Review the candidate package and repository origin first. Package updates and signature updates are separate operations; inspect errors from both. Confirm service health again after an upgrade. Do not enable a beta repository or force a rollout simply because another server has a newer release. See [ImunifyAV update instructions](https://docs.imunify360.com/imunifyav/#update-instructions).

## Step 3: Start a scoped scan and query results

First inspect the installed syntax:

```bash
sudo imunify-antivirus malware on-demand --help
sudo imunify-antivirus malware malicious list --help
```

Then scan a controlled account path:

```bash
sudo imunify-antivirus malware on-demand start --path /home/weblab/public_html/
sudo imunify-antivirus malware on-demand status
sudo imunify-antivirus malware on-demand list
sudo imunify-antivirus malware malicious list --user weblab --limit 500
```

The commands request a scan, inspect its state and history, and list detections for the account. The [official CLI reference](https://docs.imunify360.com/imunifyav/cli/) documents these commands and optional resource-intensity controls. Use installed help if your release differs.

A successful start response is not a completed scan. Record the scan ID, scope, completion state, errors, exclusions, and signature-update result. More than 500 results require the pagination supported by your version. Inspect skipped files and resource limits rather than assuming an empty result covers the whole account.

Schedule large scans outside busy hours and measure disk/CPU impact. Scanning only `public_html` omits files elsewhere in the account and does not validate database content.

## Step 4: Review detections without destructive cleanup

For each result, record its path, hash, classification, scan ID, and status in a restricted review log. Compare it with a clean upstream release or a trusted source-control revision. Inspect suspicious code as text in an isolated environment; do not execute it or open a suspected PHP file through the web server.

A detection may represent malicious code, a dual-use administration tool, or a false positive. Preserve the original before deciding to replace or remove anything. Avoid broad ignore rules. If a vendor submission is necessary, first review whether the file contains credentials or personal data; do not upload private content without authorization.

Automatic deletion can destroy application functionality and useful evidence. Availability of cleanup, quarantine, and restore actions changes by edition and version; this workflow intentionally uses no cleanup command.

## Step 5: Preserve original files and database exports

Prefer a complete cPanel account backup through its supported backup tools, with a tested restoration procedure. Store an encrypted copy outside the source VPS with restricted access. A filesystem archive alone does not capture databases, panel metadata, mail configuration, or changing files consistently.

For a supplemental snapshot of a **quiesced lab directory**, open a root shell and run:

```bash
umask 077
migration_backup=$(mktemp -d /root/migration-original.XXXXXX)
tar --acls --xattrs --numeric-owner -cpf "$migration_backup/weblab-public-html.tar" -C /home/weblab public_html
sha256sum "$migration_backup/weblab-public-html.tar" > "$migration_backup/SHA256SUMS"
tar -tf "$migration_backup/weblab-public-html.tar" | head
```

`tar` stores the selected files and metadata without deleting originals; the checksum detects later archive changes. A hash is not proof that the contents were safe when collected. Review archive warnings and verify extraction into a separate lab directory. Leave the root shell after completing the backup.

Export databases using cPanel's backup tools or the installed MySQL/MariaDB tooling with an appropriately scoped account. Avoid command-line passwords. Transaction-consistent options depend on storage engines, concurrent schema changes, and database version; plan quiescence or the correct backup strategy before calling an export consistent.

## Step 6: Restore into a controlled staging account

1. Create a separate cPanel staging account with a supported PHP version and a dedicated database user limited to its database.
2. Extract and inspect backup contents in a nonpublic directory. Check archive paths and symlinks before privileged extraction. Map ownership to the destination account rather than assuming source numeric IDs match.
3. Obtain application core, dependencies, plugins, and themes from trusted releases or source control. Restore only reviewed uploads and required configuration from the original.
4. Import the database into staging. Inspect unexpected administrators, scheduled application tasks, injected scripts, URLs, and serialized data with application-aware tools.
5. Replace environment-specific credentials and paths. Keep secrets outside public directories where the application supports it; review `.env`, `.htaccess`, `.user.ini`, and PHP prepend/append settings.
6. Review Unix permissions, PHP-FPM account identity, cron entries, SSH keys, and mail configuration. Limit writable paths and disable execution in upload areas through a tested server policy.

Keep staging inaccessible to ordinary visitors and search engines with actual access controls. Prevent real email delivery, payment requests, webhooks, and scheduled tasks from firing during tests. `robots.txt` is not an access control.

For database imports, account backups, and application repairs, use procedures that match the installed versions. There is no safe universal command that sanitizes every PHP application or database.

## Step 7: Validate before switching traffic

Run a fresh scan over the restored scope, then test login, upload handling, forms, background jobs, and database writes. Review logs and compare deployed files with the trusted baseline. Verify that the staging account has no sudo and uses the intended [WHM isolation settings](/blog/cpanel-whm-hardening/).

Prepare cutover and rollback together: document the last consistent backup, planned write freeze, DNS TTL, certificate validation, final data synchronization, and how writes will be handled if rollback becomes necessary. Preserve the original backup separately from the working restore. Monitor after cutover; do not discard the old copy immediately.

## Troubleshooting and limitations

| Problem | Response |
| --- | --- |
| Signature update fails | Inspect DNS, outbound HTTPS, repository access, disk space, and agent logs before retrying. |
| Scan remains queued or fails | Review service health, resource limits, scan status, and the selected path. |
| Results are unexpectedly empty | Verify completion, exclusions, permissions, scope, and pagination. |
| Scanner flags a required file | Compare with trusted source and review safely; do not automatically delete or ignore it. |
| Restored app fails | Check PHP compatibility, extensions, database grants, paths, and ownership before changing permissions. |

No detections means only that the selected scan found nothing under its current capabilities and scope. Unknown malware, database payloads, stolen credentials, and runtime behavior may remain outside that conclusion. Combine scanning with patching, [Auditd](/blog/linux-auditd-critical-changes/), least privilege, and verified backups.

## Conclusion

A safe migration preserves the original, uses a controlled restore, verifies application behavior, and keeps rollback possible. ImunifyAV supports that review but does not replace it. Use the [hardening roadmap](/blog/ubuntu-server-hardening/) to connect scanning with access control and monitoring.

## Official references

- ImunifyAV requirements, update instructions, and CLI reference are linked above.
- [cPanel: Backup Restoration](https://docs.cpanel.net/whm/backup/backup-restoration/).
- [Imunify360 documentation](https://docs.imunify360.com/) for edition-specific controls and supported environments.
