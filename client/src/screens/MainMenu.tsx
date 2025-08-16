import { useState } from "react";
import App from "../App";
import "../App.css";

const MainMenu = () => {
    const [gameOn, setGameOn] = useState(false);

    if (gameOn) {
        return <App />;
    }

    return (
        <div className="main-menu-container">
            <h1 className="game-title">NAZWA GRY</h1>
            <button className="start-game-button" onClick={() => setGameOn(true)}>
                Start Game
            </button>
        </div>
    );
};

export default MainMenu;
