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

    <ActLink to="/skills">BUKA STAGE SKILLS</ActLink>
  </ActPanel>
);
