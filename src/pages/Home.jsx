import { ThemeToggle } from "../components/ThemeToggle"
import { StarBackground } from "../components/StarBackground"
import { Navbar } from "../components/Navbar"
import { HomeSection } from "../components/HomeSection"
import { AboutSection } from "../components/AboutSection"

export const Home = () =>{
    return <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Theme togle */}
        <ThemeToggle/>    

        {/* Background Effects */}
        <StarBackground/>

        {/* navbar */}
        <Navbar/>
        {/* Main COntent */}
        <main>
            <HomeSection/>
            <AboutSection/>
        </main>
        {/* Footer */}
    </div>
}