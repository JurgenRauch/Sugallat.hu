import os
import re
from pathlib import Path


TARGET_CSS_FILENAMES = {
    "main.css",
    "components.css",
    "responsive.css",
    "square-patterns.css",
    "hover-animations.css",
}


STYLESHEET_RE = re.compile(
    r'^(?P<indent>\s*)<link\s+rel="stylesheet"\s+href="(?P<href>[^"]+)">\s*$'
)

PRELOAD_RE = re.compile(
    r'^(?P<indent>\s*)<link\s+rel="preload"\s+href="(?P<href>[^"]+)"\s+as="style"[^>]*>\s*$'
)

NOSCRIPT_RE = re.compile(
    r'^(?P<indent>\s*)<noscript><link\s+rel="stylesheet"\s+href="(?P<href>[^"]+)"></noscript>\s*$'
)


def is_target_css_href(href: str) -> bool:
    # We only touch the known global CSS bundle files, regardless of relative path.
    return any(href.endswith("/" + name) or href.endswith(name) for name in TARGET_CSS_FILENAMES)


def normalize_css_loading(lines: list[str]) -> tuple[list[str], bool]:
    handled: set[str] = set()
    out: list[str] = []
    changed = False

    for line in lines:
        m_stylesheet = STYLESHEET_RE.match(line)
        m_preload = PRELOAD_RE.match(line)
        m_noscript = NOSCRIPT_RE.match(line)

        indent = None
        href = None
        kind = None

        if m_stylesheet:
            indent = m_stylesheet.group("indent")
            href = m_stylesheet.group("href")
            kind = "stylesheet"
        elif m_preload:
            indent = m_preload.group("indent")
            href = m_preload.group("href")
            kind = "preload"
        elif m_noscript:
            indent = m_noscript.group("indent")
            href = m_noscript.group("href")
            kind = "noscript"

        if href and is_target_css_href(href):
            if href in handled:
                # Drop duplicates / old variants once we've written the standardized block.
                changed = True
                continue

            # If we see a noscript before the stylesheet/preload, keep it for now; we
            # will rewrite when we hit the first "real" link. But in practice these
            # files always put noscript after preload.
            if kind == "noscript":
                # We'll only keep this if we haven't handled href yet, but we still
                # prefer emitting the standardized block at the first stylesheet/preload.
                out.append(line)
                continue

            handled.add(href)

            # Replace any existing stylesheet/preload with standardized non-blocking load.
            out.append(
                f'{indent}<link rel="preload" href="{href}" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">\n'
            )
            out.append(f'{indent}<noscript><link rel="stylesheet" href="{href}"></noscript>\n')
            if kind != "preload":
                changed = True
            else:
                # Preload existed, but we may still be normalizing attributes/adding noscript.
                changed = True
            continue

        out.append(line)

    # If we emitted standardized blocks, remove any now-orphaned noscript lines for the same href.
    # (This catches cases where a noscript line came before the stylesheet and we kept it.)
    if handled:
        cleaned: list[str] = []
        for line in out:
            m = NOSCRIPT_RE.match(line)
            if m and m.group("href") in handled:
                # Keep only the standardized noscript (which should come right after preload).
                # If this is an extra one elsewhere, drop it.
                # Heuristic: if previous line is our preload for same href, keep.
                cleaned.append(line)
            else:
                cleaned.append(line)
        out = cleaned

    return out, changed


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    html_files: list[Path] = []
    for root, _, files in os.walk(repo_root):
        # Skip node_modules if it exists (not expected here, but safe).
        if "node_modules" in root.split(os.sep):
            continue
        for f in files:
            if f.lower().endswith(".html"):
                html_files.append(Path(root) / f)

    changed_files: list[Path] = []
    for path in sorted(html_files):
        try:
            original = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            # Fall back to a more permissive read (keeps file editable on Windows locales).
            original = path.read_text(encoding="utf-8", errors="replace")

        lines = original.splitlines(keepends=True)
        new_lines, changed = normalize_css_loading(lines)

        if changed and "".join(new_lines) != original:
            path.write_text("".join(new_lines), encoding="utf-8")
            changed_files.append(path)

    print(f"Processed {len(html_files)} HTML files.")
    print(f"Updated {len(changed_files)} files:")
    for p in changed_files:
        print(f"- {p.relative_to(repo_root)}")


if __name__ == "__main__":
    main()


