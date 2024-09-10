import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CommentSection = ({ podcastId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      setComments([...comments, { id: Date.now(), text: newComment, user: 'Current User' }]);
      setNewComment('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full p-2 rounded-lg bg-purple-800 bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="mt-2 px-4 py-2 bg-purple-600 rounded-full font-semibold"
        >
          Post Comment
        </motion.button>
      </form>
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-purple-800 bg-opacity-50 p-4 rounded-lg">
            <p className="font-semibold">{comment.user}</p>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;