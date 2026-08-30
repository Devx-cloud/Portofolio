"""
Normalkan sprite karakter mentah dari AI jadi dua strip yang bisa dipertukarkan.

Sumbernya belum bisa dipakai langsung oleh CSS animation:

  * walk.png 2172x724, 8 frame, TIDAK punya grid. 2172/8 = 271,5 px (bukan
    bilangan bulat) dan jarak antar-karakter aslinya berayun 247-298 px. Dianimasi
    apa adanya, karakternya meleset kiri-kanan tiap frame berganti.

  * Skala kedua file beda jauh, DAN proporsinya juga beda: idles.png digambar
    ~7 kepala, walk.png ~5,5 kepala. Menyamakan tinggi badan tidak cukup - waktu
    tingginya dipaskan, wajah walk.png keluar 17% lebih besar dan idle-nya
    terbaca sebagai karakter yang lebih kecil.

  * Sisa ruang di bawah telapak beda: idles.png 27 baris, walk.png 52 baris. Satu
    offset koreksi di CSS tidak mungkin benar untuk keduanya sekaligus - itulah
    yang dulu ditambal -6/-8/-11px di ProfileSection dan sekarang tidak perlu lagi.

Yang dilakukan di sini: setiap frame dipotong ulang ke sel identik CELL, diskalakan
lewat SATU faktor per file supaya tingginya cocok, telapaknya ditempelkan ke baris
paling bawah, dan sumbu badannya diluruskan ke tengah sel.

Dua keputusan yang perlu dicatat:

  * PENSKALAAN MEMAKAI LUAS WAJAH, bukan tinggi badan. Pada 56-88px yang dibaca
    mata sebagai "sebesar apa karakternya" adalah wajah, bukan tinggi - dan karena
    proporsi kedua lembar berbeda, kedua ukuran itu tidak bisa dipaskan sekaligus.
    Luas dipakai, bukan lebar, karena luas tidak bisa dirusak satu jambul rambut
    yang menjulur; akarnya diambil supaya angkanya kembali linier terhadap skala.

    Konsekuensi yang disengaja: idle berdiri jadi ~8% lebih jangkung dari frame
    jalan tertinggi. Itu benar secara anatomi - berdiri tegak memang lebih tinggi
    daripada melangkah dengan lutut tertekuk - dan masih di dalam rentang yang
    sudah dilakukan siklus jalan itu sendiri antar frame-nya (296-333).

  * PELURUSAN MEMAKAI TITIK TENGAH KEPALA, bukan titik tengah kotak pembatas.
    Kotak pembatas ikut melebar ke arah kaki yang sedang melangkah, jadi
    memusatkannya justru MENAMBAH ayunan kiri-kanan. Kepala tidak ikut melangkah.

Faktor skala dihitung satu kali dari RATA-RATA seluruh frame, tidak per frame:
per frame akan meratakan bob kepala sampai hilang.

Lembar mentahnya hidup di art/, hasilnya di public/: yang diunduh browser cuma
strip jadi, dan lembar mentahnya lima kali lebih besar.

Jalankan: python scripts/build-sprite.py
"""

from PIL import Image
import numpy as np
import os

# (sumber, keluaran, jumlah frame)
#
# Lembar NPC ikut lewat sini, bukan dipakai mentah, karena punya masalah yang
# persis sama dengan walk.png: 2172/8 = 271,5 px, jadi tidak ada grid dan
# karakternya meleset kiri-kanan tiap frame berganti kalau dianimasi apa adanya.
#
# Yang membuatnya sepadan dengan hero bukan kebetulan: TARGET_FACE di bawah satu
# angka untuk SEMUA lembar, jadi wajah NPC keluar seukuran wajah hero berapa pun
# skala gambar aslinya. Tanpa itu tiap NPC harus disetel tangan.
# Unsur keempat: dasar penskalaan, "face" atau "height".
SHEETS = [
    ("art/idles.png", "public/sprite-idle.png", 4, "face"),
    ("art/walk.png", "public/sprite-walk.png", 8, "face"),
    ("art/npc-1.png", "public/npc/npc-1.png", 8, "height"),
    ("art/npc-2.png", "public/npc/npc-2.png", 8, "height"),
    ("art/npc-3.png", "public/npc/npc-3.png", 8, "height"),
    ("art/npc-4.png", "public/npc/npc-4.png", 8, "height"),
]

