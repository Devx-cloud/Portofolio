import { useEffect, useState } from "react";

export const CloudBackground = () => {
    const [clouds, setClouds] = useState([]);

    useEffect(() => {
        generateClouds();
        const handleResize = () => {
            generateClouds();
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const generateClouds = () => {
        const numberOfClouds = Math.floor(Math.random() * (5 - 3 + 1)) + 3; // 3 to 5 clouds
        const newClouds = [];

        for (let i = 0; i < numberOfClouds; i++) {
            newClouds.push({
                id: i,
                size: Math.random() * (150 - 80) + 80, // Random size between 80px and 150px
                initialX: Math.random() * -50 - 20, // Start off-screen to the left (-20% to -70%)
                y: Math.random() * 80, // Random vertical position (0% to 80%)
                speed: Math.random() * (40 - 20) + 20, // Random speed (20s to 40s for animation duration)
                delay: Math.random() * 5, // Random animation delay
            });
        }
        setClouds(newClouds);
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="cloud"
                    style={{
                        width: cloud.size + "px",
                        height: cloud.size * 0.6 + "px",
                        top: cloud.y + "%",
                        animation: `cloud-move ${cloud.speed}s linear infinite`,
                        animationDelay: `-${cloud.delay}s`, // Start some clouds mid-animation
                    }}
                />
            ))}
        </div>
    );
};
