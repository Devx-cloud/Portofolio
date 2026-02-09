import { BrainCircuit, Briefcase, Code, Gamepad2Icon, User } from "lucide-react";
import { motion } from "framer-motion";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const leftColumnVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const rightColumnVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } }
};

const cardHoverVariants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      duration: 0.2
    }
  },
  rest: {
    scale: 1,
    boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
  }
};

export const AboutSection = () => {
  return (
    <motion.section
      id="about"
      className="py-24 px-4 relative"
      variants={sectionVariants} // Apply overall section animation here
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-2xl md:text-4xl font-bold mb-12 text-center pixel-font">
          About <span className="text-primary">Me</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            variants={leftColumnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <h3 className="text-xl font-semibold pixel-font">Junior Developer</h3>
            <p className="text-muted-foreground text-base">
              Saya Deva Surya, seorang developer yang ahli dalam pengembangan Web menggunakan Laravel dan Aplikasi Mobile dengan Flutter. Saya memiliki pengalaman kuat dalam manajemen data, siap membangun aplikasi yang efisien dan terstruktur.
            </p>
            <p className="text-muted-foreground">
              Saya selalu bersemangat menyambut tantangan proyek baru. Komitmen saya adalah mengubah ide menjadi solusi digital yang inovatif danandal, serta terus berkembang di dunia teknologi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center text-sm md:text-base">
                <a href="cv/cv-1.pdf" download="CV-Kadek-Deva-Surya.pdf" className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-all duration-300">Download CV</a>
            </div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-6"
            variants={rightColumnVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              { icon: Code, title: "Web Development", description: "Mulai mendalami bidang ini secara serius sejak SMK Kelas 3." },
              { icon: User, title: "App Development", description: "Memiliki pengalaman PKL di bidang ini. Tertarik sejak SMK Kelas 2." },
              { icon: BrainCircuit, title: "Ai Development", description: "Mulai berinteraksi dengan bidang ini sejak Kuliah Semester 1." },
            ].map((card, index) => (
              <motion.div
                key={index}
                className="gradien-border p-4 card-hover cursor-pointer"
                whileHover="hover"
                initial="rest"
                animate="rest"
                variants={cardHoverVariants}
              >
                  <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                          <card.icon className="h-6 w-6 text-primary"/>
                      </div>
                      <div className="text-left">
                          <h4 className="font-semibold text-lg">{card.title}</h4>
                          <p className="text-muted-foreground">{card.description}</p>
                      </div>
                  </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