# Sel 2:3, jadi aspect-[2/3] di komponen berlaku untuk kedua strip.
#
# 256 px itu ~2,9x lebar tampil terbesar (w-22 = 88px). Cukup tajam untuk layar
# 2x DPR tanpa mengirim gambar raksasa: sheet 8 frame keluar di bawah 1 MB.
CELL_W, CELL_H = 256, 384

# Ukuran wajah di dalam sel, dalam satuan akar-luas-piksel - SATU angka untuk
# semua lembar, dan itulah yang membuat idle dan walk bisa dipertukarkan.
#
# 30,6 diambil dari walk.png pada skala yang sudah terpasang sekarang (akar luas
# wajah 57,3 x skala 0,5342), jadi strip jalan TIDAK berubah ukuran sama sekali
# dan yang menyesuaikan diri hanya idle - naik ~17%.
TARGET_FACE = 30.6

# Tinggi badan sasaran, dipakai lembar NPC.
#
# Penskalaan lewat wajah dipilih untuk idle vs walk karena PROPORSI kedua lembar
# itu berbeda (7 kepala vs 5,5), dan di situ tinggi badan memang tidak bisa
# dipakai. Lembar NPC tidak punya masalah itu - semuanya siklus jalan dengan
# proporsi sejenis - sementara deteksi wajahnya justru rapuh: hero mendapat
# 36.947 piksel kulit, npc-4 hanya 157, dan skalanya meledak jadi 7x. Topi,
# rambut menutupi dahi, dan warna kulit yang lebih dingin semuanya menggagalkan
# ambang kulit yang disetel untuk satu karakter.
#
# Tinggi badan jauh lebih kokoh di sini: kelima lembar jatuh di 546-654px.
# 333 = tinggi badan hero (623px) x skalanya yang sudah terpasang (0,5344), jadi
# NPC keluar sepadan dengan hero tanpa satu pun angka disetel tangan.
TARGET_BODY = 333.0

# Bagian atas badan yang dipakai waktu mengukur wajah. Di bawah 45% mulai kena
# tangan, yang juga berkulit dan akan menggelembungkan angkanya; di kedua lembar
# tangan tidak pernah naik setinggi itu.
FACE_BAND = 0.45

# Ambang alpha untuk memisahkan badan dari latar. Tepi kedua file di-anti-alias
# tebal (walk.png punya 673 ribu piksel semi-transparan), jadi ambang rendah akan
# ikut menghitung kabut tepinya sebagai badan.
ALPHA_MIN = 128

# Pita atas badan yang dianggap "kepala" waktu mencari sumbu tegak. 14% tinggi
# badan kira-kira berhenti di dagu - cukup untuk rambut + wajah, belum kena bahu.
HEAD_BAND = 0.14


def body_mask(rgba):
    return rgba[..., 3] > ALPHA_MIN


def skin_mask(rgba, body):
    """Kulit dipakai untuk menemukan wajah. Wajah satu-satunya bidang kulit besar
    di paruh atas badan; tangan jauh lebih kecil dan selalu di bawahnya."""
    r, g, b = rgba[..., 0].astype(int), rgba[..., 1].astype(int), rgba[..., 2].astype(int)
    return (r > 200) & (g > 120) & (g < 200) & (b < 130) & body


def measure(rgba):
    body = body_mask(rgba)
    ys, xs = np.nonzero(body)
    top, bottom = ys.min(), ys.max()
    skin = skin_mask(rgba, body)
    eye = np.nonzero(skin)[0].min()

    height = bottom - top + 1
    band = body[top : top + max(1, int(height * HEAD_BAND)), :]
    head_cx = np.nonzero(band)[1].mean()

    face = skin[: top + int(height * FACE_BAND), :]

    return {
        "left": xs.min(),
        "right": xs.max(),
        "top": top,
        "bottom": bottom,
        "eye_to_floor": bottom - eye,
        "head_cx": head_cx,
        "face": float(np.sqrt(face.sum())),
    }


