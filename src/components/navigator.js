import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Search, Sun, Moon, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useToken } from '../contexts/TokenContext';

const Navigator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const { tokenBalance } = useToken();

  // Add this function to determine if the search bar should be shown
  const shouldShowSearchBar = () => {
    if (!user) {
      return false;
    }
    const hiddenPaths = ['/payment'];
    return !hiddenPaths.includes(location.pathname);
  };

  useEffect(() => {
    const performSearch = () => {
      if (searchQuery.length > 0) {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    };

    const debounce = setTimeout(performSearch, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery, navigate]);

  useEffect(() => {
    if (location.pathname !== '/search') {
      setSearchQuery('');
    }
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <Logo />
          <Title />
        </Link>
        {shouldShowSearchBar() && (
          <div className="flex-1 mx-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value==''){
                  navigate('/');
                }
              }}
              placeholder="Search podcasts..."
              className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
            <Search className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" />
          </div>
        )}
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Coins className="w-5 h-5 mr-2" />
              <span>{tokenBalance} tokens</span>
            </div>
          )}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          {user ? (
            <UserProfile />
          ) : (
            <>
              {location.pathname !== '/authenticate' && <LoginRegister />}
              <Contact />
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const Logo = () => (
  <svg width="40" height="40" viewBox="0 0 395 518" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="26.5" cy="26.5" r="26" fill="#8B5CF6" stroke="#8B5CF6"/>
    <circle cx="368.5" cy="26.5" r="26" fill="#8B5CF6" stroke="#8B5CF6"/>
    <path d="M29 127.5V262C29 312.5 70 386 198.5 386M198.5 386C324.5 386 368.5 304.5 368.5 262V127.5M198.5 386V491.5H125.5H272" stroke="#8B5CF6" strokeWidth="53" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Title = () => (
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    podAI
  </h1>
);

const UserProfile = () => (
  <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400">
    <User className="w-6 h-6" />
  </Link>
);

const Contact = () => (
  <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
    Contact
  </Link>
);

const LoginRegister = () => (
  <Link to="/authenticate" className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors">
    Login / Register
  </Link>
);

export default Navigator;
