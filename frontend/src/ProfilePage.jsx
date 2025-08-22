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
  faEnvelope,
  faLink
} from "@fortawesome/free-solid-svg-icons";

import { useWeb3 } from './contexts/Web3Context.jsx';
import { gameService } from './web3/gameService.js';

const ProfilePage = ({ onBack }) => {
  const { address, isConnected } = useWeb3();
  
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

  // State for blockchain data
  const [blockchainStats, setBlockchainStats] = useState({
    userData: null,
    rank: 0,
    totalUsers: 0,
    totalGames: 0
  });
  
  // State for reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);
  
  // Load all stats from localStorage and blockchain on component mount
  useEffect(() => {
    console.log('👤 ProfilePage: Component mounted, loading stats...', { address, isConnected });
    loadAllStats();
    loadBlockchainStats();
    
    // Initialize display name from address
    if (address) {
      setNewDisplayName(address.slice(0, 6) + '...' + address.slice(-4));
    }
    
    // Listen for game recorded events to refresh blockchain stats
    const handleGameRecorded = (event) => {
      console.log('🎮 ProfilePage: Game recorded event received:', event.detail);
      console.log('🔄 ProfilePage: Auto-refreshing blockchain stats due to new game...');
      loadBlockchainStats();
    };
    
    window.addEventListener('gameRecorded', handleGameRecorded);
    
    return () => {
      console.log('🧹 ProfilePage: Cleaning up gameRecorded event listener...');
      window.removeEventListener('gameRecorded', handleGameRecorded);
    };
  }, [address, isConnected]);
  
  // Function to load blockchain stats
  const loadBlockchainStats = async () => {
    if (!isConnected || !address) {
      console.log('ℹ️ ProfilePage: Skipping blockchain stats - not connected or no address');
      return;
    }

    try {
      console.log('🔗 ProfilePage: Loading blockchain stats for address:', address);
      
      // Get user data from smart contract
      console.log('📝 ProfilePage: Calling gameService.getUser()...');
      const userData = await gameService.getUser(address);
      console.log('📊 ProfilePage: User data from blockchain:', userData);
      
      if (userData) {
        setBlockchainStats(prev => ({ ...prev, userData }));
      }
      
      // Get user rank
      console.log('🥇 ProfilePage: Calling gameService.getUserRank()...');
      const rank = await gameService.getUserRank(address);
      console.log('🏆 ProfilePage: User rank from blockchain:', rank);
      
      // Get total users and games
      console.log('👥 ProfilePage: Calling gameService.getTotalUsers()...');
      const totalUsers = await gameService.getTotalUsers();
      console.log('📊 ProfilePage: Total users from blockchain:', totalUsers);
      
      console.log('🎮 ProfilePage: Calling gameService.getTotalGames()...');
      const totalGames = await gameService.getTotalGames();
      console.log('📊 ProfilePage: Total games from blockchain:', totalGames);
      
      setBlockchainStats({
        userData,
        rank,
        totalUsers,
        totalGames
      });
      
      console.log('✅ ProfilePage: Blockchain stats loaded successfully');
    } catch (error) {
      console.error('❌ ProfilePage: Error loading blockchain stats:', error);
      console.error('🔍 ProfilePage: Blockchain stats error details:', {
        message: error.message,
        stack: error.stack,
        address: address
      });
    }
  };
  
  // Function to load all stats from localStorage
  const loadAllStats = () => {
    console.log('📱 ProfilePage: Loading localStorage stats...');
    
    // Load basic stats
    const loadedGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const loadedGamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const loadedBestTime = parseInt(localStorage.getItem('bestTime') || '0');
    const joinedDate = localStorage.getItem('joinedDate') || new Date().toISOString();
    const lastPlayed = localStorage.getItem('lastPlayed') || null;
    
    console.log('📊 ProfilePage: LocalStorage basic stats:', {
      gamesPlayed: loadedGamesPlayed,
      gamesWon: loadedGamesWon,
      bestTime: loadedBestTime,
      joinedDate,
      lastPlayed
    });
    
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
      const result = await updateDisplayName(newDisplayName);
      
      if (result.success) {
        setNameUpdateStatus({ 
          message: 'Name updated successfully! Transaction submitted.', 
          isError: false 
        });
        
        // Exit edit mode
        setTimeout(() => {
          setIsEditingName(false);
          setShowNameStatus(false);
        }, 2000);
      } else {
        setNameUpdateStatus({ 
          message: result.error || 'Failed to update name', 
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
                {blockchainStats.userData?.displayName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'You')}
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

              <p className="text-slate-400">
                Player since {blockchainStats.userData?.joinedAt 
                  ? new Date(Number(blockchainStats.userData.joinedAt) * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : formatDate(stats.joinedDate)
                }
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-slate-700/40 p-4 rounded-xl">
              <FontAwesomeIcon icon={faClock} className="text-blue-400 mb-2" />
              <p className="text-sm text-slate-400">Last Played</p>
              <p className="text-white font-medium">
                {blockchainStats.userData?.lastGameAt 
                  ? new Date(Number(blockchainStats.userData.lastGameAt) * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : formatDate(stats.lastPlayed)
                }
              </p>
            </div>
            
            <div className="bg-slate-700/40 p-4 rounded-xl">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 mb-2" />
              <p className="text-sm text-slate-400">Daily Challenge Streak</p>
              <p className="text-white font-medium">
                {blockchainStats.userData?.gamesWon > 0 ? 'Active' : '0'} days
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
              <p className="text-4xl font-bold text-white">{blockchainStats.userData?.gamesPlayed || stats.gamesPlayed}</p>
            </div>
            
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600 text-center">
              <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-3xl mb-3" />
              <h3 className="text-slate-300 mb-2">Games Won</h3>
              <p className="text-4xl font-bold text-white">{blockchainStats.userData?.gamesWon || stats.gamesWon}</p>
            </div>
            
            <div className="bg-slate-700/50 p-5 rounded-xl border border-slate-600 text-center">
              <FontAwesomeIcon icon={faPercent} className="text-green-400 text-3xl mb-3" />
              <h3 className="text-slate-300 mb-2">Win Rate</h3>
              <p className="text-4xl font-bold text-white">
                {blockchainStats.userData && blockchainStats.userData.gamesPlayed > 0 
                  ? Math.round((blockchainStats.userData.gamesWon / blockchainStats.userData.gamesPlayed) * 100)
                  : winRate}%
              </p>
            </div>
          </div>
        </motion.div>
        

        
        {/* Additional Blockchain Info */}
        {blockchainStats.userData && (
          <motion.div 
            className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
              <FontAwesomeIcon icon={faLink} className="mr-3 text-blue-400" />
              Additional Info
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400">Best Time</p>
                <p className="text-lg font-bold text-blue-400">
                  {blockchainStats.userData.bestTime > 0 
                    ? `${blockchainStats.userData.bestTime}s`
                    : (stats.bestTime ? `${stats.bestTime}s` : '--')}
                </p>
              </div>
              
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400">Total Points</p>
                <p className="text-lg font-bold text-yellow-300">
                  {blockchainStats.userData.totalPoints || 0}
                </p>
              </div>
                            
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400">Global Rank</p>
                <p className="text-lg font-bold text-indigo-400">
                  #{blockchainStats.rank || '--'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
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
