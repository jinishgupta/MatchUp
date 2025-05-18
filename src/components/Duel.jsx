import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCrosshairs, 
  faCoins, 
  faUserGroup, 
  faArrowRight, 
  faHistory, 
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import { 
  getLeaderboard, 
  getPlayerPoints, 
  getChallengeHistory, 
  getChallengeStats 
} from '../utils/leaderboard.js';

const Duel = ({ onStart, isDisabled }) => {
  const [expanded, setExpanded] = useState(false);
  const [opponents, setOpponents] = useState([]);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [playerPoints, setPlayerPoints] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [challengeHistory, setChallengeHistory] = useState([]);
  const [challengeStats, setChallengeStats] = useState(null);

  // Load opponents and player points when component mounts
  useEffect(() => {
    loadOpponentsList();
    loadChallengeData();
  }, []);

  // Load opponents list from leaderboard
  const loadOpponentsList = () => {
    setIsLoading(true);
    
    // Get the full leaderboard
    const leaderboard = getLeaderboard();
    
    // Filter out the current player and get up to 5 potential opponents
    // In a real app, this would be replaced with server-side opponent matching
    const filteredOpponents = leaderboard
      .filter(player => player.id !== localStorage.getItem('orngPlayerId'))
      .slice(0, 5)
      .map(player => ({
        ...player,
        // Add random avatar for demo purposes
        avatar: `https://i.pravatar.cc/100?u=${player.id}`
      }));
      
    setOpponents(filteredOpponents);
    setPlayerPoints(getPlayerPoints());
    setIsLoading(false);
  };
  
  // Load challenge history and stats
  const loadChallengeData = () => {
    const history = getChallengeHistory();
    const stats = getChallengeStats();
    
    setChallengeHistory(history);
    setChallengeStats(stats);
  };

  // Handle opponent selection
  const handleSelectOpponent = (opponent) => {
    setSelectedOpponent(opponent);
  };

  // Handle bet amount change
  const handleBetChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 10) {
      setBetAmount(Math.min(value, playerPoints));
    }
  };

  // Start the duel
  const handleStartDuel = () => {
    if (!selectedOpponent || betAmount <= 0 || betAmount > playerPoints) {
      return;
    }
    
    // Prepare challenge info
    const challengeInfo = {
      isDuel: true,
      difficulty: 'Medium', // Default difficulty for duels
      time: 60, // Default time limit
      pairs: 8, // Default number of pairs
      opponent: selectedOpponent,
      betAmount: betAmount
    };
    
    // Reset states
    setSelectedOpponent(null);
    setBetAmount(50);
    setExpanded(false);
    
    // Start the game with challenge info
    onStart(challengeInfo);
  };

  return (
    <motion.div
      className={`bg-slate-800 bg-opacity-60 rounded-2xl shadow-lg border ${expanded ? 'border-orange-500' : 'border-slate-700'} overflow-hidden`}
      animate={{ height: expanded ? 'auto' : '130px' }}
      transition={{ duration: 0.3 }}
    >
      {/* Header section */}
      <div 
        className={`p-5 cursor-pointer ${expanded ? 'bg-gradient-to-r from-orange-900/40 to-slate-800' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-orange-600/20 p-3 rounded-lg mr-4">
              <FontAwesomeIcon 
                icon={faCrosshairs} 
                className="text-orange-500" 
                size="lg" 
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-400">Duel Mode</h3>
              <p className="text-sm text-gray-300">Challenge other players and bet ORNG points</p>
            </div>
          </div>
          <div>
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <FontAwesomeIcon 
                icon={faArrowRight} 
                className="text-orange-400" 
              />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Expanded content */}
      <div className="px-5 pb-5">
        {/* Duel info */}
        <div className="mb-5">
          <p className="text-sm text-gray-300 mb-3">
            Challenge other players to a memory game duel. The winner takes the bet amount from the loser!
          </p>
          
          <div className="flex justify-between mb-4">
            <motion.button
              className={`flex-1 py-2 px-3 ${!showHistory ? 'bg-orange-600' : 'bg-slate-700'} rounded-l-lg border-r border-slate-600 flex items-center justify-center`}
              onClick={() => setShowHistory(false)}
              whileHover={{ backgroundColor: showHistory ? 'rgba(226, 139, 43, 0.3)' : undefined }}
            >
              <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
              Challenge
            </motion.button>
            <motion.button
              className={`flex-1 py-2 px-3 ${showHistory ? 'bg-orange-600' : 'bg-slate-700'} rounded-r-lg flex items-center justify-center`}
              onClick={() => setShowHistory(true)}
              whileHover={{ backgroundColor: !showHistory ? 'rgba(226, 139, 43, 0.3)' : undefined }}
            >
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              History
            </motion.button>
          </div>
        </div>
        
        {!showHistory ? (
          <>
            {/* Your points */}
            <div className="bg-black/20 p-3 rounded-lg mb-4 flex justify-between items-center">
              <span className="text-gray-300">Your Points:</span>
              <span className="font-bold text-orange-300">
                <FontAwesomeIcon icon={faCoins} className="text-yellow-400 mr-2" />
                {playerPoints} ORNG
              </span>
            </div>
            
            {/* Opponents list */}
            <h4 className="font-semibold mb-2 text-white">Select Opponent:</h4>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4 text-gray-400">Loading opponents...</div>
              ) : opponents.length === 0 ? (
                <div className="text-center py-4 text-gray-400">No opponents available</div>
              ) : (
                opponents.map(opponent => (
                  <motion.div
                    key={opponent.id}
                    className={`p-3 rounded-lg flex items-center cursor-pointer ${selectedOpponent?.id === opponent.id ? 'bg-orange-700/40 border border-orange-500' : 'bg-slate-700/50 border border-transparent'}`}
                    onClick={() => handleSelectOpponent(opponent)}
                    whileHover={{ backgroundColor: 'rgba(226, 139, 43, 0.2)' }}
                  >
                    <img 
                      src={opponent.avatar} 
                      alt={opponent.name} 
                      className="w-10 h-10 rounded-full mr-3 border-2 border-slate-600" 
                    />
                    <div className="flex-1">
                      <h5 className="font-medium">{opponent.name}</h5>
                      <p className="text-sm text-gray-400">{opponent.points} ORNG</p>
                    </div>
                    {selectedOpponent?.id === opponent.id && (
                      <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center">
                        <FontAwesomeIcon icon={faArrowRight} className="text-white text-xs" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
            
            {/* Bet amount */}
            <h4 className="font-semibold mb-2 text-white">Bet Amount:</h4>
            <div className="flex items-center mb-5">
              <FontAwesomeIcon icon={faCoins} className="text-yellow-400 mr-2" />
              <input
                type="number"
                value={betAmount}
                onChange={handleBetChange}
                min={10}
                max={playerPoints}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 w-full text-white"
                disabled={!selectedOpponent}
              />
            </div>
            
            {/* Start duel button */}
            <motion.button
              onClick={handleStartDuel}
              disabled={!selectedOpponent || betAmount <= 0 || betAmount > playerPoints || isDisabled}
              className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center ${!selectedOpponent || betAmount <= 0 || betAmount > playerPoints || isDisabled ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-orange-600 hover:bg-orange-500'}`}
              whileHover={selectedOpponent && betAmount > 0 && betAmount <= playerPoints && !isDisabled ? { scale: 1.02 } : {}}
              whileTap={selectedOpponent && betAmount > 0 && betAmount <= playerPoints && !isDisabled ? { scale: 0.98 } : {}}
            >
              <FontAwesomeIcon icon={faCrosshairs} className="mr-2" />
              Start Duel
            </motion.button>
            
            {isDisabled && (
              <p className="text-sm text-orange-400 mt-2 text-center">
                Complete the daily challenge before starting a duel!
              </p>
            )}
          </>
        ) : (
          <>
            {/* Duel history */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3 text-white flex items-center">
                <FontAwesomeIcon icon={faChartBar} className="mr-2 text-orange-400" />
                Duel Stats
              </h4>
              
              {challengeStats ? (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Win/Loss</p>
                    <p className="font-bold text-lg">
                      <span className="text-green-400">{challengeStats.wins}</span>
                      <span className="text-gray-400"> / </span>
                      <span className="text-red-400">{challengeStats.losses}</span>
                    </p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Win Rate</p>
                    <p className="font-bold text-lg text-white">{challengeStats.winRate}%</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Points Earned</p>
                    <p className="font-bold text-lg text-green-400">+{challengeStats.pointsEarned}</p>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Points Lost</p>
                    <p className="font-bold text-lg text-red-400">-{challengeStats.pointsLost}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">No stats available</div>
              )}
              
              <h4 className="font-semibold mb-2 text-white flex items-center">
                <FontAwesomeIcon icon={faHistory} className="mr-2 text-orange-400" />
                Recent Duels
              </h4>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {challengeHistory.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">No duel history yet</div>
                ) : (
                  challengeHistory.map((challenge, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${challenge.outcome === 'win' ? 'border-green-500/30 bg-green-900/10' : 'border-red-500/30 bg-red-900/10'}`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">vs {challenge.opponent}</span>
                        <span className={`font-medium ${challenge.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                          {challenge.outcome === 'win' ? 'WIN' : 'LOSS'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {new Date(challenge.date).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {challenge.outcome === 'win' 
                            ? <span className="text-green-400">+{challenge.pointsEarned} ORNG</span>
                            : <span className="text-red-400">-{challenge.pointsLost} ORNG</span>
                          }
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Refresh button */}
            <motion.button
              onClick={() => {
                loadOpponentsList();
                loadChallengeData();
              }}
              className="w-full py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Refresh Data
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Duel; 