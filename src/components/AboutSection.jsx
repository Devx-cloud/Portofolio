import { BrainCircuit, Briefcase, Code, Gamepad2Icon, User } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-4xl font-bold mb-12 text-center pixel-font">
          About <span className="text-primary">Me</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 ">
            <h3 className="text-xl font-semibold pixel-font">Junior Developer</h3>
            <p className="text-muted-foreground text-base">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Similique totam rem odit maiores accusamus molestiae, facere amet
              non culpa pariatur?
            </p>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
              Similique totam rem odit maiores accusamus molestiae, facere amet
              non culpa pariatur?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center text-sm md:text-base">
                <a href="#contact" className="cosmic-button">Get In Touch</a>
                <a href="#" className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-all duration-300">Download CV</a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="gradien-border p-4 card-hover">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Code className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-lg">Web Development</h4>
                        <p className="text-muted-foreground">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis, distinctio.</p>
                    </div>
                </div>
            </div>
            <div className="gradien-border p-4 card-hover">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-lg">App Development</h4>
                        <p className="text-muted-foreground">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis, distinctio.</p>
                    </div>
                </div>
            </div>
            <div className="gradien-border p-4 card-hover">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <BrainCircuit className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-lg">Ai Development</h4>
                        <p className="text-muted-foreground">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis, distinctio.</p>
                    </div>
                </div>
            </div>
            {/* <div className="gradien-border p-4 card-hover">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Gamepad2Icon className="h-6 w-6 text-primary"/>
                    </div>
                    <div className="text-left">
                        <h4 className="font-semibold text-lg">Game Development</h4>
                        <p className="text-muted-foreground">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Corporis, distinctio.</p>
                    </div>
                </div>
            </div> */}
          </div>


        </div>
      </div>
    </section>
  );
};
