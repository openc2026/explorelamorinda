# daily-pr.ps1 - wrap a day's changes into a PR for safe, revertable deploys.
#
# Usage:
#   scripts/daily-pr.ps1 -Slug freshness -Subject "Daily freshness 2026-05-22" -Body "..." [-AutoMerge]
#
# Behavior:
#   1. Branches daily/<slug>-YYYY-MM-DD off master (dirty worktree carried forward)
#   2. Commits + pushes
#   3. Opens PR via gh
#   4. If -AutoMerge: enables auto-merge (squash, delete branch)
#   5. Switches back to master
#
# Exits non-zero on any failure.

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Slug,
  [Parameter(Mandatory=$true)][string]$Subject,
  [string]$Body = "Automated daily update.",
  [switch]$AutoMerge
)

# Don't let PowerShell treat git/gh stderr progress as terminating errors.
# We rely on $LASTEXITCODE only.
$ErrorActionPreference = "Continue"

function Invoke-Checked {
  param([string]$Cmd, [string[]]$CmdArgs)
  & $Cmd @CmdArgs 2>&1 | ForEach-Object { Write-Host $_ }
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAIL: $Cmd $($CmdArgs -join ' ') exited $LASTEXITCODE"
    exit $LASTEXITCODE
  }
}

$DateTag = Get-Date -Format "yyyy-MM-dd"
$Branch  = "daily/$Slug-$DateTag"
$Base    = "master"

# bail if nothing changed
$dirty = (git status --porcelain) -join "`n"
if ([string]::IsNullOrWhiteSpace($dirty)) {
  Write-Host "no changes to commit - skipping PR"
  exit 0
}

Invoke-Checked "git" @("fetch", "origin", $Base)
Invoke-Checked "git" @("checkout", $Base)
Invoke-Checked "git" @("pull", "--ff-only", "origin", $Base)

# if branch exists, suffix timestamp
$existing = (git branch --list $Branch)
if ($existing) { $Branch = "$Branch-$(Get-Date -Format 'HHmm')" }

Invoke-Checked "git" @("checkout", "-b", $Branch)
Invoke-Checked "git" @("add", "-A")

# Make sure something is staged
$staged = (git diff --cached --name-only) -join "`n"
if ([string]::IsNullOrWhiteSpace($staged)) {
  Write-Host "no staged changes - aborting and returning to $Base"
  Invoke-Checked "git" @("checkout", $Base)
  Invoke-Checked "git" @("branch", "-D", $Branch)
  exit 0
}

Invoke-Checked "git" @("commit", "-m", $Subject)
Invoke-Checked "git" @("push", "-u", "origin", $Branch)

# create PR
$prUrl = & gh pr create --base $Base --head $Branch --title $Subject --body $Body
if ($LASTEXITCODE -ne 0) { throw "gh pr create failed" }
Write-Host "PR: $prUrl"

if ($AutoMerge) {
  & gh pr merge $prUrl --squash --auto --delete-branch
  if ($LASTEXITCODE -ne 0) {
    Write-Host "auto-merge enable failed - falling back to immediate squash merge"
    Invoke-Checked "gh" @("pr", "merge", $prUrl, "--squash", "--delete-branch")
  }
}

# return to master
Invoke-Checked "git" @("checkout", $Base)
Invoke-Checked "git" @("pull", "--ff-only", "origin", $Base)

Write-Host "DONE: $Subject"
Write-Host "PR_URL=$prUrl"
exit 0
