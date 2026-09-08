import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion";
import { cn } from "@/lib/utils";

/*
 * Pita teks berjalan yang KECEPATANNYA ikut kecepatan gulungan, dan yang
 * BERBALIK ARAH saat digulung ke atas.
 *
 * Ini satu-satunya elemen di halaman yang bergerak tanpa dipicu gulungan -
 * pengecualian yang disengaja terhadap aturan ke-4. Alasannya: pita yang
 * benar-benar diam terbaca sebagai deretan kata yang terpotong tepi layar,
 * bukan sebagai pita. Gerak dasarnya pelan (2%/detik) supaya tidak menarik
 * perhatian dari teks di sekitarnya; yang menarik perhatian adalah reaksinya
 * terhadap gulungan.
 *
 * Cara kerja loop-nya: daftar dirender EMPAT kali berturut-turut, lalu x
 * di-wrap antara -50% dan 0% dari lebar trek. Setengah trek = tepat dua
 * salinan, jadi begitu geseran mencapai -50% salinan ke-3 berada persis di
 * tempat salinan ke-1 tadi dan lompatan baliknya tidak terlihat. Empat
 * salinan (bukan dua) memberi jaminan bahwa setengah trek selalu lebih lebar
 * dari layar mana pun - kalau tidak, akan ada celah kosong di ujung kanan.
 */
export const Marquee = ({
  items,
  baseVelocity = 2,
  className,
  itemClassName,
  separator = "/",
}) => {
  const reduced = useReducedMotion();
  const baseX = useMotionValue(0);
  const direction = useRef(1);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);

  /* Kecepatan gulungan mentah sangat berisik (melonjak tiap gerakan roda).
     Spring meredamnya jadi kurva yang bisa dipakai; tanpa ini pitanya
     tersentak-sentak alih-alih "terseret". */
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  /* clamp: false disengaja - menggulung lebih cepat dari 1200px/detik harus
     terus mempercepat pita, bukan mentok. Itu yang membuatnya terasa punya
     massa. */
  const velocityFactor = useTransform(smoothVelocity, [0, 1200], [0, 4], {
    clamp: false,
  });

  const x = useTransform(baseX, (value) => `${wrap(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;

    /* delta dalam milidetik. Membagi dengan 1000 membuat kecepatan terikat
       WAKTU, bukan jumlah frame - jadi tampilannya sama di layar 60Hz
       maupun 120Hz. */
    let moveBy = direction.current * baseVelocity * (delta / 1000);

    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;

    moveBy += moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const row = (
    <span className={cn("flex shrink-0 items-center", itemClassName)}>
      {items.map((item, i) => (
        <span key={`${item}-${i}`} className="flex shrink-0 items-center">
          <span className="whitespace-nowrap">{item}</span>
          <span aria-hidden="true" className="mx-6 text-red md:mx-10">
            {separator}
          </span>
        </span>
      ))}
    </span>
  );

  return (
    /* aria-hidden: isinya murni dekoratif dan sudah diulang empat kali -
       pembaca layar tidak boleh membacakan daftar yang sama empat kali. */
    <div aria-hidden="true" className={cn("marquee-mask overflow-hidden", className)}>
      <motion.div className="marquee-track" style={reduced ? undefined : { x }}>
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  );
};
