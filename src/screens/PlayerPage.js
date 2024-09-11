import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Heart, Share2, FileText } from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, query, collection, where, limit, getDocs } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const PlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const user = auth?.user;
  const { currentPodcast, setCurrentPodcast, isPlaying, duration, currentTime, togglePlay, seek, skipForward, skipBackward } = useAudio();
  const [showScript, setShowScript] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [relatedPodcasts, setRelatedPodcasts] = useState([]);

  useEffect(() => {
    const fetchPodcast = async () => {
      const podcastDoc = await getDoc(doc(db, 'podcasts', id));
      if (podcastDoc.exists()) {
        const data = podcastDoc.data();
        const audioUrl = await getDownloadURL(ref(storage, `podcasts/${id}/audio.wav`));
        const imageUrl = await getDownloadURL(ref(storage, `podcasts/${id}/image.png`)).catch(() => null);
        const authorInfo = await getUserInfo(data.user_id);
        const podcast = { id, ...data, audioUrl, imageUrl };
        setCurrentPodcast(podcast);
        setAuthorName(authorInfo ? authorInfo.username : 'Unknown');
        fetchRelatedPodcasts(data.user_id);
      } else {
        navigate('/');
      }
    };

    fetchPodcast();
  }, [id, navigate, setCurrentPodcast]);

  const getUserInfo = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  };

  const fetchRelatedPodcasts = async (userId) => {
    const q = query(collection(db, 'podcasts'), where('user_id', '==', userId), limit(3));
    const querySnapshot = await getDocs(q);
    const podcasts = await Promise.all(querySnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const imageUrl = await getDownloadURL(ref(storage, `podcasts/${doc.id}/image.png`)).catch(() => null);
      return { id: doc.id, ...data, imageUrl };
    }));
    setRelatedPodcasts(podcasts.filter(podcast => podcast.id !== id));
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleLike = async () => {
    if (!user || !currentPodcast) return;

    const podcastRef = doc(db, 'podcasts', id);
    if (currentPodcast.liked_by.includes(user.uid)) {
      await updateDoc(podcastRef, {
        liked_by: arrayRemove(user.uid)
      });
      setCurrentPodcast({ ...currentPodcast, liked_by: currentPodcast.liked_by.filter(uid => uid !== user.uid) });
    } else {
      await updateDoc(podcastRef, {
        liked_by: arrayUnion(user.uid)
      });
      setCurrentPodcast({ ...currentPodcast, liked_by: [...currentPodcast.liked_by, user.uid] });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPodcast.name,
        text: `Check out this podcast: ${currentPodcast.name}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      alert(`Share this link: ${window.location.href}`);
    }
  };

  if (!currentPodcast) return null;

  return (
    <div className={`md:h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 flex flex-col ${window.innerWidth < 640 ? 'flex-col' : 'flex-row'}`}>
      <div className={`flex ${window.innerWidth < 640 ? 'flex-col' : 'flex-row'}`}>
      <motion.div
        className={`flex flex-col ${window.innerWidth < 640 ? 'w-full' : 'w-3/4'}`}
        animate={{ width: window.innerWidth < 640 ? '100%' : '75%' }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-end space-x-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="text-gray-600 dark:text-gray-400"
          >
            <Heart className={`w-6 h-6 ${currentPodcast.liked_by.includes(user?.uid) ? 'fill-current text-red-500' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="text-gray-600 dark:text-gray-400"
          >
            <Share2 className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowScript(!showScript)}
            className="text-gray-600 dark:text-gray-400"
          >
            <FileText className="w-6 h-6" />
          </motion.button>
        </div>
        <AnimatePresence>
          {!showScript && (
            <motion.div
              className="flex-1 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={currentPodcast.imageUrl || '/static/images/placeholder2.png'}
                alt={currentPodcast.name}
                className="w-1/2 md:w-64 h-auto object-cover rounded-lg shadow-md mb-6"
              />
              <h1 className="text-3xl font-bold text-center mb-2">{currentPodcast.name}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 text-center mb-2">{authorName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 text-center">{currentPodcast.subject}</p>
              <div className="w-full md:w-2/3 mt-4  p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">{formatTime(currentTime)}</span>
                  <span className="text-sm">{formatTime(duration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => seek(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer mb-4"
                />
                <div className="flex justify-center items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={skipBackward}
                    className="text-purple-600 dark:text-purple-400"
                  >
                    <SkipBack className="w-6 h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="bg-purple-600 text-white p-3 rounded-full"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={skipForward}
                    className="text-purple-600 dark:text-purple-400"
                  >
                    <SkipForward className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {showScript && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-hidden h-[50vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold mb-4">Podcast Script</h2>
            {Object.entries(currentPodcast.script)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([section, dialogue]) => (
                <div key={section} className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{section}</h3>
                  {dialogue.map((line, index) => (
                    <p key={index} className="mb-2 text-sm">
                      <span className="font-bold">{Object.keys(line)[0]}:</span> {Object.values(line)[0]}
                    </p>
                  ))}
                </div>
              ))}
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className={`md:ml-4 overflow-hidden flex flex-col ${window.innerWidth < 640 ? 'w-full' : 'w-1/4'}`}
        animate={{ width: window.innerWidth < 640 ? '100%' : '25%', height: showScript ? 'calc(100% - 200px)' : '100%' }}
        transition={{ duration: 0.3 }}
      >
        <div className=' bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden h-max'>
        <h2 className="text-xl font-semibold mb-4 p-4 bg-gray-200 dark:bg-gray-700">Related Podcasts</h2>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {relatedPodcasts.map((podcast) => (
            <div
              key={podcast.id}
              className="flex items-center bg-white dark:bg-gray-900 rounded-lg p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={() => navigate(`/player/${podcast.id}`)}
            >
              <img
                src={podcast.imageUrl || '/static/images/placeholder2.png'}
                alt={podcast.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="font-semibold">{podcast.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{podcast.authorName}</p>
              </div>

            </div>

          ))}
        </div>
        </div>
        </motion.div>
        </div>
        {showScript && (
          <motion.div
            className="bg-white dark:bg-gray-900 p-4 rounded-lg mt-4 fixed bottom-0 left-0 w-screen"
          >
            <div className="flex items-center mb-4">
              <img
                src={currentPodcast.imageUrl || '/static/images/placeholder2.png'}
                alt={currentPodcast.name}
                className="w-16 h-16 object-cover rounded-md mr-4"
              />
              <div>
                <h3 className="font-semibold">{currentPodcast.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{authorName}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">{formatTime(currentTime)}</span>
              <span className="text-sm">{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer mb-4"
            />
            <div className="flex justify-center items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={skipBackward}
                className="text-purple-600 dark:text-purple-400"
              >
                <SkipBack className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="bg-purple-600 text-white p-3 rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={skipForward}
                className="text-purple-600 dark:text-purple-400"
              >
                <SkipForward className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default PlayerPage;