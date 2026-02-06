import { useEffect, useState } from "react";

export const StaticCloudBackground = () => {
    const [staticClouds, setStaticClouds] = useState([]);

    useEffect(() => {
        generateStaticClouds();
        // No resize listener needed as these are static positions
    }, []);

    const generateStaticClouds = () => {
        const numberOfStaticClouds = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // 5 to 10 static clouds
        const newStaticClouds = [];

        for (let i = 0; i < numberOfStaticClouds; i++) {
            newStaticClouds.push({
                id: i,
                size: Math.random() * (200 - 100) + 100, // Random size between 100px and 200px
                x: Math.random() * 100, // Random horizontal position (0% to 100%)
                y: Math.random() * 80, // Random vertical position (0% to 80%)
            });
        }
        setStaticClouds(newStaticClouds);
    };

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {staticClouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="cloud" // Reusing the .cloud class for styling
                    style={{
                        width: cloud.size + "px",
                        height: cloud.size * 0.6 + "px",
                        left: cloud.x + "%",
                        top: cloud.y + "%",
                        // No animation property for static clouds
                    }}
                />
            ))}
        </div>
    );
};
