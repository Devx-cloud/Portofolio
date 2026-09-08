import { useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/*
 * Efek magnetik: elemen tertarik pelan ke arah kursor saat kursor mendekat.
 *
 * Dipakai HANYA di ajakan utama (kirim pesan, kembali ke atas). Kalau semua
 * tombol magnetik, tidak ada yang terasa istimewa dan halamannya justru
 * terasa licin - efek ini bekerja karena ia langka.
 *
 * Tiga pagar yang membuatnya tidak mengganggu:
 *
 *   1. Hanya di pointer halus. Di layar sentuh tidak ada kursor untuk ditarik,
 *      jadi listener-nya tidak pernah dipasang sama sekali.
 *   2. Mati untuk prefers-reduced-motion. Yang dimatikan geraknya, bukan
 *      fungsinya - tombolnya tetap tombol, tetap bisa diklik dan difokus.
 *   3. Geserannya kecil (maksimum ~35% jarak) dan selalu kembali ke nol.
 *      Tombol yang berlari menjauh dari kursor adalah lelucon yang mahal:
 *      pengguna dengan gangguan motorik jadi tidak bisa mengkliknya.
 *
 * Nilai balik dipakai begini:
 *   const magnet = useMagnetic();
 *   <motion.button ref={magnet.ref} style={magnet.style} />
 */
export const useMagnetic = ({ strength = 0.32, radius = 110 } = {}) => {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  /* Spring, bukan nilai langsung: tarikan yang mengikuti kursor persis terasa
     seperti elemen yang menempel di kursor, sementara yang tertinggal sedikit
     terasa seperti benda bermassa yang ditarik. Perbedaannya kecil dan
     seluruh efeknya ada di situ. */
  const springX = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (reduced || !finePointer) return;

    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      /* Radius diukur dari TEPI elemen, bukan dari pusatnya: tombol lebar
         (form kontak) kalau tidak akan mulai bergerak baru setelah kursor
         hampir menyentuhnya, sementara tombol kecil bereaksi dari jauh. */
      const reach = radius + Math.max(rect.width, rect.height) / 2;

      if (Math.hypot(dx, dy) > reach) {
        x.set(0);
        y.set(0);
        return;
      }

      x.set(dx * strength);
      y.set(dy * strength);
    };

    const reset = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    /* Gulungan memindahkan elemen di bawah kursor yang diam; tanpa reset,
       tombol bisa tertinggal dalam keadaan tergeser setelah digulung pergi. */
    window.addEventListener("scroll", reset, { passive: true });
    document.addEventListener("pointerleave", reset);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", reset);
      document.removeEventListener("pointerleave", reset);
    };
  }, [reduced, finePointer, radius, strength, x, y]);

  return {
    ref,
    style: reduced || !finePointer ? undefined : { x: springX, y: springY },
  };
};
