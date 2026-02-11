"""
Local dev server for this static site that supports a small set of "internal aliases".

Why this exists:
- Production hosting may use Apache + .htaccess rewrites.
- `python -m http.server` does NOT read .htaccess, so moved folders would 404 locally.

Usage:
  python dev_server.py 8000
  # then open http://localhost:8000/
"""

from __future__ import annotations

import sys
import socket
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit


SITE_ROOT = Path(__file__).resolve().parent

# Public URL prefix -> filesystem directory
ALIASES: dict[str, Path] = {
    "/kozbeszerzes-ertekhatar/": SITE_ROOT
    / "tevekenysegeink"
    / "kozbeszerzes-ajanlatkeroknek"
    / "kozbeszerzes-ertekhatar",
}


def _safe_join(base: Path, rel_posix: str) -> Path:
    """
    Join a URL-relative path (posix style) onto a base directory, preventing traversal.
    """
    rel = PurePosixPath(rel_posix)
    safe_parts: list[str] = []
    for p in rel.parts:
        if p in ("", ".", "/"):
            continue
        if p == "..":
            continue
        safe_parts.append(p)
    return base.joinpath(*safe_parts)


class AliasRequestHandler(SimpleHTTPRequestHandler):
    # Python's SimpleHTTPRequestHandler supports a base directory via `directory=...`.
    # We set it to the repo root so normal static files still work.
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def do_GET(self):
        # Normalize missing trailing slash for folder URL (helps local navigation)
        if self.path == "/kozbeszerzes-ertekhatar":
            self.send_response(301)
            self.send_header("Location", "/kozbeszerzes-ertekhatar/")
            self.end_headers()
            return
        return super().do_GET()

    def do_HEAD(self):
        if self.path == "/kozbeszerzes-ertekhatar":
            self.send_response(301)
            self.send_header("Location", "/kozbeszerzes-ertekhatar/")
            self.end_headers()
            return
        return super().do_HEAD()

    def translate_path(self, path: str) -> str:
        # Strip query/fragment, URL-decode
        url_path = unquote(urlsplit(path).path)

        for prefix, target_dir in ALIASES.items():
            if url_path.startswith(prefix):
                rel = url_path[len(prefix) :]  # may be ''
                return str(_safe_join(target_dir, rel))

        return super().translate_path(url_path)


class DualStackServer(ThreadingHTTPServer):
    """
    Serve on IPv6 and (when supported) also accept IPv4 connections via v4-mapped addresses.
    This helps on Windows where `localhost` often resolves to `::1` first.
    """

    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except OSError:
            # If we can't change this, IPv6-only is still fine for localhost.
            pass
        return super().server_bind()


def main(argv: list[str]) -> int:
    try:
        port = int(argv[1]) if len(argv) > 1 else 8000
    except ValueError:
        print("Port must be an integer, e.g. 8000", file=sys.stderr)
        return 2

    server = DualStackServer(("::", port), AliasRequestHandler)
    print(f"Serving {SITE_ROOT} at http://localhost:{port}/ (dual-stack)")
    print("Alias enabled: /kozbeszerzes-ertekhatar/ -> /tevekenysegeink/kozbeszerzes-ajanlatkeroknek/kozbeszerzes-ertekhatar/")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))


