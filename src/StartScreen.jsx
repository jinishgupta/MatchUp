import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGamepad, faInfoCircle, faClock, faLayerGroup } from "@fortawesome/free-solid-svg-icons";
import { playSound } from './sounds.js';

function StartScreen({ onStart, onDifficultyChange, selectedDifficulty, embedded = false }) {
  const difficulties = [
    { name: "Easy", time: 60, pairs: 6 },
    { name: "Medium", time: 60, pairs: 8 },
    { name: "Hard", time: 60, pairs: 9 }
  ];

  const handleDifficultyChange = (difficulty) => {
    playSound('click');
    onDifficultyChange(difficulty);
  };

  // When embedded, render a simplified version
  if (embedded) {
    return (
      <div className="w-full">
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((difficulty) => (
              <motion.button
                key={difficulty.name}
                className={`p-2 rounded-lg border-2 ${
                  selectedDifficulty === difficulty.name
                    ? "border-orange-400 bg-slate-700"
                    : "border-slate-500 bg-slate-800 hover:border-slate-400"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultyChange(difficulty.name)}
              >
                <div className="font-medium text-white">{difficulty.name}</div>
                <div className="text-xs flex flex-col items-center gap-1 mt-1 text-white">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} className="text-orange-300" />
                    {difficulty.time}s
                  </div>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-orange-300" />
                    {difficulty.pairs} pairs
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        <div className="mb-4 text-left bg-slate-700/70 p-4 rounded-lg">
          <h2 className="font-medium flex items-center gap-2 mb-2 text-orange-300">
            <FontAwesomeIcon icon={faInfoCircle} /> How to Play
          </h2>
          <ul className="text-sm text-white space-y-1 ml-6 list-disc">
            <li>Find matching pairs of cards</li>
            <li>Click on cards to flip them</li>
            <li>Remember card locations</li>
            <li>Match all pairs before time runs out</li>
          </ul>
        </div>
      </div>
    );
  }

  // Original standalone version
  return (
    <motion.div 
      className="flex justify-center items-center min-h-screen py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-slate-900/90 p-6 rounded-xl shadow-2xl border border-slate-700 max-w-md w-full"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <motion.h1 
          className="text-4xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          MatchUp
        </motion.h1>
        <p className="text-white mb-6 text-center">Memory Card Game</p>
        
        <div className="mb-8 text-left bg-slate-700/70 p-4 rounded-lg">
          <h2 className="font-medium flex items-center gap-2 mb-2 text-yellow-300">
            <FontAwesomeIcon icon={faInfoCircle} /> How to Play
          </h2>
          <ul className="text-sm text-white space-y-1 ml-6 list-disc">
            <li>Find matching pairs of cards</li>
            <li>Click on cards to flip them</li>
            <li>Remember card locations</li>
            <li>Match all pairs before time runs out</li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h2 className="font-medium flex items-center gap-2 mb-3 text-center text-white justify-center">
            <FontAwesomeIcon icon={faGamepad} className="text-yellow-300" /> Select Difficulty
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {difficulties.map((difficulty) => (
              <motion.button
                key={difficulty.name}
                className={`p-2 rounded-lg border-2 ${
                  selectedDifficulty === difficulty.name
                    ? "border-yellow-300 bg-slate-700"
                    : "border-slate-500 bg-slate-800 hover:border-slate-400"
                }`}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultyChange(difficulty.name)}
              >
                <div className="font-medium text-white">{difficulty.name}</div>
                <div className="text-xs flex flex-col items-center gap-1 mt-1 text-white">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} className="text-yellow-300" />
                    {difficulty.time}s
                  </div>
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faLayerGroup} className="text-yellow-300" />
                    {difficulty.pairs} pairs
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        
        <motion.button 
          className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white w-full py-3 text-lg rounded-lg font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            playSound('click');
            // Start game with the selected difficulty settings
            const settings = difficulties.find(d => d.name === selectedDifficulty);
            onStart(null);
          }}
        >
          Start Game
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default StartScreen; 