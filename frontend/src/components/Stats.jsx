import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy, faClock, faGamepad, faPercent, faUser } from "@fortawesome/free-solid-svg-icons";

const Stats = ({ gamesPlayed, bestTime, winRate, onViewProfile }) => {
  return (
    <motion.div 
      className="bg-slate-800/60 p-6 rounded-xl shadow-lg border border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FontAwesomeIcon icon={faTrophy} className="mr-3 text-yellow-400" />
          Your Stats
        </h3>
        
        {onViewProfile && (
          <motion.button
            onClick={onViewProfile}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            View Profile
          </motion.button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faGamepad} className="text-indigo-400 mr-3" />
            <span className="text-lg">Games Played</span>
          </div>
          <span className="font-bold text-2xl text-white">{gamesPlayed}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="text-green-400 mr-3" />
            <span className="text-lg">Best Time</span>
          </div>
          <span className="font-bold text-2xl text-white">{bestTime ? `${bestTime}s` : "--"}</span>
        </div>
        
        <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faPercent} className="text-orange-400 mr-3" />
            <span className="text-lg">Win Rate</span>
          </div>
          <span className="font-bold text-2xl text-white">{winRate}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default Stats; 