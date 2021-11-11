import React from "react";
import styled from "styled-components";
import Slider, {
    Handle, HandleProps, SliderProps, SliderTooltip,
} from "rc-slider";

import "rc-slider/assets/index.css";

const SilderContainer = styled.div`
    width: 40;
    height: 400;
    margin: 50;
`;

const GSlider: React.FC<SliderProps> = ({ ...props }) => (
    <SilderContainer>
        <p>Basic Slider</p>
        <Slider {...props} />
    </SilderContainer>
);

export default GSlider;
