import { useFloatingTextStore } from '../../state/FloatingTextStore';
import { FloatingText } from './FloatingText';

export const FloatingTextManager = () => {
  const texts = useFloatingTextStore((state) => state.texts);

  return (
    <>
      {texts.map((textData) => (
        <FloatingText
          key={textData.id}
          id={textData.id}
          text={textData.text}
          position={textData.position}
          color={textData.color}
          fontSize={textData.fontSize}
        />
      ))}
    </>
  );
};