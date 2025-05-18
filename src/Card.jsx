import React from 'react';
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Card({ card, index, isFlipped, isMatched, isShaking, onClick }) {
  const handleClick = () => {
    if (!isFlipped) {
      onClick(index);
    }
  };

  return (
    <div className="flip-card-container w-full aspect-square">
      <div 
        className={`flip-card ${isFlipped ? 'flipped' : ''}`}
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : '',
          WebkitTransform: isFlipped ? 'rotateY(180deg)' : ''
        }}
      >
        <motion.div 
          className="flip-card-front"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.75rem',
            borderWidth: '2px',
            borderStyle: 'solid',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderColor: '#475569',
            zIndex: 2
          }}
          animate={{ 
            boxShadow: isMatched ? "0 0 10px 3px rgba(167, 243, 208, 0.7)" : "none",
            x: isShaking ? [0, -5, 5, -5, 5, 0] : 0
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
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.75rem',
            borderWidth: '2px',
            borderStyle: 'solid',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            borderColor: '#4338ca',
            transform: 'rotateY(180deg)',
            WebkitTransform: 'rotateY(180deg)',
            zIndex: 1
          }}
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
      </div>
    </div>
  );
}

export default Card;