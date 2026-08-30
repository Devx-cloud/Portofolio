import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { stages } from "@/data/stages";
import { Fireflies } from "@/components/backgrounds/Fireflies";
import { StarBackground } from "@/components/backgrounds/StarBackground";
import { useMediaQuery, useReducedMotion } from "@/hooks/useMediaQuery";
import { useTypewriter } from "@/hooks/useTypewriter";
import { cn } from "@/lib/utils";
import { DialogueBox } from "./components/DialogueBox";
import { StageList } from "./components/StageList";

// Jeda animasi "masuk stage" sebelum route benar-benar berpindah.
const ENTER_DELAY = 260;

/* Selang perputaran dialog di layar sentuh.

   Bukan angka bulat sembarangan. Mesin tik menulis ~60 karakter pada 18ms per
   karakter, jadi ~1,1 detik pertama masih dipakai menulis; sisanya yang tersedia
   untuk membaca. 5 detik menyisakan ~3,9 detik - cukup untuk satu kalimat
   pendek, dan itu sebabnya desc di stages.js dijaga tetap sepanjang itu. */
const CYCLE_MS = 5000;

/* sessionStorage, BUKAN localStorage. Umurnya satu tab: pengunjung yang baru
   datang tetap mendarat di 01/05 dan membaca perkenalannya, sementara yang
   sedang menjelajah tidak kehilangan tempatnya. localStorage akan melompati
   perkenalan itu berbulan-bulan kemudian, saat konteksnya sudah hilang. */
const LAST_STAGE_KEY = "devx:last-stage";

// Bisa melempar di mode privat / saat kuki situs diblokir - jangan sampai
// menjatuhkan render hanya demi kenyamanan kecil.
const readLastStage = () => {
  try {
    return sessionStorage.getItem(LAST_STAGE_KEY);
  } catch {
    return null;
  }
};

const writeLastStage = (id) => {
  try {
    sessionStorage.setItem(LAST_STAGE_KEY, id);
  } catch {
    /* diabaikan dengan sengaja */
  }
};

