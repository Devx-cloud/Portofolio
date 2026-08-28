import { useEffect, useRef } from "react";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";

/*
 * Kursor petak.
 *
 * Kuncinya: reticle TIDAK mengikuti kursor piksel demi piksel. Ia mengunci ke
 * petak, seperti kursor pemilih di game taktik. Gerak halus yang mengekor
 * adalah bahasa visual web modern; snap ke grid adalah bahasa dunia ini.
 *
 * Posisi ditulis langsung ke DOM lewat ref, bukan lewat state React - mousemove
 * bisa memicu ratusan kali per detik, dan setState di situ akan me-render ulang
 * pohon komponen sebanyak itu juga.
 */

const TILE = 24; // kelipatan grid 4px
const TRAIL = [0.55, 0.38, 0.22, 0.1]; // opacity jejak, bertingkat bukan gradasi
const MOTE = 8;
const MOTE_INSET = (TILE - MOTE) / 2;

/* Elemen yang bisa disentuh - reticle mengunci penuh saat berada di atasnya */
const INTERACTIVE = "a, button, input, textarea, select, label, [role='button']";

export const CursorTracker = () => {
  const reticleRef = useRef(null);
  const moteRefs = useRef([]);

  /* Hanya untuk penunjuk presisi. Di layar sentuh tidak ada kursor untuk
     diikuti, dan reduced-motion berarti pengunjung tidak ingin ada yang
     bergerak mengikutinya. */
  const hasCursor = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = hasCursor && !reducedMotion;

  useEffect(() => {
    const reticle = reticleRef.current;
    if (!enabled || !reticle) return;

    let raf = 0;
    let pending = null;
    let tileX = null;
    let tileY = null;
    let history = [];

    const paint = () => {
      raf = 0;
      if (!pending) return;

      const { x, y, locked } = pending;
      reticle.classList.toggle("is-locked", locked);

      const tx = Math.floor(x / TILE);
      const ty = Math.floor(y / TILE);
      // Petak yang sama - tidak ada yang perlu digambar ulang
      if (tx === tileX && ty === tileY) return;

      tileX = tx;
      tileY = ty;
      history.unshift([tx, ty]);
      if (history.length > TRAIL.length + 1) history.pop();

      reticle.style.transform = `translate3d(${tx * TILE}px, ${ty * TILE}px, 0)`;
      reticle.style.opacity = "1";

      // history[0] adalah petak saat ini, jejak mulai dari yang berikutnya
      moteRefs.current.forEach((el, i) => {
        if (!el) return;
        const step = history[i + 1];
        if (!step) {
          el.style.opacity = "0";
          return;
        }
        el.style.transform = `translate3d(${step[0] * TILE + MOTE_INSET}px, ${
          step[1] * TILE + MOTE_INSET
        }px, 0)`;
        el.style.opacity = String(TRAIL[i]);
      });
    };

    const handleMove = (e) => {
      pending = {
        x: e.clientX,
        y: e.clientY,
        locked: Boolean(e.target?.closest?.(INTERACTIVE)),
      };
      // Digabung ke satu frame - mousemove jauh lebih sering daripada repaint
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const handleLeave = () => {
      reticle.style.opacity = "0";
      moteRefs.current.forEach((el) => el && (el.style.opacity = "0"));
      history = [];
      tileX = null;
      tileY = null;
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] overflow-hidden">
      {TRAIL.map((_, i) => (
        <span
          key={i}
          ref={(el) => (moteRefs.current[i] = el)}
          className="pix-mote absolute left-0 top-0"
        />
      ))}
      <div ref={reticleRef} className="pix-reticle absolute left-0 top-0" />
    </div>
  );
};
