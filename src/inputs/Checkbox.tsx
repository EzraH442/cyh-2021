import React from "react";
import styled from "styled-components";

const StyledCheckbox = styled.input`
    display: inline-block;
`;

const StyledCheckboxText = styled.p`
    display: inline-block;
    padding: 0 10px;
    font-family: "Raleway"
`;

interface CheckboxInputProps {
    label: string,
}
const CheckboxInput:
    React.FC<
        CheckboxInputProps &
        React.InputHTMLAttributes<HTMLInputElement>
    > = ({ label, ...props }) => (
        <div>
            <StyledCheckboxText>{label}</StyledCheckboxText>
            <StyledCheckbox {...props} />
        </div>
    );

export default CheckboxInput;
