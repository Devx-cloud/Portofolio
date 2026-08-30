import { cn } from "@/lib/utils";

/*
 * Bayangan di kaki karakter.
 *
 * Digambar sebagai tiga rect bertingkat, BUKAN elips ber-border-radius dan bukan
 * blur. Keduanya menghasilkan tepi mulus, sementara seluruh panggung ini bertepi
 * keras - alasan yang persis sama dengan penanda segitiga di atas kepala hero.
 *
 * Ditaruh di dalam CharacterSprite dan dirender PALING AWAL, jadi ia jatuh di
 * belakang strip sprite. Sprite-nya berlatar transparan di sekitar kaki, jadi
 * bayangan tetap terlihat menyembul di kiri-kanan telapak.
 *
 * Tidak ikut naik-turun mengikuti langkah: bayangan menempel pada tanah, bukan
 * pada badan. Yang bergerak di siklus jalan cuma badannya.
 *
 * Lebar 52% kotak sprite. Kotaknya jauh lebih lebar daripada telapak - lembar
 * sumber menyisakan ruang di kiri-kanan untuk ayunan tangan dan langkah terjauh
 * (lihat "sisa ruang tersempit" di keluaran build-sprite.py) - jadi bayangan
 * selebar kotak akan terbaca sebagai genangan, bukan bayangan.
 */
export const GroundShadow = ({ className }) => (
  <svg
    viewBox="0 0 16 3"
    aria-hidden="true"
    preserveAspectRatio="none"
    className={cn(
      "pointer-events-none absolute bottom-0 left-1/2 h-[3.6%] w-[52%] -translate-x-1/2",
      className
    )}
    /* --pit, langkah paling gelap di ramp, pada 0,72.
    
       Percobaan pertama memakai 0,55 dan hasilnya nyaris tidak terbaca: jalanan
       sudah gelap, jadi bayangan yang cuma sedikit lebih gelap dari aspal tidak
       menghasilkan selisih apa pun. Yang membuatnya terlihat bukan kepekatan
       mutlaknya melainkan seberapa jauh ia memutus pantulan lampu di aspal -
       dan itu butuh angka yang lebih tinggi daripada dugaan awal. */
    fill="hsl(var(--pit) / 0.72)"
  >
    <rect x="3" y="0" width="10" height="1" />
    <rect x="0" y="1" width="16" height="1" />
    <rect x="3" y="2" width="10" height="1" />
  </svg>
);
