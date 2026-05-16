# Deployment Guide — self-intro-web

## Architecture

```
┌──────────────┐     git push      ┌───────────────────┐
│  Developer    │ ───────────────→  │  GitHub.com       │
│  (local)      │                   │  jiezheng5/       │
└──────────────┘                   │  bb_self_intro     │
                                   └────────┬──────────┘
                                            │
                                   GitHub Actions trigger
                                   (OIDC auth via IAM Role)
                                            │
                                           ▼
                                   ┌───────────────────┐
                                   │  AWS CloudFormation│
                                   │  Stack: self-intro-│
                                   │  site              │
                                   └────────┬──────────┘
                                            │
                              ┌─────────────┼─────────────┐
                              │             │             │
                              ▼             ▼             ▼
                      ┌──────────┐  ┌────────────┐  ┌──────────┐
                      │  S3      │  │ CloudFront │  │ IAM Role │
                      │  Bucket  │←─│ OAC        │  │ (OIDC)   │
                      │ (private)│  │ HTTPS      │  │          │
                      └──────────┘  └────────────┘  └──────────┘
```

## Prerequisites

- AWS CLI installed and configured
- GitHub CLI (`gh`) installed and authenticated
- Write access to the repository

## AWS Infrastructure

### CloudFormation Stack

The stack `self-intro-site` provisions:

| Resource | Purpose |
|----------|---------|
| S3 Bucket | Stores all static files (private, OAC only) |
| CloudFront Distribution | CDN with HTTPS, compression, index.html rewriting |
| Origin Access Control (OAC) | SigV4 auth between CloudFront and S3 |
| CloudFront Function | Rewrites `/path/` → `/path/index.html` |
| S3 Bucket Policy | Allows only CloudFront via SourceArn |
| IAM Role (OIDC) | GitHub Actions assumes this role for deployments |

### Update Infrastructure

```bash
aws cloudformation update-stack \
  --stack-name self-intro-site \
  --template-body file://infra/self-intro-stack.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters \
    ParameterKey=GitHubOrg,ParameterValue=jiezheng5 \
    ParameterKey=GitHubRepo,ParameterValue=bb_self_introduction \
    ParameterKey=OIDCProviderArn,ParameterValue=arn:aws:iam::936654323206:oidc-provider/token.actions.githubusercontent.com
```

### Get Stack Outputs

```bash
aws cloudformation describe-stacks --stack-name self-intro-site \
  --query "Stacks[0].Outputs" --output table
```

## CI/CD Pipeline

### How It Works

1. Developer pushes to `master` (or `main`) on GitHub
2. GitHub Actions workflow triggers automatically
3. OIDC authenticates to AWS without stored keys
4. `aws s3 sync` uploads files to S3 (with `--delete` to remove stale files)
5. CloudFront invalidation clears the edge cache

### GitHub Secrets (Configured)

| Secret | Value |
|--------|-------|
| `AWS_ROLE_ARN` | `arn:aws:iam::936654323206:role/self-intro-site-github-actions-role` |
| `AWS_REGION` | `us-west-2` |
| `S3_BUCKET` | `self-intro-site-sitebucket-nystor5mzpno` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `E1ZWJFB0UEJHAD` |

### Workflow File

`.github/workflows/deploy.yml` triggers on:
- Push to `master` or `main`
- Manual workflow dispatch (via GitHub Actions UI)

### Manual Deploy from Local

If you need to deploy directly from your local machine:

```bash
aws s3 sync . s3://self-intro-site-sitebucket-nystor5mzpno \
  --delete \
  --exclude ".git/*" \
  --exclude ".github/*" \
  --exclude "docs/*" \
  --exclude "infra/*" \
  --exclude "scripts/*" \
  --exclude ".gitignore" \
  --exclude "aws-config.json"

aws cloudfront create-invalidation \
  --distribution-id E1ZWJFB0UEJHAD \
  --paths "/*"
```

## Updating the Site

### Standard Update (via CI/CD)

```bash
# Make your changes locally, then:
git add -A
git commit -m "Description of changes"
git push origin master
```

GitHub Actions runs automatically (~30 seconds). Visit the live URL after completion.

### Quick Content Fix (via local deploy)

```bash
# Edit files, then run deploy script:
./scripts/deploy-local.sh    # (if script exists)
# OR manually:
aws s3 sync . s3://BUCKET --delete --exclude "..."
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
```

## Monitoring Deployments

```bash
# View recent workflow runs
gh run list --repo jiezheng5/bb_self_introduction --limit 5

# View specific run logs
gh run view <RUN_ID> --repo jiezheng5/bb_self_introduction --log
```

## Live URLs

| Service | URL |
|---------|-----|
| CloudFront | https://d2mqhbr1u3dr40.cloudfront.net |
| GitHub Repo | https://github.com/jiezheng5/bb_self_introduction |
| GitHub Actions | https://github.com/jiezheng5/bb_self_introduction/actions |

## Key Commands Reference

```bash
# Deploy locally
aws s3 sync . s3://self-intro-site-sitebucket-nystor5mzpno --delete --exclude ".git/*" --exclude ".github/*" --exclude "docs/*" --exclude "infra/*" --exclude ".gitignore" --exclude "aws-config.json"

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E1ZWJFB0UEJHAD --paths "/*"

# Update CloudFormation stack
aws cloudformation update-stack --stack-name self-intro-site --template-body file://infra/self-intro-stack.yaml --capabilities CAPABILITY_NAMED_IAM --parameters ParameterKey=GitHubOrg,ParameterValue=jiezheng5 ParameterKey=GitHubRepo,ParameterValue=bb_self_introduction ParameterKey=OIDCProviderArn,ParameterValue=arn:aws:iam::936654323206:oidc-provider/token.actions.githubusercontent.com

# View stack outputs
aws cloudformation describe-stacks --stack-name self-intro-site --query "Stacks[0].Outputs" --output table

# View workflow runs
gh run list --repo jiezheng5/bb_self_introduction --limit 5
```
