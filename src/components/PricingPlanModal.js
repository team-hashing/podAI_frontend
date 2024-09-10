import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { useToken } from '../contexts/TokenContext';

const PricingPlanModal = ({ isOpen, onClose, onSelectPlan }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('');
  const { user } = useAuth(); // Get the current user
  const { fetchTokenBalance } = useToken();

  useEffect(() => {
    const fetchPlansAndUserData = async () => {
      try {
        // Fetch plans
        const plansQuery = query(collection(db, 'plans'), orderBy('price', 'asc'));
        const plansSnapshot = await getDocs(plansQuery);
        const plansData = plansSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          price: parseFloat(doc.data().price)
        }));
        setPlans(plansData);

        // Fetch user's current plan
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserPlan(userData.plan || 'Free');
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPlansAndUserData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan) => {
    // ... existing code to update the user's plan and tokens

    // After updating the plan and tokens, fetch the new token balance
    await fetchTokenBalance();

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-5xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400">Choose Your Monthly Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        {loading ? (
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
                  userPlan === plan.name
                    ? 'bg-gray-100 dark:bg-gray-700 border-2 border-purple-500'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
                style={{
                  backgroundColor: userPlan === plan.name 
                    ? 'rgba(167, 139, 250, 0.05)' // Very subtle purple tint
                    : undefined
                }}
              >
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-purple-600 dark:text-purple-400">${plan.price.toFixed(2)}</span>
                  <span className="text-gray-600 dark:text-gray-300 ml-1">/month</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.tokens} Tokens per month</p>
                <ul className="mb-6 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center mb-2 text-sm">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded && plan.notIncluded.map((feature, index) => (
                    <li key={index} className="flex items-center mb-2 text-sm text-gray-500 line-through">
                      <X className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`${
                    userPlan === plan.name
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  } text-white font-bold py-2 px-4 rounded transition duration-300`}
                  disabled={userPlan === plan.name}
                >
                  {userPlan === plan.name ? 'Current Plan' : 'Select Plan'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PricingPlanModal;