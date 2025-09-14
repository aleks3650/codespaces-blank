import { useState, useEffect } from 'react';
import { useActionStore } from '../state/Store';
import { abilityData } from '../constants/classes';

interface AbilityIconProps {
    abilityId: string;
    hotkey: number;
}

export const AbilityIcon = ({ abilityId, hotkey }: AbilityIconProps) => {
    // Pobieramy dane i funkcje z nowego, zunifikowanego store'a
    const { 
        isAbilityOnCooldown, 
        abilityCooldowns, 
        selectedAction, 
        selectAction 
    } = useActionStore();

    const [remainingTime, setRemainingTime] = useState(0);

    const ability = abilityData.get(abilityId);
    const isOnCooldown = isAbilityOnCooldown(abilityId);

    // Sprawdzamy, czy TA konkretna umiejętność jest zaznaczona
    const isSelected = selectedAction?.type === 'ability' && selectedAction.id === abilityId;

    // Logika odliczania cooldownu pozostaje bez zmian, ale korzysta z nowych danych
    useEffect(() => {
        if (!isOnCooldown) {
            setRemainingTime(0);
            return;
        }

        const intervalId = setInterval(() => {
            const endTime = abilityCooldowns.get(abilityId);
            if (endTime) {
                const remaining = (endTime - Date.now()) / 1000;
                setRemainingTime(Math.max(0, remaining));

                if (remaining <= 0) {
                    clearInterval(intervalId);
                }
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, [abilityId, isOnCooldown, abilityCooldowns]);
    
    // Funkcja do wybierania tej umiejętności po kliknięciu
    const handleSelect = () => {
        selectAction({ type: 'ability', id: abilityId });
    };

    if (!ability) {
        return <div className="ability-icon missing">?</div>;
    }

    // Klasy CSS są dynamicznie dodawane na podstawie stanu
    const className = `ability-icon ${isSelected ? 'selected' : ''} ${isOnCooldown ? 'cooldown' : ''}`;
    const iconPath = `/icons/${abilityId}.png`;

    return (
        <div className={className} onClick={handleSelect}>
            <img src={iconPath} alt={ability.name} className="ability-icon-image" />
            <div className="ability-hotkey">{hotkey}</div>
            
            {isOnCooldown && (
                <>
                    <div className="cooldown-overlay" />
                    <div className="cooldown-text">{remainingTime.toFixed(1)}</div>
                </>
            )}
        </div>
    );
};