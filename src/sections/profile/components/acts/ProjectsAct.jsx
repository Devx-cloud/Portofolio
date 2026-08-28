import { projectTeasers } from "../../acts";
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

    <ul className="flex w-full flex-col gap-2 border-l-2 stage-border-soft pl-3">
      {projectTeasers.map((p) => (
        <li key={p.name} className="text-xs md:text-sm leading-snug text-muted-foreground">
          <span className="pixel-font-null uppercase tracking-[1px] text-foreground">{p.name}</span>{" "}
          &mdash; {p.desc}
        </li>
      ))}
    </ul>

    <ActLink to="/projects">BUKA STAGE PROJECTS</ActLink>
  </ActPanel>
);
