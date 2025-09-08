#!/bin/bash

# Step 1: Create .gitignore
cat > .gitignore << 'EOF'
# OS files
.DS_Store

# Node
node_modules/
npm-debug.log*

# Capacitor / Android / iOS build
android/
ios/
build/
dist/
*.aab
*.apk

# Vercel
.vercel/

# Local system junk
.local/
.config/
EOF

echo ".gitignore file created ✅"

# Step 2: Remove junk files from git history (keep them locally)
git rm -r --cached .local .config .DS_Store node_modules android ios build dist .vercel 2>/dev/null

# Step 3: Stage everything
git add .

# Step 4: Commit
git commit -m "Cleanup: added .gitignore and removed system/build files"

# Step 5: Push (adjust 'main' if your branch is different)
git push origin main

echo "✅ Repo cleaned and pushed successfully!"
