"""Generate hero illustrations: 3 onboarding screens + splash variants."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).parent
W, H = 1080, 1080

BG_TOP = (255, 90, 95)
BG_BOT = (155, 60, 220)
FG = (255, 255, 255)
FG_SOFT = (255, 255, 255, 160)


def gradient_bg(size_w, size_h, top, bot):
    base = Image.new("RGB", (1, size_h), top)
    px = base.load()
    for y in range(size_h):
        t = y / (size_h - 1)
        px[0, y] = tuple(int(top[i] * (1 - t) + bot[i] * t) for i in range(3))
    return base.resize((size_w, size_h))


def hero_curate():
    """A grid of 9 photo squares with a glowing star on the best one."""
    img = gradient_bg(W, H, BG_TOP, BG_BOT)
    d = ImageDraw.Draw(img, "RGBA")
    cols = 3; gap = 40; size = (W - gap * (cols + 1)) // cols
    fills = [(255, 220, 220), (220, 235, 255), (220, 255, 220),
             (255, 200, 255), (255, 240, 200), (200, 255, 255),
             (255, 210, 230), (230, 230, 255), (255, 200, 200)]
    for r in range(3):
        for c in range(3):
            x = gap + c * (size + gap)
            y = 220 + r * (size + gap)
            color = fills[r * 3 + c]
            d.rounded_rectangle((x, y, x + size, y + size), radius=28, fill=color + (220,))
            if r == 1 and c == 1:
                # star marker
                cx, cy = x + size // 2, y + size // 2
                points = []
                for i in range(10):
                    ang = -math.pi / 2 + i * math.pi / 5
                    rad = 80 if i % 2 == 0 else 32
                    points.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
                d.polygon(points, fill=(255, 255, 255, 240), outline=BG_TOP)
    img.save(OUT / "hero-curate.png")


def hero_enhance():
    """Two halves: before (low-contrast) and after (vivid) of the same shape."""
    img = gradient_bg(W, H, BG_TOP, BG_BOT)
    d = ImageDraw.Draw(img, "RGBA")
    # Title strip
    pad = 80
    for half, shift in enumerate(((pad, 200), (W // 2 + 40, 200))):
        x0, y0 = shift
        x1 = x0 + (W // 2 - 120)
        y1 = H - 200
        d.rounded_rectangle((x0, y0, x1, y1), radius=36, fill=(0, 0, 0, 30))
        # mountains
        if half == 0:  # before
            d.polygon([(x0 + 40, y1 - 60), (x0 + 180, y1 - 280), (x0 + 320, y1 - 120),
                       (x0 + 420, y1 - 220), (x1 - 40, y1 - 60)],
                      fill=(190, 195, 200, 220))
            d.ellipse((x0 + 250, y0 + 60, x0 + 350, y0 + 160), fill=(220, 220, 220, 240))
        else:  # after — punchier colors
            d.polygon([(x0 + 40, y1 - 60), (x0 + 180, y1 - 280), (x0 + 320, y1 - 120),
                       (x0 + 420, y1 - 220), (x1 - 40, y1 - 60)],
                      fill=(80, 60, 180, 240))
            d.ellipse((x0 + 250, y0 + 60, x0 + 350, y0 + 160), fill=(255, 220, 80, 240))
    img.save(OUT / "hero-enhance.png")


def hero_approve():
    """A phone outline with a notification bubble + ✅/❌ buttons."""
    img = gradient_bg(W, H, BG_TOP, BG_BOT)
    d = ImageDraw.Draw(img, "RGBA")
    # phone outline
    px, py, pw, ph = 280, 180, 520, 760
    d.rounded_rectangle((px, py, px + pw, py + ph), radius=56, fill=(255, 255, 255, 245), outline=(255, 255, 255, 255), width=6)
    # screen content - small photo + caption + buttons
    d.rounded_rectangle((px + 40, py + 80, px + pw - 40, py + 320), radius=24, fill=(220, 230, 240, 255))
    # caption lines
    for i in range(3):
        d.rounded_rectangle((px + 40, py + 360 + i * 40, px + pw - 40 - (i * 30), py + 380 + i * 40),
                            radius=8, fill=(200, 200, 210, 255))
    # ✅ ❌ buttons
    d.ellipse((px + 80, py + 580, px + 220, py + 720), fill=(22, 163, 74, 255))
    d.line((px + 110, py + 650, px + 145, py + 685, px + 195, py + 615), fill=(255, 255, 255, 255), width=10)
    d.ellipse((px + 300, py + 580, px + 440, py + 720), fill=(220, 38, 38, 255))
    d.line((px + 330, py + 610, px + 410, py + 690), fill=(255, 255, 255, 255), width=10)
    d.line((px + 410, py + 610, px + 330, py + 690), fill=(255, 255, 255, 255), width=10)
    img.save(OUT / "hero-approve.png")


hero_curate(); hero_enhance(); hero_approve()
print("hero-curate.png, hero-enhance.png, hero-approve.png")
