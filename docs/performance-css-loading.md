# Performance baseline: CSS loading (universal)

This site is built as static HTML pages that each include the “global CSS bundle” directly via `<link>` tags.

To keep first paint fast and consistent, use this rule:

- **Blocking (to avoid FOUC / “jump once”):**
  - `main.css`
  - `components.css`

- **Non-blocking (safe to defer):**
- `responsive.css`
- `square-patterns.css`
- `hover-animations.css`

## Copy/paste snippet for new pages

Replace the paths to match the page’s directory depth (e.g. `pages/css/...`, `../pages/css/...`, `../css/...`).

```html
<!-- CSS Files -->
<link rel="stylesheet" href="PATH/main.css">
<link rel="stylesheet" href="PATH/components.css">

<link rel="preload" href="PATH/responsive.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="PATH/responsive.css"></noscript>

<link rel="preload" href="PATH/square-patterns.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="PATH/square-patterns.css"></noscript>

<link rel="preload" href="PATH/hover-animations.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="PATH/hover-animations.css"></noscript>
```

## How to apply to the whole repo

Run:

```bash
python scripts/optimize_css_links.py
```


