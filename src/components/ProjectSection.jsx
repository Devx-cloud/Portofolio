import { ArrowRight, ExternalLink, Github } from "lucide-react"

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

export const ProjectSection = () => {
    return <section id="projects" className="py-24 px-4 relative">
        <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-center pixel-font"> Featured <span className="text-primary">Projects</span></h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto"> Lihat beberapa proyek pilihan saya yang menunjukkan keahlian dalam bidang web dan mobile. Proyek-proyek ini mencerminkan komitmen saya pada struktur kode yang rapi, efisiensi, dan fungsionalitas yang optimal</p>
        
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center"> */}
            <div className="flex flex-wrap justify-center gap-7">
                {Projects.map((Project, key)=>(
                    <div key={key} className="group bg-card rounded-lg overflow-hidden shadow-xs card-hover w-full sm:w-[300px]">
                        <div className="h-48 overflow-hidden p-2">
                            <img src={Project.image} alt={Project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        </div>
                        <div className="p-6 ">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Project.tags.map((tag)=> (
                                    <span className="px-2 py-1 text-xs font-medium border rounded-full bg-primary/20 text-secondary-foreground">
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

                    </div>
                ))}
            </div>
            <div className="text-center mt-5">
                <a href="https://github.com/Devx-cloud" className="text-sm cosmic-button w-fit flex items-center mx-auto gap-2" target="_blank">
                    Chack My Github <ArrowRight size={16}/>
                </a>
            </div>
        </div>
    </section>
}