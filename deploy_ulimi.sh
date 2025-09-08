#!/bin/bash
set -e

# === CONFIGURATION ===
GITHUB_USER="livewiresconnect6"
REPO_NAME="Ulimi"
WORK_DIR="/Users/thapelopatji/Downloads/Ulimi"
ZIP_FILE="/mnt/data/Ulimi.zip"

# Ask for token securely
read -s -p "Enter your GitHub token: " GITHUB_TOKEN
echo ""

# === PREPARE PROJECT ===
# Unzip if folder doesn't already exist
if [ ! -d "$WORK_DIR" ]; then
    echo "Extracting project..."
    unzip -o "$ZIP_FILE" -d "$(dirname "$WORK_DIR")"
fi

cd "$WORK_DIR"

# Remove old git folder if exists
if [ -d ".git" ]; then
    echo "Cleaning old Git repo..."
    rm -rf .git
fi

# === GIT SETUP ===
echo "Initializing Git repo..."
git init

git config user.name "$GITHUB_USER"
git config user.email "$GITHUB_USER@users.noreply.github.com"

# === CREATE REMOTE REPO IF NEEDED ===
echo "Creating repo on GitHub (if not exists)..."
curl -u "$GITHUB_USER:$GITHUB_TOKEN" \
     https://api.github.com/user/repos \
     -d "{\"name\":\"$REPO_NAME\"}" \
     >/dev/null 2>&1 || true

# Add remote
git remote add origin "https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"

# === COMMIT & PUSH ===
echo "Adding project files..."
git add .
git commit -m "Initial commit for $REPO_NAME" || echo "Nothing to commit."

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo "✅ Deployment complete! Repo: https://github.com/$GITHUB_USER/$REPO_NAME"
