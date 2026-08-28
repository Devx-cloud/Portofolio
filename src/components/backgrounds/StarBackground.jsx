import { useEffect, useState } from "react"

export const StarBackground = () =>{
    const[stars, setStars] = useState([])
    const[meteors, setMeteors] = useState([])

    useEffect(()=>{
        generateStars();
        generateMeteors();

        const handleResize = () =>{
            generateStars();
        };
        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    },[]);

    const generateStars =()=>{
        const numberOfStars = Math.floor(
            window.innerWidth * innerHeight/10000   
        );

        const newStars =[]

        for (let i = 0; i<numberOfStars; i++){
            newStars.push({
                id:i,
                size: Math.random() < 0.75 ? 2 : 4, // kotak 2px atau 4px - tidak ada di antaranya
                x: Math.random() * 100,
                y: Math.random() * 100,
                // opacity dikuantisasi ke 3 langkah, bukan nilai bebas
                opacity: [0.4, 0.7, 1][Math.floor(Math.random() * 3)],
                animationDuration: Math.round(Math.random() * 4 + 2),

            });
        }
        setStars(newStars)
    };
    
    
    const generateMeteors =()=>{

        const numberOfMeteors = 5
        const newMeteors =[]

        for (let i = 0; i<numberOfMeteors; i++){
            newMeteors.push({
                id:i,
                size: Math.random() < 0.5 ? 1 : 2,
                x: Math.random() * 100,
                y: Math.random() * 20,
                // Negatif: animasi dimulai di tengah siklus, bukan menunggu dulu
                delay: -Math.round(Math.random() * 15),
                animationDuration: Math.round(Math.random() * 3 + 3),

            });
        }
        setMeteors(newMeteors)
    };

    return <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {stars.map((star)=>(
            <div key={star.id} className="star animate-pulse-subtle" style={{
                width: star.size + "px",
                height: star.size + "px",
                left: star.x + "%",
                top: star.y + "%", 
                opacity: star.opacity,
                animationDuration: star.animationDuration + "s", 
            }}/>
        ))}
        
        {meteors.map((meteor)=>(
            <div key={meteor.id} className="meteor animate-meteor" style={{
                width: meteor.size * 48 + "px",
                height: meteor.size * 4 + "px",
                left: meteor.x + "%",
                top: meteor.y + "%", 
                animationDelay: meteor.delay + "s",
                animationDuration: meteor.animationDuration + "s", 
            }}/>
        ))}
    </div>;
}