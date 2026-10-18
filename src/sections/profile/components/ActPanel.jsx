import { Link } from "react-router-dom";
import { actionClass } from "../constants";
import { cn } from "@/lib/utils";

/*
 * Chrome panel babak: mengikuti bahasa visual dialogue-box di Title Screen.
 *
 * Anatominya sama untuk keempat babak, dan itu yang membuat pergantian babak
 * terbaca sebagai satu kotak yang isinya berganti, bukan empat kartu berbeda:
 *
 *   [BABAK NN · NAMA]        <- papan nama, menumpang di tepi atas
 *   judul + isi              <- tumpukan bebas dari pemanggil
 *   ──────────────────       <- garis pemisah
 *   aksi              ▼      <- kaki: satu ajakan, lalu penanda lanjut
 *
 * Kaki itu yang dulu tidak ada. Tombol dan penanda "▼" berdiri sendiri-sendiri:
 * tombolnya ikut tumpukan isi, penandanya dipasang absolut di pojok kanan bawah
 * tempat ia berdempetan dengan siku hiasan panel. Akibatnya tiap panel berakhir
 * menggantung - isinya habis, lalu 32px kosong, lalu tepi bawah.
 */
export const ActPanel = ({ index, label, hint, action, children }) => (
  /* Tinggi minimum + kaki yang didorong ke dasar (mt-auto). Keempat babak
     berganti lewat silang-redam di titik yang sama, dan tanpa lantai ini
     kotaknya berbeda tinggi 104px antar babak (terukur: 356/291/252/268) -
     selama peralihan, dua kotak berbeda ukuran terlihat sekaligus dan papan
     namanya berdiri di dua ketinggian. Angkanya sengaja di bawah babak
     tertinggi, bukan menyamai: menyamakannya akan menaruh rongga 100px di
     babak terpendek. Setengahnya cukup - lompatannya tinggal ~36px.
     Pola yang sama dipakai kotak dialog Title Screen (min-h pada teksnya). */
  /* Bingkainya NETRAL, bukan aksen - sama dengan kartu project, panel detail
     skill, dan panel Contact. Merah 4px mengelilingi kotak sebesar ini adalah
     benda paling mencolok di layar, lebih kuat daripada nama yang ada di
     dalamnya; hierarkinya terbalik. Sekarang merah hanya dipakai di tempat yang
     membawa arti: papan nama, siku pojok, garis pemisah, dan aksen judul.

     pix-dialog tetap dipakai (bukan pix-panel) karena cincin gelap di luar
     bingkai dan bayangan 8px-nya justru yang dibutuhkan di sini - panel ini
     berdiri di depan ilustrasi kota, bukan di atas latar polos. Yang diganti
     hanya warna tepinya, lewat --pix-edge.

     Kotak dialog Title Screen dan halaman 404 SENGAJA tetap merah: yang pertama
     satu-satunya kartu di layarnya dan memang wajah pertama situs ini, yang
     kedua memang peringatan. */
  <div className="pix-dialog crt pix-corners [--pix-edge:hsl(var(--border))] relative flex w-full max-w-lg md:max-w-xl flex-col min-h-[19rem] md:min-h-[20rem] px-4 pt-8 pb-5 sm:px-5 md:px-7">
    {/* left-6, bukan left-4: siku hiasan panel duduk di -4..4px dari pojok, dan
        papan nama yang mulai di 16px hanya menyisakan celah 12px - sikunya
        terbaca sebagai potongan yang tertabrak papan nama, bukan sebagai hiasan
        pojok. 24px cukup untuk keduanya berdiri sendiri-sendiri. */}
    <span className="pix-chip stage-border stage-bg-soft stage-text-bright absolute -top-4 left-6 px-3 py-1 pixel-font text-pix-sm uppercase whitespace-nowrap">
      BABAK {String(index + 1).padStart(2, "0")} · {label.toUpperCase()}
    </span>

    {/* pb-5 = jarak MINIMUM ke garis pemisah. Tanpa itu, babak yang isinya
        melampaui tinggi lantai tidak kebagian sisa ruang dari mt-auto sama
        sekali, dan baris terakhirnya menempel persis di garis. */}
    <div className="flex flex-col items-start gap-4 pb-5">{children}</div>

    {/* Selalu dirender, walau babaknya tidak punya ajakan: penanda lanjut butuh
        tempat yang tetap, dan garis pemisahnya yang memberi panel ini dasar. */}
    <div className="mt-auto flex items-end justify-between gap-4 border-t-2 stage-border-soft pt-4">
      <div className="min-w-0">{action}</div>
      <span className="pixel-font shrink-0 text-pix-sm stage-text-bright">
        {hint === "end" ? "◆ BATAS AKHIR" : <span className="animate-blink">▼</span>}
      </span>
    </div>
  </div>
);

export const ActTitle = ({ children, as: Tag = "h2", size = "lg" }) => (
  <Tag
    className={cn(
      "pixel-font font-bold leading-none text-foreground",
      size === "xl" ? "text-pix-xl md:text-pix-2xl" : "text-pix-lg md:text-pix-xl"
    )}
  >
    {children}
  </Tag>
);

/* max-w-[58ch] membatasi PANJANG BARIS, bukan lebar panel. Dibiarkan selebar
   panel, paragrafnya mencapai 87 karakter per baris di desktop (terukur) - jauh
   di atas 45-75 karakter, rentang tempat mata masih menemukan awal baris
   berikutnya tanpa kehilangan jejak. */
export const ActText = ({ children }) => (
  <p className="max-w-[58ch] text-[13px] md:text-sm leading-relaxed text-foreground/80">
    {children}
  </p>
);

/* Tombol "buka stage" - dipakai tiga dari empat babak, selalu di kaki panel. */
export const ActLink = ({ to, children }) => (
  <Link to={to} className={actionClass}>
    <span className="stage-text transition-colors group-hover:text-foreground">▶</span>
    {children}
  </Link>
);
