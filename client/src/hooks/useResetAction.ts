import { useEffect } from 'react'
import { socket } from '../socket/socket';

export const useResetAction = () => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'KeyR' && !e.repeat) {
                console.log("Sending reset action to server...");

                socket.emit("player-action", {
                    actionType: "requestReset",
                    payload: {}
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [])
}