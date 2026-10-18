import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useMediaQuery";
import { pad2, skillById, skills } from "./data";
import { ChapterLabel } from "./components/ChapterLabel";
import { SkillBoard } from "./components/SkillBoard";
import { SkillDetail } from "./components/SkillDetail";

/* Jeda antar ikon yang terbuka. 15 ikon x 80ms = ~1,2 detik: cukup lambat untuk
   diikuti mata satu per satu, cukup cepat untuk selesai sebelum pengunjung
   menggulir lewat papannya. */
const REVEAL_STEP_MS = 80;

/*
 * Bab Skills sebagai DAFTAR MENGALIR - HP, tablet, dan layar yang terlalu pendek
 * untuk panggung scroll (lihat SCROLLY_QUERY).
 *
 * Papan yang sama dengan panggung scroll, tapi pemicunya berbeda. Di sana posisi
 * gulir yang membuka ikon; di sini gulir di HP terlalu cepat dan tidak rata untuk
 * dijadikan penggerak per ikon, jadi begitu papan masuk layar ikonnya terbuka
 * sendiri bergiliran. Bahasa geraknya tetap satu.
 */
export const SkillsFlow = ({ ref, pickedId, onPick, onOpenProject }) => {
  const reducedMotion = useReducedMotion();
  const boardRef = useRef(null);
  const detailRef = useRef(null);
  const boardInView = useInView(boardRef, { once: true, amount: 0.3 });
  const [counted, setCounted] = useState(0);

  /* Satu timeout per ikon, bukan setInterval: effect ini berhenti sendiri saat
     hitungannya penuh, tanpa perlu menghentikan interval dari dalam updater. */
  useEffect(() => {
    if (!boardInView || reducedMotion || counted >= skills.length) return;
    const timer = setTimeout(() => setCounted((n) => n + 1), counted ? REVEAL_STEP_MS : 160);
    return () => clearTimeout(timer);
  }, [boardInView, reducedMotion, counted]);

  /* Skill yang dibuka dari kartu project bisa berada di depan hitungan - papan
     dipaksa terbuka setidaknya sampai skill itu, supaya yang dituju terlihat. */
  const pickedIndex = pickedId ? skills.findIndex((s) => s.id === pickedId) : -1;
  const revealed = boardInView && reducedMotion ? skills.length : Math.max(counted, pickedIndex + 1);
  /* Selama papan membuka ikonnya, panel detail mengikuti ikon terbaru. Begitu
     semuanya terbuka ia kembali ke skill pertama - yang utama. Tanpa ini keadaan
     diamnya jatuh di ikon TERAKHIR (Python: tier Eksplorasi, tidak dipakai di
     project mana pun), jadi kesan pertama papan ini adalah skill yang paling
     lemah. */
  const revealDone = revealed >= skills.length;
  const activeId = pickedIndex >= 0 ? pickedId : skills[revealDone ? 0 : Math.max(revealed - 1, 0)].id;

  useImperativeHandle(
    ref,
    () => ({
      /* Hanya digulir kalau panel detail tidak terlihat. 80 = tinggi bar stage. */
      showSkill() {
        const el = detailRef.current;
        if (!el) return;
        const { top, bottom } = el.getBoundingClientRect();
        if (top < 80 || bottom > window.innerHeight) {
          el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
        }
      },
    }),
    [reducedMotion]
  );

  return (
    <div>
      <ChapterLabel index={1} title="Skills" kicker="Loadout" meta={`${pad2(skills.length)} slot`} />

      {/* Dari md papan dan detail berdampingan - di dalam bab Skills. */}
      <div className="flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,26rem)_minmax(0,20rem)] md:items-start md:justify-center">
        <div ref={boardRef}>
          <SkillBoard revealed={revealed} activeId={activeId} onHover={onPick} />
        </div>

        <SkillDetail ref={detailRef} skill={skillById[activeId]} onOpenProject={onOpenProject} />
      </div>
    </div>
  );
};
