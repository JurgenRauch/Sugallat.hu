# Page-scoped JS (INP): feature flags via `<body data-features>`

Goal: reduce main-thread work by only initializing JS modules on pages that declare they need them.

## How it works

- Each page has:
  - `data-page="..."` (high-level page type)
  - `data-features="feature-a feature-b ..."` (space-separated)
- `pages/js/main.js` reads these and only runs matching initialization code.

## Editing / adding pages

For a new page, pick a similar existing page and copy its `<body data-page="..." data-features="...">`.

Or regenerate/stamp automatically:

```bash
python scripts/set_page_features.py
```

## Common features

- `latest-blogs`: homepage/blog listing dynamic blog logic
- `client-marquee`, `client-marquee-bg`: homepage marquee + background enhancement
- `reference-search`, `reference-table-scrollbar`: references page logic
- `text-galleries`: text gallery/slider init
- `faq`: FAQ accordion init
- `services-row`, `drag-scroll`: homepage row alignment + drag-to-scroll
- `square-patterns`: background square pattern init
- `sticky-cta`: sticky bottom CTA init


