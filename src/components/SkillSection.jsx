import { useState, useEffect, useRef } from "react"; // Re-introduced useEffect
import { cn } from "@/lib/utils";
import { FaReact, FaHtml5, FaCss3Alt, FaJava, FaGitAlt, FaPython, FaLaravel } from "react-icons/fa";
import { SiJavascript, SiTailwindcss, SiMysql, SiCanva, SiTensorflow, SiAndroidstudio, SiPhp, SiFlutter } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";
import Tilt from "react-parallax-tilt";

const skills = [
  // Web
  {name: "ReactJs", icon: <FaReact className="h-16 w-16 text-sky-400" />, category: "web"},
  {name: "HTML", icon: <FaHtml5 className="h-16 w-16 text-orange-500" />, category: "web"},
  {name: "CSS", icon: <FaCss3Alt className="h-16 w-16 text-blue-500" />, category: "web"},
  {name: "JavaScript", icon: <SiJavascript className="h-16 w-16 text-yellow-400" />, category: "web"},
  {name: "Tailwind CSS", icon: <SiTailwindcss className="h-16 w-16 text-cyan-400" />, category: "web"},
  {name: "MySQL", icon: <SiMysql className="h-16 w-16 text-sky-600" />, category: "web"},
  {name: "Laravel", icon: <FaLaravel className="h-16 w-16 text-red-600" />, category: "web"},
  {name: "PHP", icon: <SiPhp className="h-16 w-16 text-indigo-500" />, category: "web"},

  // App
  {name: "Java", icon: <FaJava className="h-16 w-16 text-red-500" />, category: "app"},
  {name: "Flutter", icon: <SiFlutter className="h-16 w-16 text-blue-400" />, category: "app"},
  {name: "Android Studio", icon: <SiAndroidstudio className="h-16 w-16 text-green-600" />, category: "app"},
  {name: "Git", icon: <FaGitAlt className="h-16 w-16 text-orange-600" />, category: "app"},

  // AI
  {name: "Python", icon: <FaPython className="h-16 w-16 text-yellow-500" />, category: "ai"},
  //   { name: "TensorFlow", icon: <SiTensorflow className="h-16 w-16 text-orange-400" />, category: "ai" },

  // Tools (tetap bisa dimasukkan juga kalau mau)
  //   { name: "Canva", icon: <SiCanva className="h-16 w-16 text-teal-400" />, category: "web" },
];

const category = ["all", "web", "app", "ai"];

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export const SkillSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hasAnimated, setHasAnimated] = useState(false); // Re-introduced state
  const sectionRef = useRef(null); // Re-introduced ref

  useEffect(() => {
    // Re-introduced useEffect
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, [hasAnimated]);

  const filteredSkill = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory,
  );

  return (
    <motion.section
      id="skills"
      className="py-24 px-4 relative bg-secondary/30"
      ref={sectionRef} // Ref added back
      // Removed initial, whileInView, viewport from here as children will control
    >
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          initial="hidden" // Set initial state
          animate={hasAnimated ? "visible" : "hidden"} // Animate based on state
          variants={fadeInUpVariants}
          className="text-2xl md:text-4xl font-bold mb-12 text-center pixel-font"
        >
          My <span className="text-primary">Skills</span>
        </motion.h2>

        <motion.div
          initial="hidden" // Set initial state
          animate={hasAnimated ? "visible" : "hidden"} // Animate based on state
          variants={fadeInUpVariants}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {category.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-3 py-2 rounded-full capitalize transition-all duration-300",
                activeCategory === category
                  ? "bg-primary text-primary-foreground hover:scale-105 hover:shadow-md"
                  : "bg-secondary/70 text-foreground hover:bg-secondary hover:scale-105 hover:shadow-md",
              )}
            >
              {category}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial="hidden" // Set initial state
            animate={hasAnimated ? "visible" : "hidden"} // Animate based on state
            variants={cardVariants}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredSkill.map((skill, key) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: key * 0.1, duration: 0.3 }}
              >
                <Tilt
                  perspective={500}
                  glareEnable={true}
                  glareMaxOpacity={0.45}
                  scale={1.05}
                  gyroscope={true}
                  className="h-full"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="bg-card p-6 rounded-lg shadow-xs flex flex-col items-center justify-center text-center hover:shadow-2xl transition-all duration-300 cursor-pointer border border-border/50 h-full" style={{ transformStyle: "preserve-3d" }}>
                  <div style={{ transform: "translateZ(50px)" }} className="drop-shadow-xl">
                    {skill.icon}
                  </div>

                  <h3 className="font-semibold text-lg mt-4" style={{ transform: "translateZ(30px)" }}>
                    {skill.name}
                  </h3>
                </div>
                </Tilt>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};
