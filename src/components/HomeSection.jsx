import { ArrowDown } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, useTexture } from "@react-three/drei";
import { Suspense } from "react";
import { useTheme } from "../context/ThemeContext"; // Import useTheme

// Komponen Bola 3D terpisah
const PlanetSphere = () => {
  const { isDarkMode } = useTheme(); // Use the theme context
  const darkTexture = useTexture("/moonTexture.png");
  const lightTexture = useTexture("/sunTexture.png");
  
  return (
    <mesh position={[ 1, 0, 0 ]} rotation={[0, 0, 0]}>
      <sphereGeometry args={[2.2, 64, 64]} />
      <meshStandardMaterial map={isDarkMode ? darkTexture : lightTexture} roughness={0.5} />
    </mesh>
  );
};

export const HomeSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* 3D Planet Background */}
      <div className="absolute top-0 right-0 h-full w-full overflow-hidden z-10 pl-[175px]">
        <Suspense fallback={<div className="text-white">Loading 3D...</div>}>
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
            <ambientLight intensity={1.5} />
            <directionalLight position={[2, 5, 2]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <PlanetSphere />
            
            <OrbitControls 
              enableZoom={false} 
              autoRotate 
              autoRotateSpeed={2}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Text Content */}
      <div className="container max-w-4xl mx-auto text-center z-20">
        <div className="space-y-6">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight pixel-font">
            <span className="opacity-0 animate-fade-in"> Hi I'm</span>
            <span className="text-primary opacity-0 animate-fade-in-delay-1">
              {" "}
              Deva
            </span>
            <span className="text-gradient ml-2 opacity-0 animate-fade-in-delay-2">
              {" "}
              Surya
            </span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-delay-3">
            Halo! Saya Deva Surya, seorang developer yang fokus pada penciptaan
            solusi digital. Spesialisasi saya ada di pengembangan Web
            menggunakan Laravel dan Aplikasi Mobile dengan Flutter. Saya siap
            mengubah ide Anda menjadi aplikasi yang efisien, terstruktur, dan

            siap digunakan.
          </p>
          <div className="text-[11px] pt-4 opacity-0 animate-fade-in-delay-4">
            <a href="#projects" className="cosmic-button">
              View My Work
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce z-20">
        <span className="text-xs text-foreground mb-2 pixel-font">Scroll</span>
        <ArrowDown className="h-5 w-5 text-primary" />
      </div>
    </section>
  );
};