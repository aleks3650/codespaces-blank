// src/components/effects/EffectsManager.tsx

import { useEffectStore } from '../../state/Store';
import { SpellImpactEffect } from './SpellImpactEffect';
import { ShockwaveEffect } from './ShockwaveEffect'; 

export const EffectsManager = () => {
  const { effects } = useEffectStore();

  return (
    <>
      {effects.map((effect) => {
        switch (effect.type) {
          case 'shockwave':
            return <ShockwaveEffect key={effect.id} id={effect.id} position={effect.position} />;
          case 'impact':
          default:
            return <SpellImpactEffect key={effect.id} id={effect.id} position={effect.position} />;
        }
      })}
    </>
  );
};