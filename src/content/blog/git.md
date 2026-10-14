---
title: "Git & GitHub Reference"
description: "Practical guidance for using Git locally and GitHub remotely, designed as a daily reference for real-world\n        projects."
tags: ["Git", "GitHub", "Development"]
draft: false
---

## Core concepts

- **Git**: version control system running on your machine.

- **GitHub**: remote platform for hosting Git repositories.

- **Repository**: project folder tracked by Git.

- **Commit**: snapshot of changes.

- **Branch**: parallel line of development.

- **Remote**: external repository (usually called `origin`).

## Initial configuration (run once)

Set your identity for commits:

```
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
```

Set default main branch:

```
git config --global init.defaultBranch main
```

## Create or clone repositories

### Initialize an existing project

```
git init
```

Creates a new Git repository in the current directory.

### Clone from GitHub

```
git clone https://github.com/username/repository.git
```

Downloads a remote repository.

## Status and history

```
git status
```

Shows modified files, staged files, and untracked files.

```
git log
```

Full commit history.

```
git log --oneline --graph --decorate
```

Compact history with branch visualization.

## Staging and committing changes

### Stage files

```
git add file.txt
```

Adds a file to the staging area.

```
git add .
```

Stages all changes.

### Create a commit

```
git commit -m "Clear and meaningful message"
```

Saves staged changes into the repository history.

**Tip:** Keep commits small and messages descriptive.

## Branches

```
git branch
```

Lists local branches.

```
git branch feature-name
```

Creates a new branch.

```
git checkout feature-name
```

Switches to another branch.

```
git checkout -b feature-name
```

Creates and switches to a new branch.

```
git merge feature-name
```

Merges a branch into the current one.

<details>
<summary>Extra: rename or delete branches</summary>



```
# Rename current branch
git branch -m new-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```



</details>

## Remotes (GitHub)

```
git remote -v
```

Displays configured remotes.

```
git remote add origin https://github.com/username/repo.git
```

Links your local repo to GitHub.

<details>
<summary>Extra: change remote URL</summary>



```
git remote set-url origin https://github.com/username/new-repo.git
```



</details>

## Push changes

```
git push
```

Uploads commits to the tracked remote branch.

```
git push origin main
```

Pushes the main branch.

```
git push -u origin feature-name
```

Pushes a new branch and sets upstream tracking.

## Fetch vs Pull

```
git fetch
```

Downloads changes without merging.

```
git pull
```

Downloads and merges changes into the current branch.

**Rule of thumb:** fetch to inspect, pull to apply.

## Diff and review

```
git diff
```

Shows unstaged differences.

```
git diff --staged
```

Shows staged differences.

## Undoing changes (careful)

```
git restore file.txt
```

Discards local changes in a file.

```
git reset HEAD file.txt
```

Removes file from staging area.

```
git reset --hard
```

**DANGER:** Deletes all uncommitted local changes.

<details>
<summary>Safe undo for shared history</summary>



```
git revert <commit-hash>
```


<p>Creates a new commit that undoes a previous one.</p>

</details>

## Stash (temporary save)

```
git stash
```

Saves local changes temporarily.

```
git stash pop
```

Restores the last stash.

<details>
<summary>Extra stash commands</summary>



```
git stash list
git stash apply
```



</details>

## Recommended workflow

```
git checkout main
git pull

git checkout -b feature-x
git add .
git commit -m "Add feature X"
git push -u origin feature-x
```

Create a Pull Request on GitHub to merge into `main`.

## Best practices

- Do not work directly on `main`.

- Pull before starting work.

- Use clear, concise commit messages.

- One feature or fix per branch.

## Common emergency commands

<details>
<summary>Resolve merge conflicts</summary>

<ol>
<li>Edit conflicted files.</li>
<li>Resolve manually.</li>
<li>Stage and commit.</li>
</ol>


```
git status
git add .
git commit -m "Resolve merge conflicts"
```



</details>
