import { ActLink, ActPanel, ActText, ActTitle } from "../ActPanel";

export const ProjectsAct = ({ index }) => (
  <ActPanel index={index} label="Projects">
    <ActTitle>
      Featured <span className="stage-text">Projects</span>
    </ActTitle>
    <ActText>
      Eksperimen yang berakhir jadi produk nyata &mdash; dari computer vision di browser sampai
      pipeline AI untuk foto, video, dan model 3D.
    </ActText>

    <ActLink to="/projects">BUKA STAGE PROJECTS</ActLink>
  </ActPanel>
);
