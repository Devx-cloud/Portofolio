/* Empat babak: Data Diri -> Experience -> Ask AI -> Contact.

   Babak mengikuti stage: Skills dan Projects dilebur jadi satu stage Experience,
   jadi babaknya ikut dilebur - HUD yang menyebut "02 SKILLS" sementara menu
   stage tidak lagi punya Skills akan membuat dua daftar yang berbeda nama.

   Pembagiannya dari empat dengan aturan yang sama seperti versi lima babak:
   peralihan berjarak sama, sisa rentangnya dibagi rata jadi plateau per babak.
   SCROLL_SPAN sengaja tidak dipendekkan - ia disetel untuk langkah hero, bukan
   jumlah babak. */
export const ACTS = [
  { id: "hero", label: "Data Diri" },
  { id: "experience", label: "Experience" },
  { id: "ai", label: "Ask AI" },
  { id: "contact", label: "Contact" },
];

/* Titik tengah tiap peralihan antar babak, terhadap scrollYProgress. Titik snap,
   ambang babak aktif, dan gerak panel semuanya diturunkan dari sini - dulu
   ketiganya ditulis tangan terpisah, dan menggeser satu peralihan berarti
   mengingat tiga tempat. */
const SEAM_CENTERS = [0.23, 0.5, 0.77];

/* Jarak tempuh panel dalam satu peralihan, dalam persen TINGGINYA SENDIRI.

   Dulu panel tidak bergerak: keempatnya berdiri di titik yang sama dan cuma
   disilang-redam, jadi di tengah peralihan dua panel setengah pudar bertumpuk
   persis - dua papan nama, dua judul, dua paragraf saling menembus. Pengunjung
   yang berhenti menggulir di situ mendapati teks yang tidak terbaca sama
   sekali. Sekarang panelnya bergulir searah guliran: yang lama naik keluar,
   yang baru naik dari bawah.

   Di atas 100% itu syarat, bukan selera. Di tengah peralihan panel lama ada di
   -60% dan yang baru di +60%, jadi tepi bawah yang satu dan tepi atas yang lain
   terpisah 10% tinggi masing-masing - ~70px di desktop, sisa ~40px setelah
   dipotong papan nama (16px) dan bayangan (8px). Persen, bukan piksel: tinggi
   panelnya berbeda-beda, dan celah dalam persen berlaku untuk pasangan mana pun. */
const REEL = 120;

const midpoint = ([start, end]) => (start + end) / 2;

/* Keyframe satu babak: tiga titik untuk tiap peralihan yang mengapitnya - awal,
   tengah, akhir.

   Opacity-nya sengaja tidak simetris: di tengah peralihan panel yang naik dari
   bawah baru 0,25, yang pergi ke atas masih 0,75. Panel di BAWAH tempatnya
   selalu lebih pudar. Di HP, posisi itu persis di depan karakter (act-reel di
   index.css hanya memudarkan yang sudah lewat dasar jendela), dan dengan kurva
   linear panel 0,5 melintas di depan kepalanya. Efek sampingnya justru yang
   diinginkan di semua layar: mata tetap di panel lama sampai yang baru hampir
   tiba, dan panel baru menebal tepat saat ia mulai bisa dibaca.

   `still` = opacity untuk gerak dikurangi. Tanpa geseran, satu-satunya cara dua
   panel tidak bertumpuk adalah tidak pernah terlihat bersamaan, jadi yang lama
   habis dulu di tengah peralihan, baru yang baru muncul. */
const keyframes = (enter, exit) => {
  const frames = { range: [], opacity: [], still: [], y: [] };

  if (enter) {
    frames.range.push(enter[0], midpoint(enter), enter[1]);
    frames.opacity.push(0, 0.25, 1);
    frames.still.push(0, 0, 1);
    frames.y.push(`${REEL}%`, `${REEL / 2}%`, "0%");
  }
  if (exit) {
    frames.range.push(exit[0], midpoint(exit), exit[1]);
    frames.opacity.push(1, 0.75, 0);
    frames.still.push(1, 0, 0);
    frames.y.push("0%", `${-REEL / 2}%`, `${-REEL}%`);
  }
  return frames;
};

/* Linimasa babak untuk satu panjang kolom scroll: titik snap (navigasi keyboard
   & klik HUD, = awal plateau) dan keyframe panel tiap babak. */
const timeline = (halfWidth) => {
  const seams = SEAM_CENTERS.map((center) => [center - halfWidth, center + halfWidth]);
  return {
    snaps: [0, ...seams.map(([, end]) => end)],
    frames: ACTS.map((_, i) => keyframes(seams[i - 1], seams[i])),
  };
};

/* Lebar peralihan per panjang kolom scroll (SCROLL_SPAN: 500vh, 750vh dari md).

   Lebarnya ditulis dalam progres, padahal yang dirasakan jari adalah PIKSEL
   guliran - dan satu satuan progres sepanjang tinggi kolom dikurangi satu layar.
   Di kolom 750vh, peralihan 0,06 = 0,39 tinggi layar guliran. Di kolom 500vh
   angka yang sama tinggal 0,24 tinggi layar (~200px di HP) untuk geseran panel
   ~400px: panelnya melaju dua kali kecepatan jari, dan setiap frame yang telat
   terlihat sebagai lompatan - terukur sampai 95px per frame dengan CPU
   diperlambat 4x, sementara panggung tanpa panel sama tersendatnya. Biaya
   render bukan masalahnya; kecepatannya. 0,1 mengembalikan 0,39 tinggi layar
   itu, jadi panel di HP kembali bergerak kira-kira seiring jari.

   Plateau kolom pendek ikut menyempit dari ~0,21 jadi ~0,17 - masih ~570px
   guliran di layar 390x844, cukup lama untuk membaca satu panel. */
export const TIMELINES = { long: timeline(0.03), short: timeline(0.05) };

/* Ambang pergantian babak aktif - di tengah tiap transisi, supaya HUD berganti
   tepat saat panel barunya mulai menebal. Sama untuk kedua panjang kolom:
   lebar peralihannya berbeda, titik tengahnya tidak. */
export const ACT_THRESHOLDS = SEAM_CENTERS;
