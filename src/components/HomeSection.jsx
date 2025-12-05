import { ArrowDown } from "lucide-react";

export const HomeSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center px-4"
    >
      <div className="container max-w-4xl mx-auto text-center z-10">
        <div className="space-y-6">
          <div className="flex justify-center"></div>

          <h1 className="text-2xl md:text-5xl font-bold tracking-tight pixel-font">
            <span className="opacity-0 animate-fade-in"> Hi I'm</span>
            <span className="text-primary opacity-0 animate-fade-in-delay-1">
              {" "}
              Deva
            </span>
            <span className="text-gradient ml-2 opacity-0 animate-fade-in-delay-2">
              {" "}
              Surya
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3">
            Halo! Saya Deva Surya, seorang developer yang fokus pada penciptaan
            solusi digital. Spesialisasi saya ada di pengembangan Web
            menggunakan Laravel dan Aplikasi Mobile dengan Flutter. Saya siap
            mengubah ide Anda menjadi aplikasi yang efisien, terstruktur, dan
            siap digunakan.
          </p>
          <div className="text-[11px] pt-4 opacity-0 animate-fade-in-delay-4">
            <a href="#projects" className="cosmic-button">
              View My Work
            </a>
          </div>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <span className="text-xs text-foreground mb-2 pixel-font">Scroll</span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};
