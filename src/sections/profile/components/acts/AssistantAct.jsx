import { Bot } from "lucide-react";
import { ActLink, ActPanel, ActText } from "../ActPanel";

export const AssistantAct = ({ index }) => (
  <ActPanel index={index} label="Ask AI">
    <h2 className="pixel-font flex items-center gap-2 text-pix-lg md:text-pix-xl font-bold leading-none text-foreground">
      <Bot className="h-6 w-6 shrink-0 stage-text" />
      Ask <span className="stage-text">AI</span>
    </h2>
    <ActText>
      Ingin tahu lebih dalam soal pengalaman, stack, atau cara saya mengerjakan sebuah proyek?
      Tanyakan langsung ke asisten AI &mdash; ditenagai Gemini dan menjawab seketika berdasarkan
      profil ini.
    </ActText>

    <ActLink to="/assistant">MULAI PERCAKAPAN</ActLink>
  </ActPanel>
);
