import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, extend, useFrame, useLoader, useThree } from "@react-three/fiber";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import {
  AdditiveBlending,
  DoubleSide,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";

extend({ MeshLineGeometry, MeshLineMaterial });

/*
 * Lampu gantung 3D yang bisa ditarik, di stage Ask AI.
 *
 * Bentuknya 3D sungguhan, tapi PERMUKAANNYA pixel art: teksturnya digambar
 * per piksel oleh scripts/lamp-texture.py dan dipasang dengan NearestFilter,
 * jadi three.js tidak memperhalusnya saat diperbesar.
 *
 * Talinya bukan animasi - ia rantai verlet: tiap titik menyimpan posisi
 * sekarang dan sebelumnya, kecepatan disimpulkan dari selisih keduanya, lalu
 * jarak antar titik dikoreksi berulang tiap frame. Demo badge aslinya memakai
 * @react-three/rapier untuk ini; di sini ditulis tangan supaya portofolio
 * tidak perlu menanggung engine fisika WASM demi satu elemen dekoratif.
 */

/* Panjang tali = (SEGMENTS - 1) x SEG_LEN. Perkecil SEG_LEN untuk menggantung
   lebih tinggi - jangan kurangi SEGMENTS, itu bikin lengkung talinya patah. */
const SEGMENTS = 7;
const SEG_LEN = 0.18;
const GRAVITY = 0.0022;
const FRICTION = 0.97; // sisa kecepatan tiap frame
const RELAX = 14; // putaran koreksi jarak; makin banyak makin kaku talinya
const MAX_STEP = 0.35; // batas gerak satu frame, penahan ledakan setelah tab diam

/* Geometri kap & berkas. Keduanya memakai SHADE_R yang sama: mulut berkas
   harus persis selebar bibir kap, kalau tidak cahayanya terlihat muncul dari
   satu titik di dalam lampu, bukan dari mulutnya. */
const SHADE_R = 0.52; // jari-jari bibir bawah kap
const SHADE_H = 0.5;
const SHADE_Y = -0.26; // pusat kap di ruang lokal grup
const RIM_Y = SHADE_Y - SHADE_H / 2; // bibir bawah - tempat cahaya keluar
const BEAM_H = 2.6;
const BEAM_R = 1.4; // jari-jari berkas di ujung bawah

const FOV = 25;

/* Piksel layar per unit dunia. DIKUNCI: kanvas boleh diperlebar sebanyak apa
   pun untuk memberi ruang seret, tapi jarak kamera ikut digeser agar angka
   ini tetap - kalau tidak, memperlebar kanvas ikut memperbesar lampunya. */
const PX_PER_UNIT = 97.75;

const cameraZ = (heightPx) =>
  heightPx / PX_PER_UNIT / (2 * Math.tan((FOV * Math.PI) / 360));

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

function Lamp() {
  const { size, gl, viewport } = useThree();
  const anchor = useRef(new Vector3());
  const ndc = useRef({ x: 0, y: 0 });
  const ropeRef = useRef(null);
  const lampRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [texture, glow, beam] = useLoader(TextureLoader, [
    "/lamp-shade.png",
    "/glow.png",
    "/beam.png",
  ]);

  useEffect(() => {
    // Kap lampu: NearestFilter supaya pikselnya tetap keras saat diperbesar
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.needsUpdate = true;

    /* Cahaya justru DIBIARKAN halus - filter linear bawaan, tanpa Nearest.
       Ini kontras yang disengaja: bendanya pixel, cahayanya tidak. */
    for (const t of [glow, beam]) {
      t.colorSpace = SRGBColorSpace;
      t.needsUpdate = true;
    }
  }, [texture, glow, beam]);

  /* Titik tali beserta posisi frame sebelumnya - inti integrasi verlet */
  const rope = useMemo(() => {
    const pts = [];
    const prev = [];
    for (let i = 0; i < SEGMENTS; i++) {
      pts.push(new Vector3());
      prev.push(new Vector3());
    }
    return { pts, prev, target: new Vector3() };
  }, []);

  /* Jangkar diletakkan di tepi atas pandangan kamera, dihitung dari viewport
     dan bukan ditulis tetap - kanvas yang diperlebar menggeser tepi itu. */
  useEffect(() => {
    const y = viewport.height / 2;
    anchor.current.set(0, y, 0);
    rope.pts.forEach((p, i) => {
      p.set(0, y - i * SEG_LEN, 0);
      rope.prev[i].copy(p);
    });
  }, [viewport.height, rope]);

  useEffect(() => {
    document.body.style.cursor = dragging ? "grabbing" : hovered ? "grab" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [dragging, hovered]);

  /* Posisi kursor dilacak di window, bukan lewat state.pointer milik R3F:
     yang terakhir berhenti diperbarui begitu kursor keluar kanvas, dan
     kanvasnya hanya selebar 360px - seretan sedikit saja langsung putus. */
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const r = gl.domElement.getBoundingClientRect();
      ndc.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -((e.clientY - r.top) / r.height) * 2 + 1,
      };
    };
    const stop = () => setDragging(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, gl]);

  useFrame((state) => {
    const { pts, prev, target } = rope;
    const last = SEGMENTS - 1;

    if (dragging) {
      // Kursor diproyeksikan ke bidang z=0, lalu ujung tali ditarik ke sana
      const v = new Vector3(ndc.current.x, ndc.current.y, 0.5).unproject(
        state.camera
      );
      const dir = v.sub(state.camera.position).normalize();
      target
        .copy(state.camera.position)
        .addScaledVector(dir, -state.camera.position.z / dir.z);
    }

    for (let i = 1; i < SEGMENTS; i++) {
      const p = pts[i];
      const q = prev[i];
      // Kecepatan = selisih dua posisi terakhir. Dibatasi supaya tab yang
      // lama tidak aktif tidak melontarkan tali saat frame melompat jauh.
      const vx = clamp((p.x - q.x) * FRICTION, -MAX_STEP, MAX_STEP);
      const vy = clamp((p.y - q.y) * FRICTION, -MAX_STEP, MAX_STEP);
      const vz = clamp((p.z - q.z) * FRICTION, -MAX_STEP, MAX_STEP);
      q.copy(p);
      p.set(p.x + vx, p.y + vy - GRAVITY, p.z + vz);
    }

    for (let k = 0; k < RELAX; k++) {
      pts[0].copy(anchor.current); // ujung atas dipaku ke langit-langit
      if (dragging) pts[last].copy(target);

      for (let i = 0; i < last; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        const d = a.distanceTo(b) || 1e-6;
        const push = ((d - SEG_LEN) / d) * 0.5;
        const dx = (b.x - a.x) * push;
        const dy = (b.y - a.y) * push;
        const dz = (b.z - a.z) * push;
        a.set(a.x + dx, a.y + dy, a.z + dz);
        b.set(b.x - dx, b.y - dy, b.z - dz);
      }
    }
    pts[0].copy(anchor.current);
    if (dragging) pts[last].copy(target);

    ropeRef.current?.setPoints(pts);

    if (lampRef.current) {
      lampRef.current.position.copy(pts[last]);
      // Sumbu lampu disejajarkan dengan arah tali, bukan dibiarkan tegak
      const dir = pts[last].clone().sub(pts[last - 1]);
      lampRef.current.rotation.z = Math.atan2(dir.x, -dir.y);
    }
  });

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

      <group
        ref={lampRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          const r = gl.domElement.getBoundingClientRect();
          ndc.current = {
            x: ((e.clientX - r.left) / r.width) * 2 - 1,
            y: -((e.clientY - r.top) / r.height) * 2 + 1,
          };
          setDragging(true);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
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

        {/* Berkas ke bawah. Frustum, BUKAN kerucut: mulutnya dibuka selebar
            SHADE_R supaya cahaya keluar dari bibir kap, bukan menyempit jadi
            satu titik. Silinder three berpusat di tengah, jadi digeser
            setengah tingginya agar mulutnya duduk tepat di bibir. */}
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
    </>
  );
}

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
