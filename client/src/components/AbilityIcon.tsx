import { useState, useEffect } from 'react';
import { useAbilityStore } from '../state/Store';
import { abilityData } from '../constants/classes';

interface AbilityIconProps {
    abilityId: string;
    hotkey: number;
    isSelected: boolean;
}

export const AbilityIcon = ({ abilityId, hotkey, isSelected }: AbilityIconProps) => {
    const { isAbilityOnCooldown, cooldowns } = useAbilityStore();
    const [remainingTime, setRemainingTime] = useState(0);

    const ability = abilityData.get(abilityId);
    const isOnCooldown = isAbilityOnCooldown(abilityId);

    useEffect(() => {
        if (!isOnCooldown) {
            setRemainingTime(0);
            return;
        }

        const interval = setInterval(() => {
            const endTime = cooldowns.get(abilityId);
            if (endTime) {
                const remaining = (endTime - Date.now()) / 1000;
                setRemainingTime(Math.max(0, remaining));

                if (remaining <= 0) {
                    clearInterval(interval);
                }
            }
        }, 100);

        return () => clearInterval(interval);
    }, [abilityId, isOnCooldown, cooldowns]);

    if (!ability) {
        return <div className="ability-icon missing">?</div>;
    }

    const className = `ability-icon ${isSelected ? 'selected' : ''} ${isOnCooldown ? 'cooldown' : ''}`;
    
    const iconPath = `/icons/${abilityId}.png`;

    return (
        <div className={className}>
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