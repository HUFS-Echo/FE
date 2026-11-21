"""Generate the dot-globe land data, vendor flag images and a static fallback globe.

Run from the project root:  python3 scripts/build_globe_assets.py
"""
from __future__ import annotations

import json
import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import Point, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
SRC = ROOT / "src" / "globe"
CACHE = ROOT / ".cache"

LAND_URL = (
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/"
    "geojson/ne_110m_land.geojson"
)

# initial camera target, must match src/config/tuning.ts
VIEW_LAT = 30.0
VIEW_LON = 55.0
SEOUL = (37.59, 127.06)

# language pins: (id, lat, lon, active)
PINS = [
    ("pt", 38.72, -9.14, True),
    ("br", -15.79, -47.88, True),
    ("nl", 52.37, 4.90, False),
    ("id", -6.21, 106.85, False),
    ("mn", 47.89, 106.91, False),
    ("se", 59.33, 18.07, False),
    ("tz", -6.79, 39.21, False),
    ("it", 41.90, 12.50, False),
    ("gr", 37.98, 23.73, False),
    ("cz", 50.08, 14.44, False),
    ("in", 28.61, 77.21, False),
    ("uz", 41.30, 69.24, False),
    ("kz", 51.17, 71.45, False),
    ("th", 13.76, 100.50, False),
    ("la", 17.97, 102.63, False),
    ("tr", 39.93, 32.86, False),
    ("az", 40.41, 49.87, False),
    ("ir", 35.69, 51.39, False),
    ("pl", 52.23, 21.01, False),
    ("hu", 47.50, 19.04, False),
    ("ua", 50.45, 30.52, False),
    ("hr", 45.81, 15.98, False),
]

FLAGS = sorted({p[0] for p in PINS})


