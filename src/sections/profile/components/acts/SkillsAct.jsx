import { focusStack } from "../../acts";
import { ActLink, ActPanel, ActText, ActTitle } from "../ActPanel";

export const SkillsAct = ({ index }) => (
  <ActPanel index={index} label="Skills">
    <ActTitle>
      My <span className="stage-text">Skills</span>
    </ActTitle>
    <ActText>
      Terbiasa bekerja di dua sisi: Laravel untuk web, Flutter untuk mobile, dan React saat
      antarmuka butuh sentuhan yang lebih modern. Di belakang layar, MySQL dan Git jadi bagian
      dari alur kerja harian.
    </ActText>

    <div className="flex flex-wrap gap-2">
      {focusStack.map(({ name, Icon }) => (
        <span
          key={name}
          className="flex items-center gap-2 pix-chip stage-border-soft px-3 py-1 pixel-font text-pix-xs md:text-pix-sm text-foreground/90"
        >
          <Icon className="h-4 w-4" /> {name.toUpperCase()}
        </span>
      ))}
    </div>

    <ActLink to="/skills">BUKA STAGE SKILLS</ActLink>
  </ActPanel>
);
