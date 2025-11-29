# 🔄 GitHub Actions Setup Guide

Quick guide to set up automatic deployments from GitHub to Firebase.

## ✅ Workflow File Created

The file `.github/workflows/deploy.yml` has been created and added to git.

## Setup Steps

### Step 1: Get Firebase Token

Run this command in your terminal:

```bash
firebase login:ci
```

This will:
1. Open a browser window
2. Ask you to login to Firebase
3. Generate a token
4. Display the token in your terminal

**Copy this token** - you'll need it in the next step.

### Step 2: Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **"New repository secret"**
5. Name: `FIREBASE_TOKEN`
6. Value: Paste the token from Step 1
7. Click **"Add secret"**

### Step 3: Commit and Push

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push
```

### Step 4: Verify It Works

1. Go to your GitHub repository
2. Click **Actions** tab (top menu)
3. You should see a workflow run starting
4. Click on it to watch the deployment progress

Once it completes, your site will be deployed to Firebase Hosting!

## How It Works

- Every time you push to the `main` branch
- GitHub Actions automatically:
  1. Checks out your code
  2. Installs Firebase CLI
  3. Deploys to Firebase Hosting using your token

## Troubleshooting

### Workflow fails with "FIREBASE_TOKEN not found"

**Fix:** Make sure you added the secret in GitHub:
- Repository → Settings → Secrets and variables → Actions
- Secret name must be exactly: `FIREBASE_TOKEN`

### Workflow fails with "Project not found"

**Fix:** Update the project ID in `.github/workflows/deploy.yml`:
- Change `galaxy-e07b4` to your actual Firebase project ID

### Want to disable auto-deploy?

Just don't push the workflow file, or delete it:
```bash
git rm .github/workflows/deploy.yml
git commit -m "Remove auto-deployment"
```

## Manual Deploy (Alternative)

If you don't want auto-deployment, just deploy manually:

```bash
firebase deploy --only hosting
```

---

**That's it!** After setting up the token, every push will automatically deploy your game. 🚀