def download(url: str, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return
    print("download", url)
    req = urllib.request.Request(url, headers={"User-Agent": "HUFS-Echo-build/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        dest.write_bytes(resp.read())


def build_land_dots() -> list[list[float]]:
    """Sample an equal-area lat/lon dot grid, keeping only land points."""
    CACHE.mkdir(exist_ok=True)
    geojson_path = CACHE / "ne_110m_land.geojson"
    download(LAND_URL, geojson_path)
    data = json.loads(geojson_path.read_text())
    land = unary_union([shape(feature["geometry"]) for feature in data["features"]])

    # points per row proportional to cos(lat): constant spacing on the sphere
    rows = 150
    equator_points = 214
    dots: list[list[float]] = []
    for row in range(rows):
        lat = -90.0 + (row + 0.5) * (180.0 / rows)
        count = max(3, round(equator_points * math.cos(math.radians(lat))))
        offset = 0.5 if row % 2 == 0 else 0.0
        for i in range(count):
            lon = -180.0 + (i + offset) * (360.0 / count)
            if land.contains(Point(lon, lat)):
                dots.append([round(lat, 2), round(lon, 2)])
    print("land dots:", len(dots))
    return dots


def rotate(lat: float, lon: float) -> tuple[float, float, float]:
    """Return the orthographic camera-space position for the initial view."""
    phi = math.radians(lat)
    lam = math.radians(lon)
    x = math.cos(phi) * math.sin(lam)
    y = math.sin(phi)
    z = math.cos(phi) * math.cos(lam)

    a = math.radians(-VIEW_LON)
    x1 = x * math.cos(a) + z * math.sin(a)
    z1 = -x * math.sin(a) + z * math.cos(a)

    b = math.radians(VIEW_LAT)
    y2 = y * math.cos(b) - z1 * math.sin(b)
    z2 = y * math.sin(b) + z1 * math.cos(b)
    return x1, y2, z2


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def mix(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def build_fallback(dots: list[list[float]]) -> None:
    size = 1600
    cx = cy = size / 2
    radius = size * 0.405

    yy, xx = np.mgrid[0:size, 0:size]
    dx = xx - cx
    dy = yy - cy
    dist = np.sqrt(dx * dx + dy * dy)

    # --- ocean body: dark navy with a soft upper-left lift -----------------
    ocean = np.zeros((size, size, 4), dtype=np.uint8)
    lift = np.clip((0.55 - dx / size * 0.7 - dy / size * 0.35), 0, 1)
    base_rgb = hex_rgb("#081226")
    for i in range(3):
        ocean[..., i] = base_rgb[i]
    # add a gentle radial shading
    shade = np.clip(1.15 - (dist / radius) * 0.55, 0, 1.15)
    ocean[..., 0] = np.clip(ocean[..., 0] * shade + lift * 10, 0, 255)
    ocean[..., 1] = np.clip(ocean[..., 1] * shade + lift * 18, 0, 255)
    ocean[..., 2] = np.clip(ocean[..., 2] * shade + lift * 34, 0, 255)
    inside = dist <= radius
    ocean[..., 3] = np.where(inside, 255, 0)
    img = Image.fromarray(ocean, "RGBA")

    # --- atmosphere: smooth exponential falloff outside the rim ------------
    outside = np.clip(dist - radius, 0, None)
    halo_alpha = np.where(
        dist > radius,
        118 * np.exp(-outside / (radius * 0.085)),
        0,
    )
    t = np.clip(outside / (radius * 0.26), 0, 1)
    inner = np.array(hex_rgb("#2856A8"), dtype=float)
    outer = np.array(hex_rgb("#5B8DEF"), dtype=float)
    halo_rgb = inner[None, None, :] * (1 - t[..., None]) + outer[None, None, :] * t[..., None]
    halo = np.zeros((size, size, 4), dtype=np.uint8)
    halo[..., :3] = np.clip(halo_rgb, 0, 255).astype(np.uint8)
    halo[..., 3] = np.clip(halo_alpha, 0, 255).astype(np.uint8)
    halo_img = Image.fromarray(halo, "RGBA").filter(ImageFilter.GaussianBlur(size * 0.006))
    img.alpha_composite(halo_img)

    # --- rim line ----------------------------------------------------------
    rim = np.zeros((size, size, 4), dtype=np.uint8)
    band = np.exp(-((dist - radius * 0.995) / (size * 0.0022)) ** 2)
    rim[..., 0] = 150
    rim[..., 1] = 196
    rim[..., 2] = 255
    rim[..., 3] = np.clip(band * 235, 0, 255).astype(np.uint8)
    img.alpha_composite(Image.fromarray(rim, "RGBA"))

    # --- dots --------------------------------------------------------------
    dots_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    dd = ImageDraw.Draw(dots_layer)
    for lat, lon in dots:
        x, y, z = rotate(lat, lon)
        if z <= 0.02:
            continue
        px = cx + x * radius
        py = cy - y * radius
        depth = max(0.0, min(1.0, z))
        r = size * 0.00118 * (0.72 + 0.45 * depth)
        alpha = int(92 + 140 * depth)
        color = mix(hex_rgb("#7EA6E8"), hex_rgb("#D3E4FF"), depth)
        dd.ellipse((px - r, py - r, px + r, py + r), fill=(*color, alpha))
    img.alpha_composite(dots_layer)

    # --- arcs --------------------------------------------------------------
    arc_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ad = ImageDraw.Draw(arc_layer)

    def arc_points(a, b, height):
        ax, ay, az = rotate(*a)
        bx, by, bz = rotate(*b)
        va = (ax, ay, az)
        vb = (bx, by, bz)
        mx, my, mz = ((va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2)
        length = math.sqrt(mx * mx + my * my + mz * mz) or 1
        ctrl = (mx / length * (1 + height), my / length * (1 + height), mz / length * (1 + height))
        pts = []
        for i in range(81):
            t = i / 80
            pts.append(
                (
                    (1 - t) ** 2 * va[0] + 2 * (1 - t) * t * ctrl[0] + t * t * vb[0],
                    (1 - t) ** 2 * va[1] + 2 * (1 - t) * t * ctrl[1] + t * t * vb[1],
                    (1 - t) ** 2 * va[2] + 2 * (1 - t) * t * ctrl[2] + t * t * vb[2],
                )
            )
        return pts

    for pid, lat, lon, active in PINS:
        pts = arc_points(SEOUL, (lat, lon), 0.42 if active else 0.62)
        screen = [(cx + x * radius, cy - y * radius, z) for x, y, z in pts]
        for i in range(len(screen) - 1):
            if screen[i][2] <= 0 or screen[i + 1][2] <= 0:
                continue
            color = (156, 214, 255, 200) if active else (110, 170, 250, 46)
            width = max(2, int(size * (0.0028 if active else 0.0011)))
            ad.line([screen[i][:2], screen[i + 1][:2]], fill=color, width=width)
    arc_layer = arc_layer.filter(ImageFilter.GaussianBlur(size * 0.0013))
    img.alpha_composite(arc_layer)

    # --- seoul ripples + pin ----------------------------------------------
    sx, sy, sz = rotate(*SEOUL)
    if sz > 0:
        spx, spy = cx + sx * radius, cy - sy * radius
        for rr, alpha in ((radius * 0.05, 120), (radius * 0.095, 60), (radius * 0.145, 28)):
            ring = Image.new("RGBA", (size, size), (0, 0, 0, 0))
            rd = ImageDraw.Draw(ring)
            rd.ellipse(
                (spx - rr, spy - rr * 0.55, spx + rr, spy + rr * 0.55),
                outline=(170, 220, 255, alpha),
                width=max(2, int(size * 0.0018)),
            )
            ring = ring.filter(ImageFilter.GaussianBlur(size * 0.0018))
            img.alpha_composite(ring)
        dot = ImageDraw.Draw(img)
        r = size * 0.0055
        dot.ellipse((spx - r, spy - r, spx + r, spy + r), fill=(240, 248, 255, 255))

    # --- language pins -----------------------------------------------------
    pin_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pd = ImageDraw.Draw(pin_layer)
    for pid, lat, lon, active in PINS:
        x, y, z = rotate(lat, lon)
        if z <= 0.04:
            continue
        px, py = cx + x * radius, cy - y * radius
        if active:
            rr = size * 0.0075
            for k in range(5, 0, -1):
                pd.ellipse(
                    (px - rr * k * 0.62, py - rr * k * 0.62, px + rr * k * 0.62, py + rr * k * 0.62),
                    fill=(91, 141, 239, int(12 + (5 - k) * 5)),
                )
            pd.ellipse((px - rr, py - rr, px + rr, py + rr), fill=(206, 231, 255, 255))
            pd.ellipse(
                (px - rr * 0.44, py - rr * 0.44, px + rr * 0.44, py + rr * 0.44),
                fill=(91, 141, 239, 255),
            )
        else:
            rr = size * 0.0028
            pd.ellipse((px - rr, py - rr, px + rr, py + rr), fill=(226, 236, 252, 205))
    img.alpha_composite(pin_layer)

    out = PUBLIC / "fallback-globe.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    print("wrote", out, out.stat().st_size)


def fetch_flags() -> None:
    for code in FLAGS:
        download(f"https://flagcdn.com/w80/{code}.png", PUBLIC / "flags" / f"{code}.png")
    print("flags:", len(FLAGS))


def main() -> None:
    dots = build_land_dots()
    SRC.mkdir(parents=True, exist_ok=True)
    out = SRC / "landDots.json"
    out.write_text(json.dumps(dots, separators=(",", ":")))
    print("wrote", out, out.stat().st_size)
    build_fallback(dots)
    fetch_flags()


if __name__ == "__main__":
    main()
