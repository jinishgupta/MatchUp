import React, { useEffect, useState } from 'react';
// Enable Orange ID integration
import { useBedrockPassport } from "@bedrock_org/passport";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faPlay, 
  faTrophy, 
  faGear, 
  faSignOutAlt, 
  faClock, 
  faGamepad, 
  faPercent,
  faCoins,
  faList
} from '@fortawesome/free-solid-svg-icons';
// Enable Orange ID integration
import { Profile } from './auth/index.jsx';
import StartScreen from '../StartScreen';
import DailyChallenge from './DailyChallenge';
import Duel from './Duel';
import { getPlayerPoints, getPlayerRank } from '../utils/leaderboard.js';

const HomePage = ({ 
  onStart, 
  onDifficultyChange, 
  selectedDifficulty, 
  onOpenProfile, 
  onOpenLeaderboard,
  gamesPlayed, 
  bestTime, 
  winRate,
  isDailyChallengeCompleted,
  username
}) => {
  // Enable Orange ID integration
  const { isLoggedIn, user, signOut } = useBedrockPassport();
  
  if (!isLoggedIn) {
    return null;
  }

  const handleLogout = async () => {
    // Enable Orange ID logout
    await signOut();
    window.location.reload();
  };

  const handleChallengeStart = (challengeInfo) => {
    // Set the difficulty based on challenge info
    onDifficultyChange(challengeInfo.difficulty);
    // Start the game with challenge settings by passing the challenge info
    onStart(challengeInfo);
  };
  
  // Get latest stats directly from localStorage to ensure they're up-to-date
  const getLatestStats = () => {
    const latestGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const latestGamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const latestBestTime = parseInt(localStorage.getItem('bestTime') || '0') || null;
    const latestWinRate = latestGamesPlayed > 0 
      ? Math.round((latestGamesWon / latestGamesPlayed) * 100) 
      : 0;
    const latestOrngPoints = getPlayerPoints();
    const playerRank = getPlayerRank();
      
    return {
      gamesPlayed: latestGamesPlayed,
      bestTime: latestBestTime,
      winRate: latestWinRate,
      orngPoints: latestOrngPoints,
      rank: playerRank.rank
    };
  };
  
  // Use state to track stats
  const [localStats, setLocalStats] = useState(getLatestStats());
  
  // Update stats when component mounts and when stats reset
  useEffect(() => {
    const refreshStats = () => {
      setLocalStats(getLatestStats());
      console.log("Stats refreshed in HomePage");
    };
    
    // Initial refresh
    refreshStats();
    
    // Listen for stats reset event
    window.addEventListener('statsReset', refreshStats);
    
    // Clean up
    return () => {
      window.removeEventListener('statsReset', refreshStats);
    };
  }, []);
  
  // Use local stats for display
  const displayGamesPlayed = localStats.gamesPlayed;
  const displayBestTime = localStats.bestTime;
  const displayWinRate = localStats.winRate;
  const displayOrngPoints = localStats.orngPoints;
  const displayRank = localStats.rank;
    
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-800 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Header with user profile */}
      <header className="p-4 flex justify-between items-center bg-slate-800 bg-opacity-70 backdrop-blur-sm">
        <div className="flex items-center">
          <motion.img 
            src="https://irp.cdn-website.com/e81c109a/dms3rep/multi/orange-web3-logo-v2a-20241018.svg"
            alt="Memory Game" 
            className="h-10 mr-3"
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5 }}
          />
          <h1 className="text-2xl font-bold text-orange-400">MatchUp</h1>
        </div>
        
        {/* User profile buttons */}
        <div className="profile-section flex items-center gap-2">
          <motion.button 
            onClick={onOpenLeaderboard}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors text-white flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faTrophy} className="mr-2" />
            Leaderboard
          </motion.button>
          
          <motion.button 
            onClick={onOpenProfile}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors text-white flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Profile
          </motion.button>
          
          <button 
            onClick={handleLogout}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Logout
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-10 max-w-6xl">
        {/* Welcome section */}
        <motion.section 
          className="text-center mb-16"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
            Welcome to Memory Game!
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto">
            Challenge your memory with our exciting card matching game. Match all the pairs before time runs out!
          </p>
        </motion.section>
        
        {/* Game options and Stats in a two-column layout */}
        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {/* Left column - Game Settings */}
          <motion.div 
            className="bg-slate-800 bg-opacity-60 p-8 rounded-2xl shadow-lg border border-slate-700 md:col-span-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <FontAwesomeIcon icon={faGear} className="mr-3 text-orange-400" />
              Game Settings
            </h3>
            
            <StartScreen 
              onStart={() => onStart(null)} 
              onDifficultyChange={onDifficultyChange}
              selectedDifficulty={selectedDifficulty}
              embedded={true}
            />
          </motion.div>
          
          {/* Right column - Game Options */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Daily Challenge */}
            <DailyChallenge 
              onStart={handleChallengeStart} 
              isCompleted={isDailyChallengeCompleted}
            />
            
            {/* Duel Mode */}
            <Duel 
              onStart={handleChallengeStart}
              isDisabled={isDailyChallengeCompleted === false}
            />
          </motion.div>
        </div>
        
        {/* Stats Section */}
        <motion.div 
          className="bg-slate-800 bg-opacity-60 p-8 rounded-2xl shadow-lg border border-slate-700 mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold flex items-center">
              <FontAwesomeIcon icon={faTrophy} className="mr-3 text-yellow-400" />
              Your Stats
            </h3>
            
            <div className="flex gap-2">
              <motion.button
                onClick={onOpenLeaderboard}
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faList} className="mr-2" />
                View Leaderboard
              </motion.button>
              
              <motion.button
                onClick={onOpenProfile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                View Full Profile
              </motion.button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faGamepad} className="text-indigo-400 mr-3" />
                <span className="text-lg">Games Played</span>
              </div>
              <span className="font-bold text-2xl text-white">{displayGamesPlayed}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="text-green-400 mr-3" />
                <span className="text-lg">Best Time</span>
              </div>
              <span className="font-bold text-2xl text-white">{displayBestTime ? `${displayBestTime}s` : "--"}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faPercent} className="text-blue-400 mr-3" />
                <span className="text-lg">Win Rate</span>
              </div>
              <span className="font-bold text-2xl text-white">{displayWinRate}%</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCoins} className="text-yellow-400 mr-3" />
                <span className="text-lg">ORNG Points</span>
              </div>
              <span className="font-bold text-2xl text-orange-300">{displayOrngPoints}</span>
            </div>
          </div>
        </motion.div>
        
        {/* Play button */}
        <motion.button
          onClick={() => onStart(null)}
          className="w-full mt-4 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg flex items-center justify-center text-xl transition-all"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <FontAwesomeIcon icon={faPlay} className="mr-3" />
          Play Now
        </motion.button>
      </main>
      
      {/* Footer */}
      <footer className="mt-12 p-4 text-center">
        <p className="opacity-70 text-sm">© 2024 MatchUp | Powered by Orange ID</p>
      </footer>
    </motion.div>
  );
};

export default HomePage; 
