import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [audio] = useState(new Audio());
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const playPromiseRef = useRef(null);

  useEffect(() => {
    if (currentPodcast) {
      audio.src = currentPodcast.audioUrl;
      audio.load();
    }
  }, [currentPodcast, audio]);

  useEffect(() => {
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
    };
  }, [audio]);

  const togglePlay = async () => {
    if (playPromiseRef.current) {
      await playPromiseRef.current;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        playPromiseRef.current = audio.play();
        await playPromiseRef.current;
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback failed:", error);
      } finally {
        playPromiseRef.current = null;
      }
    }
  };

  const seek = (time) => {
    audio.currentTime = time;
  };

  const skipForward = () => {
    audio.currentTime = Math.min(audio.currentTime + 15, audio.duration);
  };

  const skipBackward = () => {
    audio.currentTime = Math.max(audio.currentTime - 15, 0);
  };

  return (
    <AudioContext.Provider
      value={{
        currentPodcast,
        setCurrentPodcast,
        isPlaying,
        duration,
        currentTime,
        togglePlay,
        seek,
        skipForward,
        skipBackward,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);