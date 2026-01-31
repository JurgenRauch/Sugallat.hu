import os
import re
from pathlib import Path


def compute_root_prefix(file_path: Path, repo_root: Path) -> str:
    rel = file_path.relative_to(repo_root)
    depth = len(rel.parts) - 1  # exclude filename
    return "../" * depth


def compute_hu_self_href(file_path: Path, repo_root: Path) -> str:
    rel = file_path.relative_to(repo_root)
    if rel.name == "index.html" and len(rel.parts) > 1:
        return "./"
    return rel.name


def compute_en_self_href(file_path: Path, repo_root: Path) -> str:
    # EN pages are always under pages/en/
    rel = file_path.relative_to(repo_root)
    if rel.name == "index.html":
        return "index.html"
    return rel.name


HU_TO_EN = {
    "index.html": "pages/en/index.html",
    "kapcsolat.html": "pages/en/contact.html",
    "blog.html": "pages/en/blog.html",
    "sitemap.html": "pages/en/sitemap.html",
}

EN_TO_HU = {
    "pages/en/index.html": "index.html",
    "pages/en/contact.html": "kapcsolat.html",
    "pages/en/blog.html": "blog.html",
    "pages/en/sitemap.html": "sitemap.html",
}


def compute_lang_links(file_path: Path, repo_root: Path) -> dict[str, str]:
    rel_str = str(file_path.relative_to(repo_root)).replace("\\", "/")
    root = compute_root_prefix(file_path, repo_root)

    is_en = rel_str.startswith("pages/en/")

    if is_en:
        en_href = compute_en_self_href(file_path, repo_root)
        hu_target = EN_TO_HU.get(rel_str, "index.html")
        hu_href = f"{root}{hu_target}"
    else:
        hu_href = compute_hu_self_href(file_path, repo_root)
        en_target = HU_TO_EN.get(rel_str, "pages/en/index.html")
        en_href = f"{root}{en_target}"

    return {"root": root, "huHref": hu_href, "enHref": en_href}


HEADER_START_RE = re.compile(r'^(?P<indent>[ \t]*)<div\s+id="header-placeholder">', re.M)
FOOTER_START_RE = re.compile(r'^(?P<indent>[ \t]*)<div\s+id="footer-placeholder">', re.M)


def find_matching_div_end(html: str, start_idx: int) -> int:
    # Counts <div ...> and </div> from start_idx to find the matching closing tag of the
    # outer div. Assumes no <div> tags inside scripts/comments in that block (true for our header/footer).
    tag_re = re.compile(r"</div\b|<div\b", re.I)
    count = 0
    for m in tag_re.finditer(html, start_idx):
        token = m.group(0).lower()
        if token == "<div":
            count += 1
        else:
            count -= 1
            if count == 0:
                # include the full closing tag
                close_end = html.find(">", m.start())
                return close_end + 1 if close_end != -1 else m.end()
    raise ValueError("Failed to find matching </div> for placeholder block")


def indent_block(block: str, indent: str) -> str:
    lines = block.splitlines()
    # Keep trailing newline behavior consistent with existing files.
    return "\n".join((indent + l) if l else "" for l in lines).rstrip() + "\n"


def render_template(template: str, variables: dict[str, str]) -> str:
    out = template
    for k, v in variables.items():
        out = out.replace("{{" + k + "}}", v)
    return out


def sync_file(path: Path, repo_root: Path, header_hu: str, header_en: str, footer: str) -> bool:
    html = path.read_text(encoding="utf-8", errors="replace")

    if 'id="header-placeholder"' not in html or 'id="footer-placeholder"' not in html:
        return False

    vars_common = compute_lang_links(path, repo_root)
    rel_str = str(path.relative_to(repo_root)).replace("\\", "/")
    is_en = rel_str.startswith("pages/en/")

    header_tpl = header_en if is_en else header_hu

    # Extra EN-only variables for template convenience
    if is_en:
        vars_common = {
            **vars_common,
            "enSelfHref": compute_en_self_href(path, repo_root),
            "enContactHref": "contact.html",
            "enBlogHref": "blog.html",
            "enSitemapHref": "sitemap.html",
        }

    new_header = render_template(header_tpl, vars_common)
    new_footer = render_template(footer, {"root": vars_common["root"]})

    # Replace header block
    hm = HEADER_START_RE.search(html)
    if not hm:
        return False
    h_indent = hm.group("indent")
    h_start = hm.start()
    h_end = find_matching_div_end(html, hm.start())
    html = html[:h_start] + indent_block(new_header, h_indent) + html[h_end:]

    # Replace footer block (search again on updated html)
    fm = FOOTER_START_RE.search(html)
    if not fm:
        return False
    f_indent = fm.group("indent")
    f_start = fm.start()
    f_end = find_matching_div_end(html, fm.start())
    html = html[:f_start] + indent_block(new_footer, f_indent) + html[f_end:]

    path.write_text(html, encoding="utf-8")
    return True


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent

    header_hu = (repo_root / "partials" / "header-hu.html").read_text(encoding="utf-8")
    header_en = (repo_root / "partials" / "header-en.html").read_text(encoding="utf-8")
    footer = (repo_root / "partials" / "footer.html").read_text(encoding="utf-8")

    changed = []
    for root, _, files in os.walk(repo_root):
        # Skip non-site directories
        parts = Path(root).relative_to(repo_root).parts
        if parts and parts[0] in {"export", "content", "scripts", "partials", "docs"}:
            continue
        for f in files:
            if not f.lower().endswith(".html"):
                continue
            path = Path(root) / f
            if sync_file(path, repo_root, header_hu, header_en, footer):
                changed.append(path.relative_to(repo_root))

    print(f"Updated {len(changed)} pages:")
    for p in changed:
        print(f"- {p}")


if __name__ == "__main__":
    main()


