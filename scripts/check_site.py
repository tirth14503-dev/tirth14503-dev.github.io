#!/usr/bin/env python3
"""Dependency-free integrity checks for the static portfolio site."""

from __future__ import annotations

import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
MAX_INDEX_BYTES = 350_000
CASE_KEYS = ("forecast", "kehe", "automation", "segmentation", "churn", "optimization")


class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.references: list[tuple[str, str]] = []
        self.ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.add(values["id"] or "")
        attr = "href" if tag in {"a", "link"} else "src" if tag in {"img", "script", "source"} else None
        if attr and values.get(attr):
            self.references.append((tag, values[attr] or ""))


def local_target(raw_url: str) -> Path | None:
    if raw_url.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        return None
    parsed = urlsplit(raw_url)
    if parsed.scheme or parsed.netloc:
        return None
    path = unquote(parsed.path)
    if path in {"", "/"}:
        return INDEX
    return ROOT / path.lstrip("/")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    if not INDEX.exists():
        fail("index.html is missing")
    html = INDEX.read_text(encoding="utf-8")
    parser = AssetParser()
    parser.feed(html)

    required_ids = {"hero", "hero-canvas", "projects", "case-modal", "journeymap", "jm-globe", "lab", "contact"}
    missing_ids = sorted(required_ids - parser.ids)
    if missing_ids:
        fail("missing critical IDs: " + ", ".join(missing_ids))

    if INDEX.stat().st_size > MAX_INDEX_BYTES:
        fail(f"index.html exceeds the {MAX_INDEX_BYTES:,}-byte performance budget")
    if "data:font/" in html or "data:application/pdf" in html:
        fail("cacheable fonts or the resume were embedded back into index.html")

    missing_assets: list[str] = []
    for tag, reference in parser.references:
        target = local_target(reference)
        if target is not None and not target.exists():
            missing_assets.append(f"{tag}: {reference}")
    if missing_assets:
        fail("missing local assets:\n  " + "\n  ".join(sorted(set(missing_assets))))

    signatures = {
        ROOT / "Tirthal_Kothari_Resume.pdf": b"%PDF",
        ROOT / "assets/fonts/fraunces-variable.woff2": b"wOF2",
    }
    for path, signature in signatures.items():
        if not path.exists() or not path.read_bytes().startswith(signature):
            fail(f"invalid or missing critical asset: {path.relative_to(ROOT)}")
    three = ROOT / "assets/vendor/three-r128.min.js"
    if not three.exists() or b"/**" not in three.read_bytes()[:8]:
        fail("invalid or missing critical asset: assets/vendor/three-r128.min.js")

    card_keys = set(re.findall(r'data-case="([a-z0-9-]+)"', html))
    hash_keys = set(re.findall(r"\b([a-z0-9-]+):\{badge:", html))
    if not card_keys or not card_keys.issubset(hash_keys):
        fail("one or more project cards do not have matching case-study data")

    if html.count('<main ') != 1 or 'href="#main-content" class="skip-link"' not in html:
        fail("homepage needs one main landmark and a matching skip link")
    if re.search(r'<span[^>]+class="nav-link"', html):
        fail("section navigation must use native anchor links")
    for key in CASE_KEYS:
        route = f"/projects/{key}/"
        if f'href="{route}"' not in html:
            fail(f"homepage has no direct case-study link: {route}")
        page = ROOT / route.strip("/") / "index.html"
        if not page.exists():
            fail(f"case study is missing: {route}")
        study_html = page.read_text(encoding="utf-8")
        study_parser = AssetParser()
        study_parser.feed(study_html)
        if study_html.count('<main ') != 1 or study_html.count('<h1 ') != 1:
            fail(f"case study needs one main and one H1: {route}")
        if f'rel="canonical" href="https://tirthalkothari.com{route}"' not in study_html:
            fail(f"case study canonical is missing: {route}")
        for tag, reference in study_parser.references:
            target = local_target(reference)
            if target is not None and not target.exists():
                fail(f"missing case-study asset ({route}): {reference}")
        if f"https://tirthalkothari.com{route}" not in (ROOT / "sitemap.xml").read_text(encoding="utf-8"):
            fail(f"case study is absent from sitemap: {route}")

    print(
        f"Site checks passed: {len(parser.ids)} IDs, "
        f"{len(parser.references)} references, {len(card_keys)} shareable case studies, "
        f"index {INDEX.stat().st_size:,} bytes."
    )


if __name__ == "__main__":
    main()
