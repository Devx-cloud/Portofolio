import { Link } from "react-router-dom";

export const NotFound = () => (
  <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative flex flex-col">
    <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-6 text-center">
      <h1 className="text-[96px] md:text-[128px] font-bold tracking-[4px] flex pixel-font-null leading-none">
        <span className="animate-float text-primary">4</span>
        <span className="animate-bounce">0</span>
        <span className="animate-float text-primary">4</span>
      </h1>

      <p className="mt-0 text-xl md:text-2xl text-muted-foreground animate-fade-in-delay-1">
        The page you are looking for was not found.
      </p>

      <div className="mt-10 animate-fade-in-delay-2">
        <Link to="/" className="cosmic-button">
          Back to home
        </Link>
      </div>
    </main>
  </div>
);
