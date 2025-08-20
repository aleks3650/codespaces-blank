import { GameEvent, GameEventPayloads, GameEventType } from "./helpers/gameEvents.ts";
import { io } from "./helpers/IO_Server.ts";

export class GameEventManager {
    private eventQueue: GameEvent[] = []

    public queueEvent<T extends GameEventType>(
        type: T,
        payload: GameEventPayloads[T],
        targetClientId?: string
    ): void {
        this.eventQueue.push({ type, payload, targetClientId });
    }

    public dispatchEvents(): void {
        if (this.eventQueue.length === 0) return;

        const broadcastEvents = this.eventQueue.filter(e => !e.targetClientId);
        if (broadcastEvents.length > 0) {
            io.emit('game-events', broadcastEvents);
        }

        const targetedEvents = this.eventQueue.filter(e => e.targetClientId);
        for (const event of targetedEvents) {
            if (event.targetClientId) {
                io.to(event.targetClientId).emit('game-events', [event]);
            }
        }

        this.eventQueue = [];
    }
}
