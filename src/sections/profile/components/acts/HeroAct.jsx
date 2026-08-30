import { ActPanel, ActText, ActTitle } from "../ActPanel";

/*
 * Babak pembuka. Satu-satunya babak tanpa tombol - tidak ada stage "data diri"
 * untuk dituju, dan inilah yang dibaca lebih dulu daripada apa pun di situs ini.
 *
 * Dulu memuat kotak berisi tiga baris statistik berikon (Lokasi, Fokus, Status).
 * Dibuang: lokasi sudah ada di stage Contact, fokus sudah disebut di paragraf
 * DAN punya stage sendiri, jadi yang tersisa cuma pengulangan yang membuat panel
 * pertama - yang justru harus paling mudah dibaca - jadi yang paling ramai.
 *
 * Status ketersediaan dipertahankan karena ia satu-satunya yang tidak ada di
 * tempat lain, tapi sebagai satu baris, bukan kotak berbingkai.
 */
export const HeroAct = ({ index }) => (
  <ActPanel index={index} label="Data Diri">
    <div>
      <ActTitle as="h1" size="xl">
        Deva <span className="stage-text">Surya</span>
      </ActTitle>
      <p className="pixel-font-null mt-2 text-pix-sm md:text-pix-md uppercase tracking-[2px] stage-text-bright">
        Web &amp; Mobile Developer
      </p>
    </div>

    <ActText>
      Saya membangun aplikasi web dengan Laravel dan aplikasi mobile dengan Flutter, dengan
      perhatian besar pada struktur data agar setiap fitur tetap rapi, ringan, dan mudah
      dikembangkan. Di luar itu saya mengeksplorasi React dan mengasah kemampuan lewat kontribusi
      ke proyek open&#8209;source.
    </ActText>

    <p className="inline-flex items-center gap-2 text-xs md:text-sm text-foreground/80">
      <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 stage-bg animate-pulse-subtle" />
      Terbuka untuk proyek &amp; kolaborasi
    </p>
  </ActPanel>
);
