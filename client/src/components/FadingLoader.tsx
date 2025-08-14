import { useProgress, Html } from "@react-three/drei";
import { useState, useEffect } from "react";

export const FadingLoader = () => {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!active) {
      setFading(true);
      setTimeout(() => setVisible(false), 500);
    }
  }, [active]);

  return visible ? (
    <Html center>
      <div className={`loader-container ${fading ? 'fade-out' : ''}`}>
        <div className="spinner" />
        <p>{progress.toFixed(0)} %</p>
      </div>
    </Html>
  ) : null;
};