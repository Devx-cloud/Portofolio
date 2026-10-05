import { cn } from "@/lib/utils";
import { pad2, skillGroups } from "../data";
import { SkillSlot } from "./SkillSlot";

/*
 * Papan skill: SEMUA kategori dalam satu papan, dibuka satu ikon demi satu ikon.
 *
 * Tiap kategori punya barisnya sendiri dengan label di atasnya. Label itu
 * redup sampai ikon pertama kelompoknya terbuka, lalu menyala - jadi yang
 * terbaca saat menggulir adalah "Web terbuka, ikon-ikonnya menyusul", bukan
 * lima belas petak yang muncul tanpa urutan.
 *
 * `revealed` = berapa ikon yang sudah terbuka, dihitung dari depan `skills`.
 * Satu angka, bukan daftar: di panggung scroll angka ini diturunkan langsung
 * dari posisi gulir, dan di daftar mengalir dari penghitung waktu. Papan tidak
 * perlu tahu yang mana.
 */
export const SkillBoard = ({ revealed, activeId, onHover, className }) => (
  <div className={cn("flex flex-col gap-5", className)}>
    {skillGroups.map((group) => {
      const shown = Math.min(Math.max(revealed - group.start, 0), group.skills.length);
      const isOpen = shown > 0;

      return (
        <div key={group.id}>
          <div
            className={cn(
              "pixel-font mb-2 flex items-center gap-2 text-pix-sm uppercase transition-colors duration-100 ease-pix",
              isOpen ? "text-foreground/80" : "text-faint"
            )}
          >
            <span aria-hidden="true" className={cn("h-2 w-2", isOpen ? "stage-bg" : "bg-border")} />
            <span className={cn(isOpen && "stage-text-bright")}>{group.label}</span>
            <span aria-hidden="true" className="h-0.5 flex-1 bg-border" />
            <span className="tabular-nums">
              {pad2(shown)} / {pad2(group.skills.length)}
            </span>
          </div>

          <ul className="grid grid-cols-5 gap-3">
            {group.skills.map((skill, i) => (
              <SkillSlot
                key={skill.id}
                skill={skill}
                revealed={group.start + i < revealed}
                isActive={skill.id === activeId}
                onSelect={() => onHover(skill.id)}
              />
            ))}
          </ul>
        </div>
      );
    })}
  </div>
);
