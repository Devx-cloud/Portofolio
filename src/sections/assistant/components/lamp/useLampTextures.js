import { useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { NearestFilter, RepeatWrapping, SRGBColorSpace, TextureLoader } from "three";

export const useLampTextures = () => {
  const [texture, glow, beam] = useLoader(TextureLoader, [
    "/lamp-shade.png",
    "/glow.png",
    "/beam.png",
  ]);

  useEffect(() => {
    // Kap lampu: NearestFilter supaya pikselnya tetap keras saat diperbesar.
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.needsUpdate = true;

    /* Cahaya justru DIBIARKAN halus - filter linear bawaan, tanpa Nearest.
       Kontras yang disengaja: bendanya pixel, cahayanya tidak. */
    for (const t of [glow, beam]) {
      t.colorSpace = SRGBColorSpace;
      t.needsUpdate = true;
    }
  }, [texture, glow, beam]);

  return { texture, glow, beam };
};
