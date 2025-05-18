import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faClock, faRotate, faHome, faSadTear, faRedo, faCalendarDay, faCheckCircle, faCoins, faCrosshairs, faUserCircle, faHandshake } from "@fortawesome/free-solid-svg-icons";
import Confetti from "./Confetti.jsx";
import { useState, useEffect } from "react";

function GameOver({ 
  result, 
  matchedPairs, 
  totalPairs, 
  onRestart, 
  onHome, 
  currentStats, 
  isDailyChallenge, 
  isDuel,
  duelInfo,
  duelResult,
  earnedPoints,
  onOpenLeaderboard,
  onOpenProfile
}) {
  // Create state to store the latest stats
  const [localStats, setLocalStats] = useState({
    gamesPlayed: currentStats?.gamesPlayed || parseInt(localStorage.getItem('gamesPlayed') || '0'),
    gamesWon: currentStats?.gamesWon || parseInt(localStorage.getItem('gamesWon') || '0'),
    bestTime: currentStats?.bestTime || parseInt(localStorage.getItem('bestTime') || '0'),
    winRate: currentStats?.winRate || 0,
    orngPoints: currentStats?.orngPoints || 0
  });
  
  // Update stats when props change
  useEffect(() => {
    if (currentStats) {
      setLocalStats(currentStats);
    }
  }, [currentStats]);
  
  // Listen for stats reset events
  useEffect(() => {
    const handleStatsReset = () => {
      setLocalStats({
        gamesPlayed: 0,
        gamesWon: 0,
        bestTime: null,
        winRate: 0,
        orngPoints: currentStats?.orngPoints || 0
      });
      console.log("Stats reset detected in GameOver");
    };
    
    // Add event listener
    window.addEventListener('statsReset', handleStatsReset);
    
    // Clean up
    return () => {
      window.removeEventListener('statsReset', handleStatsReset);
    };
  }, [currentStats]);
  
  const isWin = result === "win";
  const dailyChallengeCompleted = isDailyChallenge && isWin;
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {isWin && <Confetti />}
      
      <motion.div 
        className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-600 my-4 overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="text-center mb-8">
          {isWin ? (
            <>
              <motion.div 
                className="inline-block mb-4"
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: 1 }}
              >
                {isDuel ? (
                  <FontAwesomeIcon icon={faCrosshairs} className="text-red-400 text-5xl" />
                ) : dailyChallengeCompleted ? (
                  <FontAwesomeIcon icon={faCalendarDay} className="text-purple-400 text-5xl" />
                ) : (
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-5xl" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold text-green-400 mb-2">Congratulations!</h2>
              <p className="text-white text-lg">You matched all {totalPairs} pairs!</p>
              
              {/* Duel win result */}
              {isDuel && isWin && duelInfo && (
                <motion.div 
                  className="mt-4 bg-red-900/60 p-3 rounded-lg text-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center">
                    <div className="bg-black/30 p-2 rounded-full">
                      <FontAwesomeIcon icon={faUserCircle} className="text-green-400 text-lg" />
                    </div>
                    <div className="mx-2 font-bold text-white">VS</div>
                    <div className="bg-black/30 p-2 rounded-full">
                      <FontAwesomeIcon icon={faUserCircle} className="text-red-400 text-lg" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2 mb-1">
                    You defeated {duelInfo.opponent.name}!
                  </h3>
                  <p className="text-yellow-300 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCoins} className="mr-2" />
                    <span>+{duelInfo.betAmount} ORNG Points!</span>
                  </p>
                  <p className="text-xs text-green-300 mt-1">
                    Your opponent lost {duelInfo.betAmount} ORNG points
                  </p>
                  
                  {duelResult && duelResult.newRank && (
                    <p className="text-xs text-blue-300 mt-2">
                      New rank: #{duelResult.newRank} ({duelResult.currentPoints} points)
                    </p>
                  )}
                </motion.div>
              )}
              
              {/* ORNG Points earned - only show for non-duel wins */}
              {earnedPoints > 0 && !isDuel && (
                <motion.div 
                  className="mt-4 bg-orange-900/60 p-3 rounded-lg text-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-orange-200 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCoins} className="mr-2 text-yellow-400" />
                    <span>
                      {isDailyChallenge ? 
                        `Daily Challenge Bonus! +${earnedPoints} ORNG` : 
                        `+${earnedPoints} ORNG Points!`
                      }
                    </span>
                  </p>
                  <p className="text-xs text-orange-300 mt-1">
                    Your total: {localStats.orngPoints} points
                  </p>
                </motion.div>
              )}
              
              {dailyChallengeCompleted && (
                <motion.div 
                  className="mt-3 bg-purple-900/70 p-3 rounded-lg text-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-purple-200 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-400" />
                    <span>Daily Challenge Completed!</span>
                  </p>
                  <p className="text-xs text-purple-300 mt-1">
                    Challenge can only be completed once per day. Come back tomorrow for a new challenge!
                  </p>
                </motion.div>
              )}
              
              {localStats.bestTime && !isDuel && (
                <div className="mt-2 inline-block bg-indigo-900/50 px-4 py-2 rounded-lg">
                  <FontAwesomeIcon icon={faClock} className="text-indigo-400 mr-2" />
                  <span className="text-indigo-300">Best time: {localStats.bestTime}s</span>
                </div>
              )}
            </>
          ) : (
            <>
              <motion.div 
                className="inline-block mb-4"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isDuel ? (
                  <FontAwesomeIcon icon={faCrosshairs} className="text-red-400 text-5xl" />
                ) : isDailyChallenge ? (
                  <FontAwesomeIcon icon={faCalendarDay} className="text-purple-400 text-5xl" />
                ) : (
                  <FontAwesomeIcon icon={faSadTear} className="text-blue-400 text-5xl" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold text-red-400 mb-2">Game Over!</h2>
              <p className="text-white text-lg">You matched {matchedPairs} out of {totalPairs} pairs</p>
              
              {/* Duel loss result */}
              {isDuel && !isWin && duelInfo && (
                <motion.div 
                  className="mt-4 bg-red-900/60 p-3 rounded-lg text-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center">
                    <div className="bg-black/30 p-2 rounded-full">
                      <FontAwesomeIcon icon={faUserCircle} className="text-red-400 text-lg" />
                    </div>
                    <div className="mx-2 font-bold text-white">VS</div>
                    <div className="bg-black/30 p-2 rounded-full">
                      <FontAwesomeIcon icon={faUserCircle} className="text-green-400 text-lg" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2 mb-1">
                    You lost to {duelInfo.opponent.name}
                  </h3>
                  <p className="text-red-300 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCoins} className="mr-2" />
                    <span>-{duelInfo.betAmount} ORNG Points</span>
                  </p>
                  
                  {duelResult && duelResult.newRank && (
                    <p className="text-xs text-blue-300 mt-2">
                      New rank: #{duelResult.newRank} ({duelResult.currentPoints} points)
                    </p>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col">
          <h3 className="text-gray-300 font-semibold mb-3">
            Game Stats
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Games Played</p>
              <p className="font-bold text-white">{localStats.gamesPlayed || 0}</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="font-bold text-white">{localStats.winRate || 0}%</p>
            </div>
            {!isDuel && (
              <>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Best Time</p>
                  <p className="font-bold text-white">{localStats.bestTime ? `${localStats.bestTime}s` : "--"}</p>
                </div>
                <div className="bg-slate-700/50 p-3 rounded-lg text-center">
                  <p className="text-sm text-gray-400">ORNG Points</p>
                  <p className="font-bold text-orange-300">{localStats.orngPoints || 0}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {/* Don't show restart for daily challenge that was won */}
            {!(dailyChallengeCompleted || (isDuel && isWin)) && (
              <motion.button
                className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center"
                onClick={onRestart}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <FontAwesomeIcon icon={faRotate} className="mr-2" />
                Restart
              </motion.button>
            )}
            <motion.button
              className={`flex-1 py-3 px-5 ${
                dailyChallengeCompleted || (isDuel && isWin) ? "bg-green-600 hover:bg-green-500" : "bg-slate-600 hover:bg-slate-500"
              } text-white rounded-lg flex items-center justify-center`}
              onClick={onHome}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FontAwesomeIcon 
                icon={dailyChallengeCompleted || (isDuel && isWin) ? faHandshake : faHome} 
                className="mr-2" 
              />
              {dailyChallengeCompleted || (isDuel && isWin) ? "Awesome!" : "Home"}
            </motion.button>
          </div>
          
          {/* Leaderboard button */}
          {onOpenLeaderboard && (
            <motion.button
              className="w-full mt-3 py-3 px-5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg flex items-center justify-center"
              onClick={onOpenLeaderboard}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <FontAwesomeIcon icon={faTrophy} className="mr-2" />
              View Leaderboard
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default GameOver; 