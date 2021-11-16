import styled from "styled-components";

const StyledButton = styled.button`
    font-family: "Arial";
    background-color: #c123de;
    border-radius: 12px;
    display: inline-block;
    cursor: pointer;
    color: #ffffff;
    font-size: 12px;
    padding: 5px 24px;
    text-decoration: none;
    border: none;
    transition-property: color, background-color;
    transition-duration: 0.5s;
    :hover {
        background-color: white;
        color: black;
    }
`;

export default StyledButton;
