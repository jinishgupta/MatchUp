import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./components/Card.jsx";
import StartScreen from "./components/StartScreen.jsx";
import GameOver from "./components/GameOver.jsx";
import GameHeader from "./components/GameHeader.jsx";
import Stats from "./components/Stats.jsx";
import ProfilePage from "./ProfilePage.jsx";
import Leaderboard from "./Leaderboard.jsx";
import WalletConnect from "./components/WalletConnect.jsx";
import { playSound, toggleSound, isSoundEnabled, resumeAudio } from './sounds.js';
import { calculatePoints } from './utils/leaderboard.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark, faPlay } from "@fortawesome/free-solid-svg-icons";
import {
  faBitcoin, faCss3Alt, faEthereum, faGithub,
  faHtml5, faJava, faLinux, faReact, faJs, 
  faPython, faNode, faDocker, faPhp, faVuejs,
  faAngular, faBootstrap, faUbuntu, faApple
} from "@fortawesome/free-brands-svg-icons";
import HomePage from "./HomePage.jsx";
import { ErrorBoundary } from 'react-error-boundary';
import { useWeb3 } from './contexts/Web3Context.jsx';

function Web3ErrorFallback({ error, resetError }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex flex-col items-center justify-center p-4 text-white">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Web3 Connection Error</h2>
      <p className="mb-4 text-center">{error.message}</p>
      <p className="text-sm text-gray-400 mb-6 text-center">Try refreshing the page or checking your wallet connection</p>
      <div className="flex gap-4">
        <button 
          onClick={resetError}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

function UserRegistration({ onRegister }) {
  const [displayName, setDisplayName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { loading } = useWeb3();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (displayName.trim() && !isRegistering) {
      setIsRegistering(true);
      await onRegister(displayName.trim());
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex flex-col items-center justify-center p-4">
      <motion.div 
        className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 max-w-md w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-2">
            Welcome to MatchUp!
          </h1>
          <p className="text-slate-300">
            Choose your display name to get started on the blockchain
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white text-lg mb-2">Display Name:</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter your name"
              maxLength={50}
              required
              disabled={isRegistering || loading}
            />
          </div>

          <button 
            type="submit"
            disabled={!displayName.trim() || isRegistering || loading}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              (!displayName.trim() || isRegistering || loading)
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl'
            }`}
            whileHover={(!displayName.trim() || isRegistering || loading) ? {} : { scale: 1.02 }}
            whileTap={(!displayName.trim() || isRegistering || loading) ? {} : { scale: 0.98 }}
          >
            {isRegistering ? 'Registering...' : 'Start Playing!'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}



function App() {
  const {
    isConnected,
    isCorrectNetwork,
    user,
    isRegistered,
    registerUser,
    recordGame,
    loading,
    error,
    switchNetwork,
    address
  } = useWeb3();

  // All available icons for cards
  const allIcons = [
    faBitcoin, faCss3Alt, faEthereum, faGithub, faHtml5, 
    faJava, faLinux, faReact, faJs, faPython, faNode, 
    faDocker, faPhp, faVuejs, faAngular, faBootstrap, 
    faUbuntu, faApple
  ];
  
  // Game state
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [shakeCard, setShakeCard] = useState(null);
  const [disableClicks, setDisableClicks] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState("Medium");
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const timerRef = useRef(null);
  const [earnedPoints, setEarnedPoints] = useState(0);

  // Stats tracking
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const initialTimeRef = useRef(0);
  
  // Add state for profile page and leaderboard
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Current game stats
  const [currentStats, setCurrentStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: null,
    winRate: 0,
    totalPoints: 0
  });

  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Transaction loading state
  const [isRecordingGame, setIsRecordingGame] = useState(false);

  // Load stats from localStorage on component mount
  useEffect(() => {
    const loadedGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const loadedGamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const loadedBestTime = parseInt(localStorage.getItem('bestTime') || '0');
    
    setGamesPlayed(loadedGamesPlayed);
    setGamesWon(loadedGamesWon);
    setBestTime(loadedBestTime || null);
    
    const winRate = loadedGamesPlayed > 0 
      ? Math.round((loadedGamesWon / loadedGamesPlayed) * 100)
      : 0;
      
    setCurrentStats({
      gamesPlayed: loadedGamesPlayed,
      gamesWon: loadedGamesWon,
      bestTime: loadedBestTime || null,
      winRate: winRate,
      totalPoints: user?.totalPoints || 0
    });
  }, [user]);

  // Update stats when user data changes
  useEffect(() => {
    if (user) {
      setCurrentStats(prev => ({
        ...prev,
        totalPoints: user.totalPoints || 0
      }));
    }
  }, [user]);
  
  // Difficulty settings
  const difficultySettings = {
    Easy: { time: 60, pairs: 6 },
    Medium: { time: 60, pairs: 8 },
    Hard: { time: 60, pairs: 9 }
  };

  const generateShuffledCards = (pairCount) => {
    const selectedIcons = allIcons.slice(0, pairCount);
    let id = 0;
    const duplicatedIcons = [...selectedIcons, ...selectedIcons];
    
    const cards = duplicatedIcons
      .map(icon => {
        const matchId = icon && icon.iconName ? icon.iconName : `card-${id % pairCount}`;
        const card = { icon, id: id++, matchId };
        return card;
      })
      .sort(() => Math.random() - 0.5);
    
    return cards;
  };

  const startGame = (challengeInfo = null) => {
    if (challengeInfo) {
      setIsDailyChallenge(true);
      setDifficulty(challengeInfo.difficulty);
      
      const time = challengeInfo.time;
      const pairs = challengeInfo.pairs;
      
      setTimer(time);
      initialTimeRef.current = time;
      setCards(generateShuffledCards(pairs));
    } else {
      setIsDailyChallenge(false);
      const { time, pairs } = difficultySettings[difficulty];
      
      setTimer(time);
      initialTimeRef.current = time;
      setCards(generateShuffledCards(pairs));
    }
    
    setFlippedCards([]);
    setMatchedCards([]);
    setGameStarted(true);
    setIsRunning(true);
    setGameOver(false);
    setResult(null);
    setEarnedPoints(0);
    playSound('start');
  };

  const restartGame = () => {
    setDisableClicks(true);
    setIsRunning(false);
    setIsPaused(false);
    setFlippedCards([]);
    setMatchedCards([]);
    setGameOver(false);
    setResult(null);
    setEarnedPoints(0);
    
    const time = isDailyChallenge 
      ? (JSON.parse(localStorage.getItem('currentDailyChallenge') || '{}').time || difficultySettings[difficulty].time)
      : difficultySettings[difficulty].time;
    const pairs = isDailyChallenge 
      ? (JSON.parse(localStorage.getItem('currentDailyChallenge') || '{}').pairs || difficultySettings[difficulty].pairs)
      : difficultySettings[difficulty].pairs;
    
    setTimer(time);
    initialTimeRef.current = time;
    
    setTimeout(() => {
      setCards(generateShuffledCards(pairs));
      setDisableClicks(false);
      setIsRunning(true);
      playSound('start');
    }, 500);
  };

  const returnToHome = () => {
    setGameStarted(false);
    setIsRunning(false);
    setIsPaused(false);
    setGameOver(false);
    setIsDailyChallenge(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    playSound('click');
  };
  
  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    playSound('click');
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    setDisableClicks(!isPaused);
    playSound('click');
  };

  const handleUserRegistration = async (displayName) => {
    console.log('👤 App: Starting user registration process...', { displayName });
    try {
      console.log('📝 App: Calling registerUser function...');
      const result = await registerUser(displayName);
      if (result.success) {
        console.log('✅ App: User registration successful!', {
          hash: result.hash,
          displayName: displayName
        });
        return result;
      } else {
        console.error('❌ App: User registration failed:', {
          error: result.error,
          displayName: displayName
        });
        return result;
      }
    } catch (error) {
      console.error('❌ App: Error during user registration:', {
        message: error.message,
        stack: error.stack,
        displayName: displayName
      });
      return { success: false, error: error.message };
    }
  };

  // Update game stats and record on blockchain
  const updateGameStats = async (isWin) => {
    console.log('🎮 App: Updating game stats...', {
      isWin,
      difficulty,
      isDailyChallenge,
      isRegistered
    });
    
    const newGamesPlayed = gamesPlayed + 1;
    setGamesPlayed(newGamesPlayed);
    localStorage.setItem('gamesPlayed', newGamesPlayed.toString());
    
    let newGamesWon = gamesWon;
    let newBestTime = bestTime;
    let earnedOrngPoints = 0;
    let timeSpent = 0;
    
    if (isWin) {
      timeSpent = initialTimeRef.current - timer;
      newGamesWon = gamesWon + 1;
      setGamesWon(newGamesWon);
      localStorage.setItem('gamesWon', newGamesWon.toString());
      
      if (!bestTime || timeSpent < bestTime) {
        newBestTime = timeSpent;
        setBestTime(timeSpent);
        localStorage.setItem('bestTime', timeSpent.toString());
        console.log('🏆 App: New best time achieved!', { newBestTime, previousBest: bestTime });
      }
      
      // Calculate points
      earnedOrngPoints = calculatePoints(difficulty, isDailyChallenge);
      setEarnedPoints(earnedOrngPoints);
      console.log('💰 App: Points earned:', { earnedOrngPoints, difficulty, isDailyChallenge });
    }

    // Always record game on blockchain after every game
    if (isConnected && address) {
      try {
        console.log('📝 App: Recording game on blockchain...', {
          isWin,
          difficulty,
          timeSpent,
          isDailyChallenge,
          address
        });
        
        // Set loading state for transaction
        setIsRecordingGame(true);
        
        // Convert difficulty string to number using gameService
        let difficultyNum = 1; // Medium default
        if (difficulty === "Easy") difficultyNum = 0;
        else if (difficulty === "Medium") difficultyNum = 1;
        else if (difficulty === "Hard") difficultyNum = 2;
        
        console.log('🎯 App: Difficulty conversion:', { original: difficulty, numeric: difficultyNum });
        
        // Show loading state for transaction
        console.log('⏳ App: Waiting for user to sign transaction...');
        
        const result = await recordGame(isWin, difficultyNum, timeSpent, isDailyChallenge);
        if (result.success) {
          console.log('✅ App: Game recorded on blockchain successfully!', {
            hash: result.hash,
            isWin,
            difficulty: difficultyNum,
            timeSpent,
            isDailyChallenge,
            blockNumber: result.receipt?.blockNumber
          });
          
          // Update local stats with blockchain data
          console.log('🔄 App: Updating local stats with blockchain data...');
          
          // Trigger a refresh of the leaderboard and profile data
          if (typeof window !== 'undefined') {
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('gameRecorded', {
              detail: {
                hash: result.hash,
                isWin,
                difficulty: difficultyNum,
                timeSpent,
                isDailyChallenge,
                address
              }
            }));
          }
          
        } else {
          console.error('❌ App: Failed to record game on blockchain:', {
            error: result.error,
            isWin,
            difficulty: difficultyNum,
            timeSpent,
            isDailyChallenge
          });
          
          // Show error to user but continue with local stats
          console.warn('⚠️ App: Game stats updated locally, but blockchain recording failed');
        }
      } catch (error) {
        console.error('❌ App: Error recording game on blockchain:', {
          message: error.message,
          stack: error.stack,
          isWin,
          difficulty,
          timeSpent,
          isDailyChallenge
        });
        
        // Show error to user but continue with local stats
        console.warn('⚠️ App: Game stats updated locally, but blockchain recording failed');
      } finally {
        // Clear loading state
        setIsRecordingGame(false);
      }
    } else {
      console.log('ℹ️ App: Skipping blockchain recording - wallet not connected or no address');
    }
    
    const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);
    
    const stats = {
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      bestTime: newBestTime,
      winRate: newWinRate,
      totalPoints: user?.totalPoints || 0,
      earnedPoints: earnedOrngPoints
    };
    
    console.log('📊 App: Game stats updated:', stats);
    return stats;
  };

  // Timer management
  useEffect(() => {
    if (!isRunning || gameOver || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setIsRunning(false);
          setGameOver(true);
          setResult("lose");
          playSound('lose');
          
          updateGameStats(false).then(latestStats => {
            setCurrentStats(latestStats);
          });
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, gameOver, isPaused]);

  // Page Visibility API - pause game when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !gameOver && !isPaused) {
        setIsPaused(true);
        setDisableClicks(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, gameOver, isPaused]);

  // Card flipping logic
  useEffect(() => {
    if (flippedCards.length !== 2) return;

    const checkMatch = async () => {
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      setDisableClicks(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        playSound('match');
        setMatchedCards(prev => [...prev, firstIndex, secondIndex]);
        await new Promise(resolve => setTimeout(resolve, 300));
        setFlippedCards([]);
      } else {
        playSound('noMatch');
        setShakeCard([firstIndex, secondIndex]);
        await new Promise(resolve => setTimeout(resolve, 500));
        setShakeCard(null);
        setFlippedCards([]);
      }
      
      setDisableClicks(false);
    };

    checkMatch();
  }, [flippedCards, cards]);

  const handleCardClick = index => {
    if (
      disableClicks ||
      flippedCards.includes(index) ||
      matchedCards.includes(index) ||
      gameOver ||
      !isRunning ||
      isPaused ||
      flippedCards.length >= 2
    ) {
      return;
    }

    playSound('flip');
    setFlippedCards(prev => [...prev, index]);
  };

  // Check for win condition
  useEffect(() => {
    if (cards.length && matchedCards.length === cards.length) {
      setGameOver(true);
      setIsRunning(false);
      setResult("win");
      playSound('win');
      
      updateGameStats(true).then(latestStats => {
        setCurrentStats(latestStats);
      });
    }
  }, [matchedCards, cards]);

  // Handle profile and leaderboard toggles
  const handleOpenProfile = () => {
    setShowProfile(true);
    setShowLeaderboard(false);
    playSound('click');
  };
  
  const handleCloseProfile = () => {
    setShowProfile(false);
    playSound('click');
  };
  
  const handleOpenLeaderboard = () => {
    setShowLeaderboard(true);
    setShowProfile(false);
    playSound('click');
  };
  
  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    playSound('click');
  };

  // Initialize audio
  useEffect(() => {
    resumeAudio();
  }, []);

  // Show wallet connection if not connected
  if (!isConnected) {
    return (
      <ErrorBoundary FallbackComponent={Web3ErrorFallback}>
        <WalletConnect />
      </ErrorBoundary>
    );
  }

  // Show network switch prompt if on wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex flex-col items-center justify-center p-4">
        <motion.div 
          className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 max-w-md w-full text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-orange-400 mb-4">Wrong Network</h2>
          <p className="text-slate-300 mb-6">
            Please switch to Sepolia testnet to play MatchUp Memory Game.
          </p>
          <button
            onClick={switchNetwork}
            className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white font-bold rounded-lg"
          >
            Switch to Sepolia
          </button>
        </motion.div>
      </div>
    );
  }

  // Show registration if user is not registered
  if (isConnected && !isRegistered) {
    return (
      <ErrorBoundary FallbackComponent={Web3ErrorFallback}>
        <UserRegistration onRegister={handleUserRegistration} />
      </ErrorBoundary>
    );
  }

    return (
    <ErrorBoundary FallbackComponent={Web3ErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800">
        {/* Sound toggle button */}
        <button 
          className="fixed bottom-4 right-4 z-50 bg-slate-800 p-3 rounded-full shadow-lg border border-slate-600"
          onClick={handleToggleSound}
          aria-label={soundOn ? "Mute sound" : "Enable sound"}
        >
          <FontAwesomeIcon 
            icon={soundOn ? faVolumeHigh : faVolumeXmark} 
            className={soundOn ? "text-yellow-300" : "text-white"}
            size="lg"
          />
        </button>
        
        {/* Game states */}
        {showProfile ? (
          <ProfilePage onBack={handleCloseProfile} />
        ) : showLeaderboard ? (
          <Leaderboard onBack={handleCloseLeaderboard} />
        ) : !gameStarted ? (
          <div className="flex flex-col min-h-screen">
            <HomePage 
              onStart={startGame} 
              onDifficultyChange={setDifficulty}
              selectedDifficulty={difficulty}
              onOpenProfile={handleOpenProfile}
              onOpenLeaderboard={handleOpenLeaderboard}
              gamesPlayed={gamesPlayed}
              bestTime={bestTime}
              winRate={currentStats.winRate}
              isDailyChallengeCompleted={isCompleted}
              username={user?.displayName}
            />
          </div>
        ) : (
          <div className="min-h-[calc(var(--vh,1vh)*100)] flex flex-col py-2 px-2 sm:py-4 sm:px-4">
            <div className="flex-none mb-4">
              <GameHeader 
                timer={timer}
                difficulty={difficulty}
                onPauseToggle={handlePauseToggle}
                isPaused={isPaused}
                isDailyChallenge={isDailyChallenge}
                showLeaderboardButton={true}
                onLeaderboard={handleOpenLeaderboard}
                pairs={matchedCards.length / 2}
                totalPairs={cards.length / 2}
                onRestart={restartGame}
                onHome={returnToHome}
                isDuel={false}
                orngPoints={user?.totalPoints || 0}
                username={user?.displayName}
              />
            </div>

            <div className="flex-grow flex items-center justify-center overflow-y-auto py-2">
              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 backdrop-blur-sm">
                  <motion.div 
                    className="bg-slate-800 p-6 rounded-xl border-2 border-yellow-500 shadow-xl text-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <h2 className="text-3xl font-bold text-yellow-300 mb-4">Game Paused</h2>
                    <p className="text-white mb-6">Take a break! Your progress is saved.</p>
                    <motion.button
                      onClick={handlePauseToggle}
                      className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FontAwesomeIcon icon={faPlay} className="mr-2" />
                      Resume Game
                    </motion.button>
                  </motion.div>
                </div>
              )}

              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full max-w-5xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {cards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    index={index}
                    isFlipped={flippedCards.includes(index) || matchedCards.includes(index)}
                    isMatched={matchedCards.includes(index)}
                    isShaking={shakeCard && shakeCard.includes(index)}
                    onClick={() => handleCardClick(index)}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {/* Game over screen */}
        <AnimatePresence>
          {gameOver && (
            <GameOver 
              result={result} 
              timeSpent={60 - timer}
              onRestart={restartGame}
              onHome={returnToHome}
              earnedPoints={earnedPoints}
              difficulty={difficulty}
              isDailyChallenge={isDailyChallenge}
              onOpenLeaderboard={handleOpenLeaderboard}
              onOpenProfile={handleOpenProfile}
              matchedPairs={matchedCards.length / 2}
              totalPairs={cards.length / 2}
              currentStats={currentStats}
              isRecordingGame={isRecordingGame}
                />
              )}
            </AnimatePresence>
          </div>
        </ErrorBoundary>
      );
}

export default App;