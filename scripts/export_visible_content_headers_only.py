import os
import re
from dataclasses import dataclass
from html import escape
from html.parser import HTMLParser
from typing import Iterable, List, Optional, Tuple


SKIP_TAGS = {
    "script",
    "style",
    "svg",
    "canvas",
    "template",
    "iframe",
    "object",
    "embed",
    "noscript",
}


def _collapse_ws(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def extract_title(html: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    if not m:
        return "Export"
    return _collapse_ws(re.sub(r"<[^>]+>", "", m.group(1))) or "Export"


def _attrs_to_dict(attrs: List[Tuple[str, Optional[str]]]) -> dict:
    d: dict = {}
    for k, v in attrs:
        if k is None:
            continue
        d[k.lower()] = "" if v is None else v
    return d


def _is_hidden(attrs: dict) -> bool:
    if "hidden" in attrs:
        return True
    aria_hidden = (attrs.get("aria-hidden") or "").strip().lower()
    if aria_hidden == "true":
        return True
    style = (attrs.get("style") or "").replace(" ", "").lower()
    if "display:none" in style or "visibility:hidden" in style:
        return True
    return False


@dataclass(frozen=True)
class TextRun:
    text: str
    level: int  # 1..6


class VisibleTextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._in_body = False
        self._skip_depth = 0
        self._tag_stack: List[str] = []
        self.runs: List[TextRun] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        t = tag.lower()
        self._tag_stack.append(t)

        if t == "body":
            self._in_body = True

        if not self._in_body:
            return

        if self._skip_depth > 0:
            self._skip_depth += 1
            return

        if t in SKIP_TAGS:
            self._skip_depth = 1
            return
        # NOTE: We intentionally do NOT skip hidden/aria-hidden content.
        # The user requested exporting *all content* (including FAQ answers that are hidden in the UI).

    def handle_endtag(self, tag: str) -> None:
        t = tag.lower()

        if self._in_body and self._skip_depth > 0:
            self._skip_depth -= 1

        if t == "body":
            self._in_body = False

        # Pop one matching tag from stack (best-effort; HTML can be messy)
        for i in range(len(self._tag_stack) - 1, -1, -1):
            if self._tag_stack[i] == t:
                del self._tag_stack[i]
                break

    def _current_heading_level(self) -> int:
        # If we are inside a heading, preserve that level; otherwise default to h6.
        for t in reversed(self._tag_stack):
            if t in {"h1", "h2", "h3", "h4", "h5", "h6"}:
                return int(t[1])
        return 6

    def handle_data(self, data: str) -> None:
        if not self._in_body or self._skip_depth > 0:
            return
        text = _collapse_ws(data)
        if not text:
            return

        level = self._current_heading_level()
        # Drop consecutive duplicates (common with repeated UI labels)
        if self.runs and self.runs[-1].text == text and self.runs[-1].level == level:
            return
        self.runs.append(TextRun(text=text, level=level))


def extract_visible_text_runs(html: str) -> List[TextRun]:
    parser = VisibleTextExtractor()
    parser.feed(html)
    parser.close()
    return parser.runs


def render_headers_only_html(title: str, lang: str, runs: Iterable[TextRun]) -> str:
    body_lines = [f"<h{r.level}>{escape(r.text)}</h{r.level}>" for r in runs]
    body = "\n".join(body_lines) + ("\n" if body_lines else "")
    return (
        "<!DOCTYPE html>\n"
        f'<html lang="{escape(lang)}">\n'
        "<head>\n"
        '  <meta charset="UTF-8">\n'
        f"  <title>{escape(title)}</title>\n"
        "</head>\n"
        "<body>\n"
        f"{body}"
        "</body>\n"
        "</html>\n"
    )


def detect_lang(html: str) -> str:
    m = re.search(r"<html[^>]*\slang=['\"]([^'\"]+)['\"]", html, flags=re.IGNORECASE)
    return (m.group(1).strip() if m else "hu") or "hu"


def export_page(src_path: str, out_path: str) -> None:
    with open(src_path, "r", encoding="utf-8", errors="replace") as f:
        html = f.read()
    title = extract_title(html)
    lang = detect_lang(html)
    runs = extract_visible_text_runs(html)
    out_html = render_headers_only_html(title=title, lang=lang, runs=runs)
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8", newline="\n") as f:
        f.write(out_html)


def main() -> int:
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    export_dir = os.path.join(repo_root, "export")

    pages: List[Tuple[str, str]] = [
        (os.path.join(repo_root, "index.html"), os.path.join(export_dir, "index.html")),
        (os.path.join(repo_root, "arak.html"), os.path.join(export_dir, "arak.html")),
        (os.path.join(repo_root, "tevekenysegeink", "index.html"), os.path.join(export_dir, "tevekenysegeink.html")),
        (
            os.path.join(repo_root, "tevekenysegeink", "kozbeszerzes-ajanlatkeroknek", "index.html"),
            os.path.join(export_dir, "kozbeszerzes-ajanlatkeroknek.html"),
        ),
        (
            os.path.join(repo_root, "tevekenysegeink", "kozbeszerzes-ajanlattevoknek", "index.html"),
            os.path.join(export_dir, "kozbeszerzes-ajanlattevoknek.html"),
        ),
    ]

    missing = [src for src, _ in pages if not os.path.exists(src)]
    if missing:
        print("Missing source files:")
        for m in missing:
            print(" -", m)
        return 2

    for src, out in pages:
        export_page(src_path=src, out_path=out)
        print(f"Exported: {os.path.relpath(out, repo_root)}  <=  {os.path.relpath(src, repo_root)}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())


