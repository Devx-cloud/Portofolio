"""
Identitas visual situs: favicon dan gambar kartu pratinjau (Open Graph).

Dijalankan dari akar proyek:  python scripts/build-brand.py
Butuh Pillow. Menulis ke public/:
  favicon.svg, favicon-32.png, apple-touch-icon.png, og.jpg

Warna diturunkan dari token di src/index.css (palet terkunci), bukan hex karangan,
supaya ikon dan kartu pratinjau selalu sewarna dengan situsnya. Kalau palet
berubah, cukup ubah HSL di bawah lalu jalankan ulang.
"""

import colorsys
import os
import random

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100)
    return (round(r * 255), round(g * 255), round(b * 255))


# --- Palet (index.css :root) ---
PIT = hsl(232, 45, 3)
BACKGROUND = hsl(232, 36, 7)
SURFACE = hsl(231, 30, 11)
RAISED = hsl(230, 26, 17)
BORDER = hsl(228, 20, 30)
MUTED = hsl(222, 16, 70)
FOREGROUND = hsl(214, 28, 95)
PRIMARY = hsl(356, 80, 56)
PRIMARY_DIM = hsl(356, 60, 32)
PRIMARY_BRIGHT = hsl(6, 88, 72)

FONT_DIR = "src/assets/fonts"
OUT = "public"


def hex_(c):
    return "#%02x%02x%02x" % c


# =========================================================
# FAVICON - "X" dari Dev_X pada kisi 16x16
# =========================================================
GRID = 16
X_MIN, X_MAX = 3, 12  # kotak 10x10 di tengah, sisakan 3 petak di tiap sisi


def x_pixels():
    """Dua diagonal setebal 2 petak, dipotong ke dalam kotak X."""
    px = set()
    for i in range(X_MAX - X_MIN + 1):
        for x, y in ((X_MIN + i, X_MIN + i), (X_MIN + i, X_MAX - i)):
            for dx in (0, 1):
                if X_MIN <= x + dx <= X_MAX:
                    px.add((x + dx, y))
    return sorted(px)


def draw_grid_icon():
    im = Image.new("RGBA", (GRID, GRID), BACKGROUND + (255,))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, GRID - 1, GRID - 1), outline=BORDER + (255,))
    for x, y in x_pixels():
        im.putpixel((x, y), PRIMARY + (255,))
    return im


def write_favicons():
    rects = [f'<rect width="{GRID}" height="{GRID}" fill="{hex_(BACKGROUND)}"/>']
    rects.append(
        f'<path fill="none" stroke="{hex_(BORDER)}" stroke-width="1" d="M.5 .5h15v15h-15z"/>'
    )
    # Satu <path> untuk semua petak merah: jauh lebih kecil daripada 40 <rect>.
    cells = "".join(f"M{x} {y}h1v1h-1z" for x, y in x_pixels())
    rects.append(f'<path fill="{hex_(PRIMARY)}" d="{cells}"/>')
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {GRID} {GRID}" '
        f'shape-rendering="crispEdges">' + "".join(rects) + "</svg>\n"
    )
    with open(os.path.join(OUT, "favicon.svg"), "w", encoding="utf-8") as f:
        f.write(svg)

    icon = draw_grid_icon()
    icon.resize((32, 32), Image.NEAREST).save(os.path.join(OUT, "favicon-32.png"), optimize=True)

    # apple-touch-icon 180px: 16 petak x 11px = 176px, ditaruh di tengah kanvas 180px.
    # 180/16 tidak bulat, dan pixel art yang diskalakan tak bulat jadi petak selebar-sempit.
    scaled = icon.resize((GRID * 11, GRID * 11), Image.NEAREST)
    canvas = Image.new("RGB", (180, 180), BACKGROUND)
    canvas.paste(scaled.convert("RGB"), (2, 2))
    canvas.save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)
    print("favicon.svg, favicon-32.png, apple-touch-icon.png")


# =========================================================
# KARTU PRATINJAU 1200x630
# =========================================================
W, H = 1200, 630


