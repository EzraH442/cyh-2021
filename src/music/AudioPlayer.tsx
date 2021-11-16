import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle, faPauseCircle, faStepForward, faStepBackward, faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";

import songs from "./songs";
import { Song } from "./Song";
import useAudio, { getNextIndexInLoop, getPreviousIndexInLoop } from "./useAudio";

const Wrapper = styled.div`
    border: 1px solid white;
    padding: 10px 0;
    text-align: center;
`;

const IconBar = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`;

const InfoWrapper = styled.div`
`;

const MusicInfoText = styled.p`
    display: none;
    font-family: 'Raleway';
    font-size: 14px;
    
    ${InfoWrapper}:hover & {
        display: block;
        position: absolute;
        background-color: black;
        padding: 6px 2px;
        border: 1px solid white;
    }
`;

type StyledMusicInfoTextProps = {
    song: Song,
}

const StyledMusicInfoText = ({ song }: StyledMusicInfoTextProps) => (
    <InfoWrapper>
        <FontAwesomeIcon
            icon={faInfoCircle}
        />
        <MusicInfoText>
            {`"${song.name}" by ${song.artistName}`}
        </MusicInfoText>
    </InfoWrapper>
);

type AudioProps = Record<string, never>

const AudioPlayer: React.FC<AudioProps> = () => {
    const [playing, togglePlaying, songIndex, setSongIndex, song] = useAudio(songs);

    return (
        <Wrapper>
            <IconBar>
                <FontAwesomeIcon
                    icon={faStepBackward}
                    onClick={() => setSongIndex(getPreviousIndexInLoop(songIndex, songs.length))}
                    size="2x"
                />
                <FontAwesomeIcon
                    icon={(playing) ? faPauseCircle : faPlayCircle}
                    onClick={togglePlaying}
                    size="2x"
                />
                <FontAwesomeIcon
                    icon={faStepForward}
                    onClick={() => setSongIndex(getNextIndexInLoop(songIndex, songs.length))}
                    size="2x"
                />
            </IconBar>
            <StyledMusicInfoText
                song={song}
            />
        </Wrapper>
    );
};

export default AudioPlayer;
