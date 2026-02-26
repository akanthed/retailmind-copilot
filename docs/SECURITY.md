# Security Guidelines

## 🔒 Important Security Information

This repository contains a hackathon project that integrates with AWS services. To maintain security:

### ⚠️ NEVER Commit These Files:
- `.env.local` - Contains your API Gateway URL
- `.env` - Any environment variables
- `aws-credentials.json` - AWS access keys
- `function.zip` - Lambda deployment packages (may contain dependencies)
- Any files with API keys, secrets, or credentials

### ✅ Safe to Commit:
- `.env.example` - Template without actual values
- Source code (`.ts`, `.tsx`, `.js`, `.mjs`)
- Configuration templates
- Documentation
- Public assets

## 🛡️ Setup Instructions for Contributors

### 1. Clone the Repository
```bash
git clone <repository-url>
cd retailmind-copilot
```

### 2. Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
# Get API URL from your AWS API Gateway console
```

### 3. AWS Credentials
**NEVER commit AWS credentials to this repository!**

Configure AWS CLI locally:
```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: us-east-1
# Output: json
```

Your credentials are stored in `~/.aws/credentials` (NOT in this repo).

### 4. Deploy Backend
Follow instructions in `DEPLOY-LAMBDA-MANUAL.md` to deploy Lambda functions to your own AWS account.

## 🚨 If You Accidentally Commit Secrets

### Immediate Actions:
1. **Rotate credentials immediately** in AWS Console
2. **Delete the commit** from history (use `git filter-branch` or BFG Repo-Cleaner)
3. **Force push** to overwrite remote history
4. **Notify team members** to re-clone the repository

### AWS Credential Rotation:
1. Go to IAM Console
2. Delete compromised access keys
3. Create new access keys
4. Update local `aws configure`

## 📋 Security Checklist Before Pushing

- [ ] No `.env.local` or `.env` files
- [ ] No AWS credentials in code
- [ ] No API keys hardcoded
- [ ] No `function.zip` files
- [ ] `.gitignore` is up to date
- [ ] Only `.env.example` with placeholder values

## 🔍 Scanning for Secrets

Before committing, scan for potential secrets:

```bash
# Check what will be committed
git status

# Review changes
git diff

# Search for potential secrets
grep -r "AKIA" .  # AWS Access Key pattern
grep -r "execute-api" .  # API Gateway URLs
```

## 📞 Reporting Security Issues

If you find a security vulnerability:
1. **DO NOT** open a public issue
2. Contact the repository owner directly
3. Provide details about the vulnerability
4. Wait for confirmation before disclosing

## 🎓 Best Practices

### For Development:
- Use environment variables for all sensitive data
- Never hardcode credentials
- Use IAM roles with least privilege
- Enable MFA on AWS accounts
- Regularly rotate credentials

### For Production:
- Use AWS Secrets Manager for sensitive data
- Enable CloudTrail for audit logging
- Use VPC for network isolation
- Enable encryption at rest and in transit
- Regular security audits

## 📚 Resources

- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Git Secrets Tool](https://github.com/awslabs/git-secrets)

---

**Remember: Security is everyone's responsibility!** 🔒
