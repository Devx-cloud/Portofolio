"""
Bikin tekstur pixel-art untuk kap lampu 3D di stage Ask AI.

Lampunya objek 3D sungguhan, tapi permukaannya harus tetap pixel art - jadi
teksturnya digambar per piksel di sini, lalu di-render dengan NearestFilter
supaya tidak diperhalus three.js.

Lebar 32px membungkus keliling kerucut, tinggi 16px dari puncak ke bibir.

Jalankan: python scripts/lamp-texture.py
"""
from PIL import Image

W, H = 32, 16

# Token malam proyek
DARK = (19, 22, 36)      # --surface
BODY = (32, 35, 54)      # --raised
EDGE = (61, 67, 91)      # --border
HI = (96, 103, 127)      # --faint
LIT = (246, 133, 120)    # --primary-bright
HOT = (232, 53, 65)      # --primary

im = Image.new("RGBA", (W, H))
px = im.load()

for y in range(H):
    for x in range(W):
        if y < 2:
            c = DARK                     # cincin atas, dekat kabel
        elif y >= H - 2:
            c = LIT                      # bibir bawah kena cahaya bola
        elif y >= H - 4:
            c = HOT
        else:
            # Panel vertikal tiap 8px, dengan garis sambungan lebih terang
            c = EDGE if x % 8 == 0 else BODY
            # Sisi kiri sedikit lebih terang - arah cahaya konsisten
            if x % 8 == 1:
                c = HI if y % 4 == 0 else BODY

        px[x, y] = (*c, 255)

# Baris paku keling di sepertiga atas badan
for x in range(4, W, 8):
    px[x, 4] = (*HI, 255)

im.save("public/lamp-shade.png")
print(f"public/lamp-shade.png  {W}x{H}, {len(im.getcolors())} warna")

# pratinjau diperbesar
im.resize((W * 12, H * 12), Image.NEAREST).save(
    "C:/Users/WINDOW~1/AppData/Local/Temp/claude/c--Project-React-Portofolio/"
    "942242c6-447c-4d35-a378-e0f2ff65668d/scratchpad/lamp-tex.png"
)


# =========================================================
# CAHAYA - SENGAJA HALUS, BUKAN PIXEL
#
# Kap lampunya pixel art; cahayanya tidak. Kedua tekstur di bawah dibuat
# dengan gradasi kontinu dan nanti dimuat dengan filter LINEAR (bukan
# NearestFilter seperti kap), supaya tetap lembut saat diperbesar.
# =========================================================

import math

# Halo bulat di sekitar bola lampu
G = 256
glow = Image.new("RGBA", (G, G))
gp = glow.load()
c = (G - 1) / 2
for y in range(G):
    for x in range(G):
        r = math.hypot(x - c, y - c) / c
        # Pangkat 3: inti terang menyempit, halonya melebar landai
        a = 0 if r >= 1 else (1 - r) ** 3
        gp[x, y] = (255, 255, 255, int(a * 255))
glow.save("public/glow.png")
print(f"public/glow.png       {G}x{G} gradasi radial (halus)")

# Berkas cahaya ke bawah. Lebar 8px saja - ia membungkus keliling kerucut,
# jadi yang berarti hanya sumbu vertikalnya.
BW, BH = 8, 256
beam = Image.new("RGBA", (BW, BH))
bp = beam.load()
for y in range(BH):
    t = y / (BH - 1)          # 0 di atas (dekat bola) -> 1 di bawah
    a = (1 - t) ** 1.8
    for x in range(BW):
        bp[x, y] = (255, 255, 255, int(a * 190))
beam.save("public/beam.png")
print(f"public/beam.png       {BW}x{BH} gradasi vertikal (halus)")
