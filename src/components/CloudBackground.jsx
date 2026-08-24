import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const CloudBackground = ({ isHomePage }) => {
    const [movingClouds, setMovingClouds] = useState([]);
    const [staticClouds, setStaticClouds] = useState([]);

    useEffect(() => {
        generateMovingClouds();
        generateStaticClouds();

        const handleResize = () => {
            generateMovingClouds();
            // Static clouds positions don't need to change on resize as they are percentage based
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const generateMovingClouds = () => {
        const numberOfClouds = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // 3 to 5 clouds
        const newClouds = [];

        for (let i = 0; i < numberOfClouds; i++) {
            newClouds.push({
                id: `moving-${i}`,
                size: Math.round((Math.random() * (144 - 80) + 80) / 8) * 8,
                initialX: Math.random() * -50 - 20, // Start off-screen to the left (-20% to -70%)
                y: Math.random() * 80, // Random vertical position (0% to 80%)
                speed: Math.random() * (40 - 20) + 20, // Random speed (20s to 40s for animation duration)
                delay: Math.random() * 5, // Random animation delay
            });
        }
        setMovingClouds(newClouds);
    };

    const generateStaticClouds = () => {
        const numberOfStaticClouds = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // 5 to 10 static clouds
        const newStaticClouds = [];

        for (let i = 0; i < numberOfStaticClouds; i++) {
            newStaticClouds.push({
                id: `static-${i}`,
                size: Math.round((Math.random() * (200 - 96) + 96) / 8) * 8,
                x: Math.random() * 100, // Random horizontal position (0% to 100%)
                y: Math.random() * 80, // Random vertical position (0% to 80%)
            });
        }
        setStaticClouds(newStaticClouds);
    };

    return (
        <div className={cn(
            "fixed inset-0 overflow-hidden pointer-events-none",
            isHomePage ? "z-0" : "z-[9]"
        )}>
            {movingClouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="cloud"
                    style={{
                        width: cloud.size + "px",
                        height: Math.round(cloud.size * 0.6 / 8) * 8 + "px",
                        top: cloud.y + "%",
                        animation: `cloud-move ${cloud.speed}s linear infinite`,
                        animationDelay: `-${cloud.delay}s`,
                    }}
                />
            ))}
            {staticClouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="cloud"
                    style={{
                        width: cloud.size + "px",
                        height: Math.round(cloud.size * 0.6 / 8) * 8 + "px",
                        left: cloud.x + "%",
                        top: cloud.y + "%",
                    }}
                />
            ))}
        </div>
    );
};