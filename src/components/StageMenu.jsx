import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { stages } from "../data/stages";
import { cn } from "@/lib/utils";

/*
 * Pemilih stage di bar atas.
 *
 * Menggantikan panah antar-stage yang dulu ada di sini dan dibuang. Panah punya
 * masalah yang dropdown tidak punya: di Profile ia bertabrakan makna dengan HUD
 * babak - bar menunjuk "Skills" sebagai STAGE berikutnya sementara HUD menunjuk
 * "02 SKILLS" sebagai BABAK berikutnya, dua "berikutnya" yang berbeda di satu
 * layar. Daftar yang dibuka atas permintaan tidak menjanjikan urutan apa pun,
 * jadi ambiguitas itu tidak muncul.
 *
 * Isinya dibaca dari stages.js, bukan ditulis ulang: satu stage satu nama, dan
 * menambah stage baru cukup di satu tempat.
 */

const itemBase =
  "flex w-full items-center gap-2 px-3 py-2 pixel-font text-pix-xs uppercase " +
  "transition-colors duration-100 ease-pix focus-visible:outline-2 " +
  "focus-visible:-outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]";

export const StageMenu = ({ currentId }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const itemsRef = useRef([]);

  const close = useCallback((focusTrigger) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }, []);

  /* Ditutup lewat pointerdown, bukan click: klik pada tautan di dalam menu akan
     menavigasi dan melepas komponennya sebelum click sempat menggelembung, dan
     penutup berbasis click jadi tidak pernah kebagian giliran di sebagian
     browser. pointerdown selalu lebih dulu. */
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    window.addEventListener("pointerdown", onDown);
    return () => window.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Fokus pindah ke stage yang sedang dibuka, bukan selalu ke butir pertama.
  useEffect(() => {
    if (!open) return;
    const active = stages.findIndex((s) => s.id === currentId);
    itemsRef.current[active < 0 ? 0 : active]?.focus();
  }, [open, currentId]);

  /* stopPropagation untuk SEMUA panah, bukan cuma yang dipakai di sini.
     ProfileSection memasang pendengar panah kiri/kanan di window untuk berpindah
     babak; tanpa penghenti ini, menavigasi menu ikut menggeser panggung di
     belakangnya. Selama menu terbuka, panah milik menu. */
  const onKeyDown = (e) => {
    if (e.key.startsWith("Arrow")) e.stopPropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      close(true);
      return;
    }

    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();

    const items = itemsRef.current.filter(Boolean);
    const at = items.indexOf(document.activeElement);
    const next = (at + step + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div ref={rootRef} className="relative" onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Pindah stage"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "pix-chip flex items-center gap-2 px-3 py-2 pixel-font text-pix-xs uppercase",
          "transition-all duration-100 ease-pix focus-visible:outline-2",
          "focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent))]",
          open
            ? "stage-border stage-bg-soft stage-text"
            : "stage-border-soft text-foreground/80 hover:stage-border hover:stage-text"
        )}
      >
        Stage
        {/* Segitiga berbalik saat terbuka - satu-satunya petunjuk arah yang
            dibutuhkan, dan sudah jadi bahasa yang sama dengan panel babak. */}
        <span aria-hidden="true" className={cn("inline-block", open && "rotate-180")}>
          ▼
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Daftar stage"
          className={cn(
            "pix-chip stage-border-soft absolute right-0 top-full z-40 mt-2",
            "flex min-w-[12rem] flex-col py-1"
          )}
        >
          {stages.map((stage, i) => {
            const isCurrent = stage.id === currentId;
            return (
              <Link
                key={stage.id}
                to={stage.path}
                role="menuitem"
                aria-current={isCurrent ? "page" : undefined}
                ref={(el) => (itemsRef.current[i] = el)}
                onClick={() => close(false)}
                className={cn(
                  itemBase,
                  isCurrent
                    ? "stage-bg stage-ink"
                    : "text-foreground/80 hover:stage-bg-soft hover:stage-text"
                )}
              >
                <span className={cn("w-4 shrink-0", !isCurrent && "opacity-0")}>▶</span>
                {stage.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
