import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/*
 * Ladang partikel di latar Hero: kisi titik yang MENYIBAK saat kursor lewat.
 *
 * Kenapa kisi, bukan taburan acak seperti starfield: halaman ini dibangun dari
 * garis dan sudut siku, dan partikel yang melayang acak akan terbaca sebagai
 * hiasan yang ditempel dari tema lain. Kisi yang terganggu justru memperkuat
 * bahasanya - ia terlihat seperti sesuatu yang direkayasa, dan gangguannya
 * jadi bukti bahwa halamannya hidup.
 *
 * Titiknya KOTAK, bukan lingkaran. Dua alasan: ctx.rect() lebih murah daripada
 * ctx.arc(), dan titik font Anton (yang jadi aksen merah di nama Hero) juga
 * kotak - jadi teksturnya mengutip tipografinya sendiri.
 *
 * ---- Anggaran performa ----
 * Di 1440x900 dengan jarak 38px ada ~1000 titik. Yang membuatnya murah:
 *
 *   1. DUA draw call per frame, bukan seribu. Semua titik diam masuk ke satu
 *      Path2D dan semua titik aktif ke satu lagi; warna dan alpha di-set
 *      sekali per batch. Mengganti fillStyle per titik adalah cara paling
 *      cepat membunuh canvas.
 *   2. Loop BERHENTI saat semuanya diam. Tanpa kursor di layar, tidak ada
 *      yang bergerak - jadi tidak ada alasan membangunkan GPU 60 kali sedetik.
 *      Dibangunkan lagi oleh pointermove.
 *   3. Berhenti saat Hero keluar layar (IntersectionObserver) dan saat tab
 *      disembunyikan (visibilitychange). Menggambar latar yang sedang tidak
 *      dilihat siapa pun adalah baterai yang terbuang.
 *   4. devicePixelRatio dibatasi 2. Di layar 3x, ~2.25 juta piksel per frame
 *      untuk tekstur latar tidak sepadan dengan bedanya yang nyaris tak terlihat.
 *
 * Sepenuhnya dilewati untuk prefers-reduced-motion - lihat catatan di bawah.
 */

/* Jarak antar titik. Turun ke ~24px dan kisinya berubah jadi bidang abu-abu
   rata (teksturnya hilang); naik ke ~56px dan sibakannya cuma menggerakkan
   dua-tiga titik sekaligus, jadi tidak terbaca sebagai gelombang. */
const SPACING = 38;

/* Radius pengaruh kursor. Kira-kira empat sel kisi - cukup lebar untuk
   menyibak sekelompok titik, bukan satu per satu. */
const RADIUS = 150;

/* Sejauh mana titik terdorong di pusat sibakan. Sengaja lebih kecil dari
   setengah SPACING supaya titik tidak pernah menyeberangi tetangganya -
   kisi yang tumpang tindih terbaca rusak, bukan terganggu. */
const MAX_PUSH = 16;

const DOT_REST = 1.5;
const DOT_ACTIVE = 4;

/* Ambang sebuah titik dihitung "aktif" (dicat merah, ukuran membesar).
   0.06 kira-kira tepi lingkaran pengaruh - di bawah itu perubahannya terlalu
   kecil untuk terlihat dan cuma menambah isi batch merah. */
const ACTIVE_AT = 0.06;

const ALPHA_REST = 0.3;
const ALPHA_ACTIVE = 0.9;

/* Kekakuan pegas balik, dalam satuan "per detik". Dipakai lewat
   1 - exp(-k * dt) supaya kecepatan kembalinya sama di layar 60Hz dan 120Hz;
   lerp dengan faktor tetap per frame akan dua kali lebih cepat di 120Hz. */
const STIFFNESS = 9;

const readColors = () => {
  const styles = getComputedStyle(document.documentElement);
  return {
    rest: styles.getPropertyValue("--c-muted").trim() || "#8a8a8a",
    active: styles.getPropertyValue("--c-red").trim() || "#e5384c",
  };
};

