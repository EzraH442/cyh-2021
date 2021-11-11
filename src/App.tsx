import React, { useState } from "react";

import GSlider from "./inputs/Slider";
import useWindowDimensions from "./useWidowDimensions";

import { Colors } from "./graphics/Color";
import GCanvas from "./gravity/GCanvas";


type AppProps = Record<string, never>

const App: React.FC<AppProps> = () => {
    const [currentGravity, setCurrentGravity] = useState(25);
    const [energyLoss, setEnergyLoss] = useState(0.15);
    const [isPaused, setisPaused] = useState(false);
    const [isResetting, setIsReseting] = useState(false);
    const { width, height } = useWindowDimensions();

    const handleButtonPress = () => {
        setIsReseting(!isResetting);
    };

    return (
        <div>
            <GCanvas
                width={width}
                height={height}
                FPS={100}
                fillColor={Colors.Black}
                constants={{
                    GC: currentGravity,
                    E_LOSS_COLLISION: energyLoss,
                    MAX_RADIUS: 50,
                }}
                isPaused={isPaused}
                isResetting={isResetting}
            />
            <div>
                <input
                    type="checkbox"
                    defaultChecked={isPaused}
                    onChange={() => setisPaused(!isPaused)}
                />
                <GSlider
                    min={0}
                    max={25}
                    defaultValue={10}
                    onChange={setCurrentGravity}
                />
                <GSlider
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={0.15}
                    onChange={setEnergyLoss}
                />
                <button type="button" onClick={handleButtonPress}>Reset</button>
            </div>
        </div>
    );
};

export default App;
