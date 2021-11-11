import React from "react";
import styled from "styled-components";
import Slider, { SliderProps } from "rc-slider";
import "rc-slider/assets/index.css";

const SilderContainer = styled.div`
`;

const SliderLabel = styled.p`
    display: inline-block;
    font-family: "Raleway";
`;

interface GSliderProps {
    label: string
}

const GSlider: React.FC<SliderProps & GSliderProps> = ({ label, ...props }) => (
    <SilderContainer>
        <SliderLabel>{label}</SliderLabel>
        <Slider
            {...props}
            trackStyle={{
                // backgroundColor: "#4d00bf",
                backgroundColor: "#491f87",
            }}
            railStyle={{
                backgroundColor: "#160136",
            }}
            handleStyle={{
                borderColor: "#96005a",
                height: 10,
                width: 10,
                marginTop: -3,
                backgroundColor: "#96005a",
            }}

        />
    </SilderContainer>
);

export default GSlider;
