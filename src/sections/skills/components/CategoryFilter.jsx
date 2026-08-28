import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { categories, countFor } from "../data";

/* Filter kategori, gaya menu pixel. */
export const CategoryFilter = ({ active, onChange }) => (
  <motion.div
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
            "group pixel-font flex items-center gap-2 border-2 px-3 py-2 text-pix-xs uppercase transition-all duration-100 ease-pix",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            isActive
              ? "stage-border stage-bg-soft stage-text stage-shadow"
              : "pix-chip text-foreground/70 hover:stage-border hover:text-foreground"
          )}
        >
          <span
            className={cn(
              "transition-opacity",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            )}
          >
            &#9654;
          </span>
          {cat.label}
          <span className={cn("border-l pl-2", isActive ? "stage-border-soft" : "border-border")}>
            {countFor(cat.id)}
          </span>
        </button>
      );
    })}
  </motion.div>
);
