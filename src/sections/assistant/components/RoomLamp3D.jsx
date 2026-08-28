import { Canvas, extend, useThree } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { FOV, cameraZ } from "./lamp/config";
import { useDraggableRope } from "./lamp/useDraggableRope";
import { useLampTextures } from "./lamp/useLampTextures";
import { LampBody } from "./lamp/LampBody";

extend({ MeshLineGeometry, MeshLineMaterial });

const Lamp = () => {
  const { size } = useThree();
  const { rope, ropeRef, lampRef, lampHandlers } = useDraggableRope();
  const { texture, glow, beam } = useLampTextures();

  return (
    <>
      <mesh>
        <meshLineGeometry ref={ropeRef} points={rope.pts} />
        <meshLineMaterial
          color="#3D435B"
          /* Unit dunia, bukan piksel. Pada 97.75 px/unit ini sekitar 5px. */
          lineWidth={0.112}
          resolution={[size.width, size.height]}
        />
      </mesh>

      <LampBody
        lampRef={lampRef}
        handlers={lampHandlers}
        texture={texture}
        glow={glow}
        beam={beam}
      />
    </>
  );
};

export default function RoomLamp3D({ height }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, cameraZ(height)], fov: FOV }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 3, 4]} intensity={0.6} />
      <Lamp />
    </Canvas>
  );
}
