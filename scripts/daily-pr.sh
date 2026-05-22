#!/usr/bin/env bash
# daily-pr.sh — wrap a day's worth of changes into a PR for safe, revertable deploys.
#
# Usage:
#   scripts/daily-pr.sh <slug> "<commit subject>" "<PR body>" [--auto-merge]
#
# Behavior:
#   1. Creates branch daily/<slug>-YYYY-MM-DD off master
#   2. Stages all changes, commits, pushes branch
#   3. Opens a PR against master via gh
#   4. If --auto-merge: enables auto-merge (squash). Otherwise leaves PR open for review.
#   5. Switches local checkout back to master and pulls.
#
# Exit non-zero on any failure (caller should NOT proceed to "report success").

set -euo pipefail

SLUG="${1:?slug required, e.g. freshness or blog or sprint-day5}"
SUBJECT="${2:?commit subject required}"
BODY="${3:-Automated daily update.}"
AUTO_MERGE_FLAG="${4:-}"

DATE_TAG="$(date +%Y-%m-%d)"
BRANCH="daily/${SLUG}-${DATE_TAG}"
DEFAULT_BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo master)"
# always base off master regardless of current branch
BASE_BRANCH="master"

# Bail early if there's nothing staged or worktree-dirty
if git diff --quiet && git diff --cached --quiet && [[ -z "$(git status --porcelain)" ]]; then
  echo "no changes to commit — skipping PR"
  exit 0
fi

# Make sure we are up to date with master before branching
git fetch origin "$BASE_BRANCH"
git checkout "$BASE_BRANCH"
git pull --ff-only origin "$BASE_BRANCH"

# If the branch already exists locally (re-run same day), append a timestamp
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  BRANCH="${BRANCH}-$(date +%H%M)"
fi

git checkout -b "$BRANCH"

# Re-apply any stashed/untracked changes if needed — but in cron usage, the agent
# made edits BEFORE calling this script while on master. Those edits remain in
# the worktree across the checkout because they weren't committed yet.
# (git checkout -b carries dirty worktree forward.)

git add -A
if git diff --cached --quiet; then
  echo "no staged changes after branch creation — aborting"
  git checkout "$BASE_BRANCH"
  git branch -D "$BRANCH"
  exit 0
fi

git commit -m "$SUBJECT"
git push -u origin "$BRANCH"

# Create the PR
PR_URL=$(gh pr create \
  --base "$BASE_BRANCH" \
  --head "$BRANCH" \
  --title "$SUBJECT" \
  --body "$BODY")

echo "PR: $PR_URL"

if [[ "$AUTO_MERGE_FLAG" == "--auto-merge" ]]; then
  # Squash merge keeps master history linear. If branch protection requires
  # checks, auto-merge waits until they pass.
  gh pr merge "$PR_URL" --squash --auto --delete-branch || {
    echo "auto-merge enable failed (likely branch protection or no required checks); falling back to immediate squash merge"
    gh pr merge "$PR_URL" --squash --delete-branch
  }
fi

# Return to master so subsequent runs/operations are clean
git checkout "$BASE_BRANCH"
git pull --ff-only origin "$BASE_BRANCH" || true

echo "DONE: $SUBJECT"
