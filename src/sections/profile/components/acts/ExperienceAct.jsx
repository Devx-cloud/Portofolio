import { ActLink, ActPanel, ActText, ActTitle } from "../ActPanel";

export const ExperienceAct = ({ index }) => (
  <ActPanel
    index={index}
    label="Experience"
    action={<ActLink to="/experience">BUKA STAGE EXPERIENCE</ActLink>}
  >
    <ActTitle>
      My <span className="stage-text">Experience</span>
    </ActTitle>
    <ActText>
      Terbiasa bekerja di dua sisi: Laravel untuk web, Flutter untuk mobile, dan React saat
      antarmuka butuh sentuhan yang lebih modern &mdash; lalu diuji di project nyata, dari computer
      vision di browser sampai pipeline AI untuk foto, video, dan model 3D.
    </ActText>
  </ActPanel>
);
