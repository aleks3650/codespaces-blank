import {
  EffectComposer,
  Bloom,
  HueSaturation,
  BrightnessContrast,
  Vignette,
  Noise,
  SMAA,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={0.02}
        luminanceThreshold={1.05}
        luminanceSmoothing={0.03}
      />
      <HueSaturation saturation={0.1} />
      <BrightnessContrast brightness={-0.1} contrast={0.15} />
      <Vignette eskil={false} offset={0.12} darkness={0.1} />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.015} />
      <SMAA />
    </EffectComposer>
  );
}