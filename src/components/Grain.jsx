/*
 * Butiran film di atas seluruh halaman.
 *
 * Alasan teknisnya: warna datar pada area luas memperlihatkan banding - pita
 * halus yang muncul karena hanya ada 256 langkah per kanal. Noise memecahnya,
 * dan mata membaca ketidakteraturan acak sebagai tekstur, bukan sebagai cacat.
 * Kesan "kertas cetak"-nya bonus, dan itulah yang membuatnya tetap masuk akal
 * di tema terang.
 *
 * Dibuat dari feTurbulence sebagai data URI, bukan file PNG: beberapa ratus
 * byte inline mengalahkan satu request gambar, dan ubinnya bisa disetel dari
 * sini. baseFrequency 0.8 = butiran halus (1-2px); turun ke 0.3 dan ia berubah
 * jadi awan berbercak yang terlihat jelas sebagai lapisan tambahan.
 *
 * Mode blend dan opasitasnya TIDAK ada di sini - keduanya berbeda per tema dan
 * datang dari --grain-blend / --grain-opacity lewat kelas .grain di index.css.
 */
const NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`;

const NOISE_URL = `url("data:image/svg+xml;utf8,${encodeURIComponent(NOISE_SVG)}")`;

export const Grain = () => (
  <div aria-hidden="true" className="grain" style={{ backgroundImage: NOISE_URL }} />
);
