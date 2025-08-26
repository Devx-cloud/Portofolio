import { Link } from "react-router-dom";
import { StarBackground } from "../components/StarBackground";

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative flex flex-col">
      {/* Background Effects */}
      <StarBackground />

      <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-6 text-center">
        {/* Judul 404 dengan animasi float + glow */}
        <h1 className="text-9xl font-bold text-glow tracking-widest flex gap-2">
          <span className="animate-float text-primary">4</span>
          <span className="animate-bounce">0</span>
          <span className="animate-float text-primary">4</span>  
        </h1>

        {/* Subjudul */}
        <p className="mt-6 text-xl md:text-2xl text-muted-foreground animate-fade-in-delay-1">
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
          src="/gunung2.png"
          alt="Gunung"
          className="w-full h-auto object-cover absolute bottom-0 left-0"
        />
      </div>
    </div>
  );
};
