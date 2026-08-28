import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { FRICTION, GRAVITY, MAX_STEP, RELAX, SEGMENTS, SEG_LEN, clamp } from "./config";

/*
 * Tali lampu: rantai verlet, bukan animasi. Tiap titik menyimpan posisi sekarang
 * dan sebelumnya, kecepatan disimpulkan dari selisih keduanya, lalu jarak antar
 * titik dikoreksi berulang tiap frame. Demo aslinya memakai @react-three/rapier;
 * di sini ditulis tangan supaya portofolio tidak perlu menanggung engine fisika
 * WASM demi satu elemen dekoratif.
 */
export const useDraggableRope = () => {
  const { gl, viewport } = useThree();
  const anchor = useRef(new Vector3());
  const ndc = useRef({ x: 0, y: 0 });
  const ropeRef = useRef(null);
  const lampRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const rope = useMemo(() => {
    const pts = [];
    const prev = [];
    for (let i = 0; i < SEGMENTS; i++) {
      pts.push(new Vector3());
      prev.push(new Vector3());
    }
    return { pts, prev, target: new Vector3() };
  }, []);

  /* Jangkar di tepi atas pandangan kamera, dihitung dari viewport dan bukan
     ditulis tetap - kanvas yang diperlebar menggeser tepi itu. */
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

  const readPointer = useCallback(
    (e) => {
      const r = gl.domElement.getBoundingClientRect();
      ndc.current = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: -((e.clientY - r.top) / r.height) * 2 + 1,
      };
    },
    [gl]
  );

  /* Kursor dilacak di window, bukan lewat state.pointer milik R3F: yang terakhir
     berhenti diperbarui begitu kursor keluar kanvas, dan seretan sedikit saja
     langsung putus. */
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => readPointer(e);
    const stop = () => setDragging(false);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging, readPointer]);

  useFrame((state) => {
    const { pts, prev, target } = rope;
    const last = SEGMENTS - 1;

    if (dragging) {
      // Kursor diproyeksikan ke bidang z=0, lalu ujung tali ditarik ke sana.
      const v = new Vector3(ndc.current.x, ndc.current.y, 0.5).unproject(state.camera);
      const dir = v.sub(state.camera.position).normalize();
      target.copy(state.camera.position).addScaledVector(dir, -state.camera.position.z / dir.z);
    }

    for (let i = 1; i < SEGMENTS; i++) {
      const p = pts[i];
      const q = prev[i];
      // Kecepatan = selisih dua posisi terakhir, dibatasi supaya tab yang lama
      // tidak aktif tidak melontarkan tali saat frame melompat jauh.
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
      // Sumbu lampu disejajarkan dengan arah tali, bukan dibiarkan tegak.
      const dir = pts[last].clone().sub(pts[last - 1]);
      lampRef.current.rotation.z = Math.atan2(dir.x, -dir.y);
    }
  });

  const lampHandlers = {
    onPointerDown: (e) => {
      e.stopPropagation();
      readPointer(e);
      setDragging(true);
    },
    onPointerOver: () => setHovered(true),
    onPointerOut: () => setHovered(false),
  };

  return { rope, ropeRef, lampRef, lampHandlers };
};
