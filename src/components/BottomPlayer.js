import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';

const BottomPlayer = () => {
  const { 
    currentPodcast, 
    isPlaying, 
    togglePlay, 
    seekForward, 
    seekBackward,
    currentTime,
    duration,
    seek
  } = useAudio();
  const { user } = useAuth();

  // If there's no user or no current podcast, don't render the player
  if (!user || !currentPodcast) return null;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 shadow-lg"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center w-1/4">
          <img
            src={currentPodcast.imageUrl || '/static/images/placeholder2.png'}
            alt={currentPodcast.name}
            className="w-12 h-12 rounded-lg mr-4 object-cover"
          />
          <div>
            <h4 className="font-semibold">{currentPodcast.name}</h4>
            <p className="text-sm text-primary-light dark:text-primary-dark">{currentPodcast.authorName}</p>
          </div>
        </div>
        <div className="flex flex-col items-center w-1/2">
          <div className="flex items-center space-x-4 mb-2">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={seekBackward}>
              <SkipBack className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="bg-primary-light dark:bg-primary-dark p-2 rounded-full"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={seekForward}>
              <SkipForward className="w-6 h-6" />
            </motion.button>
          </div>
          <div className="w-full flex items-center space-x-2">
            <span className="text-xs">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs">{formatTime(duration)}</span>
          </div>
        </div>
        <div className="w-1/4"></div>
      </div>
    </motion.div>
  );
};

export default BottomPlayer;