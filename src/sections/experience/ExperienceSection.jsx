import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { SCROLLY_QUERY } from "./constants";
import { ProjectStack } from "./ProjectStack";
import { SkillsFlow } from "./SkillsFlow";
import { SkillsStage } from "./SkillsStage";
import { ExperienceHeader } from "./components/ExperienceHeader";

/*
 * Stage Experience: layar judul, lalu Skills dan Projects, dua bab berurutan di
 * satu halaman.
 *
 *   Judul    - ExperienceHeader: judul, pengantar, dan daftar isi kedua bab.
 *   Skills  - papan semua kategori yang ikonnya terbuka satu per satu.
 *              SkillsStage (panggung scroll) di layar lebar yang cukup tinggi,
 *              SkillsFlow (daftar mengalir) di tempat lain. Keduanya dipasang,
 *              CSS (varian scrolly) yang memilih mana yang terlihat - kalau
 *              dipilih lewat JS, layar lebar sempat merender daftar mengalir
 *              satu frame sebelum media query terbaca.
 *   Projects - tumpukan kartu yang saling menimpa (ProjectStack).
 *
 * Kedua bab saling menunjuk:
 *   tag skill di kartu project -> papan skill, skill itu terbuka di detail
 *   "Dipakai di" di detail     -> kartu project-nya, berkedip saat tiba
 * Karena itu pilihan skill hidup DI SINI, bukan di dalam bab Skills: kartu
 * project harus bisa mengisinya.
 */
/* Batas atas kunci hover kalau `scrollend` tidak pernah datang - browser tanpa
   dukungannya, atau detail yang sudah terlihat sehingga tidak ada gulir sama
   sekali. Sedikit lebih lama dari gulir halus terpanjang di halaman ini. */
const HOVER_LOCK_MS = 1500;

export const ExperienceSection = () => {
  const location = useLocation();
  const [pickedId, setPickedId] = useState(null);

  const stageRef = useRef(null);
  const flowRef = useRef(null);
  const projectsRef = useRef(null);

  /* Kunci hover selama gulir otomatis ke papan skill.

     Kursor diam di tempat pengunjung mengklik tag, lalu halaman menggulir papan
     skill MELEWATI kursor itu - dan browser menganggap tiap slot yang lewat
     sebagai hover. Tanpa kunci ini, skill yang dituju langsung tertimpa slot
     yang kebetulan lewat terakhir: klik Three.js, mendarat di ReactJs.
     Terukur di Chrome, bukan dugaan. */
  const hoverLocked = useRef(false);
  const unlockRef = useRef(() => {});

  const hoverPick = useCallback((id) => {
    if (!hoverLocked.current) setPickedId(id);
  }, []);

  const pickSkill = useCallback((id) => {
    setPickedId(id);

    unlockRef.current();
    let timer = 0;
    const unlock = () => {
      hoverLocked.current = false;
      clearTimeout(timer);
      window.removeEventListener("scrollend", unlock);
      unlockRef.current = () => {};
    };
    hoverLocked.current = true;
    unlockRef.current = unlock;
    window.addEventListener("scrollend", unlock);
    timer = setTimeout(unlock, HOVER_LOCK_MS);

    const view = window.matchMedia(SCROLLY_QUERY).matches ? stageRef : flowRef;
    view.current?.showSkill();
  }, []);

  useEffect(() => () => unlockRef.current(), []);

  const openProject = useCallback((id) => projectsRef.current?.open(id), []);

  /* Tautan lama /skills dan /projects mendarat di #skills / #projects (lihat
     App.jsx). Satu frame kemudian, setelah tata letaknya benar-benar ada.
     Seketika, tanpa gulir halus - pengunjung datang untuk bab itu, bukan untuk
     menonton perjalanan ke sana. */
  useEffect(() => {
    const id = location.hash.slice(1);
    if (!id) return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" })
    );
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  return (
    /* reducedMotion="user": framer menahan gerak transform untuk pengunjung yang
       meminta gerak dikurangi, opacity tetap. Animasi CSS-nya dimatikan terpisah
       di index.css. */
    <MotionConfig reducedMotion="user">
      <div className="relative">
        {/* Tiga bagian, masing-masing dengan layarnya sendiri: judul, Skills,
            Projects. Panggung Skills dulu ditarik naik ke ruang di bawah judul
            supaya lipatan pertama tidak setengah kosong - hasilnya judul,
            statistik, dan papan skill berdesakan di satu layar. Sekarang layar
            pertama memang milik judul saja, jadi tidak ada lagi yang perlu
            ditarik. */}
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
          <ExperienceHeader />
        </div>

        <div id="skills" className="scroll-mt-20 pt-4 scrolly:pt-0">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8 scrolly:hidden">
            <SkillsFlow ref={flowRef} pickedId={pickedId} onPick={hoverPick} onOpenProject={openProject} />
          </div>
          <SkillsStage ref={stageRef} pickedId={pickedId} onPick={hoverPick} onOpenProject={openProject} />
        </div>

        <ProjectStack ref={projectsRef} onPickSkill={pickSkill} />
      </div>
    </MotionConfig>
  );
};
