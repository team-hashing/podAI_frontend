import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { CreditCard } from 'lucide-react';

const CreditCardManager = ({ onCardSelect }) => {
  const { user } = useAuth();
  const [savedCards, setSavedCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    const fetchSavedCards = async () => {
      if (user) {
        const cardsCollection = collection(db, 'users', user.uid, 'cards');
        const cardsSnapshot = await getDocs(cardsCollection);
        const cardsData = cardsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            number: CryptoJS.AES.decrypt(data.number, 'your-secret-key').toString(CryptoJS.enc.Utf8),
            expiry: CryptoJS.AES.decrypt(data.expiry, 'your-secret-key').toString(CryptoJS.enc.Utf8),
            cvv: CryptoJS.AES.decrypt(data.cvv, 'your-secret-key').toString(CryptoJS.enc.Utf8),
          };
        });
        setSavedCards(cardsData);
      }
    };

    fetchSavedCards();
  }, [user]);

  const handleCardSelect = (card) => {
    setSelectedCardId(card.id);
    onCardSelect(card); // Call the parent function to handle card selection
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Saved Credit Cards</h3>
      {savedCards.length > 0 ? (
        <div className="space-y-4">
          {savedCards.map((card) => (
            <div key={card.id} className="flex items-center w-full p-4 border rounded-lg shadow-md">
              <input
                type="radio"
                id={card.id}
                name="creditCard"
                checked={selectedCardId === card.id}
                onChange={() => handleCardSelect(card)}
                className="hidden peer"
              />
              <label
                htmlFor={card.id}
                className={`flex items-center cursor-pointer w-full p-2  rounded-lg ${selectedCardId === card.id ? 'border-purple-600' : 'border-gray-300'}`}
              >
                <span className="w-5 h-5 flex items-center justify-center border-2 rounded-full border-purple-600 mr-2">
                  {selectedCardId === card.id && <span className="w-3 h-3 bg-purple-600 rounded-full"></span>}
                </span>
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <CreditCard className="w-6 h-6 text-purple-600 mr-2" />
                    <p className="font-bold">**** **** **** {card.number.slice(-4)}</p>
                  </div>
                  <p className="text-sm text-gray-500 ml-4">Expires: {card.expiry}</p>
                </div>
              </label>
            </div>
          ))}
        </div>
      ) : (
        <p>No saved credit cards. Please add a new one.</p>
      )}
    </div>
  );
};

export default CreditCardManager;