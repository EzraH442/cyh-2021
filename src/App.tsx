import React, { useState } from "react";
import styled from "styled-components";

import GSlider from "./inputs/Slider";
import CheckboxInput from "./inputs/Checkbox";
import StyledButton from "./inputs/Button";
import useWindowDimensions from "./useWidowDimensions";

import GCanvas from "./gravity/GCanvas";
import AudioPlayer from "./music/AudioPlayer";

const InputBox = styled.div<{width: number, height: number}>`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    background-color: black;
    padding: 10px 20px;
    margin: 5px;
    border: 1px dashed cyan;
    color: white;
    max-width: ${(props) => `${props.width - 52}px`};
    height: ${(props) => `${props.height - 32}px`};
`;

const Wrapper = styled.div`
    background-color: black;
    display: flex;
`;


type AppProps = Record<string, never>

const App: React.FC<AppProps> = () => {
    const [currentGravity, setCurrentGravity] = useState(25);
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
                width={width * 0.8}
                height={height}
                constants={{
                    GC: currentGravity,
                }}
                isPhysicsPaused={isPhysicsPaused}
                isPaused={false}
                isResetting={isResetting}
                trailLength={trailLength}
            />
            <InputBox
                height={height}
                width={width * 0.2}
            >
                <StyledButton
                    type="button"
                    onClick={handleButtonPress}
                >
                    Reset

                </StyledButton>
                <CheckboxInput
                    label="Paused"
                    type="checkbox"
                    defaultChecked={isPhysicsPaused}
                    onChange={() => setisPhysicsPaused(!isPhysicsPaused)}
                />
                <GSlider
                    label="Gravity"
                    min={0}
                    max={30}
                    defaultValue={10}
                    onChange={setCurrentGravity}
                />
                <GSlider
                    label="Trail Length"
                    min={0}
                    max={2}
                    step={0.02}
                    defaultValue={1}
                    onChange={setTrailLength}
                />
                <AudioPlayer />
            </InputBox>
        </Wrapper>
    );
};
export default App;
