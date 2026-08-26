import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TitleScreen } from "./pages/TitleScreen";
import { StagePage } from "./pages/StagePage";
import { NotFound } from "./pages/NotFound";
import { StarBackground } from "./components/StarBackground";
import { CloudBackground } from "./components/CloudBackground";
import { CursorTracker } from "./components/CursorTracker";
import { useTheme } from "./context/ThemeContext";

/* Halaman ini punya langitnya sendiri - jangan tumpuk background global di atasnya */
const SELF_LIT_ROUTES = ["/", "/profile"];

/* Jumlah kolom wipe. 28 -> tiap kolom ~3.6% lebar layar: cukup tebal untuk
   terbaca sebagai balok pixel, cukup rapat untuk tepinya terbaca mengalir. */
const WIPE_COLUMNS = 28;

/* Keterlambatan tiap kolom. Dua gelombang sinus yang saling tumpang tindih,
   BUKAN acak murni: acak murni menghasilkan tepi seperti derau: naik-turun
   tiap kolom. Cairan punya tetangga yang berkorelasi - tinggi satu kolom
   dekat dengan tetangganya, dan itu yang gelombang berikan.

   Fase diacak tiap transisi supaya dua perpindahan berturut-turut tidak
   membentuk pola yang sama. */
const wipeDelays = () => {
  const phase = Math.random() * Math.PI * 2;
  return Array.from({ length: WIPE_COLUMNS }, (_, i) => {
    const t = i / (WIPE_COLUMNS - 1);
    const wave =
      Math.sin(t * Math.PI * 3.1 + phase) * 0.6 + Math.sin(t * Math.PI * 7.3 + phase * 2) * 0.4;
    return `${(((wave + 1) / 2) * 0.12).toFixed(3)}s`;
  });
};

function App() {
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const hasOwnBackdrop = SELF_LIT_ROUTES.includes(location.pathname);
  const isHomePage = location.pathname === "/";

  const isFirstRender = useRef(true);
  const [wipeKey, setWipeKey] = useState(null);

  /* Wipe hanya dipicu saat pindah halaman, bukan saat load pertama */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setWipeKey(`${location.pathname}-${Date.now()}`);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!hasOwnBackdrop &&
        (isDarkMode ? <StarBackground /> : <CloudBackground isHomePage={isHomePage} />)}

      {/* Crossfade route: sengaja opacity saja. transform/filter di sini akan
          membuat containing block baru dan merusak position:fixed & sticky di dalamnya. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Routes location={location}>
            <Route index element={<TitleScreen />} />
            <Route path="/profile" element={<StagePage stageId="profile" />} />
            <Route path="/skills" element={<StagePage stageId="skills" />} />
            <Route path="/projects" element={<StagePage stageId="projects" />} />
            <Route path="/assistant" element={<StagePage stageId="assistant" />} />
            <Route path="/contact" element={<StagePage stageId="contact" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <CursorTracker />

      {/* Overlay wipe berdiri sendiri di luar wrapper route supaya tidak ikut memengaruhi layout */}
      {wipeKey && (
        <div key={wipeKey} aria-hidden="true" className="page-wipe pointer-events-none fixed inset-0 z-[60]">
          {wipeDelays().map((delay, i) => (
            <span key={i} style={{ "--wipe-delay": delay }} />
          ))}
        </div>
      )}
    </>
  );
}

export default App;
