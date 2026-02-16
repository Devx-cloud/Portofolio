import { Moon, Sun } from "lucide-react";
import { useState } from "react"
import { cn } from "@/lib/utils";

export const ThemeToggle = () =>{
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains("dark"));

    const toggleTheme = () =>{
        if(isDarkMode){
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme","light")
            setIsDarkMode(false)
        }else{
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme","dark")
            setIsDarkMode(true)

        }
    }

    return <button onClick={toggleTheme} className={cn(
        // "fixed max-sm:hidden top-5 right-5 z-50 p-2 rounded-full transition-colors duration-300",
        "p-2 rounded-full transition-colors duration-300",
        "focus:outline-hidden"
    )}>
    {isDarkMode ?(
         <Moon className="h-6 w-6 text-red-500"/>):(
         <Sun className="h-6 w-6 text-yellow-300"/>)
         }</button>;
}