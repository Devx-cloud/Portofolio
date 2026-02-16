import { Link } from "react-router-dom";
import { StarBackground } from "../components/StarBackground";
import { CloudBackground } from "../components/CloudBackground"
import { useEffect, useState } from "react";

export const NotFound = () => {
  const [gunungSrc, setGunungSrc] = useState("");

  useEffect(() => {
    const updateGunungSrc = () => {
      if (document.documentElement.classList.contains("dark")) {
        setGunungSrc("/gunung-dark.png");
      } else {
        setGunungSrc("/gunung-light.png");
      }
    };

    updateGunungSrc(); // Set initial image

    // Observe changes to the 'dark' class on the html element
    const observer = new MutationObserver(updateGunungSrc);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect(); // Clean up observer
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative flex flex-col">
      {/* Background Effects */}
      <StarBackground />

      <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-6 text-center">
        {/* Judul 404 dengan animasi float + glow */}
        <h1 className="text-9xl font-bold tracking-widest flex pixel-font-null">
          <span className="animate-float text-primary">4</span>
          <span className="animate-bounce">0</span>
          <span className="animate-float text-primary">4</span>  
        </h1>

        {/* Subjudul */}
        <p className="mt-0 text-xl md:text-2xl text-muted-foreground animate-fade-in-delay-1">
         The page you are looking for was not found.
        </p>

        {/* Tombol kembali */}
        <div className="mt-10 animate-fade-in-delay-2">
          <Link to="/" className="cosmic-button">
            Back to home
          </Link>
        </div>
      </main>

      {/* Gunung di bawah halaman */}
      <div className="relative w-full">
        <img
          src={gunungSrc}
          alt="Gunung"
          className="w-full h-auto object-cover absolute bottom-0 left-0 z-[9]" // Added z-[9]
        />
      </div>
    </div>
  );
};
