import React from 'react';
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Card({ card, index, isFlipped, isMatched, isShaking, onClick }) {
  // Handle touch start - prevent default to avoid issues with scrolling
  const handleTouchStart = (e) => {
    if (!isFlipped) {
      // Prevent scrolling when touching a card
      e.preventDefault();
    }
  };

  return (
    <div className="flip-card-container w-full aspect-square">
      <motion.div 
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => !isFlipped && onClick(index)}
        onTouchStart={handleTouchStart}
        whileHover={!isFlipped ? { scale: 1.03 } : {}}
        whileTap={!isFlipped ? { scale: 0.98 } : {}}
        style={{ touchAction: isFlipped ? 'auto' : 'none' }}
      >
        <motion.div 
          className="flip-card-front"
          animate={{ 
            boxShadow: isMatched ? "0 0 10px 3px rgba(167, 243, 208, 0.7)" : "none",
            x: isShaking ? [0, -5, 5, -5, 5, 0] : 0,
          }}
          transition={{ 
            x: { duration: 0.5 },
            boxShadow: { duration: 0.3 }
          }}
        >
          <motion.div 
            className="text-center font-bold text-xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3, repeatType: "loop" }}
          >
            <span className="text-yellow-300">Match</span>
            <span className="text-white">Up</span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flip-card-back"
          animate={{ 
            boxShadow: isMatched ? "0 0 15px 5px rgba(167, 243, 208, 0.7)" : "none"
          }}
        >
          <motion.div
            animate={{ 
              scale: isFlipped ? 1 : 0.8, 
              opacity: isFlipped ? 1 : 0,
              rotate: isMatched ? [0, 5, -5, 5, -5, 0] : 0
            }}
            transition={{ 
              scale: { duration: 0.3 },
              rotate: { duration: 0.5, repeat: isMatched ? 1 : 0 }
            }}
          >
            <FontAwesomeIcon 
              icon={card.icon} 
              size="3x" 
              className={isMatched ? "text-green-300" : "text-yellow-300"} 
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Card;