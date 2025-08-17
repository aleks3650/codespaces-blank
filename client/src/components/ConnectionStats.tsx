import { socket } from "../socket/socket";
import { useSocketStore } from "../state/Store";

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
    return state.players[socket.id!];
};

const ConnectionStats = () => {
    const isConnected = socket.connected;
    const socketId = socket.id;

    const data = useSocketStore(selectLocalPlayer);
    return (
        <div
            style={{
                position: "fixed",
                right: 0,
                top: 0,
                background: "rgba(255, 255, 255, 0.25)",
                borderRadius: "16px",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(4.1px)",
                WebkitBackdropFilter: "blur(4.1px)",
                border: "1px solid rgba(255, 255, 255, 0.21)",
                zIndex: 1000,
                padding: "10px",
                textAlign: "right",
                color: "black",
                margin: "10px"
            }}
        >
            {isConnected && <h1 style={{ fontSize: "14px" }}>ID: {socketId}
            </h1>}
            {data?.class && (
                <h2 style={{ fontSize: "10px" }}>Class: {data.class}</h2>
            )}
        </div>
    );
};

export default ConnectionStats;
