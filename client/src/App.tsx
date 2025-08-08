import "./App.css";
import { useSocketConnect } from "./hooks/useSocket";
import { useSocketStore } from "./state/Store";
import { socket } from "./socket/socket"; 

function App() {
  useSocketConnect();
  
  const { tick, time } = useSocketStore();
  const isConnected = socket.connected;
  const socketId = socket.id;

  return (
    <>
      <h1>Hello world!!</h1>
      {isConnected && <h2>Twoje ID: {socketId}</h2>}
      {tick && <h3>Tick: {tick}</h3>}
      {time && <h3>Time: {time}</h3>}
    </>
  );
}

export default App;