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
  const lineVariants = {
    hidden: { width: 0 },
    visible: { width: "100%", transition: { duration: 0.8, ease: "easeInOut" } }
  };

  const textRevealVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.5, ease: "easeOut" } }
  };

  const imagePopVariants = {
    hidden: { x: "50%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <motion.section
      id="about"
      className="py-24 px-4 relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center md:items-start pt-12 text-left">
          {/* Column 1: Image - Even smaller size */}
          <motion.div
            className="w-full md:w-[260px] flex-shrink-0"
            variants={imagePopVariants}
          >
            <div className="relative group">
              <img
                src="/dev_right.png"
                alt="Deva Surya"
                className="w-full h-auto object-cover rounded-tl-[60px] rounded-br-[60px] border-4 border-primary/20 shadow-lg transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-tl-[60px] rounded-br-[60px] bg-primary/5 group-hover:bg-transparent transition-colors duration-500"></div>
            </div>
          </motion.div>

          {/* Column 2: Content - More space, left-aligned */}
          <div className="flex-grow space-y-8 flex flex-col justify-start items-start">
            <div className="w-full text-left">
              <div className="relative inline-block overflow-hidden">
                <motion.h2 
                  className="text-3xl md:text-5xl font-bold mb-4 pixel-font whitespace-nowrap text-left"
                  variants={textRevealVariants}
                >
                  About Me
                </motion.h2>
              </div>
              <motion.div 
                className="h-[2px] bg-foreground/80 dark:bg-foreground/50 w-full"
                variants={lineVariants}
              />
            </div>

            <motion.div 
              className="space-y-6 text-base md:text-lg leading-relaxed text-muted-foreground max-w-4xl text-left"
              variants={textRevealVariants}
            >
              <p>
                Saya <span className="text-foreground font-semibold">Deva Surya</span>, seorang developer yang ahli dalam pengembangan Web menggunakan Laravel dan Aplikasi Mobile dengan Flutter. Saya memiliki pengalaman kuat dalam manajemen data, siap membangun aplikasi yang efisien dan terstruktur.
              </p>
              <p>
                Di luar pekerjaan, saya selalu bersemangat menyambut tantangan proyek baru. Komitmen saya adalah mengubah ide menjadi solusi digital yang inovatif dan andal, serta terus berkembang di dunia teknologi. Salah satu cara favorit saya untuk tetap kreatif adalah dengan mengeksplorasi teknologi baru dan berkontribusi pada proyek open-source.
              </p>
            </motion.div>

            <motion.div 
              variants={textRevealVariants}
              className="pt-4"
            >
              <a 
                href="/cv/cv-1.pdf" 
                download 
                className="text-primary hover:text-primary/80 transition-all font-medium border-b border-primary/40 hover:border-primary text-xl flex items-center gap-2 group w-fit"
              >
                see my resume
                <motion.span
                   initial={{ x: 0 }}
                   whileHover={{ x: 5 }}
                >
                  →
                </motion.span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
