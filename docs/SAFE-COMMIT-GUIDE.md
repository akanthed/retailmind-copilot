# Safe Commit Guide

## 🔒 Before Every Commit - Security Checklist

### Run Security Check
```powershell
.\check-security.ps1
```

This script will scan for:
- Hardcoded API URLs
- AWS credentials
- .env files not in .gitignore
- Lambda deployment packages (.zip)

### Manual Verification

1. **Check Git Status**
```bash
git status
```

2. **Review Changes**
```bash
git diff
```

3. **Verify .gitignore**
```bash
# These should be ignored:
.env.local
.env
*.zip (in backend/)
node_modules/
```

## ✅ Safe Files to Commit

### Source Code:
- `src/**/*.ts`
- `src/**/*.tsx`
- `src/**/*.css`
- `backend/functions/**/*.mjs` (source code only)
- `backend/functions/**/package.json`

### Configuration Templates:
- `.env.example` (NO actual values!)
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`

### Documentation:
- `README.md`
- `SECURITY.md`
- `*.md` files (check for secrets first!)

### Scripts:
- `scripts/*.ps1`
- `scripts/*.sh`
- Deployment scripts (without credentials)

## ❌ NEVER Commit These

### Environment Files:
- `.env`
- `.env.local`
- `.env.production`
- Any file with actual API URLs or keys

### AWS Credentials:
- `~/.aws/credentials`
- Any file with `AKIA...` (AWS Access Keys)
- Any file with AWS Secret Keys

### Build Artifacts:
- `node_modules/`
- `dist/`
- `*.zip` (Lambda packages)
- `function.zip`

### Sensitive Data:
- API Gateway URLs (use environment variables)
- Database connection strings
- Any passwords or tokens

## 🚀 Safe Commit Workflow

### 1. Make Changes
```bash
# Edit your code
# Test locally
```

### 2. Run Security Check
```powershell
.\check-security.ps1
```

### 3. Stage Files Carefully
```bash
# Stage specific files (safer than 'git add .')
git add src/
git add backend/functions/aiCopilot/index.mjs
git add README.md

# DO NOT use 'git add .' blindly!
```

### 4. Review Staged Changes
```bash
git diff --cached
```

### 5. Commit with Descriptive Message
```bash
git commit -m "feat: Add AI Copilot with Amazon Nova Pro integration"
```

### 6. Push to Remote
```bash
git push origin main
```

## 🔧 If You Accidentally Commit Secrets

### Immediate Actions:

1. **DO NOT PUSH** if you haven't already
```bash
# Undo last commit (keeps changes)
git reset HEAD~1
```

2. **If Already Pushed:**
```bash
# Rotate ALL credentials immediately in AWS Console
# Then remove from history:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: Destructive!)
git push origin --force --all
```

3. **Rotate Credentials:**
- Go to AWS IAM Console
- Delete compromised access keys
- Create new access keys
- Update local configuration

## 📋 Pre-Commit Checklist

Before every commit, verify:

- [ ] Ran `.\check-security.ps1` - no issues
- [ ] Reviewed `git diff` - no secrets visible
- [ ] `.env.local` is NOT staged
- [ ] No `.zip` files staged
- [ ] No AWS credentials in code
- [ ] Only source code and docs staged
- [ ] Commit message is descriptive

## 💡 Pro Tips

### Use Git Hooks
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
powershell.exe -File check-security.ps1
if [ $? -ne 0 ]; then
    echo "Security check failed! Commit aborted."
    exit 1
fi
```

### Use Environment Variables
```typescript
// ✅ GOOD
const apiUrl = import.meta.env.VITE_API_URL;

// ❌ BAD
const apiUrl = "https://abc123.execute-api.us-east-1.amazonaws.com/dev";
```

### Review Before Push
```bash
# See what will be pushed
git log origin/main..HEAD

# Review all changes
git diff origin/main..HEAD
```

## 🆘 Need Help?

If unsure about a file:
1. Check if it's in `.gitignore`
2. Run security check script
3. When in doubt, DON'T commit it
4. Ask for review

**Remember: It's easier to add files later than to remove secrets from history!**

---

**Stay safe! 🔒**
