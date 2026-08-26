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

# Palet tiga layer parallax Profile. SATU palet untuk ketiganya, bukan
# masing-masing: layer yang dikuantisasi dengan palet berbeda akan menunjukkan
# pita warna yang tidak sinkron di tempat mereka bersinggungan.
#
# Isinya token proyek plus nada biru-abu yang benar-benar dipakai artwork ini -
# memakai CITY_PALETTE apa adanya meninggalkan galat maks 93 di layer terdepan,
# karena trotoar dan aspalnya tidak punya padanan di sana.
LAYER_PALETTE = [
    "04050B", "0B0D18", "111831", "131624", "161828", "1E2134", "252352", "2A3050",
    "343C60", "3C4970", "454E75", "525C86", "60677F", "7C86A6", "A6ADBE", "D6DCE8",
    "EEF1F5",
    "822027", "B8404A", "E83541", "F68578", "FFC9B0",
]

def extend_base(rgba, solid_floor):
    """Perpanjang dasar layer lurus ke bawah sampai tepi gambar.

    Tanpa ini ada celah tembus latar: dasar layer-2 ada di 24.9% dan layer-1 di
    30.4%, sementara gedung layer-3 baru mulai di 18.8%. Pita 19-30% itu tidak
    tertutup siapa pun, dan di ketinggian 22% sebanyak 12-18% kolom menembus ke
    latar - terlihat sebagai celah kosong di antara layer.

    Tiap kolom mengambil warna piksel opak terbawahnya lalu meneruskannya ke
    bawah, jadi kaki gedungnya memanjang alih-alih dipotong pita rata.

    solid_floor: untuk layer paling belakang. Kolom yang kosong sama sekali
    ikut diisi dari garis dasar rata-rata, karena di belakangnya tidak ada
    lagi yang bisa menutup.
    """
    out = rgba.copy()
    h, w = out.shape[:2]
    alpha = out[..., 3]

    bottoms = []
    for x in range(w):
        col = np.where(alpha[:, x] > 20)[0]
        if len(col):
            bottoms.append(col[-1])

    if not bottoms:
        return out

    baseline = int(np.median(bottoms))
    dark = out[..., :3][alpha > 20].sum(axis=1).argmin()
    dark_rgb = out[..., :3][alpha > 20][dark]

    for x in range(w):
        col = np.where(alpha[:, x] > 20)[0]
        if len(col):
            y = col[-1]
            out[y + 1:, x, :3] = out[y, x, :3]
            out[y + 1:, x, 3] = 255
        elif solid_floor:
            out[baseline:, x, :3] = dark_rgb
            out[baseline:, x, 3] = 255

    return out


# (sumber, hasil, lebar, tinggi, palet, keying magenta?, perpanjang dasar)
#
# Ketiga layer WAJIB seukuran (543x181) supaya teregistrasi saat ditumpuk -
# layer-2.png datang 1px lebih sempit dari dua lainnya, dan resize di sini
# yang menyamakannya.
TARGETS = [
    ("public/city.png", "public/city-px.png", 543, 181, CITY_PALETTE, True, None),
    ("public/room.png", "public/room-px.png", 352, 198, ROOM_PALETTE, False, None),
    ("public/layer-1.png", "public/layer-1-px.png", 543, 181, LAYER_PALETTE, False, "solid"),
    ("public/layer-2.png", "public/layer-2-px.png", 543, 181, LAYER_PALETTE, False, "column"),
    ("public/layer-3.png", "public/layer-3-px.png", 543, 181, LAYER_PALETTE, False, None),

    # Versi resolusi penuh: palet TIDAK dikunci dan ukuran tidak diperkecil,
    # hanya dasarnya diperpanjang. Untuk memakai artwork apa adanya tanpa
    # celah tembus latar di antara layer.
    ("public/layer-1.png", "public/layer-1-fix.png", 2172, 724, None, False, "solid"),
    ("public/layer-2.png", "public/layer-2-fix.png", 2172, 724, None, False, "column"),
    ("public/layer-3.png", "public/layer-3-fix.png", 2172, 724, None, False, None),

    # Rooftop menu-bg: sumbernya terlalu jenuh dan lampunya condong pink/magenta
    # dibanding layer-1/2/3 (yang sudah pas dari sononya). Resolusi dipertahankan,
    # cuma tiap piksel di-snap ke LAYER_PALETTE yang sama supaya satu keluarga warna.
    ("public/menu-bg.png", "public/menu-bg-fix.png", 2172, 724, LAYER_PALETTE, False, None),
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


def build(src, dst, nw, nh, palette, key_sky, extend):
    source = Image.open(src)
    arr = np.array(source.convert("RGB")).astype(np.int16)

    # Sumber yang SUDAH punya alpha (tiga layer parallax) tidak perlu keying -
    # alpha aslinya dipakai langsung, cuma perlu ikut diperkecil di bawah.
    src_alpha = np.array(source.convert("RGBA"))[..., 3] if not key_sky else None
    if src_alpha is not None and src_alpha.min() == 255:
        src_alpha = None  # solid, tidak ada yang perlu dijaga

    if key_sky:
        sky = sky_mask(arr)
        rgb = bleed_clean_colors(arr, sky)
    else:
        sky, rgb = None, arr

    body = Image.fromarray(rgb.astype(np.uint8)).resize((nw, nh), Image.LANCZOS)
    # palette None = pakai warna aslinya apa adanya
    out = (
        body.quantize(palette=fixed_palette_image(palette), dither=Image.Dither.NONE).convert("RGB")
        if palette
        else body
    )

    alpha = None
    if key_sky:
        alpha = Image.fromarray(((~sky) * 255).astype(np.uint8))
    elif src_alpha is not None:
        alpha = Image.fromarray(src_alpha)

    if alpha is not None:
        # Pixel art tidak punya tepi setengah transparan
        alpha = alpha.resize((nw, nh), Image.LANCZOS).point(lambda v: 255 if v >= 128 else 0)
        out = out.convert("RGBA")
        out.putalpha(alpha)

    if extend:
        out = Image.fromarray(extend_base(np.array(out.convert("RGBA")), extend == "solid"))

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
    for src, dst, nw, nh, palette, key_sky, extend in TARGETS:
        if not os.path.exists(src):
            print(f"LEWAT (tidak ada): {src}")
            continue
        img = build(src, dst, nw, nh, palette, key_sky, extend)
        print(f"{src} -> {dst}")
        print(f"  {nw}x{nh}, {len(palette) if palette else 'warna asli'} warna, "
              f"{os.path.getsize(src) // 1024}KB -> {os.path.getsize(dst) // 1024}KB")
        if img.mode == "RGBA":
            a = np.array(img)
            g = ground_line(img)
            print(f"  langit transparan: {(a[..., 3] == 0).mean() * 100:.1f}% gambar")
            print(f"  GARIS TROTOAR: {g}px dari bawah = {g * 100 / nh:.2f}% tinggi gambar")
