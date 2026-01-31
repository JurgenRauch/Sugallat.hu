import html
import json
import re
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://www.sugallat.hu"

SKIP_DIRS = {"export", "content", "partials"}


def _strip_tags(text: str) -> str:
    text = re.sub(r"<[^>]+>", "", text)
    return html.unescape(text).strip()


def _get_lang(doc: str) -> str:
    m = re.search(r'<html[^>]*\blang="([^"]+)"', doc, flags=re.IGNORECASE)
    return (m.group(1).strip().lower() if m else "hu")


def _get_title(doc: str) -> str | None:
    m = re.search(r"<title>(.*?)</title>", doc, flags=re.IGNORECASE | re.DOTALL)
    return _strip_tags(m.group(1)) if m else None


def _get_first_h1(doc: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", doc, flags=re.IGNORECASE | re.DOTALL)
    return _strip_tags(m.group(1)) if m else None


def _label_from_title(title: str | None) -> str | None:
    if not title:
        return None
    # Common pattern: "X - Sugallat Kft." or similar
    for sep in [" - Sugallat Kft.", " - Sugallat Ltd.", " | Sugallat Kft."]:
        if title.endswith(sep):
            return title[: -len(sep)].strip()
    # Or "X - Sugallat Kft." with extra suffixes
    if " - Sugallat" in title:
        return title.split(" - Sugallat", 1)[0].strip()
    return title.strip()


def _canonical_path_for_file(file_path: Path, lang: str) -> str | None:
    rel = file_path.relative_to(REPO_ROOT).as_posix()

    # Skip fragments / exported copies
    parts = rel.split("/")
    if parts[0] in SKIP_DIRS:
        return None

    # Homepages
    if rel == "index.html":
        return "/"
    if rel == "pages/en/index.html":
        return "/en/"

    # Services (directory-based)
    if rel == "tevekenysegeink/index.html":
        return "/tevekenysegeink"
    if rel.startswith("tevekenysegeink/") and rel.endswith("/index.html"):
        slug = parts[1]
        return f"/tevekenysegeink/{slug}"

    # Blog listing
    if rel == "blog.html":
        return "/blog"
    if rel == "pages/en/blog.html":
        return "/en/blog"

    # Blog posts
    if rel.startswith("pages/blog/") and rel.endswith(".html"):
        slug = file_path.stem
        return f"/en/blog/{slug}" if lang == "en" else f"/blog/{slug}"

    # English utility pages
    if rel.startswith("pages/en/") and rel.endswith(".html"):
        slug = file_path.stem
        return f"/en/{slug}"

    # Root pages (rewrite-style, no .html)
    if "/" not in rel and rel.endswith(".html"):
        slug = file_path.stem
        return f"/{slug}"

    return None


def _breadcrumbs_for_file(file_path: Path, doc: str) -> list[dict] | None:
    lang = _get_lang(doc)
    rel = file_path.relative_to(REPO_ROOT).as_posix()

    # Do not add breadcrumbs to the homepage itself
    if rel in {"index.html", "pages/en/index.html"}:
        return None

    canonical_path = _canonical_path_for_file(file_path, lang)
    if not canonical_path:
        return None

    title = _get_title(doc)
    h1 = _get_first_h1(doc)
    # Prefer on-page H1/title, but allow overrides where navigation wording differs
    label_overrides_hu = {
        "/bemutatkozas": "Rólunk",
        "/kapcsolat": "Kapcsolat",
        "/referenciak": "Ügyfeleink",
    }
    label = (label_overrides_hu.get(canonical_path) if lang != "en" else None) or h1 or _label_from_title(title) or file_path.stem

    crumbs: list[tuple[str, str]] = []
    if lang == "en" and rel.startswith("pages/en/"):
        crumbs.append(("Home", f"{BASE_URL}/en/"))
        # English pages are flat (no sections), except blog posts
        if canonical_path.startswith("/en/blog/"):
            crumbs.append(("Blog", f"{BASE_URL}/en/blog"))
        elif canonical_path == "/en/blog":
            pass
        else:
            # e.g. /en/contact, /en/sitemap
            pass
    elif lang == "en" and rel.startswith("pages/blog/"):
        # English blog posts are under /en/blog/*
        crumbs.append(("Home", f"{BASE_URL}/en/"))
        crumbs.append(("Blog", f"{BASE_URL}/en/blog"))
    else:
        crumbs.append(("Főoldal", f"{BASE_URL}/"))
        if canonical_path.startswith("/tevekenysegeink/") and canonical_path != "/tevekenysegeink":
            crumbs.append(("Szolgáltatások", f"{BASE_URL}/tevekenysegeink"))
        elif canonical_path == "/tevekenysegeink":
            pass
        elif canonical_path.startswith("/blog/") and canonical_path != "/blog":
            crumbs.append(("Blog", f"{BASE_URL}/blog"))
        elif canonical_path == "/blog":
            pass
        elif canonical_path in {"/kapcsolat", "/referenciak"}:
            # These live under "Rólunk" in the HU nav dropdown
            crumbs.append(("Rólunk", f"{BASE_URL}/bemutatkozas"))
        else:
            # top-level page: only Home -> Page
            pass

    # Always end with current page
    crumbs.append((label, f"{BASE_URL}{canonical_path}".rstrip("/") if canonical_path != "/en/" else f"{BASE_URL}/en/"))

    item_list = []
    for idx, (name, url) in enumerate(crumbs, start=1):
        item_list.append(
            {
                "@type": "ListItem",
                "position": idx,
                "name": name,
                "item": url,
            }
        )
    return item_list


def _render_breadcrumb_jsonld(item_list: list[dict]) -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": item_list,
    }
    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    return "\n".join(
        [
            "    <!-- Breadcrumbs (JSON-LD) -->",
            '    <script type="application/ld+json">',
            *[f"    {line}" for line in json_text.splitlines()],
            "    </script>",
        ]
    )


