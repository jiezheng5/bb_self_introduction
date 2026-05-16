# Jie Zheng — Self-Introduction Website

> **Principal Signal Integrity Engineer** | 224 Gb/s · 1.6T Ethernet · EM Automation

A polished presentation website showcasing 18+ years of high-speed interconnect engineering experience. Features a tab-based slide navigation system with sectioned sidebar TOC, speaker notes, and full-screen presentation mode.

## Live Site

**🔗 https://d2mqhbr1u3dr40.cloudfront.net**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (semantic, accessible) |
| Styling | CSS3 (custom properties, grid, flexbox, backdrop-filter) |
| Behavior | Vanilla JS (IIFE, IntersectionObserver) |
| Fonts | IBM Plex (Sans / Serif / Mono) |
| Hosting | AWS S3 + CloudFront (OAC) |
| CI/CD | GitHub Actions + AWS OIDC |

## Key Features

- **Tab navigation** — One slide at a time with sidebar TOC grouped into 5 thematic sections
- **Presentation mode** — Press `P` for full-viewport snap-scroll slides with HUD counter
- **Speaker notes** — Press `N` for a persistent notes drawer synced to current slide
- **Interactive matrix** — Four-quadrant correlation diagnostic (clickable)
- **Keyboard shortcuts** — Arrow keys, Space, Home/End, `P`, `N`, `Esc`
- **Light theme** — Warm off-white background, red titles (#c62828), blue highlights (#1565c0)
- **Responsive** — Optimized for desktop with sidebar collapse on narrow screens

## Slides Overview

| Section | Slides | Topic |
|---------|--------|-------|
| Overview | 00–01 | Hero, Six integrated functions |
| Technical Expertise | 02–05, 17 | SI simulation, EM analysis, RF testing, correlation |
| Product Development | 06–08 | 100G ACC, portfolio, OSFP 224G connector |
| Leadership & Standards | 09–11, 18 | Project mgmt, transparency, standards, Ethernet roadmap |
| Automation & Quality | 12–16, close | Design automation, checklists, libraries |

## Quick Start

```bash
# Serve locally
python3 -m http.server 8080
# Open http://localhost:8080
```

## Deployment

Push to `master` → automatic deployment via GitHub Actions:

```bash
git add -A
git commit -m "Description of changes"
git push origin master
```

See [docs/deployment-guide.md](docs/deployment-guide.md) for full details.

## Project Structure

```
├── index.html              # Main presentation page (979 lines)
├── assets/
│   ├── styles.css          # Theme, layout, responsive (1,673 lines)
│   ├── script.js           # Tab switching, present mode, notes (263 lines)
│   └── projectDashboard.png
├── screenshots/            # Hero state preview images
├── uploads/                # Downloadable PDF and PPTX
├── docs/                   # Design spec, execution log, deployment guide
├── infra/                  # AWS CloudFormation template
└── .github/workflows/      # CI/CD deploy workflow
```

## Author

**Jie Zheng** — Principal Signal Integrity Engineer
- Expertise: EM simulation, RF testing, high-speed product development
- Standards: IEEE 802.3, OIF, USB-IF, PCI-SIG, HDMI, Thunderbolt
- Automation: PyAEDT, ADS Python, Virtuoso Skill, AWS Batch/K8s
