import { ProfileSection } from "../components/ProfileSection";
import { SkillSection } from "../components/SkillSection";
import { ProjectSection } from "../components/ProjectSection";
import { AssistantSection } from "../components/AssistantSection";
import { ContactSection } from "../components/ContactSection";

export const stages = [
  { id: "profile", path: "/profile", label: "Profile", Section: ProfileSection },
  { id: "skills", path: "/skills", label: "Skills", Section: SkillSection },
  { id: "projects", path: "/projects", label: "Projects", Section: ProjectSection },
  { id: "assistant", path: "/assistant", label: "Ask AI", Section: AssistantSection },
  { id: "contact", path: "/contact", label: "Contact", Section: ContactSection },
];
