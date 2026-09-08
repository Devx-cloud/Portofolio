import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { EASE_OUT_EXPO } from "@/lib/motion";

/*
 * Pengalih tema. Satu-satunya kontrol di masthead, dan sengaja tetap kecil -
 * ia bukan fitur utama situs ini, cuma kenyamanan.
 *
 * Ikonnya menunjukkan tema YANG AKAN DITUJU, bukan yang sedang aktif. Dua
 * konvensi ini sama-sama ada di alam liar dan keduanya membingungkan sebagian
 * orang; yang menyelesaikannya adalah aria-label yang menyebut tujuannya
 * dengan kata-kata ("Ganti ke tema terang"), jadi tidak ada yang perlu menebak.
 */
export const ThemeToggle = () => {
  const { toggle, isLight } = useTheme();
  const reduced = useReducedMotion();

  const target = isLight ? "gelap" : "terang";
  const Icon = isLight ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Ganti ke tema ${target}`}
      title={`Ganti ke tema ${target}`}
      className="flex size-8 shrink-0 items-center justify-center border border-line text-muted transition-colors duration-500 hover:border-red hover:text-red"
    >
      {/* mode="wait" supaya ikon lama keluar dulu - dua ikon yang saling
          menembus di kotak 32px terbaca sebagai kedipan, bukan pergantian. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isLight ? "moon" : "sun"}
          initial={reduced ? false : { opacity: 0, rotate: -70, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduced ? undefined : { opacity: 0, rotate: 70, scale: 0.6 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          className="flex"
        >
          <Icon size={14} strokeWidth={2} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
};
