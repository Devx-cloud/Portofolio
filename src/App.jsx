import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TitleScreen } from "./pages/title-screen/TitleScreen";
import { StagePage } from "./pages/StagePage";
import { NotFound } from "./pages/NotFound";
import { StarBackground } from "./components/backgrounds/StarBackground";
import { CursorTracker } from "./components/CursorTracker";
import { PageWipe } from "./components/PageWipe";
import { stages } from "./data/stages";

/* Halaman ini punya langitnya sendiri - jangan tumpuk background global. */
const SELF_LIT_ROUTES = ["/", "/profile"];

function App() {
  const location = useLocation();
  const hasOwnBackdrop = SELF_LIT_ROUTES.includes(location.pathname);

  const isFirstRender = useRef(true);
  const [wipeKey, setWipeKey] = useState(null);

  /* Wipe hanya dipicu saat pindah halaman, bukan saat load pertama. */
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
      {!hasOwnBackdrop && <StarBackground />}

      {/* Crossfade route: sengaja opacity saja. transform/filter di sini akan
          membuat containing block baru dan merusak position:fixed & sticky. */}
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
            {stages.map((stage) => (
              <Route key={stage.id} path={stage.path} element={<StagePage stageId={stage.id} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <CursorTracker />

      {wipeKey && <PageWipe key={wipeKey} />}
    </>
  );
}

export default App;
