# GitHub Setup Guide for Sugallat Website

## Prerequisites
- GitHub account (create one at https://github.com if you don't have one)
- Git installed on your computer

## Method 1: Using GitHub Desktop (Easiest)

### Step 1: Download GitHub Desktop
1. Go to https://desktop.github.com/
2. Download and install GitHub Desktop
3. Sign in with your GitHub account

### Step 2: Create Repository
1. Open GitHub Desktop
2. Click "Create a new repository on your hard drive"
3. Name: `sugallat-website`
4. Local path: `C:\Users\derse\OneDrive\Dokumentumok\Sajat\Sugallat`
5. Check "Initialize this repository with a README" (uncheck this since we already have files)
6. Click "Create repository"

### Step 3: Publish to GitHub
1. In GitHub Desktop, you'll see all your files
2. Add a commit message like "Initial website setup"
3. Click "Commit to main"
4. Click "Publish repository"
5. Choose to make it public or private
6. Click "Publish repository"

## Method 2: Using Command Line (If Git is installed)

### Step 1: Install Git
1. Go to https://git-scm.com/download/win
2. Download and install Git for Windows
3. Restart your terminal/PowerShell

### Step 2: Initialize Repository
```bash
cd "C:\Users\derse\OneDrive\Dokumentumok\Sajat\Sugallat"
git init
git add .
git commit -m "Initial website setup"
```

### Step 3: Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name: `sugallat-website`
4. Make it public or private
5. Don't initialize with README (we already have files)
6. Click "Create repository"

### Step 4: Connect and Push
```bash
git remote add origin https://github.com/YOUR_USERNAME/sugallat-website.git
git branch -M main
git push -u origin main
```

## Method 3: Using VS Code (If you have VS Code)

1. Open VS Code in your project folder
2. Go to Source Control panel (Ctrl+Shift+G)
3. Click "Initialize Repository"
4. Stage all files (click + next to each file)
5. Add commit message and commit
6. Click "Publish to GitHub"
7. Follow the prompts to create the repository

## After Setup

### Daily Workflow
1. Make changes to your files
2. Commit changes with descriptive messages
3. Push to GitHub to sync

### Commit Messages (Good Examples)
- "Add logo to navigation bar"
- "Update homepage styling"
- "Create pricing page"
- "Fix mobile responsiveness"
- "Add contact form"

### File Structure in GitHub
Your repository will contain:
```
sugallat-website/
├── index.html
├── README.md
├── .gitignore
├── css/
│   ├── main.css
│   ├── components.css
│   └── responsive.css
├── js/
│   └── main.js
├── images/
│   └── logo.png
└── fonts/
```

## Benefits of Using GitHub
- **Backup**: Your code is safely stored online
- **Version Control**: Track all changes and revert if needed
- **Collaboration**: Share with others if needed
- **Portfolio**: Show your work to potential clients/employers
- **Free Hosting**: Use GitHub Pages to host your website for free

## Next Steps After GitHub Setup
1. Set up GitHub Pages for free hosting
2. Custom domain (optional)
3. Continue developing other pages
4. Regular commits as you make changes
