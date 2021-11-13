import { useState, useEffect } from "react";
import { Song } from "./Song";

const useAudio = (songs : Song[]): [boolean, () => void, () => void] => {
    const [audio] = useState(new Audio(songs[0].url));
    const [songIndex, setSongIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    const playNext = () => {
        const nextSongIndex = (songIndex + 1) % songs.length;
        setSongIndex(nextSongIndex);
    };

    const togglePlaying = () => {
        setPlaying(!playing);
    };

    useEffect(() => {
        audio.pause();
        audio.src = songs[songIndex].url;
        audio.load();
        audio.play();
    }, [songIndex]);

    useEffect(() => {
        if (playing) {
            audio.play();
        }
        else {
            audio.pause();
        }
    }, [playing]);

    useEffect(() => {
        audio.addEventListener("ended", () => {
            playNext();
        });
        return () => {
            audio.removeEventListener("ended", () => setPlaying(false));
        };
    }, []);

    return [playing, togglePlaying, playNext];
};

export default useAudio;
