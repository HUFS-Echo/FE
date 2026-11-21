"""첨부된 부엉이 일러스트를 웹용 PNG로 정리한다.

- 여행가방 시트는 원본부터 알파 채널이 있으므로 그대로 살린다(왼쪽 캐릭터만 크롭).
- 축구복 이미지는 흰 배경을 테두리 flood fill로 지운다. 배 안쪽 흰색은 외곽선에
  둘러싸여 있어 보존된다.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
UPLOAD = Path("/home/ubuntu/upload")
OUT = ROOT / "public" / "owls"
OUT.mkdir(parents=True, exist_ok=True)
MARKER = (255, 0, 255)


def find_sources() -> dict[str, Path]:
    found: dict[str, Path] = {}
    for path in sorted(UPLOAD.glob("*.png")):
        with Image.open(path) as image:
            width, height = image.size
            has_alpha = image.mode in ("RGBA", "LA") and image.convert("RGBA").getchannel("A").getextrema()[0] < 250
        if has_alpha:
            found["suitcase"] = path
        else:
            found["football"] = path
    if len(found) < 2:
        raise SystemExit(f"부엉이 이미지를 찾지 못했습니다: {found}")
    return found


def save(image: Image.Image, name: str, max_height: int) -> None:
    bbox = image.getchannel("A").getbbox()
    if bbox:
        pad = 10
        image = image.crop(
            (
                max(0, bbox[0] - pad),
                max(0, bbox[1] - pad),
                min(image.width, bbox[2] + pad),
                min(image.height, bbox[3] + pad),
            )
        )
    if image.height > max_height:
        ratio = max_height / image.height
        image = image.resize((round(image.width * ratio), max_height), Image.LANCZOS)
    path = OUT / f"{name}.png"
    image.save(path, optimize=True)
    alpha = image.getchannel("A")
    print(f"{path.name}: {image.width}x{image.height} · alpha {alpha.getextrema()} · {path.stat().st_size // 1024}KB")


def cut_white_background(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    work = rgb.copy()
    for point in [(0, 0), (width - 1, 0), (0, height - 1), (width - 1, height - 1)]:
        if work.getpixel(point) != MARKER:
            ImageDraw.floodfill(work, point, MARKER, thresh=82)

    mask = Image.new("L", (width, height), 0)
    pixels = mask.load()
    work_pixels = work.load()
    filled = 0
    for y in range(height):
        for x in range(width):
            if work_pixels[x, y] == MARKER:
                pixels[x, y] = 255
                filled += 1

    mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = rgb.convert("RGBA")
    alpha = rgba.getchannel("A")
    alpha = Image.composite(Image.new("L", (width, height), 0), alpha, mask)
    rgba.putalpha(alpha)
    print(f"  background coverage: {filled / (width * height):.1%}")
    return rgba


SOURCES = find_sources()
suitcase = Image.open(SOURCES["suitcase"]).convert("RGBA")
# 원본은 두 캐릭터가 나란히 있다. 왼쪽(여행가방을 든) 캐릭터만 사용한다.
suitcase = suitcase.crop((0, 0, suitcase.width // 2, suitcase.height))
save(suitcase, "suitcase", 880)

football = cut_white_background(Image.open(SOURCES["football"]))
save(football, "football", 900)
