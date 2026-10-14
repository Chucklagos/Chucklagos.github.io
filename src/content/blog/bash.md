---
title: "Linux & Bash Reference"
description: "Practical commands for working efficiently in the Linux terminal, focused on real-world development,\n        troubleshooting, and server usage."
tags: ["Linux", "Bash", "Infrastructure"]
draft: false
---

## Basic navigation

```
pwd
```

Prints the current working directory.

```
ls
```

Lists files and directories.

```
ls -la
```

Lists all files (including hidden) with details.

```
cd directory
```

Changes directory.

```
cd ..
```

Moves up one directory.

```
cd ~
```

Goes to home directory.

## File and directory management

```
touch file.txt
```

Creates an empty file.

```
mkdir folder
```

Creates a directory.

```
mkdir -p parent/child
```

Creates nested directories.

```
cp file.txt copy.txt
```

Copies a file.

```
cp -r dir1 dir2
```

Copies a directory recursively.

```
mv old.txt new.txt
```

Moves or renames files.

```
rm file.txt
```

Deletes a file.

```
rm -r folder
```

Deletes a directory recursively.

```
rm -rf folder
```

**DANGER:** Force deletes without confirmation.

## Viewing file content

```
cat file.txt
```

Prints file content.

```
less file.txt
```

Views file content page by page.

```
head file.txt
```

Shows the first lines of a file.

```
tail file.txt
```

Shows the last lines of a file.

```
tail -f logfile.log
```

Follows a file in real time (logs).

## Searching and finding

```
grep "text" file.txt
```

Searches for text inside a file.

```
grep -r "text" folder
```

Recursive search in directories.

```
find . -name "file.txt"
```

Finds files by name.

```
find . -type f
```

Finds all files.

## Permissions and ownership

```
ls -l
```

Shows permissions and ownership.

```
chmod +x script.sh
```

Makes a file executable.

```
chmod 755 file
```

Sets permissions using numeric mode.

```
chown user:group file
```

Changes file owner and group.

## Processes and system

```
ps
```

Shows running processes.

```
ps aux
```

Lists all processes.

```
top
```

Interactive process viewer.

```
htop
```

Improved process viewer (if installed).

```
kill PID
```

Stops a process by ID.

```
kill -9 PID
```

**Force kills** a process.

## Disk and system info

```
df -h
```

Shows disk usage.

```
du -sh folder
```

Shows folder size.

```
free -h
```

Displays memory usage.

```
uname -a
```

Shows system information.

## Networking

```
ip a
```

Shows network interfaces.

```
ping google.com
```

Tests network connectivity.

```
curl https://example.com
```

Requests a URL from terminal.

```
wget https://example.com/file.zip
```

Downloads a file.

## Redirection and pipes

```
command > file.txt
```

Redirects output to a file (overwrite).

```
command >> file.txt
```

Appends output to a file.

```
command1 | command2
```

Pipes output of one command into another.

```
grep "error" log.txt | less
```

Example of piping commands.

## Compression and archives

```
tar -czvf archive.tar.gz folder
```

Creates a compressed archive.

```
tar -xzvf archive.tar.gz
```

Extracts a compressed archive.

```
zip -r file.zip folder
```

Creates a zip archive.

```
unzip file.zip
```

Extracts a zip archive.

## Environment and shell

```
echo $PATH
```

Shows PATH environment variable.

```
env
```

Lists environment variables.

```
which node
```

Shows the path of a command.

```
history
```

Shows command history.

```
clear
```

Clears the terminal screen.

## Recommended daily workflow

```
pwd
ls
cd project
ls -la
grep "TODO" .
tail -f logs/app.log
```

Common commands used during development and debugging.

## Best practices

- Double-check before using `rm -rf`.

- Use `less` instead of `cat` for large files.

- Prefer pipes over temporary files.

- Learn to read permissions and ownership.
