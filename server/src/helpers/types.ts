export interface PlayerInput {
    playerId?: string;    
    rotation: number[];
    inputs: {
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
        jump: boolean;
        sprint: boolean;
    };
}