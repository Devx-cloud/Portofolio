import { ArrowRight, ExternalLink, Github } from "lucide-react"
import { motion } from "framer-motion"

const Projects = [
    {
        id:1,
        title: "Hand Gesture",
        desc:"deteksi tangan untuk masuk link url [index]",
        image: "/projects/hand.png" ,
        tags: ["html", "css", "js"],
        demoUrl: "#",
        githubUrl: "https://github.com/Devx-cloud/gesture-hand"
    },
    {
        id:2,
        title: "Loka Pura",
        desc:"website generate video dan 3D model",
        image: "/projects/lokapura.png" ,
        tags: ["laravel", "alpine", "three", "tailwind"],
        demoUrl: "#",
        githubUrl: "https://github.com/Devx-cloud/PuraLoka"
    },
    // {
    //     id:3,
    //     title: "pro3",
    //     desc:"Lorem ipsum dolor sit amet.wdawad",
    //     image: "/projects/arlechino.jpeg" ,
    //     tags: ["image", "gila"],
    //     demoUrl: "#",
    //     githubUrl: "#"
    // },
]

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 10 }, // Fade in from slightly below
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export const ProjectSection = () => {
    return (
        <motion.section
            id="projects"
            className="py-24 px-4 relative"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <div className="container mx-auto max-w-5xl">
                <motion.h2
                    className="text-2xl md:text-4xl font-bold mb-4 text-center pixel-font"
                    variants={fadeInUpVariants}
                >
                    Featured <span className="text-primary">Projects</span>
                </motion.h2>
                <motion.p
                    className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"
                    variants={fadeInUpVariants}
                >
                    Lihat beberapa proyek pilihan saya yang menunjukkan keahlian dalam bidang web dan mobile. Proyek-proyek ini mencerminkan komitmen saya pada struktur kode yang rapi, efisiensi, dan fungsionalitas yang optimal
                </motion.p>
        
                <div className="flex flex-wrap justify-center gap-7">
                    {Projects.map((Project, key)=>(
                        <motion.div
                            key={key}
                            className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover w-full sm:w-[300px]"
                            variants={cardVariants}
                            custom={key} // Pass key as custom prop for staggered delay
                            whileHover={{ y: -6, scale: 1.03, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }} // Re-introduce subtle scale and boxShadow
                            transition={{ duration: 0.3 }}
                        >
                            <div className="h-48 overflow-hidden p-2">
                                <img src={Project.image} alt={Project.title} className="w-full h-full object-cover transition-transform duration-500"/>
                            </div>
                            <div className="p-6 ">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {Project.tags.map((tag)=> (
                                        <span key={tag} className="px-2 py-1 text-xs font-medium border rounded-full bg-primary/20 text-secondary-foreground">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            
                                <h3 className="text-lg font-semibold mb-1">
                                    {Project.title}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4">{Project.desc}</p>
                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-3 ">
                                        <a href={Project.demoUrl} target="_blank" className="text-foreground/80 hover:text-primary transition-colors duration-300">
                                            <ExternalLink size={20}/>
                                        </a>
                                        <a href={Project.githubUrl} target="_blank" className="text-foreground/80 hover:text-primary transition-colors duration-300">
                                            <Github size={20}/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="text-center mt-5">
                    <motion.a
                        href="https://github.com/Devx-cloud"
                        className="text-sm cosmic-button w-fit flex items-center mx-auto gap-2"
                        target="_blank"
                        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
                        transition={{ duration: 0.2 }}
                    >
                        Check My Github <ArrowRight size={16}/>
                    </motion.a>
                </div>
            </div>
        </motion.section>
    )
}