import { DesktopScrollShowcase } from "./components/DesktopScrollShowcase";
import { MobileProjectList } from "./components/MobileProjectList";

/* Dua penyajian yang benar-benar berbeda, bukan satu layout yang di-responsif:
   lihat catatan di masing-masing komponen soal kenapa scroll-jack dilepas di HP. */
export const ProjectSection = () => (
  <section id="projects" className="relative">
    <MobileProjectList />
    <DesktopScrollShowcase />
  </section>
);
