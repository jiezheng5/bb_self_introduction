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

### Stop 4: Light Theme + Section TOC ✓
- **Light mode**: Warm off-white bg `#f8f7f4`, dark text `#1e1e1e`
- **Red (#c62828)**: Slide titles, numbers, section headers
- **Blue (#1565c0)**: Key points, tags, emphasis, buttons
- **Sectioned sidebar**: 5 groups with expand/collapse

### Stop 5: AWS Deployment ✓ ← YOU ARE HERE
- **Date**: 2026-05-16
- **CloudFormation stack**: `self-intro-site`
  - S3 bucket: `self-intro-site-sitebucket-nystor5mzpno`
  - CloudFront OAC (private bucket, CloudFront-only access)
  - CloudFront distribution with index.html rewrite function
  - HTTPS redirect enabled
- **Deployed files**: index.html, assets/, screenshots/, uploads/
- **Live URL**: https://d2mqhbr1u3dr40.cloudfront.net
- **Type**: Static site via S3 + CloudFront (no build step needed)
- **Status**: Complete ✅

## Quick Context Switch

| Question | Answer |
|----------|--------|
| What are we doing? | AWS deployment complete |
| Live URL | https://d2mqhbr1u3dr40.cloudfront.net |
| Stack name | `self-intro-site` |
| S3 Bucket | `self-intro-site-sitebucket-nystor5mzpno` |
| CloudFront ID | `E1ZWJFB0UEJHAD` |
| Config file | `aws-config.json` |
| Region | us-west-2 |
| Next steps | User review of live site → optional custom domain → optional GitHub CI/CD |
