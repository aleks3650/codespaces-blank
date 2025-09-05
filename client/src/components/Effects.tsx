import { useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  HueSaturation,
  BrightnessContrast,
  Vignette,
  Noise,
  SMAA,
  DepthOfField,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useState } from "react";

export function Effects() {
  const { camera } = useThree();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (camera) setReady(true);
  }, [camera]);

  if (!ready) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={0.35}
        luminanceThreshold={0.19}
        luminanceSmoothing={0.2}
      />
      <HueSaturation hue={0.02} saturation={0.05} />
      <BrightnessContrast brightness={-0.1} contrast={0.15} />
      <Vignette eskil={false} offset={0.15} darkness={0.5} />
      <Noise
        premultiply
        blendFunction={BlendFunction.DARKEN}
        opacity={0.03}
      />
      <DepthOfField
        focusDistance={.1}
        focalLength={.7}
        bokehScale={2.5}
      />
      <SMAA />
    </EffectComposer>
  );
}
