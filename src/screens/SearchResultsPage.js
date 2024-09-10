import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, storage } from '../services/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import PodcastCard from '../components/PodcastCard';

const SearchResultsPage = () => {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');
  const [allPodcasts, setAllPodcasts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllPodcasts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'podcasts'));
        const podcasts = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const audioUrl = await getDownloadURL(ref(storage, `podcasts/${doc.id}/audio.wav`)).catch(() => null);
          const imageUrl = await getDownloadURL(ref(storage, `podcasts/${doc.id}/image.png`)).catch(() => null);
          return { id: doc.id, ...data, audioUrl, imageUrl };
        }));
        setAllPodcasts(podcasts);
      } catch (error) {
        console.error("Error fetching podcasts:", error);
      }
      setLoading(false);
    };

    fetchAllPodcasts();
  }, []);

  useEffect(() => {
    const performSearch = () => {
      if (searchQuery && searchQuery.length > 0) {
        const results = allPodcasts.filter(podcast => 
          podcast.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [searchQuery, allPodcasts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h2>
          {loading ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {searchResults.map((podcast) => (
                    <PodcastCard key={podcast.id} {...podcast} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400">No results found.</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default SearchResultsPage;