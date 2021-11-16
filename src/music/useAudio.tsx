import { useState, useEffect } from "react";
import { Song } from "./Song";

function getNextIndexInLoop(current: number, length: number): number {
    return (current + 1) % length;
}

function getPreviousIndexInLoop(current: number, length: number): number {
    let nextIndex = current - 1;
    if (nextIndex < 0) nextIndex += length;
    return nextIndex;
}

const useAudio = (songs : Song[]): [
    boolean, () => void,
    number, (index: number) => void,
    Song
] => {
    const [audio] = useState(new Audio(songs[0].url));
    const [songIndex, setSongIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [song, setSong] = useState(songs[0]);

    const togglePlaying = () => setPlaying(!playing);

    useEffect(() => {
        const abortController = new AbortController();

        setSong(songs[songIndex]);
        audio.pause();
        audio.src = songs[songIndex].url;
        audio.load();
        audio.play().catch();

        return () => abortController.abort();
    }, [songIndex]);

    useEffect(() => {
        const abortController = new AbortController();

        if (playing) audio.play().catch();
        else {
            audio.pause();
        }

        return () => abortController.abort();
    }, [playing]);

    useEffect(() => {
        audio.addEventListener("ended", () => setSongIndex(getNextIndexInLoop(songIndex, songs.length)));
        return () => audio.removeEventListener("ended", () => setSongIndex(getNextIndexInLoop(songIndex, songs.length)));
    }, [songIndex]);

    return [playing, togglePlaying, songIndex, setSongIndex, song];
};

export default useAudio;

export { getNextIndexInLoop, getPreviousIndexInLoop };
