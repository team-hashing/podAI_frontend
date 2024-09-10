import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

const CreatePlaylistModal = ({ onClose }) => {
  const [playlistName, setPlaylistName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically handle the playlist creation
    console.log('Creating playlist:', playlistName);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-purple-800 p-6 rounded-lg shadow-xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Playlist</h2>
          <button onClick={onClose} className="text-purple-300 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            placeholder="Enter playlist name"
            className="w-full px-4 py-2 rounded-lg bg-purple-700 bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded"
          >
            Create Playlist
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreatePlaylistModal;