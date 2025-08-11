# 📤 Push to GitHub - Step by Step

## Step 1: Create GitHub Repository

1. **Open GitHub in your browser**:
   ```
   https://github.com/new
   ```

2. **Create new repository with these settings**:
   - Repository name: `referrallink-platform`
   - Description: "AI-powered referral platform with Instabids.ai integration"
   - Public or Private: Your choice
   - **DO NOT** initialize with README (we already have one)
   - **DO NOT** add .gitignore (we already have one)
   - **DO NOT** add license

3. **Click "Create repository"**

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/referrallink-platform.git

# Verify remote was added
git remote -v

# Push to GitHub
git push -u origin master
```

If you're asked for credentials:
- Username: Your GitHub username
- Password: Your GitHub Personal Access Token (not your password!)

### To create a Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name like "referrallink-deploy"
4. Select scopes: `repo` (full control)
5. Generate token
6. Copy the token and use it as your password

## Step 3: Verify Upload

Once pushed, your repository will be available at:
```
https://github.com/YOUR_USERNAME/referrallink-platform
```

## Step 4: Deploy to Railway

Now that your code is on GitHub:

1. **Go to Railway**:
   ```
   https://railway.app
   ```

2. **Click "New Project"**

3. **Select "Deploy from GitHub repo"**

4. **Authorize Railway** to access your GitHub (if first time)

5. **Select** `referrallink-platform` repository

6. **Railway will auto-detect** Node.js and start building

7. **Add Environment Variables** in Railway dashboard:
   - Click on your service
   - Go to "Variables" tab
   - Add all variables from `.env.production`

## Quick Commands to Copy:

### For GitHub Push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/referrallink-platform.git
git push -u origin master
```

### Check if successful:
```bash
git log --oneline -1
git remote -v
```

## 🎯 Your code is now ready for deployment!

Once on GitHub, Railway deployment takes just 2-3 minutes!