import { AdditiveBlending, DoubleSide } from "three";
import { BEAM_H, BEAM_R, RIM_Y, SHADE_H, SHADE_R, SHADE_Y } from "./config";

/* Badan lampu: kap, dudukan kabel, bola, berkas ke bawah, dan halo. */
export const LampBody = ({ lampRef, handlers, texture, glow, beam }) => (
  <group ref={lampRef} {...handlers}>
    {/* Kap: kerucut terbuka, 10 sisi supaya faset-nya terbaca retro */}
    <mesh position={[0, SHADE_Y, 0]}>
      <coneGeometry args={[SHADE_R, SHADE_H, 10, 1, true]} />
      <meshLambertMaterial map={texture} side={DoubleSide} />
    </mesh>

    {/* Dudukan kabel */}
    <mesh position={[0, 0.02, 0]}>
      <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
      <meshLambertMaterial color="#202336" />
    </mesh>

    {/* Bola lampu - tidak terkena cahaya, ia SUMBER cahayanya */}
    <mesh position={[0, -0.5, 0]}>
      <sphereGeometry args={[0.13, 10, 8]} />
      <meshBasicMaterial color="#FFC9B0" />
    </mesh>
    <pointLight position={[0, -0.5, 0]} color="#F68578" intensity={4} distance={4} />

    {/* Berkas ke bawah. Frustum, BUKAN kerucut: mulutnya dibuka selebar SHADE_R
        supaya cahaya keluar dari bibir kap. Silinder three berpusat di tengah,
        jadi digeser setengah tingginya agar mulutnya duduk tepat di bibir. */}
    <mesh position={[0, RIM_Y - BEAM_H / 2, 0]} renderOrder={1}>
      <cylinderGeometry args={[SHADE_R, BEAM_R, BEAM_H, 28, 1, true]} />
      <meshBasicMaterial
        map={beam}
        color="#F68578"
        blending={AdditiveBlending}
        side={DoubleSide}
        transparent
        depthWrite={false}
        opacity={0.5}
      />
    </mesh>

    {/* Halo. Sprite selalu menghadap kamera, jadi tetap bulat berapa pun
        miringnya lampu. */}
    <sprite position={[0, -0.5, 0]} scale={[2.4, 2.4, 1]} renderOrder={2}>
      <spriteMaterial
        map={glow}
        color="#F68578"
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
        opacity={0.85}
      />
    </sprite>
  </group>
);
