import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faLock, faUnlock, faStar, faCalendarAlt, faRedo, faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
// Enable Orange ID integration
import { useBedrockPassport } from "@bedrock_org/passport";

const DailyChallenge = ({ onStart, isCompleted: propIsCompleted }) => {
  // Enable Orange ID authentication
  const { user } = useBedrockPassport();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(propIsCompleted || false);
  const [isInProgress, setIsInProgress] = useState(false);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [lastPlayed, setLastPlayed] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [challengeInfo, setChallengeInfo] = useState({
    difficulty: "Hard",
    time: 60,
    pairs: 9,
    specialReward: "2x Points"
  });

  // Update isCompleted when prop changes
  useEffect(() => {
    if (propIsCompleted !== undefined) {
      setIsCompleted(propIsCompleted);
    }
  }, [propIsCompleted]);

  // Check if challenge is unlocked (once per day) and track progress
  useEffect(() => {
    const today = new Date().toDateString();
    const storedLastPlayed = localStorage.getItem('dailyChallengeLastPlayed');
    const storedStreak = parseInt(localStorage.getItem('dailyChallengeStreak') || '0');
    const storedAttempts = parseInt(localStorage.getItem('dailyChallengeAttempts') || '0');
    const isChallengeCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true';
    const inProgress = localStorage.getItem('inDailyChallenge') === 'true';
    
    setLastPlayed(storedLastPlayed);
    setStreak(storedStreak);
    setAttempts(storedAttempts);
    setIsInProgress(inProgress);
    
    // Check if challenge is completed today
    const isCompletedToday = storedLastPlayed === today && isChallengeCompleted;
    
    // Only update isCompleted state from localStorage if we don't have a prop value
    if (propIsCompleted === undefined) {
      setIsCompleted(isCompletedToday);
    }
    
    // Unlock only if not completed today
    setIsUnlocked(!isCompletedToday);
    
    // Randomly set today's challenge parameters (but keep consistent for today)
    const todayString = today.replace(/\s/g, ''); // Remove spaces
    // Use a simple hash of the date string to generate deterministic random values
    const dateHash = todayString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const difficultyOptions = ["Medium", "Hard"];
    const timeOptions = [60, 60, 60]; // All set to 60 seconds
    // Update pairs options to be between 8-10
    const pairsOptions = [8, 9, 10];
    
    // Use the hash to pick deterministic options for today
    const dailyDifficulty = difficultyOptions[dateHash % difficultyOptions.length];
    const dailyTime = timeOptions[dateHash % timeOptions.length];
    const dailyPairs = pairsOptions[dateHash % pairsOptions.length];
    
    setChallengeInfo({
      difficulty: dailyDifficulty,
      time: dailyTime,
      pairs: dailyPairs,
      specialReward: "2x Points"
    });
  }, [propIsCompleted]);

  const handleStartChallenge = () => {
    if (!isUnlocked || isCompleted) {
      // Show message if trying to play a completed challenge
      if (isCompleted) {
        // Show visual alert
        setShowAlert(true);
        // Hide after 3 seconds
        setTimeout(() => setShowAlert(false), 3000);
        console.log("Daily challenge already completed. Come back tomorrow!");
      }
      return;
    }
    
    // Increment attempts counter
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    localStorage.setItem('dailyChallengeAttempts', newAttempts.toString());
    
    // Update difficulty-specific daily challenge attempts
    const difficultyKey = challengeInfo.difficulty.toLowerCase();
    const difficultyAttempts = parseInt(localStorage.getItem(`${difficultyKey}DailyChallengeAttempts`) || '0') + 1;
    localStorage.setItem(`${difficultyKey}DailyChallengeAttempts`, difficultyAttempts.toString());
    
    // Save challenge info to localStorage for restarting
    localStorage.setItem('currentDailyChallenge', JSON.stringify(challengeInfo));
    
    // Mark challenge as in progress
    setIsInProgress(true);
    
    // Start the challenge with the current challenge info
    onStart(challengeInfo);
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-purple-800 to-indigo-900 p-6 rounded-2xl shadow-xl border border-purple-500 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Alert message */}
      <AnimatePresence>
        {showAlert && (
          <motion.div 
            className="absolute top-0 left-0 right-0 bg-red-500 text-white p-3 rounded-t-2xl text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              <span className="flex-grow">Daily challenge already completed. Come back tomorrow!</span>
              <button onClick={() => setShowAlert(false)} className="text-white">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-yellow-400" />
          Daily Challenge
        </h3>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faStar} className="text-yellow-400" />
          <span className="text-white font-medium">{streak} Day Streak</span>
        </div>
      </div>
      
      <div className="bg-black bg-opacity-30 p-4 rounded-xl mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
            <p className="text-sm text-purple-300">Difficulty</p>
            <p className="text-lg font-bold text-white">{challengeInfo.difficulty}</p>
          </div>
          <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
            <p className="text-sm text-purple-300">Time Limit</p>
            <p className="text-lg font-bold text-white">{challengeInfo.time}s</p>
          </div>
          <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
            <p className="text-sm text-purple-300">Pairs</p>
            <p className="text-lg font-bold text-white">{challengeInfo.pairs}</p>
          </div>
          <div className="bg-purple-900 bg-opacity-50 p-3 rounded-lg">
            <p className="text-sm text-purple-300">Special Reward</p>
            <p className="text-lg font-bold text-white">{challengeInfo.specialReward}</p>
          </div>
        </div>
        
        <div className="text-center">
          {lastPlayed && (
            <p className="text-sm text-purple-300">
              Last completed: {new Date(lastPlayed).toLocaleDateString()}
            </p>
          )}
          
          {attempts > 0 && isUnlocked && (
            <p className="text-sm text-yellow-300 mt-1">
              <FontAwesomeIcon icon={faRedo} className="mr-1" />
              Attempts today: {attempts}
            </p>
          )}
          
          {isCompleted && (
            <p className="text-sm text-green-300 mt-2 font-medium">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
              Today's challenge completed!
            </p>
          )}
        </div>
      </div>
      
      <motion.button
        onClick={handleStartChallenge}
        disabled={!isUnlocked || isCompleted}
        className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${
          isUnlocked && !isCompleted
            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white' 
            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={(isUnlocked && !isCompleted) ? { scale: 1.03 } : {}}
        whileTap={(isUnlocked && !isCompleted) ? { scale: 0.98 } : {}}
      >
        {isCompleted ? (
          <>
            <FontAwesomeIcon icon={faCheckCircle} />
            Challenge Completed
          </>
        ) : isUnlocked ? (
          <>
            {isInProgress ? (
              <>
                <FontAwesomeIcon icon={faRedo} />
                Continue Challenge
              </>
            ) : attempts > 0 ? (
              <>
                <FontAwesomeIcon icon={faRedo} />
                Retry Challenge
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUnlock} />
                Start Challenge
              </>
            )}
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faLock} />
            Challenge Unavailable
          </>
        )}
      </motion.button>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-purple-300">
        <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
        <span>
          {isCompleted 
            ? "Come back tomorrow for a new challenge!" 
            : isUnlocked 
              ? "Complete the challenge to earn streak points!" 
              : "Challenge unavailable today."
          }
        </span>
      </div>
    </motion.div>
  );
};

export default DailyChallenge; 