import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { categories, countFor } from "../data";

/*
 * Pemilih kategori: baris mendatar di atas grid.
 *
 * Penanda ▶ di butir aktif sengaja dipertahankan - itu bahasa yang sama dengan
 * menu Title Screen dan pemilih stage di bar atas, satu cara untuk menyatakan
 * "ini yang sedang dituju" di seluruh situs.
 */
export const CategoryMenu = ({ active, onChange }) => (
  <motion.nav
    aria-label="Saring kategori skill"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
    className="mb-7 flex flex-wrap justify-center gap-2 md:mb-9"
  >
    {categories.map((cat) => {
      const isActive = active === cat.id;
      return (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange(cat.id)}
          aria-pressed={isActive}
          className={cn(
            "group pixel-font flex items-center gap-2 border-2 px-3 py-2 text-pix-xs uppercase",
            "transition-all duration-100 ease-pix",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            isActive
              ? "stage-border stage-bg-soft stage-text stage-shadow"
              : "pix-chip text-foreground/70 hover:stage-border hover:text-foreground"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            )}
          >
            ▶
          </span>
          {cat.label}
          <span
            className={cn(
              "border-l pl-2 tabular-nums",
              isActive ? "stage-border-soft" : "border-border"
            )}
          >
            {countFor(cat.id)}
          </span>
        </button>
      );
    })}
  </motion.nav>
);
