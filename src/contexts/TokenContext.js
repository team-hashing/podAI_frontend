import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const TokenContext = createContext();

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  const [tokenBalance, setTokenBalance] = useState(0);
  const { user } = useAuth();

  const fetchTokenBalance = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setTokenBalance(userData.tokens || 0);
      }
    }
  };

  useEffect(() => {
    fetchTokenBalance();
  }, [user]);

  const updateTokenBalance = (newBalance) => {
    setTokenBalance(newBalance);
  };

  return (
    <TokenContext.Provider value={{ tokenBalance, updateTokenBalance, fetchTokenBalance }}>
      {children}
    </TokenContext.Provider>
  );
};