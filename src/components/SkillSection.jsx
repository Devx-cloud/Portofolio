import { useState } from "react"
import { cn } from "@/lib/utils"
import { FaReact, FaHtml5, FaCss3Alt, FaJava, FaGitAlt, FaPython, FaLaravel } from "react-icons/fa";
import { SiJavascript, SiTailwindcss, SiMysql, SiCanva, SiTensorflow, SiAndroidstudio, SiPhp, SiFlutter } from "react-icons/si";

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
  const filteredSkill = skills.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory
  )

  return (
    <section id="skills" className="py-24 px-4 relative bg-secondary/30">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
          My <span className="text-primary">Skills</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {category.map((category, key) => (
            <button
              key={key}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-5 py-2 rounded-full transition-colors duration-300 capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/70 text-foreground hover:bg-secondary"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredSkill.map((skill, key) => (
            <div
              className="bg-card p-6 rounded-lg shadow-xs card-hover flex flex-col items-center justify-center text-center"
              key={key}
            >
              {skill.icon}
              <h3 className="font-semibold text-lg mt-4">{skill.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
