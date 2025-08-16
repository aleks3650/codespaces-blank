import { useEffect } from 'react';
import { socket } from '../../socket/socket'; 
import { useEffectStore } from '../../state/Store';
import { SpellImpactEffect } from './SpellImpactEffect';

interface SpellImpactData {
  casterId: string;
  hitPlayerId?: string;
  hitPoint: { x: number; y: number; z: number };
}

export const EffectsManager = () => {
  const { effects, addEffect } = useEffectStore();

  useEffect(() => {
    const onSpellImpact = (data: SpellImpactData) => {
      addEffect(data.hitPoint);

      if (data.hitPlayerId) {
        // TODO: Możesz tu dodać dodatkową logikę, np. krótkie
        // mignięcie trafionego gracza na czerwono.
      }
    };

    socket.on('spell-impact', onSpellImpact);

    return () => {
      socket.off('spell-impact', onSpellImpact);
    };
  }, [addEffect]);

  return (
    <>
      {effects.map((effect) => (
        <SpellImpactEffect key={effect.id} id={effect.id} position={effect.position} />
      ))}
    </>
  );
};