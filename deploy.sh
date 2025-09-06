#!/bin/bash

# GitHub Pages Deployment Script for BigSoundGen
# This script helps you deploy your synthesizer to GitHub Pages

echo "🎵 BigSoundGen - GitHub Pages Deployment Script"
echo "=============================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Get repository name
REPO_NAME=$(basename $(git rev-parse --show-toplevel))
echo "📁 Repository: $REPO_NAME"

# Get GitHub username (you'll need to set this)
echo "⚠️  Please update the following files with your GitHub username:"
echo "   1. package.json - Update 'homepage' field"
echo "   2. vite.config.js - Update 'base' path if repository name is different"
echo ""

read -p "Have you updated the configuration files? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please update the configuration files first, then run this script again."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
npm run deploy

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "Your synthesizer should be available at:"
    echo "https://yourusername.github.io/$REPO_NAME"
    echo ""
    echo "⚠️  Remember to:"
    echo "   1. Replace 'yourusername' with your actual GitHub username"
    echo "   2. Enable GitHub Pages in your repository settings"
    echo "   3. Set source to 'GitHub Actions' for automatic deployments"
else
    echo "❌ Deployment failed. Please check for errors."
    exit 1
fi
