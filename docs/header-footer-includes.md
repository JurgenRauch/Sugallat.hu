# Shared header/footer: prebuilt includes (no JS dependency)

Goal: keep header/footer **present in initial HTML** (no CLS / no JS dependency), while avoiding copy-pasting the markup into every page by hand.

## Source of truth

- `partials/header-hu.html`
- `partials/header-en.html`
- `partials/footer.html`

These use simple placeholders:

- `{{root}}` – relative path prefix back to repo root (computed per page)
- `{{huHref}}` / `{{enHref}}` – language switcher targets (computed per page)

## Apply changes to all pages

After editing a partial, run:

```bash
python scripts/sync_header_footer.py
```

This rewrites the existing `<div id="header-placeholder">...</div>` and `<div id="footer-placeholder">...</div>` blocks in-place across the site pages.

## Notes

- The output remains **static HTML** (SEO-safe, reliable if JS is blocked).
- `pages/js/main.js` still runs “enhancement” behavior (active nav states, mobile menu), but does **not** inject header/footer markup.

## Page-scoped JS (INP)

Many pages stamp `<body data-page="..." data-features="...">` so `pages/js/main.js` can skip unrelated modules (e.g. marquee/blog/reference logic).

If you add new pages, either:

- Copy the `data-page` / `data-features` pattern from a similar page, or
- Re-run:

```bash
python scripts/set_page_features.py
```


