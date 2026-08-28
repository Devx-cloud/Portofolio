/*
 * Angka-angka lampu gantung 3D di stage Ask AI.
 *
 * Bentuknya 3D sungguhan tapi PERMUKAANNYA pixel art: teksturnya digambar per
 * piksel oleh scripts/lamp-texture.py dan dipasang dengan NearestFilter.
 */

/* Panjang tali = (SEGMENTS - 1) x SEG_LEN. Perkecil SEG_LEN untuk menggantung
   lebih tinggi - jangan kurangi SEGMENTS, itu bikin lengkung talinya patah. */
export const SEGMENTS = 7;
export const SEG_LEN = 0.18;
export const GRAVITY = 0.0022;
export const FRICTION = 0.97; // sisa kecepatan tiap frame
export const RELAX = 14; // putaran koreksi jarak; makin banyak makin kaku
export const MAX_STEP = 0.35; // batas gerak satu frame, penahan ledakan setelah tab diam

/* Geometri kap & berkas. Keduanya memakai SHADE_R yang sama: mulut berkas harus
   persis selebar bibir kap, kalau tidak cahayanya terlihat muncul dari satu
   titik di dalam lampu, bukan dari mulutnya. */
export const SHADE_R = 0.52; // jari-jari bibir bawah kap
export const SHADE_H = 0.5;
export const SHADE_Y = -0.26; // pusat kap di ruang lokal grup
export const RIM_Y = SHADE_Y - SHADE_H / 2; // bibir bawah - tempat cahaya keluar
export const BEAM_H = 2.6;
export const BEAM_R = 1.4; // jari-jari berkas di ujung bawah

export const FOV = 25;

/* Piksel layar per unit dunia. DIKUNCI: kanvas boleh diperlebar sebanyak apa pun
   untuk memberi ruang seret, tapi jarak kamera ikut digeser agar angka ini
   tetap - kalau tidak, memperlebar kanvas ikut memperbesar lampunya. */
const PX_PER_UNIT = 97.75;

export const cameraZ = (heightPx) => heightPx / PX_PER_UNIT / (2 * Math.tan((FOV * Math.PI) / 360));

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
