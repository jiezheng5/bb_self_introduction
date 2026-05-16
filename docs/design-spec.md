# Self-Introduction Web — Design Specification

## Overview

This document records design decisions for the Brittany Zheng self-introduction presentation website (`self-intro-web`). The site serves as both a standalone reading experience and a live presentation deck for a Principal Signal Integrity Engineer.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Markup | HTML5 | Zero build dependencies, works from any static server |
| Styling | CSS3 (custom properties, grid, backdrop-filter) | Full control, no framework overhead |
| Behavior | Vanilla JS (IIFE, IntersectionObserver) | Lightweight, no bundler needed |
| Fonts | IBM Plex (Sans / Serif / Mono) via Google Fonts | Technical aesthetic, excellent readability |
| Hosting | S3 + CloudFront (AWS) | Future deployment target |

## Architecture

### Layout (after tab/pages refactor)

```
┌──────────────────────────────────────────────────┐
│ Chrome Header (sticky)                           │
│ [JZ] brand  [Notes] [Present]                    │
├──────────────┬───────────────────────────────────┤
│ Sidebar TOC  │ Main Content Area                 │
│ (fixed,      │                                   │
│  scrollable) │  [One slide visible at a time]    │
│              │                                   │
│ S00 Hero     │    slide content                  │
│ S01 Outline  │    centered vertically +          │
│ S02 Core     │    horizontally                   │
│ S03 Sim      │                                   │
│ ...          │                                   │
│ S19 Close    │                                   │
├──────────────┴───────────────────────────────────┤
│ Navigation bar (prev / next buttons)              │
└──────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Tab-based navigation**: Replace single long-scroll with sidebar-tab interaction. Each slide loads as a "page", reducing cognitive load and improving focus.
2. **Sticky sidebar TOC**: Always visible, shows human-readable slide labels (not just dots). The current slide is highlighted.
3. **Single-slide view**: In read mode, only one slide is displayed at a time. Arrow keys navigate forward/backward.
4. **Present mode preserved**: The full viewport snap-scroll presentation mode is retained as-is, with the same keyboard shortcuts.

## Color System & Readability Fix

### Problems Identified

- Some sections used `color: var(--text-2)` (mid-grey `#b9bdc6`) on `var(--bg-soft)` (dark `#0e131a`), resulting in insufficient contrast
- Card backgrounds (`--bg-soft`, `--surface`) are very close to the body background, creating a "flat" appearance
- The accent teal is used extensively but its soft variant (14% opacity) is barely visible on dark backgrounds

### Improvements

| Token | Old Value | New Value | Purpose |
|-------|-----------|-----------|---------|
| `--text` | `#e8e6e1` | (unchanged) | Primary text, good contrast |
| `--text-2` | `#b9bdc6` | `#cdd1da` | Body text, brighter for readability |
| `--text-3` | `#7a8290` | `#949cab` | Secondary labels, slightly brighter |
| `--surface` | `#131923` | `#161e2b` | Card background, slightly lighter |
| `--elevated` | `#1a212d` | `#1f2a3a` | Hover state, more distinct |
| `--accent-soft` | `oklch(0.78 0.10 175 / 0.14)` | `oklch(0.78 0.10 175 / 0.18)` | More visible accent glow |
| `--border` | `#232c3a` | (unchanged) | Subtle borders |

### Design Tokens

```css
:root {
  /* Core palette */
  --bg:        #0a0e14;
  --bg-soft:   #0e131a;
  --surface:   #161e2b;
  --elevated:  #1f2a3a;
  --border:    #232c3a;
  --border-strong: #36425a;

  /* Text — improved readability */
  --text:      #e8e6e1;
  --text-2:    #cdd1da;  /* was: #b9bdc6 */
  --text-3:    #949cab;  /* was: #7a8290 */
  --text-4:    #4f5765;

  /* Accent */
  --accent:        oklch(0.78 0.10 175);
  --accent-soft:   oklch(0.78 0.10 175 / 0.18);
  --accent-strong: oklch(0.88 0.12 175);
  --warn:          oklch(0.78 0.10 65);
  --warn-soft:     oklch(0.78 0.10 65 / 0.14);

  /* Layout */
  --sidebar-w: 260px;
  --chrome-h:  56px;
}
```

## Component States

### Sidebar Tab
| State | Style |
|-------|-------|
| Default | Dim text, subtle left border |
| Hover | Brighter text, slight background shift |
| Active (current slide) | Accent teal left border + text, soft highlight |
| Scroll | Sidebar has its own scroll container for long lists |

### Slide Transition
- **Fade transition**: 300ms ease when switching slides
- **No scroll snap** in tab mode (unlike present mode)
- Smooth cross-fade between slide content

## Accessibility

- All interactive elements are keyboard-navigable
- `aria-selected` on sidebar tabs for screen readers
- Tab order: sidebar → main content → nav buttons → chrome
- Slide titles use semantic heading hierarchy (h2 per slide)

## Future Considerations

- Consider extracting the sidebar + tab pattern as a reusable HTML presentation template
- The speaker notes JSON + CSS grid patterns could be extracted into a shared library
- AWS CloudFormation template exists at `infra/static-site.template.yaml` for deployment

---

*Document generated: 2026-05-16*
