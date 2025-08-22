import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function Confetti() {
  const [confetti, setConfetti] = useState([]);
  
  useEffect(() => {
    // Generate random confetti pieces
    const pieces = [];
    const colors = [
      '#FFD700', // Gold
      '#FF4500', // Orange-Red
      '#1E90FF', // Dodger Blue
      '#32CD32', // Lime Green
      '#FF1493', // Deep Pink
      '#8A2BE2', // Blue Violet
      '#00FFFF', // Cyan
    ];
    
    // Create 100 confetti pieces
    for (let i = 0; i < 100; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // random x position (0-100%)
        size: Math.random() * 10 + 5, // random size (5-15px)
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * 3 + 2, // random duration (2-5s)
        delay: Math.random() * 0.5, // random delay (0-0.5s)
      });
    }
    
    setConfetti(pieces);
    
    // Clean up confetti after 6 seconds
    const timer = setTimeout(() => {
      setConfetti([]);
    }, 6000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}vw`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: '50%',
          }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ 
            y: '100vh', 
            opacity: [0, 1, 1, 0.5, 0],
            rotate: Math.random() > 0.5 ? 360 : -360
          }}
          transition={{ 
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

export default Confetti; 