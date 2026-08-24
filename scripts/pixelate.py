"""
Ubah pelat latar hasil generative AI jadi pixel art siap pakai.

Dua pelat: kota (stage Profile) dan ruangan (stage Ask AI). Gambar mentah dari
model AI tidak bisa dipakai langsung karena:
  1. Tepinya anti-aliased dan warnanya puluhan sampai ratusan ribu - "bergaya
     pixel", bukan pixel art sungguhan.
  2. Khusus kota: langitnya magenta (#FF00FF), bukan transparan - model gambar
     tidak bisa menghasilkan alpha, jadi warna kunci dipakai sebagai gantinya.
     Bintang di StarBackground harus tembus di belakang kota, jadi ini wajib
     dibuang. Ruangan solid, jadi langkah ini dilewati untuknya.

Tiga jebakan yang sudah diperhitungkan di sini, semuanya pernah menghasilkan
output yang salah waktu dikerjakan:

  * PINGGIRAN PINK. Piksel di batas gedung-langit tercampur magenta. Kalau
    langsung diperkecil, sisa magenta ikut terhitung dan meninggalkan halo pink.
    Solusinya warna bersih dirambatkan dulu ke dalam area langit (BLEED), jadi
    yang ikut terhitung saat mengecil adalah warna gedung.

  * MAGENTA MEREBUT PALET. Kuantisasi tidak tahu soal alpha; ia tetap
    menghitung langit yang sudah transparan. Sebelum diperbaiki, 8 dari 24 slot
    palet habis untuk magenta dan merah jendela terpaksa merger ke ungu. Karena
    itu seluruh sisa langit diratakan ke satu warna gelap dulu.

  * AKSEN KECIL TERGILAS. Jendela menyala cuma ~5% luas gambar, jadi kuantisasi
    adaptif (median-cut) membuangnya - hasilnya kota serba ungu tanpa merah.
    MAXCOVERAGE menyelamatkan merahnya tapi merusak aspal jadi belang. Karena
    itu paletnya DITETAPKAN, bukan dicari otomatis: diambil dari token warna
    proyek plus keluarga ungu kabut malam milik artwork.

Jalankan: python scripts/pixelate.py
"""

from PIL import Image
import numpy as np
import os

# Seberapa jauh warna bersih dirambatkan ke area langit, dalam piksel sumber.
# Harus melebihi faktor pengecilan supaya tepinya bersih.
BLEED = 8

SKY_FILL = (11, 13, 24)  # --background malam

# Palet kota: 8 token malam proyek, 4 aksen merah, 8 ungu kabut malam dari
# artwork yang memberi kedalaman.
CITY_PALETTE = [
    "04050B", "0B0D18", "131624", "202336", "3D435B", "60677F", "A6ADBE", "EEF1F5",
    "822027", "B8404A", "E83541", "F68578",
    "191938", "252352", "312F62", "3F4066", "4F4185", "554494", "55497A", "876280",
]

# Palet ruangan: ramp netral lebih rapat karena hampir seluruh gambar ada di
# ujung gelap (kecerahan rata-rata 18/255), ditambah satu langkah krem terang
# untuk inti lampu meja. Hue-nya dijaga tetap di keluarga merah, bukan oranye.
ROOM_PALETTE = [
    "04050B", "070912", "0B0D18", "0F1220", "131624", "171B2B", "202336", "262A40",
    "3D435B", "4A5069", "60677F", "A6ADBE", "EEF1F5",
    "822027", "B8404A", "E83541", "F68578", "FFC9B0",
]

# (sumber, hasil, lebar, tinggi, palet, pakai keying magenta?)
TARGETS = [
    ("public/city.png", "public/city-px.png", 543, 181, CITY_PALETTE, True),
    ("public/room.png", "public/room-px.png", 352, 198, ROOM_PALETTE, False),
]


def sky_mask(arr):
    """Magenta kunci berikut pinggiran anti-aliasnya yang sudah tercemar.

    Ambangnya sengaja longgar untuk menangkap campuran, tapi tetap aman:
    jendela merah (#F64457) punya biru rendah, jadi tidak ikut tertangkap.
    """
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    return (r > 110) & (b > 110) & (g < 110) & (r - g > 50) & (b - g > 50)


def bleed_clean_colors(arr, sky):
    """Rambatkan warna bersih ke dalam area langit, 1px per putaran per arah."""
    rgb = arr.copy()
    unknown = sky.copy()
    for _ in range(BLEED):
        for axis, shift in [(0, 1), (0, -1), (1, 1), (1, -1)]:
            src_rgb = np.roll(rgb, shift, axis=axis)
            src_unknown = np.roll(unknown, shift, axis=axis)
            fill = unknown & ~src_unknown
            rgb[fill] = src_rgb[fill]
            unknown &= ~fill
    rgb[unknown] = np.array(SKY_FILL)
    return rgb


def fixed_palette_image(palette):
    flat = []
    for hexcode in palette:
        flat += [int(hexcode[i:i + 2], 16) for i in (0, 2, 4)]
    img = Image.new("P", (1, 1))
    img.putpalette(flat + [0, 0, 0] * (256 - len(palette)))
    return img


def build(src, dst, nw, nh, palette, key_sky):
    arr = np.array(Image.open(src).convert("RGB")).astype(np.int16)

    if key_sky:
        sky = sky_mask(arr)
        rgb = bleed_clean_colors(arr, sky)
    else:
        sky, rgb = None, arr

    body = Image.fromarray(rgb.astype(np.uint8)).resize((nw, nh), Image.LANCZOS)
    out = body.quantize(
        palette=fixed_palette_image(palette), dither=Image.Dither.NONE
    ).convert("RGB")

    if key_sky:
        alpha = Image.fromarray(((~sky) * 255).astype(np.uint8)).resize((nw, nh), Image.LANCZOS)
        # Pixel art tidak punya tepi setengah transparan
        out = out.convert("RGBA")
        out.putalpha(alpha.point(lambda v: 255 if v >= 128 else 0))

    out.save(dst, optimize=True)
    return out


def ground_line(img):
    """Baris terbawah yang masih rata - dipakai CSS untuk mendudukkan sprite."""
    rgb = np.array(img)[..., :3].astype(int)
    h = rgb.shape[0]
    flat_from = h - 1
    for y in range(h - 1, int(h * 0.55), -1):
        if rgb[y].std(axis=0).mean() < 9:
            flat_from = y
        else:
            break
    return h - flat_from


if __name__ == "__main__":
    for src, dst, nw, nh, palette, key_sky in TARGETS:
        if not os.path.exists(src):
            print(f"LEWAT (tidak ada): {src}")
            continue
        img = build(src, dst, nw, nh, palette, key_sky)
        print(f"{src} -> {dst}")
        print(f"  {nw}x{nh}, {len(palette)} warna, "
              f"{os.path.getsize(src) // 1024}KB -> {os.path.getsize(dst) // 1024}KB")
        if key_sky:
            a = np.array(img)
            g = ground_line(img)
            print(f"  langit transparan: {(a[..., 3] == 0).mean() * 100:.1f}% gambar")
            print(f"  GARIS TROTOAR: {g}px dari bawah = {g * 100 / nh:.2f}% tinggi gambar")
