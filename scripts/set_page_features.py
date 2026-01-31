import os
import re
from pathlib import Path


FEATURES_BY_PAGE: dict[str, list[str]] = {
    "home": [
        "latest-blogs",
        "client-marquee",
        "client-marquee-bg",
        "text-galleries",
        "faq",
        "services-row",
        "drag-scroll",
        "square-patterns",
    ],
    "pricing": ["text-galleries", "faq", "square-patterns"],
    "services": ["text-galleries", "faq", "square-patterns", "drag-scroll"],
    "references": ["reference-search", "reference-table-scrollbar", "square-patterns"],
    "blog": ["latest-blogs", "square-patterns"],
    "blog_post": ["square-patterns"],
    "contact": ["square-patterns"],
    "about": ["square-patterns"],
    "sitemap": ["square-patterns"],
    "legal": ["square-patterns"],
    "other": ["square-patterns"],
}


BODY_RE = re.compile(r"<body(?P<attrs>[^>]*)>", re.IGNORECASE)


def classify_page(rel_posix: str) -> str:
    # Normalize
    rel_posix = rel_posix.lstrip("./")

    if rel_posix.startswith("pages/en/"):
        name = rel_posix.split("/")[-1]
        if name == "index.html":
            return "home"
        if name == "contact.html":
            return "contact"
        if name == "blog.html":
            return "blog"
        if name == "sitemap.html":
            return "sitemap"
        return "other"

    if rel_posix.startswith("pages/blog/"):
        return "blog_post"

    if rel_posix.startswith("tevekenysegeink/"):
        return "services"

    name = rel_posix.split("/")[-1]
    if name == "index.html":
        return "home"
    if name == "arak.html":
        return "pricing"
    if name == "kapcsolat.html":
        return "contact"
    if name == "bemutatkozas.html":
        return "about"
    if name == "referenciak.html":
        return "references"
    if name == "blog.html":
        return "blog"
    if name == "sitemap.html":
        return "sitemap"
    if name in {"adatkezelesi-tajekoztato.html", "cookie-policy.html"}:
        return "legal"

    return "other"


def stamp_body(html: str, page: str, features: list[str]) -> tuple[str, bool]:
    m = BODY_RE.search(html)
    if not m:
        return html, False

    attrs = m.group("attrs") or ""
    # Remove existing data-page/data-features to avoid duplicates
    attrs = re.sub(r'\sdata-page="[^"]*"', "", attrs, flags=re.IGNORECASE)
    attrs = re.sub(r'\sdata-features="[^"]*"', "", attrs, flags=re.IGNORECASE)

    features_str = " ".join(features).strip()
    insert = f' data-page="{page}" data-features="{features_str}"'
    new_tag = f"<body{attrs}{insert}>"

    new_html = html[: m.start()] + new_tag + html[m.end() :]
    return new_html, new_html != html


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent

    html_files: list[Path] = []
    for root, _, files in os.walk(repo_root):
        parts = Path(root).relative_to(repo_root).parts
        if parts and parts[0] in {"export", "content", "scripts", "partials", "docs"}:
            continue
        for f in files:
            if f.lower().endswith(".html"):
                html_files.append(Path(root) / f)

    changed: list[Path] = []
    for path in sorted(html_files):
        rel_posix = str(path.relative_to(repo_root)).replace("\\", "/")
        page = classify_page(rel_posix)
        features = FEATURES_BY_PAGE.get(page, FEATURES_BY_PAGE["other"])

        original = path.read_text(encoding="utf-8", errors="replace")
        updated, did_change = stamp_body(original, page, features)
        if did_change:
            path.write_text(updated, encoding="utf-8")
            changed.append(path.relative_to(repo_root))

    print(f"Stamped {len(changed)} pages with data-page/data-features:")
    for p in changed:
        print(f"- {p}")


if __name__ == "__main__":
    main()


