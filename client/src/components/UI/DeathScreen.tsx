import { useEffect, useState } from 'react';
import { useSocketStore } from '../../state/Store';
import { socket } from '../../socket/socket';

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
  return state.players[socket.id!];
};

export const DeathScreen = () => {
  const localPlayer = useSocketStore(selectLocalPlayer);
  const [timeLeft, setTimeLeft] = useState(0);

  const respawnTimestamp = localPlayer?.respawnAt;

  useEffect(() => {
    if (!respawnTimestamp) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, (respawnTimestamp - Date.now()) / 1000);
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);

  }, [respawnTimestamp]);

  if (!localPlayer) {
    return null;
  }

  return (
    <div className="death-screen-container">
      <h1>YOU ARE DEAD</h1>
      <h2>Respawning in {timeLeft.toFixed(1)}s</h2>
    </div>
  );
};