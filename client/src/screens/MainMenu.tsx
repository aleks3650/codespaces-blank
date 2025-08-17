import { useState } from "react";
import App from "./App";
import "../index.css";

const options = ['Mage', "Warrior"]

const MainMenu = () => {
    const [gameOn, setGameOn] = useState(false);

    if (gameOn) {
        return <App />;
    }

    return (
        <div className="main-menu-container">
            <h1 className="game-title">Game name</h1>
            <select id="class" name="class" className="character-select">
                {options.map((item) => (
                    <option id={`Class-${item}`} key={item}>{item}</option>
                ))}
            </select>
            <button className="start-game-button" onClick={() => setGameOn(true)}>
                Start Game
            </button>
        </div>
    );
};

export default MainMenu;
