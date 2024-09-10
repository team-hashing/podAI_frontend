import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { CreditCard, User, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import CreditCardManager from '../components/CreditCardManager';

const PaymentPage = () => {
  const { user, signup } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);

  const plan = location.state?.plan || { 
    name: 'Pro', 
    price: 19.99, 
    interval: 'month', 
    features: ['Unlimited AI-generated podcasts', 'Advanced customization options', 'Priority support', 'Analytics dashboard']
  };

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!user) {
        await signup(email, password, name);
      }
      console.log('Processing payment...');
      navigate('/main');
    } catch (error) {
      setError('Failed to process payment: ' + error.message);
    }
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
  };

  return (
    <div className={`h-min ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan Details Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md`}
          >
            <h2 className={`text-3xl font-extrabold mb-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              {plan.name} Plan
            </h2>
            <p className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ${plan.price} <span className="text-xl font-normal">/ {plan.interval}</span>
            </p>
            <ul className="space-y-4 mb-8">
              {plan.features && plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className={`mr-3 h-6 w-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                  <span className="text-lg">{feature}</span>
                </li>
              ))}
            </ul>
            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                By subscribing, you'll be charged ${plan.price} every {plan.interval}. You can cancel anytime.
              </p>
            </div>
          </motion.div>

          {/* Payment Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
              Complete Your Purchase
            </h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user && (
                <>
                  <div>
                    <label htmlFor="name" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:ring-purple-500 focus:border-purple-500 pl-10`}
                        placeholder="John Doe"
                        required
                      />
                      <User className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:ring-purple-500 focus:border-purple-500 pl-10`}
                        placeholder="you@example.com"
                        required
                      />
                      <Mail className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="password" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:ring-purple-500 focus:border-purple-500 pl-10`}
                        placeholder="••••••••"
                        required
                      />
                      <Lock className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                </>
              )}
              <CreditCardManager onCardSelect={handleCardSelect} />
              {selectedCard && (
                <div className="mt-4">
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Selected Card:</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedCard.number}</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Expires: {selectedCard.expiry}</p>
                </div>
              )}
              <div>

                <h3 className="text-lg font-semibold mb-4 mt-8">Or use a new card</h3>
                <label htmlFor="cardNumber" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:ring-purple-500 focus:border-purple-500 pl-10`}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                  <CreditCard className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="expiryDate" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div className="w-1/2">
                  <label htmlFor="cvv" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className={`w-full px-4 py-2 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} rounded-md focus:ring-purple-500 focus:border-purple-500`}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Complete Purchase
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;