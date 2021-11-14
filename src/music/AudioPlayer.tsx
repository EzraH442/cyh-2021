import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle, faPauseCircle, faStepForward, faStepBackward, faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

import songs from "./songs";
import useAudio, { getNextIndexInLoop, getPreviousIndexInLoop } from "./useAudio";

const Wrapper = styled.div`
    border: 1px solid white;
    padding: 10px;
    text-align: center;
`;

const IconBar = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const StyledIcon = styled(FontAwesomeIcon)`
    color="#FF00FF"
`;

type AudioProps = Record<string, never>

const AudioPlayer: React.FC<AudioProps> = () => {
    const [playing, togglePlaying, songIndex, setSongIndex, song] = useAudio(songs);

    return (
        <Wrapper>
            <IconBar>
                <StyledIcon
                    icon={faStepBackward}
                    onClick={() => setSongIndex(getPreviousIndexInLoop(songIndex, songs.length))}
                    size="2x"
                />
                <StyledIcon
                    icon={(playing) ? faPlayCircle : faPauseCircle}
                    onClick={togglePlaying}
                    size="2x"
                />
                <StyledIcon
                    icon={faStepForward}
                    onClick={() => {
                        setSongIndex(getNextIndexInLoop(songIndex, songs.length));
                    }}
                    size="2x"
                />
            </IconBar>
            <StyledIcon
                icon={faCaretDown}
                size="2x"
            />
        </Wrapper>
    );
};

export default AudioPlayer;
