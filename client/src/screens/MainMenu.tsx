import { useState } from "react";
import App from "./App";
import "../index.css";

const options = ['Mage', "Warrior"]

const MainMenu = () => {
    const [gameOn, setGameOn] = useState(false);
    const [selectedClass, setSelectedClass] = useState(options[0]);

    if (gameOn) {
        return <App selectedClass={selectedClass} />;
    }

    return (
        <div className="main-menu-container">
            <h1 className="game-title">Game name</h1>
            <select 
                id="class" 
                name="class" 
                className="character-select"
                onChange={(e) => setSelectedClass(e.target.value)}
                value={selectedClass}
            >
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