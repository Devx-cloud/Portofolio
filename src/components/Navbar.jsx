import { href } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle"
import { animateView } from "framer-motion";

const navItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  // { name: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "fixed w-full z-30 transition-all duration-300", // Lower z-index for nav
          isScrolled ? "py-3 bg-background/20 backdrop-blur-sm shadow-xs" : "py-5 bg-background/50 backdrop-blur-sm"
        )}
      >
        <div className="container flex items-center  justify-between pixel-font">
          <a
            className="text-xl  font-bold text-primary flex items-center"
            href="#home"
          >
            <img 
                src="/dev_right.png"
                alt="Deva Surya" 
                className="w-8 h-7 md:w-10 md:h-9 object-cover shadow-lg" 
              />
            <span className="relatif z-10">
              <span className="text-glow text-foreground px-3">Dev</span>
              _X
            </span>
          </a>

          {/* desktop nav */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-foreground/80 hover:text-primary transition-colors duration-300 "
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button and Theme Toggle are moved out to have their own stacking context */}
      <button
        onClick={() => setIsMenuOpen((prev) => !prev)}
        className={cn(
          "md:hidden p-2 text-foreground z-50 fixed", // Higher z-index and fixed position
          isScrolled ? "top-2" : "top-4", // top values for burger (remain unchanged)
          "right-20" // fixed horizontal position
        )}
        aria-label={isMenuOpen? "Close Menu" : "Open Menu"}
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={cn(
          "fixed z-50 inline-block", // Wrapper for ThemeToggle, added inline-block
          isScrolled ? "top-2" : "top-4", // Custom, smaller top values for ThemeToggle
          "right-5" // fixed horizontal position
        )}>
        <ThemeToggle/>
      </div>

      <div
        className={cn(
          "fixed inset-0 bg-background/60 backdrop-blur-[4px] z-40 flex flex-col items-center justify-center", // z-index for overlay
          "transition-all duration-300 md:hidden",
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col space-y-8 text-xl">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-foreground/80 hover:text-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </>
  );
};
