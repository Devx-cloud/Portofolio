import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

/*
 * Tombol salin dengan konfirmasi.
 *
 * Alamat email di bagian Kontak sudah berupa tautan mailto, tapi mailto cuma
 * berguna bagi orang yang punya klien email terpasang dan mau memakainya saat
 * itu juga. Sebagian besar orang justru ingin MENYALIN alamatnya - ke Gmail di
 * tab lain, ke Slack, ke catatan. Tanpa tombol ini mereka harus menyeleksi
 * teks display setinggi 56px dengan tangan, yang di layar sentuh nyaris mustahil.
 *
 * Umpan baliknya wajib dan harus lebih dari sekadar warna: menyalin tidak
 * meninggalkan jejak apa pun di layar, jadi tanpa konfirmasi eksplisit
 * pengunjung tidak punya cara tahu apakah kliknya berhasil. Karena itu
 * ikonnya BERGANTI (bukan cuma berubah warna) dan labelnya ikut berubah -
 * status yang cuma disampaikan lewat warna tidak terbaca oleh sebagian orang.
 */
const RESET_AFTER = 2200;

/*
 * Cadangan untuk saat navigator.clipboard tidak bisa dipakai.
 *
 * Itu lebih sering daripada dugaan: API modernnya butuh secure context
 * (jadi hilang di http biasa - termasuk saat mengetes lewat IP di jaringan
 * lokal), butuh dokumennya sedang fokus, dan di sebagian browser butuh izin
 * yang bisa ditolak. execCommand memang sudah usang, tapi ia tidak menuntut
 * satu pun dari itu dan masih didukung semua browser yang relevan.
 *
 * Textarea-nya dibuat position: fixed dengan opacity 0, bukan display: none -
 * elemen yang tidak dirender tidak bisa diseleksi, dan tanpa seleksi
 * execCommand("copy") tidak menyalin apa pun.
 */
const legacyCopy = (text) => {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  area.style.pointerEvents = "none";

  document.body.appendChild(area);
  area.select();

  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }

  document.body.removeChild(area);
  return ok;
};

export const CopyButton = ({ value, label = "Salin", className }) => {
  const [state, setState] = useState("idle"); // idle | done | failed
  const timer = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);

    let ok = false;

    try {
      /* navigator.clipboard hanya ada di secure context (https / localhost).
         Di http biasa ia undefined - bukan gagal, tapi tidak ada sama sekali,
         jadi harus dicek sebelum dipanggil. */
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch {
      /* Izin ditolak, atau dokumennya sedang tidak fokus. Jangan menyerah di
         sini - cadangan execCommand di bawah tidak menuntut keduanya. */
    }

    if (!ok) ok = legacyCopy(value);

    setState(ok ? "done" : "failed");
    timer.current = setTimeout(() => setState("idle"), RESET_AFTER);
  };

  const view = {
    idle: { Icon: Copy, text: label },
    done: { Icon: Check, text: "Tersalin" },
    failed: { Icon: X, text: "Salin manual" },
  }[state];

  return (
    <button
      type="button"
      onClick={copy}
      /* aria-live di dalam tombol: perubahan labelnya diumumkan tanpa
         memindahkan fokus, jadi pengguna pembaca layar mendapat konfirmasi
         yang sama dengan pengguna yang melihat. */
      className={`group inline-flex items-center gap-2 border border-line px-3 py-2 transition-colors duration-300 hover:border-red hover:text-red ${
        state === "failed" ? "border-red text-red" : "text-muted"
      } ${className ?? ""}`}
    >
      <span className="relative flex size-4 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            initial={reduced ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="absolute flex"
          >
            <view.Icon size={14} />
          </motion.span>
        </AnimatePresence>
      </span>

      <span aria-live="polite" className="eyebrow">
        {view.text}
      </span>
    </button>
  );
};
