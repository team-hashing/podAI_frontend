import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Mic, Music, ImageIcon, Clock, Heart, User, Play, Pause, Plus, Search, Share2, Loader, Check, Coins, Sparkles  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../services/firebase';
import { collection, query, orderBy, limit, getDocs, updateDoc, doc, arrayUnion, arrayRemove, where, getDoc, increment, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import BottomPlayer from '../components/BottomPlayer';
import { useAudio } from '../contexts/AudioContext';
import { useTheme } from '../contexts/ThemeContext';
import PricingPlanModal from '../components/PricingPlanModal';
import Navigator from '../components/navigator';
import PodcastCard from '../components/PodcastCard';
import { useToken } from '../contexts/TokenContext';

const MainPage = () => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [mostLikedPodcasts, setMostLikedPodcasts] = useState([]);
  const [userPodcasts, setUserPodcasts] = useState([]);
  const navigate = useNavigate();
  const { currentPodcast, isPlaying, togglePlay, setCurrentPodcast } = useAudio();
  const { tokenBalance, updateTokenBalance, fetchTokenBalance } = useToken();
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPodcasts();
    } else {
      navigate('/authenticate');
    }
  }, [user]);

  const getUserInfo = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  };

  const fetchPodcasts = async () => {
    if (!user) return;

    // Fetch most liked podcasts
    const likedQuery = query(collection(db, 'podcasts'), orderBy('likes', 'desc'), limit(3));
    const likedSnapshot = await getDocs(likedQuery);
    const likedPodcasts = await Promise.all(likedSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const audioUrl = data.status === "ready" ? await getDownloadURL(ref(storage, `podcasts/${doc.id}/audio.wav`)).catch(() => null) : null;
      const imageUrl = data.status === "ready" ? await getDownloadURL(ref(storage, `podcasts/${doc.id}/image.png`)).catch(() => null) : null;
      const authorInfo = await getUserInfo(data.user_id);
      return {
        id: doc.id,
        ...data,
        audioUrl,
        imageUrl,
        authorName: authorInfo ? authorInfo.username : 'Unknown'
      };
    }));
    setMostLikedPodcasts(likedPodcasts);

    // Fetch user's podcasts
    const userQuery = query(collection(db, 'podcasts'), where('user_id', '==', user.uid), limit(5));
    const userSnapshot = await getDocs(userQuery);
    const userPodcasts = await Promise.all(userSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const audioUrl = data.status === "ready" ? await getDownloadURL(ref(storage, `podcasts/${doc.id}/audio.wav`)).catch(() => null) : null;
      const imageUrl = data.status === "ready" ? await getDownloadURL(ref(storage, `podcasts/${doc.id}/image.png`)).catch(() => null) : null;
      const authorInfo = await getUserInfo(data.user_id);
      return {
        id: doc.id,
        ...data,
        audioUrl,
        imageUrl,
        authorName: authorInfo ? authorInfo.username : 'Unknown'
      };
    }));
    setUserPodcasts(userPodcasts);
  };

  const handleProfileButtonClick = () => {
    navigate('/profile');
  };

  const handleLike = async (podcastId) => {
    if (!user) return;

    const podcastRef = doc(db, 'podcasts', podcastId);
    await updateDoc(podcastRef, {
      liked_by: arrayUnion(user.uid)
    });
    fetchPodcasts(); // Refresh podcasts after liking
  };

  const handleUnlike = async (podcastId) => {
    if (!user) return;

    const podcastRef = doc(db, 'podcasts', podcastId);
    await updateDoc(podcastRef, {
      liked_by: arrayRemove(user.uid)
    });
    fetchPodcasts(); // Refresh podcasts after unliking
  };

  const handleGenerate = async () => {
    if (tokenBalance < 1) {
      setIsPricingModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationComplete(false);
    try {
      // Prepare the payload for the podcast generation API
      const payload = {
        user_id: user.uid, // Use the user ID from the auth context
        subject: prompt, // Use the prompt as the subject
        podcast_name: prompt, // You can customize this as needed
      };

      // Call your backend API to generate a new podcast
      const response = await fetch('https://34.170.203.169:8003/generate-podcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`, // Include token if needed
        },
        body: JSON.stringify(payload), // Send the payload to the backend
      });

      if (!response.ok) {
        throw new Error('Failed to generate podcast');
      }

      const podcastData = await response.json();

      // Assuming the response contains the new podcast data
      const newPodcast = {
        id: podcastData.id, // Adjust based on your API response
        name: podcastData.podcast_name, // Adjust based on your API response
        user_id: user.uid,
        subject: podcastData.subject, // Adjust based on your API response
        audioUrl: podcastData.audioUrl, // Adjust based on your API response
        imageUrl: podcastData.imageUrl, // Adjust based on your API response
        liked_by: [],
        // Add any other fields you need
      };

      // Save the new podcast to Firestore
      const podcastRef = await addDoc(collection(db, 'podcasts'), newPodcast);

      // Update the state with the new podcast
      setUserPodcasts((prev) => [...prev, { ...newPodcast, id: podcastRef.id }]);
      
      // Deduct a token
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        tokens: increment(-1)
      });

      // Refresh token balance
      await fetchTokenBalance();
      
      setIsGenerating(false);
      setGenerationComplete(true);
      setTimeout(() => setGenerationComplete(false), 2000); // Reset to initial state after 2 seconds
      setPrompt('');
      fetchPodcasts(); // Refresh podcasts after generating
    } catch (error) {
      console.error("Error generating podcast:", error);
      setIsGenerating(false);
      alert('Failed to generate podcast. Please try again.');
    }
  };

  const handleSelectPlan = async (plan) => {
    // Here you would typically integrate with a payment processor
    // For now, we'll just simulate adding tokens
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        tokens: plan.tokens,
        plan: plan.name
      });
      await fetchTokenBalance();
      setIsPricingModalOpen(false);
      alert(`Successfully subscribed to ${plan.name} plan!`);
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      alert("Failed to subscribe to plan. Please try again.");
    }
  };

  const filteredPodcasts = (podcasts) => {
    return podcasts;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 max-w-4xl mx-auto">
          <motion.div 
            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">Create Your AI Podcast</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Coins className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{tokenBalance} tokens left</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-purple-500" />
                  <span>2-3 minutes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-grow">
                <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => {
                    const newPrompt = e.target.value;
                    setPrompt(newPrompt);
                    if (newPrompt.trim() === '') {
                      navigate('/'); // Redirect to main page if the search bar is empty
                    }
                  }}
                  placeholder="Enter your podcast topic..."
                  className="w-full p-3 pl-12 text-base border-2 border-purple-200 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={isGenerating}
                />
              </div>
              <AnimatePresence mode="wait">
                {!isGenerating && !generationComplete && (
                  <motion.button
                    key="generate"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={handleGenerate}
                    disabled={!prompt || tokenBalance < 1}
                    className={`p-3 rounded-lg flex items-center justify-center text-white font-semibold text-base transition-all duration-300 whitespace-nowrap ${
                      !prompt || tokenBalance < 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Generate Podcast
                  </motion.button>
                )}
                {isGenerating && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-3 rounded-lg bg-purple-600 text-white font-semibold text-base flex items-center justify-center shadow-md whitespace-nowrap"
                  >
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </motion.div>
                )}
                {generationComplete && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="p-3 rounded-lg bg-green-500 text-white font-semibold text-base flex items-center justify-center shadow-md whitespace-nowrap"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Generated!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {tokenBalance < 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded-lg text-red-700 dark:text-red-200 text-xs text-center"
              >
                Out of tokens! <button onClick={() => setIsPricingModalOpen(true)} className="font-semibold underline">Get more</button>
              </motion.div>
            )}
          </motion.div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Most Liked Podcasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts(mostLikedPodcasts).map(podcast => (
              <PodcastCard 
                key={podcast.id} 
                {...podcast} 
                isReady={podcast.status === "ready"} // Pass the isReady prop
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Your Podcasts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts(userPodcasts).map(podcast => (
              <PodcastCard 
                key={podcast.id} 
                {...podcast} 
                isReady={podcast.status === "ready"} // Pass the isReady prop
              />
            ))}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/create-podcast')}
            >
              <Plus className="w-6 h-6 mr-2 text-purple-600" />
              <span className="text-lg font-semibold text-purple-600">Create New Podcast</span>
            </motion.div>
          </div>
        </section>
      </main>

      <PricingPlanModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
};

export default MainPage;