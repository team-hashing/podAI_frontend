import React, { useState, useEffect } from 'react';
import { User, CreditCard, BarChart, Settings2, LogOut, X, Check, Headphones, Podcast, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../services/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, orderBy, query, where, deleteDoc, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { signOut, updateEmail, updatePassword, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { motion } from 'framer-motion';
import { getDownloadURL, ref } from 'firebase/storage';
import PodcastCard from '../components/PodcastCard';
import CryptoJS from 'crypto-js';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition duration-150"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [userData, setUserData] = useState({});
  const [plans, setPlans] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCVC, setNewCardCVC] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        const plansQuery = query(collection(db, 'plans'), orderBy('price', 'asc'));
        const plansSnapshot = await getDocs(plansQuery);
        const plansData = plansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: parseFloat(doc.data().price)
        }));
        setPlans(plansData);

        const podcastsQuery = query(collection(db, 'podcasts'), where('user_id', '==', user.uid));
        const podcastsSnapshot = await getDocs(podcastsQuery);
        const podcastsData = await Promise.all(podcastsSnapshot.docs.map(async doc => {
          const data = doc.data();
          let imageUrl = null;
          try {
            imageUrl = await getDownloadURL(ref(storage, `podcasts/${doc.id}/image.png`));
          } catch (error) {
            console.error(`Error fetching image for podcast ${doc.id}:`, error);
          }
          return { id: doc.id, ...data, imageUrl };
        }));
        console.log('Fetched podcasts:', podcastsData); // Add this line for debugging
        setPodcasts(podcastsData);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePlan = async (newPlan) => {
    try {
      // Navigate to the payment page with the selected plan details
      navigate('/payment', {
        state: {
          plan: {
            name: newPlan.name,
            price: newPlan.price,
            tokens: newPlan.tokens,
            features: newPlan.features,
          },
        },
      });
    } catch (error) {
      console.error('Error navigating to payment page:', error);
      alert('Failed to navigate to payment page. Please try again.');
    }
  };

  const handleUpdatePayment = async (e) => {
    e.preventDefault();
    try {
      // In a real app, you would send this info to your payment processor
      // and only update the database after successful processing
      await updateDoc(doc(db, 'users', user.uid), {
        paymentMethod: {
          last4: newCardNumber.slice(-4),
          // Don't store full card details in your database!
        }
      });
      setUserData(prevData => ({
        ...prevData,
        paymentMethod: {
          last4: newCardNumber.slice(-4),
        }
      }));
      setShowUpdatePayment(false);
      alert('Payment method updated successfully!');
    } catch (error) {
      console.error('Error updating payment method:', error);
      alert('Failed to update payment method. Please try again.');
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    try {
      await updateEmail(user, newEmail);
      setShowChangeEmail(false);
      alert('Email updated successfully!');
    } catch (error) {
      console.error('Error updating email:', error);
      alert('Failed to update email. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await updatePassword(user, newPassword);
      setShowChangePassword(false);
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteAccount = async () => {
    try {
      // Re-authenticate user
      const password = prompt('Please enter your password to confirm account deletion:');
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete user account
      await deleteUser(user);

      alert('Your account has been deleted.');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const SideMenu = () => (
    <div className="md:space-x-4 bg-gray-100 dark:bg-gray-800 p-4 space-y-2 border-r border-gray-200 dark:border-gray-700 h-min rounded-xl">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-bold">{userData.name}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>
      </div>
      <div className='flex flex-row sm:flex-col justify-between'>
      <button
        onClick={() => setActiveSection('overview')}
        className={`flex center items-center p-2 rounded ${activeSection === 'overview' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <User className="inline-block md:mr-2" size={18} /> <span className='hidden md:block'>Overview</span>
      </button>
      <button
        onClick={() => setActiveSection('subscription')}
        className={`flex items-center p-2 rounded ${activeSection === 'subscription' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <BarChart className="inline-block md:mr-2" size={18} /> <span className='hidden md:block'>Subscription</span>
      </button>
      <button
        onClick={() => setActiveSection('payment')}
        className={`flex items-center p-2 rounded ${activeSection === 'payment' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <CreditCard className="inline-block md:mr-2" size={18} /> <span className='hidden md:block'>Payment</span>
      </button>
      <button
        onClick={() => setActiveSection('settings')}
        className={`flex items-center p-2 rounded ${activeSection === 'settings' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        <Settings2 className="inline-block md:mr-2" size={18} /><span className='hidden md:block'>Settings</span>
      </button>
      <button
        onClick={handleLogout}
        className="flex items-center p-2 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
      >
        <LogOut className="inline-block md:mr-2" size={18} /><span className='hidden md:block'>Log Out</span>
      </button>
      </div>
    </div>
  );

  const Overview = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Member Since</h3>
          <p>{new Date(user.metadata.creationTime).toLocaleDateString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Podcasts Created</h3>
          <p>{podcasts.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Current Plan</h3>
          <p>{userData.plan || 'Free'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">Token Balance</h3>
          <p>{userData.tokens || 0}</p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">Your Podcasts</h3>
      {podcasts.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          You haven't created any podcasts yet. (Podcasts count: {podcasts.length})
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {podcasts.map(podcast => (
              <PodcastCard key={podcast.id} {...podcast} />
          ))}
        </div>
      )}
    </div>
  );

  const Subscription = () => (
    <div className='w-full'>
      <h2 className="text-2xl font-bold mb-4">Your Subscription Plan</h2>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-10">
        <h3 className="font-semibold mb-2">Token Balance</h3>
        <p>{userData.tokens || 0}</p>
      </div>
      {plans.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.05 }}
              className={`p-6 rounded-lg shadow-md flex flex-col ${
                userData.plan === plan.name
                  ? 'bg-gray-100 dark:bg-gray-700 border-2 border-purple-500'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">${plan.price.toFixed(2)}</span>
                <span className="text-gray-600 dark:text-gray-300 ml-1">/month</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.tokens} Tokens per month</p>
              <ul className="mb-6 flex-grow">
                {plan.features && plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center mb-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChangePlan(plan)}
                className={`${
                  userData.plan === plan.name
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                } text-white font-bold py-2 px-4 rounded transition duration-300 w-full`}
              >
                {userData.plan === plan.name ? 'Current Plan' : 'Select Plan'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const Payment = () => {
    const [newCard, setNewCard] = useState({ number: '', expiry: '', cvv: '' });
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null); // State to track selected card
    const [isEditing, setIsEditing] = useState(false); // State to track if editing
    const [editingCardId, setEditingCardId] = useState(null); // State to track which card is being edited
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for delete confirmation
    const [cardToDelete, setCardToDelete] = useState(null); // State to track which card to delete

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

    const handleAddCard = async (e) => {
      e.preventDefault();
      try {
        const encryptedCard = {
          number: CryptoJS.AES.encrypt(newCard.number, 'your-secret-key').toString(),
          expiry: CryptoJS.AES.encrypt(newCard.expiry, 'your-secret-key').toString(),
          cvv: CryptoJS.AES.encrypt(newCard.cvv, 'your-secret-key').toString(),
        };

        const docRef = await addDoc(collection(db, 'users', user.uid, 'cards'), encryptedCard);
        const newCardData = {
          id: docRef.id,
          number: newCard.number, // Store decrypted number
          expiry: newCard.expiry, // Store decrypted expiry
          cvv: newCard.cvv, // Store decrypted cvv
        };

        setSavedCards([...savedCards, newCardData]);
        setNewCard({ number: '', expiry: '', cvv: '' });
      } catch (error) {
        console.error("Error adding card:", error);
        alert('Failed to add card. Please try again.');
      }
    };

    const handleRemoveCard = async () => {
      if (cardToDelete) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'cards', cardToDelete));
          setSavedCards(savedCards.filter(card => card.id !== cardToDelete));
          setShowDeleteConfirmation(false);
          setCardToDelete(null);
        } catch (error) {
          console.error("Error removing card:", error);
          alert('Failed to remove card. Please try again.');
        }
      }
    };

    const handleEditCard = (card) => {
      setIsEditing(true);
      setEditingCardId(card.id);
      setNewCard({ number: card.number, expiry: card.expiry, cvv: card.cvv });
    };

    const handleUpdateCard = async (e) => {
      e.preventDefault();
      try {
        const encryptedCard = {
          number: CryptoJS.AES.encrypt(newCard.number, 'your-secret-key').toString(),
          expiry: CryptoJS.AES.encrypt(newCard.expiry, 'your-secret-key').toString(),
          cvv: CryptoJS.AES.encrypt(newCard.cvv, 'your-secret-key').toString(),
        };

        await updateDoc(doc(db, 'users', user.uid, 'cards', editingCardId), encryptedCard);
        const updatedCardData = {
          id: editingCardId,
          number: newCard.number, // Store decrypted number
          expiry: newCard.expiry, // Store decrypted expiry
          cvv: newCard.cvv, // Store decrypted cvv
        };

        setSavedCards(savedCards.map(card => (card.id === editingCardId ? updatedCardData : card)));
        setNewCard({ number: '', expiry: '', cvv: '' });
        setIsEditing(false);
        setEditingCardId(null);
      } catch (error) {
        console.error("Error updating card:", error);
        alert('Failed to update card. Please try again.');
      }
    };

    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Payment Information</h2>
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 gap-10">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4">Saved Credit Cards</h3>
            {savedCards.length > 0 ? (
              <div className="space-y-4 mb-6">
                {savedCards.map((card) => (
                  <div key={card.id} className="flex items-center w-full p-4 border rounded-lg shadow-md">
                    <input
                      type="radio"
                      id={card.id}
                      name="creditCard"
                      checked={selectedCardId === card.id}
                      onChange={() => setSelectedCardId(card.id)}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={card.id}
                      className={`flex items-center cursor-pointer w-full p-2 rounded-lg ${selectedCardId === card.id ? 'border-purple-600' : 'border-gray-300'}`}
                    >
                      <div className="flex justify-between w-full">
                        <div className="flex items-center">
                          <CreditCard className="w-6 h-6 text-purple-600 mr-2" />
                          <p className="font-bold">**** **** **** {card.number.slice(-4)}</p>
                        </div>
                        <p className="text-sm text-gray-500 ml-4">Expires: {card.expiry}</p>
                      </div>
                    </label>
                    <div className="ml-4 flex space-x-2">
                      <button onClick={() => handleEditCard(card)} className="text-blue-600 hover:underline">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setShowDeleteConfirmation(true); setCardToDelete(card.id); }} className="text-red-600 hover:underline">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No saved credit cards. Please add a new one.</p>
            )}
          </div>

          <div className="flex-1 w-full justify-center">            
            <h3 className="text-lg font-semibold mb-4">Add New Credit Card</h3>
          <form onSubmit={isEditing ? handleUpdateCard : handleAddCard} className="space-y-4">
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Card Number
              </label>
              <input
                id="cardNumber"
                type="text"
                value={newCard.number}
                onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-1"
                required
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiry (MM/YY)
                </label>
                <input
                  id="cardExpiry"
                  type="text"
                  value={newCard.expiry}
                  onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-1"
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CVC
                </label>
                <input
                  id="cardCVC"
                  type="text"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-1"
                  required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
              {isEditing ? 'Update Payment Method' : 'Add Payment Method'}
            </button>
          </form>
          </div>
        </div>

        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete this card?</h3>
              <p className="mb-4">Card ending in: **** **** **** {cardToDelete ? savedCards.find(card => card.id === cardToDelete).number.slice(-4) : ''}</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveCard}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Card Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Edit Card</h3>
              <form onSubmit={handleUpdateCard} className="space-y-4">
                <div>
                  <label htmlFor="editCardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Card Number
                  </label>
                  <input
                    id="editCardNumber"
                    type="text"
                    value={newCard.number}
                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-1"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="editCardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Expiry (MM/YY)
                    </label>
                    <input
                      id="editCardExpiry"
                      type="text"
                      value={newCard.expiry}
                      onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-1"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="editCardCVC" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      CVC
                    </label>
                    <input
                      id="editCardCVC"
                      type="text"
                      value={newCard.cvv}
                      onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-1"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Update Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Settings = () => (
    <div>
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Email</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
          <button 
            onClick={() => setShowChangeEmail(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Change Email
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Password</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">••••••••</p>
          <button 
            onClick={() => setShowChangePassword(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Change Password
          </button>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Delete Account</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">This action cannot be undone.</p>
          <button 
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row">
          <SideMenu />
          <div className="flex-grow ml-0 md:ml-8">
            {activeSection === 'overview' && <Overview />}
            {activeSection === 'subscription' && <Subscription />}
            {activeSection === 'payment' && <Payment />}
            {activeSection === 'settings' && <Settings />}
          </div>
        </div>
      </div>
      <Modal isOpen={showChangeEmail} onClose={() => setShowChangeEmail(false)} title="Change Email">
        <form onSubmit={handleChangeEmail} className="space-y-4">
          <div>
            <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Email
            </label>
            <input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            Update Email
          </button>
        </form>
      </Modal>

      <Modal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Password">
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            Update Password
          </button>
        </form>
      </Modal>

      <Modal isOpen={showUpdatePayment} onClose={() => setShowUpdatePayment(false)} title="Update Payment Method">
        <form onSubmit={handleUpdatePayment} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Card Number
            </label>
            <input
              id="cardNumber"
              type="text"
              value={newCardNumber}
              onChange={(e) => setNewCardNumber(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expiry (MM/YY)
              </label>
              <input
                id="cardExpiry"
                type="text"
                value={newCardExpiry}
                onChange={(e) => setNewCardExpiry(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                CVC
              </label>
              <input
                id="cardCVC"
                type="text"
                value={newCardCVC}
                onChange={(e) => setNewCardCVC(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300">
            Update Payment Method
          </button>
        </form>
      </Modal>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Are you sure you want to delete your account?</h3>
            <p className="mb-4">This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;