import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      title={isDarkMode ? "Tema terang" : "Tema gelap"}
      className={cn(
        "pix-chip flex h-9 w-9 shrink-0 items-center justify-center transition-all duration-100 ease-pix",
        "hover:stage-border active:translate-y-1",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--stage-accent,var(--primary)))]"
      )}
    >
      {isDarkMode ? (
        <Moon className="h-4 w-4 text-primary" />
      ) : (
        <Sun className="h-4 w-4 text-primary" />
      )}
    </button>
  );
};