def spaced(draw, xy, text, font, fill, tracking):
    """Teks dengan jarak antar-huruf. Font pixel dibuat tanpa letter-spacing."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def glow_layer(alpha, radius, color, strength):
    """Pendar dari bentuk (alpha) sebuah gambar - cahaya yang sama dengan sprite-cast di situs.

    Kanvasnya DIPERLUAS 3x radius di semua sisi sebelum diburamkan. Tanpa itu ekor
    blur terpotong di tepi gambar dan meninggalkan persegi panjang samar (selisih 1-2
    tingkat warna, tapi terlihat jelas sebagai garis lurus di latar gelap).
    Mengembalikan (layer, offset) - offset adalah pergeseran layer terhadap gambar asal.
    """
    pad = int(radius * 3)
    padded = Image.new("L", (alpha.width + 2 * pad, alpha.height + 2 * pad), 0)
    padded.paste(alpha, (pad, pad))
    a = padded.filter(ImageFilter.GaussianBlur(radius)).point(lambda v: int(v * strength))
    layer = Image.new("RGBA", padded.size, color + (0,))
    layer.putalpha(a)
    return layer, pad


def write_og():
    rnd = random.Random(2024)
    base = Image.new("RGB", (W, H), BACKGROUND)
    d = ImageDraw.Draw(base)

    # Langit: bintang kotak 2-4px, seperti StarBackground
    for _ in range(90):
        s = 4 if rnd.random() < 0.25 else 2
        x, y = rnd.randrange(0, W), rnd.randrange(0, int(H * 0.62))
        color = MUTED if rnd.random() < 0.7 else FOREGROUND  # undian tetap dipanggil: urutan bintang lain stabil
        # Kotak teks dikosongkan: bintang berwarna sama dengan teks kecil (MUTED), jadi
        # yang jatuh di bawah huruf terbaca sebagai bagian huruf - "DEVA" jadi "DEVĄ".
        if 60 <= x <= 660 and 90 <= y <= 440:
            continue
        d.rectangle((x, y, x + s - 1, y + s - 1), fill=color)

    # Siluet kota di bawah, mengisi lebar penuh
    city = Image.open("public/menu-bg.webp").convert("RGBA")
    ch = 520
    city = city.resize((round(city.width * ch / city.height), ch), Image.LANCZOS)
    left = (city.width - W) // 2
    city = city.crop((left, 0, left + W, ch))
    canvas = base.convert("RGBA")
    canvas.alpha_composite(city, (0, H - ch))

    # Peneduh sisi kanan, sama fungsinya dengan menu-scrim: pisahkan potret dari kota
    scrim = Image.new("RGBA", (W, H), PIT + (0,))
    sd = ImageDraw.Draw(scrim)
    for x in range(int(W * 0.5), W):
        t = (x - W * 0.5) / (W * 0.5)
        sd.line((x, 0, x, H), fill=PIT + (int(120 * t),))
    canvas.alpha_composite(scrim)

    # Potret dengan pendar merah
    me = Image.open("public/me.webp").convert("RGBA")
    ph = 580
    me = me.resize((round(me.width * ph / me.height), ph), Image.LANCZOS)
    me_rgb = ImageEnhance.Brightness(me.convert("RGB")).enhance(0.9)
    me = Image.merge("RGBA", (*me_rgb.split(), me.getchannel("A")))
    px, py = W - me.width - 60, H - ph
    for radius, strength in ((34, 0.55), (12, 0.6)):
        layer, pad = glow_layer(me.getchannel("A"), radius, PRIMARY, strength)
        gx, gy = px - pad, py - pad
        # alpha_composite tidak menerima offset negatif: potong bagian yang keluar kanvas.
        cx0, cy0 = max(0, -gx), max(0, -gy)
        layer = layer.crop((cx0, cy0, min(layer.width, W - gx), min(layer.height, H - gy)))
        canvas.alpha_composite(layer, (max(0, gx), max(0, gy)))
    canvas.alpha_composite(me, (px, py))

    d = ImageDraw.Draw(canvas)
    d.fontmode = "1"  # tanpa anti-alias: tepi font pixel harus tetap keras

    title_font = ImageFont.truetype(os.path.join(FONT_DIR, "big-shot.ttf"), 144)
    sub_font = ImageFont.truetype(os.path.join(FONT_DIR, "big-shot.ttf"), 24)
    # big-shot, bukan deltarune: deltarune.ttf tidak punya "&" yang benar (glyph-nya
    # cuma titik kecil), jadi "Web & Mobile" terbaca "web . mobile".
    role_font = ImageFont.truetype(os.path.join(FONT_DIR, "big-shot.ttf"), 32)
    chip_font = ImageFont.truetype(os.path.join(FONT_DIR, "big-shot.ttf"), 24)

    tx, ty = 72, 96
    # Halo blok di sekeliling judul (text-glow di situs): salinan merah digeser 4px
    for dx, dy in ((-4, 0), (4, 0), (0, -4), (0, 4)):
        d.text((tx + dx, ty + dy), "Dev", font=title_font, fill=PRIMARY_DIM)
    d.text((tx, ty), "Dev", font=title_font, fill=FOREGROUND)
    dev_w = d.textlength("Dev", font=title_font)
    for dx, dy in ((-4, 0), (4, 0), (0, -4), (0, 4)):
        d.text((tx + dev_w + dx, ty + dy), "_X", font=title_font, fill=PRIMARY_DIM)
    d.text((tx + dev_w, ty), "_X", font=title_font, fill=PRIMARY)

    # "/" alih-alih "·": font pixel tidak punya titik tengah. Browser menambalnya dari
    # font cadangan, Pillow tidak - hasilnya kotak kosong.
    spaced(d, (tx + 4, ty + 178), "PORTOFOLIO / DEVA SURYA", sub_font, MUTED, 6)
    spaced(d, (tx + 4, ty + 232), "WEB & MOBILE DEVELOPER", role_font, PRIMARY_BRIGHT, 4)

    # Chip teknologi - bahasa yang sama dengan pix-chip
    cx, cy = tx + 4, ty + 320
    for label in ("LARAVEL", "FLUTTER", "REACT"):
        w = d.textlength(label, font=chip_font) + 32
        d.rectangle((cx + 4, cy + 4, cx + w + 4, cy + 52), fill=PIT)  # bayangan keras
        d.rectangle((cx, cy, cx + w, cy + 48), fill=RAISED, outline=BORDER, width=3)
        d.text((cx + 16, cy + 12), label, font=chip_font, fill=FOREGROUND)
        cx += w + 20

    # Bingkai layar game
    d.rectangle((0, 0, W - 1, H - 1), outline=PRIMARY, width=8)

    out = os.path.join(OUT, "og.jpg")
    canvas.convert("RGB").save(out, quality=86, optimize=True, progressive=True)
    print(f"og.jpg  {W}x{H}, {os.path.getsize(out) / 1024:.0f} KB")


if __name__ == "__main__":
    write_favicons()
    write_og()
