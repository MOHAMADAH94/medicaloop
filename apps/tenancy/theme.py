"""Clinic UI theme helpers — overlay a custom color on specialty branding."""

from __future__ import annotations

import re

THEME_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")


def _rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _hex(r: int, g: int, b: int) -> str:
    def clamp(n: int) -> int:
        return max(0, min(255, n))

    return f"#{clamp(r):02X}{clamp(g):02X}{clamp(b):02X}"


def mix_hex(color: str, other: str, t: float) -> str:
    a = _rgb(color)
    b = _rgb(other)
    return _hex(
        round(a[0] + (b[0] - a[0]) * t),
        round(a[1] + (b[1] - a[1]) * t),
        round(a[2] + (b[2] - a[2]) * t),
    )


def overlay_theme_color(branding: dict, color: str) -> dict:
    primary = color if color.startswith("#") else f"#{color}"
    primary = primary.upper()
    return {
        **branding,
        "primary": primary,
        "primary_dark": mix_hex(primary, "#000000", 0.28),
        "secondary": mix_hex(primary, "#FFFFFF", 0.22),
        "accent": mix_hex(primary, "#FFFFFF", 0.72),
        "surface": mix_hex(primary, "#FFFFFF", 0.94),
        "gradient": f"linear-gradient(135deg, {primary} 0%, {mix_hex(primary, '#FFFFFF', 0.22)} 100%)",
    }


def clinic_theme_color(clinic) -> str:
    from django.core.exceptions import ObjectDoesNotExist

    try:
        return (clinic.settings.theme_color or "").strip()
    except ObjectDoesNotExist:
        return ""


def clinic_branding(clinic, theme_color: str | None = None) -> dict:
    from specialties.base.pack import branding_dict

    data = branding_dict(clinic.specialty_code)
    color = (theme_color if theme_color is not None else clinic_theme_color(clinic)).strip()
    if THEME_COLOR_RE.match(color):
        return overlay_theme_color(data, color)
    return data
