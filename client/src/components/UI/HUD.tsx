import { useSocketStore } from '../../state/Store';
import { socket } from '../../socket/socket';

const MAX_HEALTH = 100;
const MAX_MANA = 100;

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
  return state.players[socket.id!];
};

export const HUD = () => {
  const localPlayer = useSocketStore(selectLocalPlayer);

  if (!localPlayer) {
    return null;
  }
  const currentHealth = +(localPlayer.health ?? MAX_HEALTH).toFixed(1); 
  const currentMana = +(localPlayer.mana ?? MAX_MANA).toFixed(1);

  const healthPercentage = (currentHealth / MAX_HEALTH) * 100;
  const manaPercentage = (currentMana / MAX_MANA) * 100;

  return (
    <div className="hud-container">
      <div className="stat-bar">
        <div className="stat-bar-label">HP</div>
        <div className="stat-bar-background">
          <div
            className="stat-bar-fill health"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <div className="stat-bar-value">
          {currentHealth} / {MAX_HEALTH}
        </div>
      </div>
      
      <div className="stat-bar">
        <div className="stat-bar-label">MP</div>
        <div className="stat-bar-background">
          <div
            className="stat-bar-fill mana"
            style={{ width: `${manaPercentage}%` }}
          />
        </div>
        <div className="stat-bar-value">
          {currentMana} / {MAX_MANA}
        </div>
      </div>
    </div>
  );
};