import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "../context/ThemeContext";

export const ThemeToggle = () =>{
    const { isDarkMode, toggleTheme } = useTheme();

    return <button onClick={toggleTheme} className={cn(
        "p-2 rounded-full transition-colors duration-300",
        "focus:outline-hidden"
    )}>
    {isDarkMode ?(
         <Moon className="h-6 w-6 text-red-500"/>):(
         <Sun className="h-6 w-6 text-yellow-300"/>)
         }</button>;
}