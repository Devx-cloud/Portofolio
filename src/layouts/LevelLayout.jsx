import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { StageMenu } from "./components/StageMenu";

/*
 * Bar stage: jalan kembali ke menu di kiri, pemilih stage dan nama stage di kanan.
 *
 * h-20 WAJIB sama dengan pt-20 di main dan top-20 / 5rem di panggung. Kalau
 * tinggi bar dibiarkan mengikuti isinya, selisihnya muncul sebagai celah kosong
 * di bawah bar.
 */
export const LevelLayout = ({ stage, children }) => {
  const mainRef = useRef(null);

  /* Pindah stage = halaman baru, tapi peramban tidak tahu itu: fokus tertinggal di
     tautan yang baru diklik (yang sudah lenyap), jadi pengguna keyboard mulai lagi
     dari puncak dokumen dan pembaca layar tidak mendengar apa pun. Fokus
     dipindahkan ke isi halaman - main tidak interaktif, jadi tak ada cincin fokus
     yang perlu ditampilkan, dan preventScroll menjaga posisi gulir tetap. */
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
  }, [stage.id]);

  return (
    <div
      className="relative min-h-svh bg-background text-foreground"
      style={{ "--stage-accent": stage.accent }}
    >
      <header className="pix-veil fixed inset-x-0 top-0 z-30 flex h-20 items-center justify-between border-b-4 stage-border px-4">
        {/* state membawa stage asal, dipakai Title Screen sebagai pilihan awal -
            kembali dari Experience menyorot 02, bukan mengulang dari 01. Lewat state
            navigasi, bukan penyimpanan: ini cuma soal satu perjalanan bolak-balik,
            tidak perlu bertahan lintas sesi. */}
        <Link
          to="/"
          state={{ fromStage: stage.id }}
          className="pix-chip pixel-font stage-border-soft px-3 py-2 text-xs text-foreground/80 transition-all duration-100 ease-pix hover:stage-text hover:stage-border md:text-sm"
        >
          &laquo;&laquo; MENU
        </Link>

        {/* Pemilih mendahului label: urutan baca yang wajar menaruh kendali sebelum
            keterangannya. Labelnya disembunyikan di bawah sm - di layar sempit
            keduanya tidak muat berdampingan, dan yang dikorbankan keterangannya.
            Teksnya dari stages.js: satu stage satu nama, tidak bisa lepas sinkron. */}
        <div className="flex items-center gap-2">
          <StageMenu currentId={stage.id} />
          <span className="pixel-font pix-chip stage-border-soft stage-text-bright hidden px-3 py-2 text-pix-sm uppercase sm:inline-block">
            {stage.badge}
          </span>
        </div>
      </header>

      <div aria-hidden="true" className="aurora pointer-events-none fixed inset-0 z-0" />

      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className="relative z-10 pt-20 outline-none"
      >
        {/* Judul dokumen untuk pembaca layar dan mesin pencari. Tiap stage punya
            judul tampilnya sendiri (kadang di dalam panggung yang non-aktifnya
            di-inert, kadang tidak ada sama sekali seperti di Ask AI), jadi
            h1 yang selalu ada dan tunggal ditaruh di sini. */}
        <h1 className="sr-only">{stage.label} - Deva Surya</h1>
        {children}
      </main>
    </div>
  );
};