export const TitleScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  /* Pilihan awal = stage yang barusan ditinggalkan.

     Dua sumber, karena ada dua cara pulang. Tombol MENU mengirim asalnya lewat
     state navigasi; gestur back sistem tidak - ia memulihkan entri riwayat "/"
     yang state-nya memang kosong sejak awal. Di HP justru gestur itu yang
     paling sering dipakai, jadi sandaran sessionStorage-nya bukan pelengkap:
     dialah yang menangani kasus yang dikeluhkan.

     Tidak ketemu -> 0, yang juga berlaku untuk kunjungan pertama. */
  const [selected, setSelected] = useState(() => {
    const id = location.state?.fromStage ?? readLastStage();
    const at = stages.findIndex((s) => s.id === id);
    return at < 0 ? 0 : at;
  });
  const [entering, setEntering] = useState(false);

  /* Berhenti berputar begitu pengunjung memilih sendiri - lewat ketukan, hover,
     fokus, atau papan ketik. Setelah ada niat yang jelas, teks yang berganti
     sendiri berubah dari "hidup" jadi "mengganggu". */
  const [locked, setLocked] = useState(false);

  /* Perputaran otomatis HANYA kalau tidak ada penunjuk presisi. Di sana hover
     tidak pernah terjadi, jadi kotak dialog tidak punya cara lain untuk
     berganti - ketukan langsung masuk ke stage, bukan memilih.

     Dimatikan saat prefers-reduced-motion: teks yang berganti sendiri termasuk
     yang dihindari pengaturan itu. */
  const autoCycle = useMediaQuery("(pointer: coarse)") && !reducedMotion;

  const activeStage = stages[selected];
  const typed = useTypewriter(activeStage.desc, 18);
  const dialogue = reducedMotion ? activeStage.desc : typed;

  // Dipakai semua jalur pemilihan manual, jadi penguncian tidak bisa terlewat.
  const chooseStage = useCallback((index) => {
    setSelected(index);
    setLocked(true);
  }, []);

  const enterStage = useCallback(
    (index) => {
      if (entering) return;
      chooseStage(index);
      writeLastStage(stages[index].id);
      setEntering(true);
    },
    [entering, chooseStage]
  );

  useEffect(() => {
    if (!autoCycle || locked || entering) return;
    const timer = setInterval(
      () => setSelected((prev) => (prev + 1) % stages.length),
      CYCLE_MS
    );
    return () => clearInterval(timer);
  }, [autoCycle, locked, entering]);

  useEffect(() => {
    if (!entering) return;
    const timeout = setTimeout(() => navigate(stages[selected].path), ENTER_DELAY);
    return () => clearTimeout(timeout);
  }, [entering, selected, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (entering) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        chooseStage((selected + 1) % stages.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        chooseStage((selected - 1 + stages.length) % stages.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        enterStage(selected);
      } else if (/^[1-9]$/.test(e.key)) {
        const index = Number(e.key) - 1;
        if (index < stages.length) {
          e.preventDefault();
          chooseStage(index);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected, entering, enterStage, chooseStage]);

  return (
    <div
      className="fixed inset-0 z-20 overflow-hidden bg-background"
      style={{ "--stage-accent": activeStage.accent }}
    >
      <StarBackground />

      {/* Sorotan multi-hue tipis supaya latar tidak cuma hitam-merah */}
      <div aria-hidden="true" className="aurora pointer-events-none absolute inset-0 z-[1]" />

      {/* Siluet atap kota - langitnya transparan supaya bintang & meteor tembus */}
      <img
        src="/menu-bg.webp"
        alt=""
        aria-hidden="true"
        className="sprite pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[170vh] w-full object-cover object-bottom select-none"
      />

      {!reducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[3]">
          <Fireflies count={22} size={3} seed={73} warmRatio={0.6} />
        </div>
      )}

      {/* h-dvh (bukan min-h-screen) supaya tingginya PASTI, bukan sekadar minimum -
          overflow-y-auto baru jadi scroll beneran kalau ada batas tinggi yang
          jelas. Tanpa ini kelebihannya kepotong diam-diam oleh overflow-hidden
          milik pembungkus di atas, tanpa cara untuk di-scroll. */}
      <div className="relative z-10 flex h-dvh items-center justify-center overflow-y-auto px-5 py-12 md:px-8">
        <div
          className={cn(
            "flex w-full max-w-5xl flex-col items-center gap-10 transition-all duration-100 ease-pix",
            "md:flex-row md:items-center md:justify-between md:gap-12",
            entering ? "scale-95 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <div className="flex w-full flex-col items-start md:w-auto">
            <h1 className="pixel-font text-pix-2xl font-bold leading-none md:text-pix-3xl">
              <span className="text-glow text-foreground">Dev</span>
              <span className="text-primary">_X</span>
            </h1>
            <p className="pixel-font mt-2 text-pix-xs uppercase tracking-[4px] text-muted-foreground">
              Portofolio &middot; Deva Surya
            </p>

            <p className="pixel-font stage-text-bright mt-7 mb-4 animate-blink text-pix-xs md:text-xs">
              PRESS ENTER TO SELECT
            </p>

            <StageList
              selected={selected}
              entering={entering}
              onSelect={(i) => !entering && chooseStage(i)}
              onEnter={enterStage}
            />

            <p className="pixel-font mt-7 text-pix-xs leading-relaxed text-faint">
              ↑↓ Pilih &nbsp;·&nbsp; Enter Masuk &nbsp;·&nbsp; 1-5 Lompat
            </p>
          </div>

          <DialogueBox text={dialogue} index={selected} total={stages.length} />
        </div>
      </div>

      <p className="pixel-font pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-pix-xs uppercase tracking-[2px] text-faint">
        Deva Surya &middot; Portofolio v2
      </p>
    </div>
  );
};