def slice_frames(rgba, n):
    """Batas frame TIDAK boleh dibagi rata - tidak satu pun lembar sumber punya
    grid. idles.png 1774/4 = 443,5 dan walk.png 2172/8 = 271,5, keduanya pecahan,
    dan jarak antar-karakter aslinya berayun puluhan piksel.

    Dua jalur, karena kedua lembar berbeda sifat:
      * idles.png punya celah kosong bersih di antara frame - dipotong di tengah
        celah, hasilnya eksak.
      * walk.png frame-nya bersentuhan (cuma 3 celah di seluruh lembar), jadi
        dicari lembah kerapatan kolom di sekitar posisi nominal. Lebih lemah, tapi
        satu-satunya cara memotong tanpa mengiris badan."""
    body = body_mask(rgba)
    col = body.sum(axis=0)
    w = col.shape[0]

    gaps = []
    start = None
    for x in range(w):
        if col[x] == 0:
            start = x if start is None else start
        elif start is not None:
            gaps.append((start, x - 1))
            start = None
    # Celah tepi bukan pemisah frame, cuma margin kanvas.
    interior = [g for g in gaps if g[0] > 0 and g[1] < w - 1]

    if len(interior) >= n - 1:
        interior.sort(key=lambda g: g[1] - g[0], reverse=True)
        picks = sorted((g[0] + g[1]) // 2 for g in interior[: n - 1])
        cuts = [0] + picks + [w]
    else:
        nominal = w / n
        cuts = [0]
        for i in range(1, n):
            c = int(i * nominal)
            lo, hi = max(0, c - 90), min(w, c + 90)
            cuts.append(lo + int(np.argmin(col[lo:hi])))
        cuts.append(w)

    return [(cuts[i], cuts[i + 1]) for i in range(n)]


def place(src, info, scale, cell):
    """Satu frame ke satu sel: diskalakan, telapak ke baris paling bawah, sumbu
    kepala ke tengah sel."""
    sw, sh = src.size
    scaled = src.resize((max(1, round(sw * scale)), max(1, round(sh * scale))), Image.LANCZOS)

    # Titik jangkar ikut diskalakan, bukan diukur ulang di gambar hasil - mengukur
    # ulang setelah LANCZOS memungutkan tepi lembut dan menggeser jangkarnya.
    foot = info["bottom"] * scale
    head_cx = info["head_cx"] * scale

    dx = round(cell[0] / 2 - head_cx)
    dy = round(cell[1] - 1 - foot)

    out = Image.new("RGBA", cell, (0, 0, 0, 0))
    out.alpha_composite(scaled, (dx, dy))
    return out, dx, dy


def overflow(info, scale, dx, dy):
    return {
        "left": round(info["left"] * scale + dx),
        "right": round(info["right"] * scale + dx) - (CELL_W - 1),
        "top": round(info["top"] * scale + dy),
    }


def build(src_path, out_path, n_frames, basis="face"):
    src = Image.open(src_path).convert("RGBA")
    arr = np.array(src)

    frames = []
    for x0, x1 in slice_frames(arr, n_frames):
        sub = src.crop((x0, 0, x1, src.height))
        frames.append((sub, measure(np.array(sub))))

    # SATU skala untuk seluruh lembar, diambil dari rata-rata mata-ke-lantai.
    # Skala per frame akan meratakan bob kepala sampai hilang - justru gerakan
    # yang bikin animasinya hidup.
    if basis == "height":
        mean_h = sum(f[1]["bottom"] - f[1]["top"] + 1 for f in frames) / len(frames)
        scale = TARGET_BODY / mean_h
    else:
        mean_face = sum(f[1]["face"] for f in frames) / len(frames)
        scale = TARGET_FACE / mean_face

    sheet = Image.new("RGBA", (CELL_W * n_frames, CELL_H), (0, 0, 0, 0))
    worst = {"left": CELL_W, "right": -CELL_W, "top": CELL_H}
    for i, (sub, info) in enumerate(frames):
        cell, dx, dy = place(sub, info, scale, (CELL_W, CELL_H))
        sheet.paste(cell, (i * CELL_W, 0))
        o = overflow(info, scale, dx, dy)
        worst["left"] = min(worst["left"], o["left"])
        worst["right"] = max(worst["right"], o["right"])
        worst["top"] = min(worst["top"], o["top"])

    sheet.save(out_path)

    print(f"{out_path}  {CELL_W * n_frames}x{CELL_H}  {n_frames} frame  skala {scale:.4f}")
    print(
        f"  sisa ruang tersempit: atas {worst['top']}px  "
        f"kiri {worst['left']}px  kanan {-worst['right']}px"
        f"  ({os.path.getsize(out_path) / 1024:.0f} KB)"
    )
    if worst["left"] < 0 or worst["right"] > 0 or worst["top"] < 0:
        print("  PERINGATAN: ada frame yang terpotong sel - besarkan CELL_W/CELL_H")


def main():
    os.makedirs("public/npc", exist_ok=True)
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    for src, out, n, basis in SHEETS:
        build(src, out, n, basis)


if __name__ == "__main__":
    main()