export const DotField = ({ className }) => {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let colors = readColors();

    /* Posisi dasar kisi (bx, by) dan simpangan sekarang (ox, oy). Disimpan di
       Float32Array yang datar, bukan array objek: seribu objek kecil yang
       dibaca tiap frame memberi pekerjaan tetap ke garbage collector, dan itu
       muncul sebagai tersendat berkala - persis hal yang paling terlihat di
       animasi latar. */
    let bx = new Float32Array(0);
    let by = new Float32Array(0);
    let ox = new Float32Array(0);
    let oy = new Float32Array(0);
    let count = 0;

    let width = 0;
    let height = 0;

    const pointer = { x: -9999, y: -9999, inside: false };

    let frame = 0;
    let running = false;
    let visible = true;
    let lastTime = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / SPACING) + 1;
      const rows = Math.ceil(height / SPACING) + 1;
      count = cols * rows;

      bx = new Float32Array(count);
      by = new Float32Array(count);
      ox = new Float32Array(count);
      oy = new Float32Array(count);

      /* Sisa pembagian dibagi dua di kedua sisi supaya kisinya terpusat -
         kalau tidak, akan ada jalur kosong selebar sisa itu di tepi kanan. */
      const offsetX = (width - (cols - 1) * SPACING) / 2;
      const offsetY = (height - (rows - 1) * SPACING) / 2;

      let i = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          bx[i] = offsetX + c * SPACING;
          by[i] = offsetY + r * SPACING;
          i++;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const rest = new Path2D();
      const active = new Path2D();

      for (let i = 0; i < count; i++) {
        const x = bx[i] + ox[i];
        const y = by[i] + oy[i];

        /* Seberapa jauh titik ini dari tempat asalnya, dinormalkan terhadap
           dorongan maksimum. Dipakai sebagai pengganti menghitung ulang jarak
           ke kursor - hasilnya sama tapi tanpa sqrt kedua. */
        const shift = Math.abs(ox[i]) + Math.abs(oy[i]);
        const strength = Math.min(shift / MAX_PUSH, 1);

        if (strength > ACTIVE_AT) {
          const size = DOT_REST + (DOT_ACTIVE - DOT_REST) * strength;
          active.rect(x - size / 2, y - size / 2, size, size);
        } else {
          rest.rect(x - DOT_REST / 2, y - DOT_REST / 2, DOT_REST, DOT_REST);
        }
      }

      ctx.globalAlpha = ALPHA_REST;
      ctx.fillStyle = colors.rest;
      ctx.fill(rest);

      ctx.globalAlpha = ALPHA_ACTIVE;
      ctx.fillStyle = colors.active;
      ctx.fill(active);
    };

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const ease = 1 - Math.exp(-STIFFNESS * dt);
      let moving = false;

      for (let i = 0; i < count; i++) {
        let targetX = 0;
        let targetY = 0;

        if (pointer.inside) {
          const dx = bx[i] - pointer.x;
          const dy = by[i] - pointer.y;
          const distSq = dx * dx + dy * dy;

          /* Bandingkan kuadratnya - sqrt hanya dihitung untuk titik yang
             benar-benar kena, dan itu segelintir dari seribu. */
          if (distSq < RADIUS * RADIUS) {
            const dist = Math.sqrt(distSq) || 0.0001;
            const force = 1 - dist / RADIUS;
            const push = force * force * MAX_PUSH;
            targetX = (dx / dist) * push;
            targetY = (dy / dist) * push;
          }
        }

        ox[i] += (targetX - ox[i]) * ease;
        oy[i] += (targetY - oy[i]) * ease;

        /* Ambang diam. Tanpa ini, lerp eksponensial tidak pernah benar-benar
           mencapai nol dan loop-nya berjalan selamanya untuk gerakan sepersekian
           piksel yang tidak bisa dilihat siapa pun. */
        if (Math.abs(ox[i]) > 0.05 || Math.abs(oy[i]) > 0.05) moving = true;
      }

      draw();

      if (moving || pointer.inside) {
        frame = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (running || !visible) return;
      running = true;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.inside =
        pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
      wake();
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      wake();
    };

    build();
    draw();

    /* ResizeObserver, bukan window.resize: tinggi Hero ikut svh dan berubah
       saat bilah alamat browser mobile menyusut - peristiwa yang tidak selalu
       memicu resize window. */
    const resizeObserver = new ResizeObserver(() => {
      build();
      draw();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          running = false;
        } else {
          wake();
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        running = false;
      } else {
        wake();
      }
    };

    /* Warna diambil dari token CSS, jadi ia harus dibaca ulang saat tema
       berganti - canvas tidak ikut kaskade seperti elemen DOM biasa. */
    const themeObserver = new MutationObserver(() => {
      colors = readColors();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  /* Dilewati sepenuhnya untuk gerak minimal - dan yang dilewati adalah
     KESELURUHANNYA, bukan cuma animasinya. Kisi titik statis tidak
     menyampaikan apa pun yang tidak sudah disampaikan halamannya; merendernya
     hanya menambah tekstur yang harus diabaikan mata. */
  if (reduced) return null;

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
};
