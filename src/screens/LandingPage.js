import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Headphones, Zap, ChevronDown, Edit, Volume2, Bot, Type, Podcast, Download, Check, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode } = useTheme();
  const [plans, setPlans] = useState([]);
  const [activeFeature, setActiveFeature] = useState(0);
  const { user } = useAuth();

  const features = [
    { icon: Edit, title: "AI Script Writing", description: "Our AI generates engaging, natural-sounding scripts tailored to your topic, saving you hours of writing and editing." },
    { icon: Bot, title: "Lifelike AI Voices", description: "Choose from a diverse range of realistic AI voices or even clone your own, bringing your podcast characters to life." },
    { icon: Volume2, title: "Studio-Quality Audio", description: "Enjoy professional-grade sound without investing in expensive equipment or post-production services." },
    { icon: Zap, title: "Lightning Fast Creation", description: "Transform your ideas into full-fledged podcast episodes in minutes, not days or weeks." },
    { icon: Headphones, title: "Multilingual Support", description: "Break language barriers by producing your podcast in over 50 languages with native-sounding voices." },
    { icon: Mic, title: "Custom Branding", description: "Add your unique touch with personalized intros, outros, and sound effects that make your podcast stand out." }
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      const plansCollection = collection(db, 'plans');
      const plansSnapshot = await getDocs(plansCollection);
      const plansData = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort plans by price in ascending order
      const sortedPlans = plansData.sort((a, b) => a.price - b.price);
      setPlans(sortedPlans);
    };

    fetchPlans();
  }, []);

  const fadeInUp = {
    initial: { y: 60, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };


  const waveVariants = {
    start: { pathLength: 0, pathOffset: 0 },
    end: { pathLength: 1, pathOffset: 1 }
  };

  const dotVariants = (duration) => ({
    animate: {
      rotate: 360,
      transition: {
        duration: duration,
        repeat: Infinity,
        ease: "linear"
      }
    }
  });

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        delay: 0.5,
        duration: 0.5
      }
    }
  };

  const handlePlanSelection = (plan) => {
    navigate('/payment', { 
      state: { 
        plan: {
          name: plan.name,
          price: plan.price,
          interval: plan.interval,
          features: plan.features
        }
      } 
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} overflow-x-hidden`}>
      <main className="container mx-auto px-6 py-12">
        <motion.section 
          className="flex flex-col lg:flex-row items-center justify-between mb-32 py-20 gap-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
          }}
        >
          {/* Left side - Text content */}
          <motion.div 
            className="lg:w-1/2 text-center lg:text-left"
            variants={{
              hidden: { x: -50, opacity: 0 },
              visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
            }}
          >
            <motion.h1
              className="text-5xl lg:text-7xl font-extrabold mb-8 leading-tight"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
              }}
            >
              <span className="block">AI-Powered</span>
              <span className="block">Podcasts on</span>
              <span className="block mt-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500">
                Any Topic
              </span>
            </motion.h1>

            <motion.p
              className={`text-xl lg:text-2xl mb-12 ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
              }}
            >
              Enter any subject, and our AI creates a full podcast instantly. Browse, generate, and enjoy AI-crafted content on demand.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
              }}
            >
              <motion.button 
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-10 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg text-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Generate Your First Podcast
              </motion.button>
              <motion.button 
                className={`flex items-center justify-center font-bold py-4 px-10 rounded-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} hover:bg-opacity-80 transition-all duration-300 text-xl`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="mr-3" size={24} /> Listen to Samples
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Right side - Visual representation */}
          <motion.div 
            className="lg:w-1/2 flex justify-center items-center"
            variants={{
              hidden: { x: 50, opacity: 0 },
              visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
            }}
          >
            <div className={`relative w-2/3 aspect-square rounded-3xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-purple-100'}`}>
              {/* Rotating dots */}
              {[
                { radius: '25%', size: 'w-7 h-7', color: 'bg-pink-400', duration: 4 },
                { radius: '35%', size: 'w-8 h-8', color: 'bg-purple-400', duration: 6 },
                { radius: '45%', size: 'w-9 h-9', color: 'bg-indigo-400', duration: 8 },
                { radius: '50%', size: 'w-6 h-6', color: 'bg-blue-400', duration: 5 },
                { radius: '60%', size: 'w-5 h-5', color: 'bg-green-400', duration: 7 },
              ].map((dot, index) => (
                <motion.div
                  key={index}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    width: dot.radius,
                    height: dot.radius,
                    marginLeft: `-${parseInt(dot.radius) / 2}%`,
                    marginTop: `-${parseInt(dot.radius) / 2}%`,
                    opacity: .5
                  }}
                  variants={dotVariants(dot.duration)}
                  animate="animate"
                >
                  <div className={`${dot.size} ${dot.color} rounded-full absolute top-0 left-1/2 transform -translate-x-1/2`} />
                </motion.div>
              ))}

              {/* Central Logo */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                variants={iconVariants}
              >
                <svg width="64" height="64" viewBox="0 0 395 518" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-1/3 h-1/3">
                  <circle cx="26.5" cy="26.5" r="26" fill="#8B5CF6" stroke="#8B5CF6"/>
                  <circle cx="368.5" cy="26.5" r="26" fill="#8B5CF6" stroke="#8B5CF6"/>
                  <path d="M29 127.5V262C29 312.5 70 386 198.5 386M198.5 386C324.5 386 368.5 304.5 368.5 262V127.5M198.5 386V491.5H125.5H272" stroke="#8B5CF6" strokeWidth="53" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              {/* Mic with placeholder text simulation */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Mic className="w-8 h-8" />
                  <div className="flex-1">
                    <motion.div 
                      className={`h-1.5 rounded-full mb-1 ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '80%' }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                    />
                    <motion.div 
                      className={`h-1.5 rounded-full ${isDarkMode ? 'bg-purple-400' : 'bg-purple-600'}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '60%' }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.section className="mb-20" {...fadeInUp}>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-center">Create a Podcast in 3 Simple Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Type, title: "1. Enter Your Idea", description: "Type in your podcast topic or concept. That's all we need to get started." },
              { icon: Podcast, title: "2. AI Does the Magic", description: "Our advanced AI writes the script, generates voices, and produces the audio." },
              { icon: Volume2, title: "3. Listen & Share", description: "Get your professionally produced podcast ready to share with the world." }
            ].map((step, index) => (
              <motion.div 
                key={index} 
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <step.icon className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section className="mb-20" {...fadeInUp}>
          <h2 className="text-3xl font-bold mb-12 text-center">Why Creators Love podAI</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-full md:w-1/3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                    activeFeature === index 
                      ? (isDarkMode ? 'bg-purple-800' : 'bg-purple-100') 
                      : (isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                  }`}
                  onClick={() => setActiveFeature(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <feature.icon className={`w-8 h-8 mr-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </motion.div>
              ))}
            </div>
            <div className="w-full md:w-2/3">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-50'}`}
              >
                <h3 className="text-2xl font-bold mb-4">{features[activeFeature].title}</h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {features[activeFeature].description}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section className="mb-20" {...fadeInUp}>
          <h2 className="text-3xl font-bold mb-8 text-center">Choose the Perfect Plan for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, index) => (
              <motion.div 
                key={plan.id}
                className={`${isDarkMode ? 'bg-gray-800 border-purple-500' : 'bg-white border-purple-200'} p-4 rounded-lg shadow-xl border-2 ${plan.name === 'Pro' ? 'border-pink-500' : ''} flex flex-col relative`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.name === 'Pro' && (
                    <div className="bg-pink-500 text-white text-xs font-bold py-1 px-2 rounded-full">
                      Recommended
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold mb-4">{plan.price === 0 ? 'Free' : `$${plan.price}/mo`}</p>
                <ul className="mb-4 space-y-2 text-sm flex-grow">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full py-2 rounded-full ${plan.name === 'Pro' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors duration-300 text-sm mt-auto`}
                >
                  {plan.price === 0 ? 'Create Your Free Account' : 'Choose Plan'}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section className="text-center mb-20" {...fadeInUp}>
          <h2 className="text-3xl font-bold mb-8">Ready to Revolutionize Your Podcast?</h2>
          <p className={`text-xl mb-8 ${isDarkMode ? 'text-purple-200' : 'text-purple-600'}`}>
            Join thousands of creators who are already using podAI to bring their ideas to life.
          </p>
          <motion.button 
            onClick={() => navigate('/signup')}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-8 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your Free Account Now
          </motion.button>
        </motion.section>
      </main>

      <footer className={`text-center py-6 ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        <p>&copy; 2024 podAI. All rights reserved. | <a href="#" className="underline">Terms of Service</a> | <a href="#" className="underline">Privacy Policy</a></p>
      </footer>
    </div>
  );
};

export default LandingPage;