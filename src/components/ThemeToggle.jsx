import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils";

export const ThemeToggle = () =>{
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(()=>{
        const storageTheme = localStorage.getItem("theme")
        if(storageTheme === "light"){
            setIsDarkMode(false)
            document.documentElement.classList.remove("dark");
        } else { // Default to dark if no theme is set or if it's 'dark'
            setIsDarkMode(true)
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme","dark")
        }
    },[])



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
        "fixed max-sm:hidden top-5 right-5 z-50 p-2 rounded-full transition-colors duration-300", 
        "focus:outline-hidden"
    )}> 
    {isDarkMode ?(
         <Sun className="h-6 w-6 text-yellow-300"/>):(
         <Moon className="h-6 w-6 text-blue-900"/>)
         }</button>;
}