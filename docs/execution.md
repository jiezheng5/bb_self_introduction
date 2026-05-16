# Execution Log — self-intro-web

## Progress Log

### Stop 1: Initial Local Setup ✓
- Explored repo, identified as pure static HTML/CSS/JS site
- Started local dev at http://localhost:8080

### Stop 2: Design Specification ✓
- Created `docs/design-spec.md` with tech stack, layout, color tokens
- Extracted reusable `.claude/prompt_presentation_web.md` template

### Stop 3: Tab/Sidebar Layout Refactor ✓
- Tab-based navigation (sidebar + one-slide-at-a-time)
- Sticky left sidebar TOC with labeled items
- Bottom Prev/Next nav bar
- **Status**: Complete

### Stop 4: Light Theme + Section TOC ✓
- Light mode (#f8f7f4), red titles (#c62828), blue highlights (#1565c0)
- Sectioned sidebar with 5 groups and expand/collapse
- **Status**: Complete

### Stop 5: AWS Infrastructure ✓
- CloudFormation stack `self-intro-site` deployed
- S3 bucket (private, OAC-only), CloudFront distribution
- HTTPS redirect, compression, index.html rewrite function
- **Live URL**: https://d2mqhbr1u3dr40.cloudfront.net
- **Status**: Complete

### Stop 6: CI/CD Pipeline ✓ ← YOU ARE HERE
- **Date**: 2026-05-16
- **CloudFormation updated**: Added IAM role for GitHub Actions OIDC
- **GitHub repository**: https://github.com/jiezheng5/bb_self_introduction
- **GitHub Actions workflow**: `.github/workflows/deploy.yml`
- **Secrets configured**: AWS_ROLE_ARN, AWS_REGION, S3_BUCKET, CLOUDFRONT_DISTRIBUTION_ID
- **Trigger**: Push to `master` or manual dispatch
- **Verified**: 2 successful deployments via CI/CD ✅
- **Status**: Complete ✅

## Quick Context Switch

| Question | Answer |
|----------|--------|
| Live URL | https://d2mqhbr1u3dr40.cloudfront.net |
| GitHub | https://github.com/jiezheng5/bb_self_introduction |
| Deploy trigger | `git push origin master` |
| Workflow | `.github/workflows/deploy.yml` |
| Stack name | `self-intro-site` |
| S3 Bucket | `self-intro-site-sitebucket-nystor5mzpno` |
| CloudFront ID | `E1ZWJFB0UEJHAD` |
| IAM Role | `self-intro-site-github-actions-role` |
| Region | us-west-2 |
| Local config | `aws-config.json` |
| Deployment docs | `docs/deployment-guide.md` |
