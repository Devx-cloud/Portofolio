import { useEffect, useState } from "react";

/* Media query sebagai state React. Dipakai untuk keputusan yang tidak bisa
   diselesaikan CSS - misalnya menolak mengunduh chunk 3D sama sekali. */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);

    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
};

/* Efek yang sama sebelumnya disalin di Profile, Projects, Title Screen, dan
   RoomLamp. Satu tempat saja supaya perilakunya tidak bisa lepas sinkron. */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
