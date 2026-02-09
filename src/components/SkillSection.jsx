import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { FaReact, FaHtml5, FaCss3Alt, FaJava, FaGitAlt, FaPython, FaLaravel } from "react-icons/fa";
import { SiJavascript, SiTailwindcss, SiMysql, SiCanva, SiTensorflow, SiAndroidstudio, SiPhp, SiFlutter } from "react-icons/si";
import { motion, AnimatePresence } from "framer-motion";

const skills = [
  // Web
  { name: "ReactJs", icon: <FaReact className="h-16 w-16 text-sky-400" />, category: "web" },
  { name: "HTML", icon: <FaHtml5 className="h-16 w-16 text-orange-500" />, category: "web" },
  { name: "CSS", icon: <FaCss3Alt className="h-16 w-16 text-blue-500" />, category: "web" },
  { name: "JavaScript", icon: <SiJavascript className="h-16 w-16 text-yellow-400" />, category: "web" },
  { name: "Tailwind CSS", icon: <SiTailwindcss className="h-16 w-16 text-cyan-400" />, category: "web" },
  { name: "MySQL", icon: <SiMysql className="h-16 w-16 text-sky-600" />, category: "web" },
   { name: "Laravel", icon: <FaLaravel className="h-16 w-16 text-red-600" />, category: "web" },
  { name: "PHP", icon: <SiPhp className="h-16 w-16 text-indigo-500" />, category: "web" },
  
  // App
  { name: "Java", icon: <FaJava className="h-16 w-16 text-red-500" />, category: "app" },
  { name: "Flutter", icon: <SiFlutter className="h-16 w-16 text-blue-400" />, category: "app" },
  { name: "Android Studio", icon: <SiAndroidstudio className="h-16 w-16 text-green-600" />, category: "app" },
  { name: "Git", icon: <FaGitAlt className="h-16 w-16 text-orange-600" />, category: "app" },

  // AI
  { name: "Python", icon: <FaPython className="h-16 w-16 text-yellow-500" />, category: "ai" },
//   { name: "TensorFlow", icon: <SiTensorflow className="h-16 w-16 text-orange-400" />, category: "ai" },

  // Tools (tetap bisa dimasukkan juga kalau mau)
//   { name: "Canva", icon: <SiCanva className="h-16 w-16 text-teal-400" />, category: "web" },
]

const category = ["all", "web", "app", "ai"]

export const SkillSection = () => {
  const [activeCategory, setActiveCategory] = useState("all")
  const [hasAnimated, setHasAnimated] = useState(false); // New state for animation trigger
  const sectionRef = useRef(null); // Ref for the section

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect(); // Disconnect once animation is triggered
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, [hasAnimated]); // Dependency array: re-run if hasAnimated changes

  const filteredSkill = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  )

  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30" ref={sectionRef}>
      <div className="container mx-auto max-w-5xl">
        {hasAnimated && (
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl md:text-4xl font-bold mb-12 text-center pixel-font"
          >
            My <span className="text-primary">Skills</span>
          </motion.h2>
        )}

        {hasAnimated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
                    : "bg-secondary/70 text-foreground hover:bg-secondary hover:scale-105 hover:shadow-md"
                )}
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}

        {hasAnimated && (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory} // Key changes when category changes, forcing re-render of children
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {filteredSkill.map((skill, key) => (
                <motion.div
                  key={skill.name} // Use skill.name as key for consistent animation
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: key * 0.1, duration: 0.3 }} // Staggered entry
                  className="bg-card p-6 rounded-lg shadow-xs flex flex-col items-center justify-center text-center
                             hover:scale-105 hover:shadow-xl transition-all duration-300 cursor-pointer" // Hover effects
                >
                  {skill.icon}
                  <h3 className="font-semibold text-lg mt-4">{skill.name}</h3>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  )
}
