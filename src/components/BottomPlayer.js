import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, ChevronUp, ChevronDown } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';

const BottomPlayer = () => {
  const [isVisible, setIsVisible] = useState(true); // State to manage visibility
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
  if (!user || !currentPodcast) return null; // Check visibility

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleHide = () => {
    setIsVisible(false); // Hide the player
  };

  const handleShow = () => {
    setIsVisible(true); // Show the player
  };

  return (
    <>
      <div className={`main-content ${isVisible ? 'mb-20' : ''}`}> {/* Add margin when visible */}
        {/* Your main content goes here */}
      </div>
      {isVisible ? (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark p-4 shadow-lg rounded-t-lg z-50"
        >
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center w-full md:w-1/4">
              <img
                src={currentPodcast.imageUrl || '/static/images/placeholder2.png'}
                alt={currentPodcast.name}
                className="w-12 h-12 rounded-lg mr-4 object-cover"
              />
              <div className="md:ml-4"> {/* Added margin for larger screens */}
                <h4 className="font-semibold">{currentPodcast.name}</h4>
                <p className="text-sm text-text-light dark:text-text-dark">{currentPodcast.authorName}</p>
              </div>
            </div>
            <div className="flex flex-col items-center w-full md:w-1/2"> {/* Changed w-1/2 to w-full for mobile */}
              <div className="flex justify-center space-x-4 mb-2 w-full"> {/* Added w-full here */}
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
            <div className="w-1/4 flex justify-end"> {/* Hide on larger screens */}
              <button onClick={handleHide} className="text-purple-500 flex items-center absolute top-2 right-2 md:relative"> {/* Positioning for mobile */}
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-background-light dark:bg-background-dark p-2 rounded-lg shadow-lg  text-text-light dark:text-text-dark ">

          <button onClick={handleShow} className="text-purple-500 flex items-center">
            <ChevronUp className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-4">
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
        </div>
      )}
    </>
  );
};

export default BottomPlayer;