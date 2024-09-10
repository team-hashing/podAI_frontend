import { useState, useEffect, useRef } from 'react';

export const useAudio = (url) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!url) {
      setError("No audio URL provided");
      return;
    }

    audioRef.current = new Audio(url);
    audioRef.current.onerror = (e) => {
      console.error("Audio error:", e);
      setError(`Failed to load audio: ${e.target.error.message}`);
    };

    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current.duration);
    });

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(audioRef.current.currentTime);
    });

    audioRef.current.addEventListener('canplaythrough', () => {
      setError(null);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('loadedmetadata', () => {});
        audioRef.current.removeEventListener('timeupdate', () => {});
        audioRef.current.removeEventListener('canplaythrough', () => {});
      }
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Playback failed:", e);
        setError(`Playback failed: ${e.message}`);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const skipBack = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0);
  };

  const skipForward = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, duration);
  };

  const seek = (time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  return { isPlaying, togglePlay, skipBack, skipForward, seek, progress, duration, error };
};
