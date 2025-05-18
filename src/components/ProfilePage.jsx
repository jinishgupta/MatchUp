import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faTrophy, 
  faClock, 
  faGamepad, 
  faPercent, 
  faArrowLeft, 
  faStar,
  faCalendarAlt,
  faChartLine,
  faTrash,
  faExclamationTriangle,
  faTimes,
  faCheck,
  faEdit,
  faCoins,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";

// Enable Orange ID import
import { useBedrockPassport } from "@bedrock_org/passport";
// Import Firebase service for updating display name
import { updateUserDisplayName } from "../firebase/firebaseService";

const ProfilePage = ({ onBack }) => {
  const { user } = useBedrockPassport();
  
  // State for editing display name
  const [isEditingName, setIsEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [nameUpdateStatus, setNameUpdateStatus] = useState({ message: '', isError: false });
  const [showNameStatus, setShowNameStatus] = useState(false);
  
  // State for user stats
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: null,
    joinedDate: null,
    lastPlayed: null,
    difficultyStats: {
      easy: { games: 0, wins: 0, winRate: 0, bestTime: null, dailyChallengeAttempts: 0 },
      medium: { games: 0, wins: 0, winRate: 0, bestTime: null, dailyChallengeAttempts: 0 },
      hard: { games: 0, wins: 0, winRate: 0, bestTime: null, dailyChallengeAttempts: 0 },
    },
    dailyChallengeStats: {
      streak: 0,
      maxStreak: 0,
      totalAttempts: 0,
      isCompleted: false
    },
    duelStats: {
      wins: 0,
      losses: 0,
      totalDuels: 0
    }
  });
  
  // State for reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Load all stats from localStorage on component mount
  useEffect(() => {
    loadAllStats();
    
    // Initialize display name from user data
    if (user && user.displayName) {
      setNewDisplayName(user.displayName);
    }
  }, [user]);
  
  // Function to load all stats from localStorage
  const loadAllStats = () => {
    // Load basic stats
    const loadedGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const loadedGamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const loadedBestTime = parseInt(localStorage.getItem('bestTime') || '0');
    const joinedDate = localStorage.getItem('joinedDate') || new Date().toISOString();
    const lastPlayed = localStorage.getItem('lastPlayed') || null;
    
    // Save joined date if it doesn't exist
    if (!localStorage.getItem('joinedDate')) {
      localStorage.setItem('joinedDate', joinedDate);
    }
    
    // Calculate overall win rate
    const overallWinRate = loadedGamesPlayed > 0 
      ? Math.round((loadedGamesWon / loadedGamesPlayed) * 100) 
      : 0;
    
    // Load difficulty-specific stats
    const difficultyStats = {
      easy: {
        games: parseInt(localStorage.getItem('easyGames') || '0'),
        wins: parseInt(localStorage.getItem('easyWins') || '0'),
        winRate: parseInt(localStorage.getItem('easyWinRate') || '0'),
        bestTime: parseInt(localStorage.getItem('easyBestTime') || '0') || null,
        dailyChallengeAttempts: parseInt(localStorage.getItem('easyDailyChallengeAttempts') || '0'),
      },
      medium: {
        games: parseInt(localStorage.getItem('mediumGames') || '0'),
        wins: parseInt(localStorage.getItem('mediumWins') || '0'),
        winRate: parseInt(localStorage.getItem('mediumWinRate') || '0'),
        bestTime: parseInt(localStorage.getItem('mediumBestTime') || '0') || null,
        dailyChallengeAttempts: parseInt(localStorage.getItem('mediumDailyChallengeAttempts') || '0'),
      },
      hard: {
        games: parseInt(localStorage.getItem('hardGames') || '0'),
        wins: parseInt(localStorage.getItem('hardWins') || '0'),
        winRate: parseInt(localStorage.getItem('hardWinRate') || '0'),
        bestTime: parseInt(localStorage.getItem('hardBestTime') || '0') || null,
        dailyChallengeAttempts: parseInt(localStorage.getItem('hardDailyChallengeAttempts') || '0'),
      }
    };
    
    // Verify win rates are correct for each difficulty
    Object.keys(difficultyStats).forEach(diff => {
      const games = difficultyStats[diff].games;
      const wins = difficultyStats[diff].wins;
      if (games > 0) {
        const calculatedWinRate = Math.round((wins / games) * 100);
        difficultyStats[diff].winRate = calculatedWinRate;
      }
    });
    
    // Load daily challenge stats
    const dailyChallengeStreak = parseInt(localStorage.getItem('dailyChallengeStreak') || '0');
    const dailyChallengeMaxStreak = parseInt(localStorage.getItem('dailyChallengeMaxStreak') || '0');
    const dailyChallengeAttempts = parseInt(localStorage.getItem('dailyChallengeAttempts') || '0');
    const isDailyChallengeCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true';
    
    // Load duel stats
    const challengeWins = parseInt(localStorage.getItem('challengeWins') || '0');
    const challengeLosses = parseInt(localStorage.getItem('challengeLosses') || '0');
    
    // Verify the overall win rate
    if (loadedGamesPlayed > 0) {
      const calculatedWinRate = Math.round((loadedGamesWon / loadedGamesPlayed) * 100);
      if (calculatedWinRate !== overallWinRate) {
        localStorage.setItem('winRate', calculatedWinRate.toString());
      }
    }
    
    setStats({
      gamesPlayed: loadedGamesPlayed,
      gamesWon: loadedGamesWon,
      bestTime: loadedBestTime || null,
      joinedDate,
      lastPlayed,
      difficultyStats,
      dailyChallengeStats: {
        streak: dailyChallengeStreak,
        maxStreak: dailyChallengeMaxStreak,
        totalAttempts: dailyChallengeAttempts,
        isCompleted: isDailyChallengeCompleted
      },
      duelStats: {
        wins: challengeWins,
        losses: challengeLosses,
        totalDuels: challengeWins + challengeLosses
      }
    });
  };
  
  // Calculate win rate
  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
    : 0;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Reset all stats
  const resetAllStats = () => {
    // Reset basic stats
    localStorage.setItem('gamesPlayed', '0');
    localStorage.setItem('gamesWon', '0');
    localStorage.setItem('bestTime', '0');
    localStorage.setItem('winRate', '0');
    
    // Reset difficulty-specific stats
    ['easy', 'medium', 'hard'].forEach(diff => {
      localStorage.setItem(`${diff}Games`, '0');
      localStorage.setItem(`${diff}Wins`, '0');
      localStorage.setItem(`${diff}WinRate`, '0');
      localStorage.setItem(`${diff}BestTime`, '0');
      localStorage.setItem(`${diff}DailyChallengeAttempts`, '0');
    });
    
    // Reset streaks
    localStorage.setItem('currentStreak', '0');
    localStorage.setItem('maxStreak', '0');
    localStorage.setItem('dailyChallengeStreak', '0');
    localStorage.setItem('dailyChallengeMaxStreak', '0');
    
    // Reset daily challenge stats
    localStorage.setItem('dailyChallengeAttempts', '0');
    localStorage.removeItem('dailyChallengeLastPlayed');
    localStorage.removeItem('dailyChallengeCompleted');
    localStorage.removeItem('inDailyChallenge');
    localStorage.removeItem('currentDailyChallenge');
    
    // Reset duel stats
    localStorage.setItem('challengeWins', '0');
    localStorage.setItem('challengeLosses', '0');
    localStorage.removeItem('inDuel');
    localStorage.setItem('challengeHistory', JSON.stringify([]));
    
    // Update last reset date
    localStorage.setItem('statsResetDate', new Date().toISOString());
    
    // Dispatch a custom event that other components can listen for
    const resetEvent = new CustomEvent('statsReset');
    window.dispatchEvent(resetEvent);
    
    // Reload all stats
    loadAllStats();
    
    // Close modal
    setShowResetModal(false);
    
    // Emit a notification about the reset via a callback
    if (onBack) {
      setTimeout(() => {
        onBack(); // Return to homepage to ensure all stats are refreshed
      }, 500);
    }
  };
  
  // Function to get streak information
  const getStreakInfo = () => {
    const streakCount = parseInt(localStorage.getItem('currentStreak') || '0');
    const maxStreak = parseInt(localStorage.getItem('maxStreak') || '0');
    
    return {
      current: streakCount,
      max: maxStreak
    };
  };
  
  const streakInfo = getStreakInfo();

  // Calculate total daily challenge attempts
  const totalDailyChallengeAttempts = Math.floor(
  (stats.difficultyStats.easy.dailyChallengeAttempts + 
   stats.difficultyStats.medium.dailyChallengeAttempts + 
   stats.difficultyStats.hard.dailyChallengeAttempts) / 2
);

  // Handle display name edit
  const startEditingName = () => {
    setIsEditingName(true);
    setNewDisplayName(user?.displayName || '');
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setNameUpdateStatus({ message: '', isError: false });
    setShowNameStatus(false);
  };

  const saveDisplayName = async () => {
    if (!user || !user.id) {
      setNameUpdateStatus({ 
        message: 'You must be logged in to update your name', 
        isError: true 
      });
      setShowNameStatus(true);
      return;
    }

    if (!newDisplayName || newDisplayName.trim() === '') {
      setNameUpdateStatus({ 
        message: 'Display name cannot be empty', 
        isError: true 
      });
      setShowNameStatus(true);
      return;
    }

    try {
      const result = await updateUserDisplayName(user.id, newDisplayName);
      
      if (result.success) {
        setNameUpdateStatus({ 
          message: 'Name updated successfully!', 
          isError: false 
        });
        
        // Update the user object if possible
        if (user && typeof user === 'object') {
          user.displayName = newDisplayName.trim();
        }
        
        // Set local storage for users who aren't logged in with Orange ID
        localStorage.setItem('orngPlayerName', newDisplayName.trim());
        
        // Exit edit mode
        setTimeout(() => {
          setIsEditingName(false);
          setShowNameStatus(false);
        }, 1500);
      } else {
        setNameUpdateStatus({ 
          message: result.message || 'Failed to update name', 
          isError: true 
        });
      }
    } catch (error) {
      setNameUpdateStatus({ 
        message: 'An error occurred while updating your name', 
        isError: true 
      });
    }
    
    setShowNameStatus(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 py-8 px-4 overflow-y-auto">
      <div className="container max-w-4xl mx-auto">
        {/* Back Button and Reset Stats */}
        <div className="flex justify-between items-center mb-6">
          <motion.button
            onClick={onBack}
            className="flex items-center text-white px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </motion.button>
          
          <motion.button
            onClick={() => setShowResetModal(true)}
            className="flex items-center text-white px-4 py-2 rounded-lg bg-red-700 hover:bg-red-600"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Reset Stats
          </motion.button>
        </div>
        
        {/* Header */}
        <motion.div 
          className="bg-slate-800 rounded-2xl p-8 mb-8 shadow-xl border border-slate-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-xl mr-5">
              <FontAwesomeIcon icon={faUser} className="text-white text-2xl" />
            </div>
            <div className="flex-grow">
              {!isEditingName ? (
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-white mr-3">
                    {user?.displayName || localStorage.getItem('orngPlayerName') || user?.name || 'You'}
                  </h1>
                  <motion.button
                    onClick={startEditingName}
                    className="text-indigo-400 hover:text-indigo-300 p-1"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Edit your display name"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      placeholder="Enter your display name"
                      className="bg-slate-700 text-white px-3 py-2 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      maxLength={20}
                    />
                    <motion.button
                      onClick={saveDisplayName}
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg mr-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </motion.button>
                    <motion.button
                      onClick={cancelEditingName}
                      className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </motion.button>
                  </div>
                  {showNameStatus && (
                    <motion.p 
                      className={`text-sm mt-2 ${nameUpdateStatus.isError ? 'text-red-400' : 'text-green-400'}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {nameUpdateStatus.message}
                    </motion.p>
                  )}
                </div>
              )}
              {user?.email && (
                <p className="text-indigo-300 mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  {user.email}
                </p>
              )}
              <p className="text-slate-400">Player since {formatDate(stats.joinedDate)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-700/40 p-4 rounded-xl">
              <FontAwesomeIcon icon={faClock} className="text-blue-400 mb-2" />
              <p className="text-sm text-slate-400">Last Played</p>
              <p className="text-white font-medium">{formatDate(stats.lastPlayed)}</p>
            </div>
            
            <div className="bg-slate-700/40 p-4 rounded-xl">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 mb-2" />
              <p className="text-sm text-slate-400">Daily Challenge Streak</p>
              <p className="text-white font-medium">
                {parseInt(localStorage.getItem('dailyChallengeStreak') || '0')} days
              </p>
            </div>
            
            {localStorage.getItem('statsResetDate') && (
              <div className="bg-slate-700/40 p-4 rounded-xl">
                <FontAwesomeIcon icon={faTrash} className="text-red-400 mb-2" />
                <p className="text-sm text-slate-400">Last Stats Reset</p>
                <p className="text-white font-medium">
                  {formatDate(localStorage.getItem('statsResetDate'))}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          className="bg-slate-800 rounded-2xl p-8 mb-8 shadow-xl border border-slate-700"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
            <FontAwesomeIcon icon={faTrophy} className="mr-3 text-yellow-400" />
            Performance Stats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600 text-center">
              <FontAwesomeIcon icon={faGamepad} className="text-blue-400 text-3xl mb-3" />
              <h3 className="text-slate-300 mb-2">Games Played</h3>
              <p className="text-4xl font-bold text-white">{stats.gamesPlayed}</p>
            </div>
            
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600 text-center">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-3xl mb-3" />
              <h3 className="text-slate-300 mb-2">Games Won</h3>
              <p className="text-4xl font-bold text-white">{stats.gamesWon}</p>
            </div>
            
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600 text-center">
              <FontAwesomeIcon icon={faPercent} className="text-green-400 text-3xl mb-3" />
              <h3 className="text-slate-300 mb-2">Win Rate</h3>
              <p className="text-4xl font-bold text-white">{winRate}%</p>
            </div>
          </div>
        </motion.div>
        
        {/* Achievements and Records */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Best Time */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center text-white">
              <FontAwesomeIcon icon={faClock} className="mr-3 text-blue-400" />
              Best Time
            </h2>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Fastest completion:</span>
              <span className="text-3xl font-bold text-white">
                {stats.bestTime ? `${stats.bestTime}s` : "--"}
              </span>
            </div>
          </motion.div>
          
          {/* Game History */}
          <motion.div 
            className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center text-white">
              <FontAwesomeIcon icon={faChartLine} className="mr-3 text-purple-400" />
              Game History
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Easy mode games:</span>
                <span className="font-semibold text-white">
                  {stats.difficultyStats.easy.games}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Medium mode games:</span>
                <span className="font-semibold text-white">
                  {stats.difficultyStats.medium.games}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Hard mode games:</span>
                <span className="font-semibold text-white">
                  {stats.difficultyStats.hard.games}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-slate-300 font-medium">Daily challenge attempts:</span>
                <span className="font-semibold text-yellow-300">
                  {totalDailyChallengeAttempts}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Stats by Difficulty */}
        <motion.div 
          className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
            <FontAwesomeIcon icon={faStar} className="mr-3 text-yellow-400" />
            Difficulty Stats
          </h2>
          
          <div className="space-y-6">
            {Object.entries(stats.difficultyStats).map(([difficulty, diffStats]) => (
              <div key={difficulty} className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-white capitalize">{difficulty}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Win Rate</p>
                    <p className="text-lg font-bold text-white">
                      {diffStats.winRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Best Time</p>
                    <p className="text-lg font-bold text-white">
                      {diffStats.bestTime ? `${diffStats.bestTime}s` : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Games Played</p>
                    <p className="text-lg font-bold text-white">
                      {diffStats.games}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Daily Challenges</p>
                    <p className="text-lg font-bold text-yellow-300">
                      {diffStats.dailyChallengeAttempts}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-slate-800 rounded-2xl p-8 max-w-md shadow-2xl border border-red-500 my-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <div className="flex items-center gap-3 mb-4 text-red-400">
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl" />
                <h2 className="text-2xl font-bold">Reset All Stats?</h2>
              </div>
              
              <p className="text-white mb-6">
                This will permanently reset all your game statistics. This action cannot be undone.
              </p>
              
              <div className="flex gap-4">
                <motion.button
                  onClick={resetAllStats}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Yes, Reset All
                </motion.button>
                
                <motion.button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage; 
