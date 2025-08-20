import { useEffectStore } from '../../state/Store';
import { SpellImpactEffect } from './SpellImpactEffect';

export const EffectsManager = () => {

  const { effects } = useEffectStore()

  return (
    <>
      {effects.map((effect) => (
        <SpellImpactEffect key={effect.id} id={effect.id} position={effect.position} />
      ))}
    </>
  );
};