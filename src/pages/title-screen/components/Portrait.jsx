import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/* Potret asli di Title Screen - foto sungguhan dengan lensa pixel art.

   Dua lapis gambar yang persis setumpuk: foto di bawah, versi pixel art di
   atasnya. Yang atas ditutup mask lingkaran yang mengikuti kursor, jadi hanya
   bagian DI DEKAT KURSOR yang berubah jadi pixel art; sisanya tetap foto, dan
   begitu kursor pergi lensanya menutup sendiri.

   SYARAT MATI dari efek ini: kedua layer harus terdaftar presisi piksel. Kalau
   mata di layer foto tidak berada di koordinat yang sama dengan mata di layer
   pixel, wajahnya akan MELOMPAT tiap kali batas lensa lewat - dan ilusinya
   habis. Karena itu keduanya dipanggang dari crop dan ukuran yang identik
   (640x808) oleh scripts/build-portrait.py, yang melipat penyelarasan wajah ke
   dalam kotak crop-nya. Jangan pernah mengganti salah satu aset dengan tangan:
   keduanya HARUS keluar dari skrip itu, atau registrasinya lepas.

   Layer pixel dipakai apa adanya, tanpa filter gradasi. Ia memang sudah
   berwarna penuh, dan saat diam ia tertutup mask sepenuhnya - tidak ada yang
   perlu diredam.

   Lebarnya w-full, artinya persis selebar kotak dialog di bawahnya. Pada 320px
   potretnya terbaca hilang di komposisi - kolom kiri dengan judul Dev_X jauh
   lebih berat. Selebar panel, keduanya membaca sebagai satu kartu yang sengaja
   dirancang, bukan gambar yang kebetulan ditaruh di atas kotak.

   GRADASINYA TETAP, tidak berubah saat hover. Versi sebelumnya menggelapkan
   potret saat diam lalu menaikkannya saat hover, dan itu keliru: kursor masuk,
   SELURUH potret berkedip terang, lalu mata harus mencari lagi di mana lensanya.
   Perubahan global bersaing dengan perubahan lokal yang justru jadi isi
   interaksinya. Hover di sini cuma boleh mengubah satu hal - lensa pixel di
   bawah kursor - dan karena itu satu-satunya yang berubah, ia tidak bisa
   terlewat.

   Nilainya 0,86 kecerahan / 0,86 saturasi: cukup turun untuk duduk di dalam
   malamnya (foto mentah pada 1,0 lebih terang daripada apa pun di layar ini dan
   langsung terbaca lepas), tapi tidak sampai gelap - di bawah ~0,55 wajahnya
   berhenti terbaca dan potretnya lenyap dari menu.

   TIDAK ADA angkat-geser di sini, beda dari kartu lain yang memakai pix-lift.
   Lensanya berjangkar ke koordinat elemen; menggeser elemen tepat saat lensa
   membuka membuat lingkarannya meleset dari kursor sampai gerakan berikutnya.

   Tetap disembunyikan di HP: layar sentuh tidak punya hover, jadi lensanya
   tidak pernah terjadi di sana - dan satu kolom berisi menu + dialog + potret
   gampang lebih tinggi dari layar. */
export const Portrait = () => {
  const ref = useRef(null);
  const raf = useRef(0);

  /* pointermove membanjir jauh lebih cepat dari laju gambar layar. Satu tulis
     per frame sudah semulus aslinya dan menghemat sisanya.

     offsetX/offsetY dipakai supaya tidak perlu getBoundingClientRect() tiap
     frame - itu memaksa layout sinkron. Nilainya relatif terhadap node sasaran,
     dan sasarannya SELALU pembungkus ini karena kedua gambar di dalamnya
     pointer-events-none. */
  const track = useCallback((e) => {
    if (raf.current) return;
    const { offsetX, offsetY } = e.nativeEvent;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = ref.current;
      if (!el) return;
      el.style.setProperty("--mx", `${offsetX}px`);
      el.style.setProperty("--my", `${offsetY}px`);
    });
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div
      ref={ref}
      onPointerMove={track}
      className={cn(
        "group sprite-cast relative z-0 -mb-14 hidden w-full select-none md:block"
      )}
    >
      {/* Pembungkus gradasi. Kedua layer WAJIB digradasi sama persis - kalau
          hanya fotonya yang diturunkan, lingkaran lensa menyala lebih terang
          dari sekitarnya dan batasnya langsung ketahuan sebagai potongan.
          Karena itu nilainya ditulis sekali di sini, bukan disalin ke masing-
          masing gambar tempat keduanya bisa lepas sinkron.

          Tidak bisa ditumpuk ke pembungkus luar: di sana sprite-cast sudah
          memegang properti filter untuk pendarnya, dan dua filter di satu
          elemen akan saling menimpa. */}
      <div
        className="relative brightness-[.86] contrast-[1.12] saturate-[.86]"
      >
        <img
          src="/me.webp"
          alt="Foto Deva Surya"
          /* Cat pertama di route "/" bareng siluet kota - jangan diantre
             di belakang aset yang baru terlihat setelah masuk stage. */
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none w-full"
        />

        {/* Kembaran pixel art, ditumpuk pas di atas foto. aria-hidden karena ia
            orang yang sama - pembaca layar sudah dapat alt di gambar pertama.

            SENGAJA TANPA utility sprite. image-rendering:pixelated cuma benar
            kalau skalanya kelipatan bulat, dan di sini tidak pernah bulat: grid
            artwork aslinya (v2) berperiode ~8,5px pada crop 903px, jadi di aset
            640px bloknya jatuh ke ~6px - dan pada tampilan 384px jadi ~3,6px.
            Dipaksa pixelated, blok-nya berselang-seling lebar dan sempit,
            persis cacat yang diperingatkan catatan di utility itu. Dibiarkan
            default, bloknya tetap sama lebar. */}
        <img
          src="/me-pixel.webp"
          alt=""
          aria-hidden="true"
          decoding="async"
          className={cn(
            "pix-lens pointer-events-none absolute inset-0 h-full w-full",
            "group-hover:[--lens:128px]",
            "motion-reduce:transition-none"
          )}
        />
      </div>
    </div>
  );
};
