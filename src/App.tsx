import React, { useState } from "react";
import styled from "styled-components";

import GSlider from "./inputs/Slider";
import useWindowDimensions from "./useWidowDimensions";

import GCanvas from "./gravity/GCanvas";

const InputBox = styled.div`
    background-color: black;
    padding: 10px 20px;
    margin: 5px;
    border: 1px dashed cyan;
    color: white;
`;

const Wrapper = styled.div`
    background-color: black;
`;

const StyledCheckbox = styled.input`
    display: inline-block;
`;

const StyledCheckboxText = styled.p`
    display: inline-block;
    padding: 0 10px;
`;

const GTextBox = styled.div`
    
`;

type AppProps = Record<string, never>

const App: React.FC<AppProps> = () => {
    const [currentGravity, setCurrentGravity] = useState(25);
    const [energyLoss, setEnergyLoss] = useState(0.15);
    const [trailLength, setTrailLength] = useState(1);
    const [isPhysicsPaused, setisPhysicsPaused] = useState(false);
    const [isResetting, setIsReseting] = useState(false);
    const { width, height } = useWindowDimensions();

    const handleButtonPress = () => {
        setIsReseting(!isResetting);
    };

    return (
        <Wrapper>
            <GCanvas
                width={width}
                height={height}
                constants={{
                    GC: currentGravity,
                    E_LOSS_COLLISION: energyLoss,
                }}
                isPhysicsPaused={isPhysicsPaused}
                isPaused={false}
                isResetting={isResetting}
                trailLength={trailLength}
            />
            <InputBox>
                <div>
                    <StyledCheckboxText>Click to Pause</StyledCheckboxText>
                    <StyledCheckbox
                        type="checkbox"
                        defaultChecked={isPhysicsPaused}
                        onChange={() => setisPhysicsPaused(!isPhysicsPaused)}
                    />
                </div>
                <GSlider
                    min={0}
                    max={100}
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
                <GSlider
                    min={0}
                    max={2}
                    step={0.02}
                    defaultValue={1}
                    onChange={setTrailLength}
                />
                <button type="button" onClick={handleButtonPress}>Reset</button>
            </InputBox>
        </Wrapper>
    );
};

export default App;
