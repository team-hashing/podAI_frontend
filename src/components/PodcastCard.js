import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, Clock, Loader, Music } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';

const PodcastCard = ({ id, name, authorName, duration, liked_by, imageUrl, audioUrl, status }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentPodcast, isPlaying, togglePlay, setCurrentPodcast } = useAudio();
    const isReady = (status=='ready');

    const handlePlayClick = async (e) => {
        e.stopPropagation();
        if (currentPodcast?.id !== id) {
            await setCurrentPodcast({ id, name, authorName, duration, liked_by, imageUrl, audioUrl });
        }
        togglePlay();
    };

    const handleCardClick = () => {
        if (isReady){
            navigate(`/player/${id}`); 
        }
    };

    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md relative"
            onClick={handleCardClick} // Add click handler
        >
            {!isReady && (
                <div className="absolute inset-0 bg-gray-500 opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold">Generating...</span>
                </div>
            )}
            {isReady ? (
                <img
                    src={imageUrl || '/static/images/placeholder2.png'}
                    alt={name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/static/images/placeholder2.png';
                    }}
                />
            ) : (
                <div className="flex items-center justify-center w-full h-48 bg-gray-300 dark:bg-gray-700">
                    <Music className="w-12 h-12 text-purple-600" />
                    <span className="text-gray-700 dark:text-gray-300 font-semibold ml-2">Not Ready</span>
                </div>
            )}
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold truncate">{name}</h3>
                    {isReady ? (
                        <button onClick={handlePlayClick} className="text-purple-600 hover:text-purple-700">
                            {currentPodcast?.id === id && isPlaying ? (
                                <Pause className="w-6 h-6" />
                            ) : (
                                <Play className="w-6 h-6" />
                            )}
                        </button>
                    ) : (
                        <Loader className="w-6 h-6 animate-spin text-purple-600" />
                    )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{authorName}</p>
                {isReady ? (<div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {Math.floor(duration / 60)} min</span>
                    <span className="flex items-center">
                        <Heart
                            className={`w-4 h-4 mr-1 ${liked_by.includes(user?.uid) ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                        />
                        {liked_by.length}
                    </span>
                </div>
                ) : (<></>)}
            </div>
        </div>
    );
};

export default PodcastCard;
