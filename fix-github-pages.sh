s getti22#!/bin/bash

# Quick Fix Script for GitHub Pages White Screen Issue
echo "🔧 BigSoundGen - GitHub Pages Fix Script"
echo "========================================"

# Get repository name
REPO_NAME=$(basename $(git rev-parse --show-toplevel 2>/dev/null) 2>/dev/null)
if [ -z "$REPO_NAME" ]; then
    echo "❌ Not in a git repository. Please run 'git init' first."
    exit 1
fi

echo "📁 Repository name: $REPO_NAME"

# Get GitHub username
echo ""
echo "Please enter your GitHub username:"
read -p "GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

echo ""
echo "🔧 Updating configuration files..."

# Update package.json homepage
sed -i.bak "s|https://yourusername.github.io/BigSoundGen|https://$GITHUB_USERNAME.github.io/$REPO_NAME|g" package.json

# Update vite.config.js base path
sed -i.bak "s|base: '/BigSoundGen/'|base: '/$REPO_NAME/'|g" vite.config.js

echo "✅ Configuration updated!"
echo ""
echo "📋 Summary:"
echo "  Repository: $REPO_NAME"
echo "  GitHub username: $GITHUB_USERNAME"
echo "  Homepage URL: https://$GITHUB_USERNAME.github.io/$REPO_NAME"
echo "  Base path: /$REPO_NAME/"
echo ""
echo "🚀 Next steps:"
echo "  1. Run: npm run build"
echo "  2. Run: npm run deploy"
echo "  3. Enable GitHub Pages in repository settings"
echo "  4. Visit: https://$GITHUB_USERNAME.github.io/$REPO_NAME"
echo ""
echo "⚠️  Important: Make sure your repository name matches '$REPO_NAME'"
echo "   If it's different, update vite.config.js manually"
