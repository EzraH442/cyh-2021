import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faPauseCircle } from "@fortawesome/free-solid-svg-icons";

import songs from "./songs";
import useAudio from "./useAudio";

import StyledButton from "../inputs/Button";

const Wrapper = styled.div`

`;

type AudioProps = Record<string, never>

const AudioPlayer: React.FC<AudioProps> = () => {
    const [playing, togglePlaying, playNext] = useAudio(songs);

    return (
        <Wrapper>
            <FontAwesomeIcon
                icon={(playing) ? faPlayCircle : faPauseCircle}
                onClick={togglePlaying}
                color="#FF00FF"
            />
            <StyledButton
                type="button"
                onClick={playNext}
            >
                Next Song
            </StyledButton>
            <p>
                {(playing) ? "Playing" : "Paused"}
            </p>
        </Wrapper>
    );
};

export default AudioPlayer;
