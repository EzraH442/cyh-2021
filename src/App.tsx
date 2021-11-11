import React, { useState } from "react";
import styled from "styled-components";

import GSlider from "./inputs/Slider";
import CheckboxInput from "./inputs/Checkbox";
import StyledButton from "./inputs/Button";
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
                <CheckboxInput
                    label="Click To Pause"
                    type="checkbox"
                    defaultChecked={isPhysicsPaused}
                    onChange={() => setisPhysicsPaused(!isPhysicsPaused)}
                />
                <GSlider
                    label="Gravity"
                    min={0}
                    max={100}
                    defaultValue={10}
                    onChange={setCurrentGravity}
                />
                <GSlider
                    label="Collision Energy Loss"
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={0.15}
                    onChange={setEnergyLoss}
                />
                <GSlider
                    label="Trail Length"
                    min={0}
                    max={2}
                    step={0.02}
                    defaultValue={1}
                    onChange={setTrailLength}
                />
                <StyledButton type="button" onClick={handleButtonPress}>Reset</StyledButton>
            </InputBox>
        </Wrapper>
    );
};

export default App;
