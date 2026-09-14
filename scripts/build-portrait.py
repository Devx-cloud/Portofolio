"""
Panggang dua layer potret Title Screen dari artwork mentah di art/.

Potret itu punya lensa: hover menyingkap versi pixel art hanya di sekitar
kursor. Efek itu berdiri di atas satu syarat yang tidak bisa ditawar - KEDUA
LAYER HARUS TERDAFTAR PRESISI PIKSEL. Kalau mata di layer foto tidak berada di
koordinat yang sama dengan mata di layer pixel, wajahnya melompat tiap kali
batas lensa lewat dan ilusinya habis.

ATURAN KERAS: artwork-nya TIDAK BOLEH diubah. Yang dilakukan skrip ini hanya
memotong dan menurunkan ke ukuran kirim. Tidak ada kuantisasi warna, tidak ada
alpha di-threshold, tidak ada grid yang dipanggang ulang. Versi sebelumnya
melakukan ketiganya dan hasilnya membuang sebagian besar detail gambar aslinya -
lineart kacamata dan rim light-nya rata jadi blok-blok kasar.

CARA MENYELARASKAN TANPA MENGEDIT
Kedua artwork tidak sepanjang proporsi yang sama: pixel art-nya digambar ulang
oleh model, bukan diturunkan dari fotonya, jadi kepalanya sedikit lebih besar.
Pixel art v2 memberi skala 0,977 dengan geseran (14, -4) - jauh lebih dekat ke
foto daripada v1 (0,93 dan (40, 38)).

Angka v2 diambil dari korelasi TEPI di dalam wajah - garis kacamata, mata,
hidung, jari - bukan dari IoU siluet kepala seperti v1. Siluet kepala didominasi
garis luar rambut: best-fit-nya (0,942 dan (30, 10)) memang pas di rambut, tapi
menaruh kacamata pixel ~20px terlalu tinggi, persis di tempat lensa paling
sering dibuka. Dengan kotak berbasis wajah, siluet badannya tetap pas di IoU
0,95.

Skala itu TIDAK diterapkan sebagai transform. Ia dilipat ke dalam kotak crop:
mengambil area 1/0,977 lebih besar lalu merender kedua layer ke kotak yang sama
menghasilkan penyelarasan yang persis sama, tapi operasinya murni crop. Kotak
di bawah adalah hasil pembalikan itu - lihat CROP_PIXEL.

Wajah yang dipilih, bukan badan: tidak ada satu kotak yang memasangkan keduanya
sekaligus. Mata pengunjung tertuju ke wajah, dan meleset di wajah jauh lebih
terlihat daripada meleset di tepi bahu.

KENAPA 640 LEBAR
Potret tampil pada 320 CSS px. Di layar 2x itu 640 piksel perangkat, jadi 640
adalah resolusi kirim yang benar - apa pun di atasnya tidak pernah terlihat.
Crop pixel-nya sendiri 903px; menurunkannya ke 640 memakai LANCZOS, dipilih
setelah membandingkan NEAREST / BOX / HAMMING / LANCZOS pada area wajah:
NEAREST memecah garis kacamata jadi tidak rata, sisanya melunak, LANCZOS yang
paling menjaga lineart-nya.
"""

import numpy as np
from PIL import Image

SRC_PHOTO = "art/me_v1-graded.png"      # cutout yang sudah digradasi ke palet situs
SRC_PIXEL = "art/me-pixel_v2.png"       # pixel art hasil model, proporsinya berbeda

OUT = (640, 808)                        # 2x dari lebar tampil 320px

# Kedua kotak menghasilkan framing yang sama pada output yang sama. Rasio
# keduanya dijaga di 640/808 = 0,7921 supaya tidak ada peregangan.
CROP_PHOTO = (101, 37, 983, 1151)       # 882 x 1114
CROP_PIXEL = (89, 42, 992, 1182)        # 903 x 1140 - sudah memuat skala 0,977

# Pembulatan ke piksel bulat menggeser penyelarasan paling jauh ~0,3px di
# output - di bawah satu piksel perangkat, jadi tidak perlu kotak pecahan.


def _drop_hidden_rgb(im):
    """RGB nol di piksel transparan penuh. Tidak mengubah apa pun yang terlihat,
    tapi memangkas ukuran WebP karena tidak ada lagi derau tak terpakai."""
    a = np.array(im)
    a[a[..., 3] == 0, :3] = 0
    return Image.fromarray(a)


def bake_photo():
    im = Image.open(SRC_PHOTO).convert("RGBA").crop(CROP_PHOTO).resize(OUT, Image.LANCZOS)
    _drop_hidden_rgb(im).save("public/me.webp", "WEBP", quality=82, method=6)


def bake_pixel():
    im = Image.open(SRC_PIXEL).convert("RGBA").crop(CROP_PIXEL).resize(OUT, Image.LANCZOS)
    _drop_hidden_rgb(im).save("public/me-pixel.webp", "WEBP", quality=92, method=6)


if __name__ == "__main__":
    bake_photo()
    bake_pixel()
    print("public/me.webp + public/me-pixel.webp dipanggang ulang (crop saja)")