def _upsert_breadcrumbs(doc: str, breadcrumb_block: str) -> str:
    # Replace existing BreadcrumbList JSON-LD if present
    existing = re.search(
        r"\s*<!--\s*Breadcrumbs.*?-->\s*<script\s+type=\"application/ld\+json\">\s*[\s\S]*?\"@type\"\s*:\s*\"BreadcrumbList\"[\s\S]*?</script>\s*",
        doc,
        flags=re.IGNORECASE,
    )
    if existing:
        # Ensure the script ends on its own line (avoid `</script><link...` formatting)
        return doc[: existing.start()] + "\n" + breadcrumb_block + "\n" + doc[existing.end() :]

    # Otherwise, insert after meta description if possible, else after title
    meta_desc = re.search(r'<meta\s+name="description"[^>]*>\s*', doc, flags=re.IGNORECASE)
    if meta_desc:
        insert_at = meta_desc.end()
        # Keep surrounding formatting stable and ensure the next tag starts on a new line
        return doc[:insert_at] + "\n\n" + breadcrumb_block + "\n" + doc[insert_at:]

    title_tag = re.search(r"</title>\s*", doc, flags=re.IGNORECASE)
    if title_tag:
        insert_at = title_tag.end()
        return doc[:insert_at] + "\n\n" + breadcrumb_block + "\n" + doc[insert_at:]

    return doc


def main() -> int:
    changed = 0

    for file_path in REPO_ROOT.rglob("*.html"):
        rel_parts = file_path.relative_to(REPO_ROOT).parts
        if rel_parts and rel_parts[0] in SKIP_DIRS:
            continue
        if rel_parts and rel_parts[0] == "partials":
            continue

        doc = file_path.read_text(encoding="utf-8")
        item_list = _breadcrumbs_for_file(file_path, doc)
        if not item_list:
            continue

        breadcrumb_block = _render_breadcrumb_jsonld(item_list)
        new_doc = _upsert_breadcrumbs(doc, breadcrumb_block)
        if new_doc != doc:
            file_path.write_text(new_doc, encoding="utf-8")
            changed += 1

    print(f"BreadcrumbList JSON-LD updated in {changed} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


