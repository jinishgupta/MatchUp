import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./Card.jsx";
import StartScreen from "./StartScreen.jsx";
import GameOver from "./GameOver.jsx";
import GameHeader from "./GameHeader.jsx";
import Stats from "./Stats.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import { playSound, toggleSound, isSoundEnabled, resumeAudio } from './sounds.js';
import { 
  calculatePoints, 
  addPointsToPlayer, 
  getPlayerPoints,
  getPlayerRank,
  processChallengeResult
} from './utils/leaderboard.js';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark, faPlay, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import {
  faBitcoin, faCss3Alt, faEthereum, faGithub,
  faHtml5, faJava, faLinux, faReact, faJs, 
  faPython, faNode, faDocker, faPhp, faVuejs,
  faAngular, faBootstrap, faUbuntu, faApple
} from "@fortawesome/free-brands-svg-icons";
// Enable Orange ID integration
import { useBedrockPassport } from "@bedrock_org/passport";
import { Login } from "./components/auth/index.jsx";
import HomePage from "./components/HomePage";
import { ErrorBoundary } from 'react-error-boundary';
// Firebase imports
import { saveUserToFirebase, updateUserPoints, syncLocalStatsWithFirebase, getUserData } from './firebase/firebaseService';

function AuthErrorFallback({ error }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex flex-col items-center justify-center p-4 text-white">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h2>
      <p className="mb-4">{error.message}</p>
      <p className="text-sm text-gray-400 mb-6">Try refreshing the page or clearing browser cache</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg"
      >
        Refresh Page
      </button>
    </div>
  );
}

// Simple login component
function SimpleLogin({ onLogin }) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Create a simple user object
      const user = {
        id: 'user-' + Date.now(),
        displayName: username,
        email: username + '@example.com'
      };
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-8">
        MatchUp Memory Game
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-800 rounded-lg p-8 shadow-xl">
        <label className="block text-white text-lg mb-2">Enter Your Name:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full bg-slate-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          placeholder="Your Name"
          required
        />
        <button 
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-3 px-4 rounded"
        >
          Start Playing
        </button>
      </form>
    </div>
  );
}

function App() {
  // Use Orange ID authentication
  const { isLoggedIn, user, signOut } = useBedrockPassport();
  const [authLoading, setAuthLoading] = useState(true);
  
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

  // Stats tracking - expanded with more detailed statistics
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [bestTime, setBestTime] = useState(null);
  const initialTimeRef = useRef(0);
  
  // Add state for profile page and leaderboard
  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Add state for current game stats
  const [currentStats, setCurrentStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    bestTime: null,
    winRate: 0,
    orngPoints: 0
  });

  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [dailyChallengeAttempts, setDailyChallengeAttempts] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Add state for duel mode
  const [isDuel, setIsDuel] = useState(false);
  const [duelInfo, setDuelInfo] = useState(null);
  const [duelResult, setDuelResult] = useState(null);
  
  // Load all stats from localStorage
  useEffect(() => {
    // Load basic stats
    const loadedGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const loadedGamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const loadedBestTime = parseInt(localStorage.getItem('bestTime') || '0');
    
    // Initialize joined date if not set
    if (!localStorage.getItem('joinedDate')) {
      localStorage.setItem('joinedDate', new Date().toISOString());
    }
    
    // Initialize player ID if not set
    if (!localStorage.getItem('orngPlayerId')) {
      const playerId = 'user-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('orngPlayerId', playerId);
    }
    
    // Ensure current user has an entry in the leaderboard
    const playerId = localStorage.getItem('orngPlayerId');
    const leaderboard = JSON.parse(localStorage.getItem('orngLeaderboard') || '[]');
    const playerExists = leaderboard.some(player => player.id === playerId);
    
    if (!playerExists) {
      leaderboard.push({
        id: playerId,
        name: localStorage.getItem('orngPlayerName') || 'You',
        points: 0
      });
      localStorage.setItem('orngLeaderboard', JSON.stringify(leaderboard));
    }
    
    // Check if daily challenge is completed today
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('dailyChallengeLastPlayed');
    const challengeCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true';
    
    // Set isCompleted state
    setIsCompleted(lastPlayed === today && challengeCompleted);
    
    // Initialize difficulty-specific stats if not set
    ['easy', 'medium', 'hard'].forEach(diff => {
      if (!localStorage.getItem(`${diff}Games`)) {
        localStorage.setItem(`${diff}Games`, '0');
      }
      if (!localStorage.getItem(`${diff}Wins`)) {
        localStorage.setItem(`${diff}Wins`, '0');
      }
      if (!localStorage.getItem(`${diff}WinRate`)) {
        localStorage.setItem(`${diff}WinRate`, '0');
      }
      if (!localStorage.getItem(`${diff}DailyChallengeAttempts`)) {
        localStorage.setItem(`${diff}DailyChallengeAttempts`, '0');
      }
    });
    
    setGamesPlayed(loadedGamesPlayed);
    setGamesWon(loadedGamesWon);
    setBestTime(loadedBestTime || null);
    
    // Load ORNG points
    const orngPoints = getPlayerPoints();
    
    // Set current stats for immediate use
    const winRate = loadedGamesPlayed > 0 
      ? Math.round((loadedGamesWon / loadedGamesPlayed) * 100)
      : 0;
      
    setCurrentStats({
      gamesPlayed: loadedGamesPlayed,
      gamesWon: loadedGamesWon,
      bestTime: loadedBestTime || null,
      winRate: winRate,
      orngPoints: orngPoints
    });
  }, []);
  
  // Listen for stats reset events
  useEffect(() => {
    const handleStatsReset = () => {
      // Reset all stat states
      setGamesPlayed(0);
      setGamesWon(0);
      setBestTime(null);
      
      // Update current stats
      setCurrentStats({
        gamesPlayed: 0,
        gamesWon: 0,
        bestTime: null,
        winRate: 0,
        orngPoints: getPlayerPoints()
      });
      
      console.log("Stats reset detected and applied to app state");
    };
    
    // Add event listener
    window.addEventListener('statsReset', handleStatsReset);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('statsReset', handleStatsReset);
    };
  }, []);

  // Save all stats to localStorage
  const saveStats = () => {
    // Save basic stats
    localStorage.setItem('gamesPlayed', gamesPlayed.toString());
    localStorage.setItem('gamesWon', gamesWon.toString());
    if (bestTime) {
      localStorage.setItem('bestTime', bestTime.toString());
    }
    
    // Calculate and save overall win rate
    if (gamesPlayed > 0) {
      const overallWinRate = Math.round((gamesWon / gamesPlayed) * 100);
      localStorage.setItem('winRate', overallWinRate.toString());
    }
  };
  
  // Difficulty settings
  const difficultySettings = {
    Easy: { time: 60, pairs: 6 },
    Medium: { time: 60, pairs: 8 },
    Hard: { time: 60, pairs: 9 }
  };

  // Window size state for responsiveness
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateShuffledCards = (pairCount) => {
    console.log(`Generating ${pairCount} card pairs`);
    
    // Select the specified number of icons
    const selectedIcons = allIcons.slice(0, pairCount);
    console.log(`Selected ${selectedIcons.length} icons`);
    
    let id = 0;
    // Create pairs
    const duplicatedIcons = [...selectedIcons, ...selectedIcons];
    
    // Return shuffled card objects
    const cards = duplicatedIcons
      .map(icon => {
        // Make sure icon has a valid iconName property
        const matchId = icon && icon.iconName ? icon.iconName : `card-${id % pairCount}`;
        const card = { icon, id: id++, matchId };
        console.log(`Created card with id: ${card.id}, matchId: ${card.matchId}`);
        return card;
      })
      .sort(() => Math.random() - 0.5);
    
    console.log(`Generated ${cards.length} cards total`);
    return cards;
  };

  const startGame = (challengeInfo = null) => {
    // If this is a daily challenge or duel, set the appropriate flags
    if (challengeInfo) {
      if (challengeInfo.isDuel) {
        // This is a duel
        setIsDuel(true);
        setDuelInfo(challengeInfo);
        localStorage.setItem('inDuel', 'true');
        
        // Use the difficulty settings from the duel
        setDifficulty(challengeInfo.difficulty);
        
        // Use the specific duel settings
        const time = challengeInfo.time;
        const pairs = challengeInfo.pairs;
        
        setTimer(time);
        initialTimeRef.current = time; // Store initial time for stats
        setCards(generateShuffledCards(pairs));
      } else {
        // This is a daily challenge
        setIsDailyChallenge(true);
        setDailyChallengeAttempts(prev => prev + 1);
        
        // Store in localStorage that we're in a daily challenge
        localStorage.setItem('inDailyChallenge', 'true');
        
        // Update total daily challenge attempts counter
        const newAttempts = dailyChallengeAttempts + 1;
        localStorage.setItem('dailyChallengeAttempts', newAttempts.toString());
        
        // Update difficulty-specific daily challenge attempts
        // This is the one place we should track attempts to avoid double-counting
        const difficultyKey = challengeInfo.difficulty.toLowerCase();
        const difficultyAttempts = parseInt(localStorage.getItem(`${difficultyKey}DailyChallengeAttempts`) || '0') + 1;
        localStorage.setItem(`${difficultyKey}DailyChallengeAttempts`, difficultyAttempts.toString());
        
        // Use the challenge difficulty and settings
        setDifficulty(challengeInfo.difficulty);
        
        // Use the specific challenge settings
        const time = challengeInfo.time;
        const pairs = challengeInfo.pairs;
        
        setTimer(time);
        initialTimeRef.current = time; // Store initial time for stats
        setCards(generateShuffledCards(pairs));
      }
    } else {
      // For regular games, explicitly set flags to false
      setIsDailyChallenge(false);
      setIsDuel(false);
      localStorage.removeItem('inDailyChallenge');
      localStorage.removeItem('inDuel');
      
      // Use the difficulty settings for regular game
      const { time, pairs } = difficultySettings[difficulty];
      
      setTimer(time);
      initialTimeRef.current = time; // Store initial time for stats
      setCards(generateShuffledCards(pairs));
    }
    
    // Reset duel result
    setDuelResult(null);
    
    setFlippedCards([]);
    setMatchedCards([]);
    setGameStarted(true);
    setIsRunning(true);
    setGameOver(false);
    setResult(null);
    setEarnedPoints(0);
    playSound('start');
    
    // Record last played time
    const now = new Date().toISOString();
    localStorage.setItem('lastPlayed', now);
    
    // Update the currentStats to reflect the latest values from localStorage
    const latestGamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const latestGamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const latestBestTime = parseInt(localStorage.getItem('bestTime') || '0') || null;
    const latestWinRate = latestGamesPlayed > 0 
      ? Math.round((latestGamesWon / latestGamesPlayed) * 100)
      : 0;
    const orngPoints = getPlayerPoints();
    
    setCurrentStats({
      gamesPlayed: latestGamesPlayed,
      gamesWon: latestGamesWon,
      bestTime: latestBestTime,
      winRate: latestWinRate,
      orngPoints: orngPoints
    });
  };

  const restartGame = () => {
    // If this is a daily challenge, check if it's already been completed
    if (isDailyChallenge) {
      const today = new Date().toDateString();
      const lastPlayed = localStorage.getItem('dailyChallengeLastPlayed');
      const isCompleted = localStorage.getItem('dailyChallengeCompleted') === 'true';
      
      // If challenge was already completed today, don't allow restart
      if (lastPlayed === today && isCompleted) {
        console.log("Cannot restart - daily challenge already completed today");
        alert("You've already completed today's challenge. Come back tomorrow for a new challenge!");
        return;
      }
    }
    
    setDisableClicks(true);
    setIsRunning(false);
    setIsPaused(false);
    setFlippedCards([]);
    setMatchedCards([]);
    setGameOver(false);
    setResult(null);
    setEarnedPoints(0);
    
    // Set game parameters based on whether this is a daily challenge or regular game
    let time, pairs;
    
    if (isDailyChallenge) {
      // For daily challenge, get the time and pairs from localStorage or use default values
      const challengeData = JSON.parse(localStorage.getItem('currentDailyChallenge') || '{}');
      time = challengeData.time || difficultySettings[difficulty].time;
      pairs = challengeData.pairs || difficultySettings[difficulty].pairs;
    } else {
      // For regular game, use difficulty settings
      time = difficultySettings[difficulty].time;
      pairs = difficultySettings[difficulty].pairs;
    }
    
    setTimer(time);
    initialTimeRef.current = time;
    
    // Record last played time
    const now = new Date().toISOString();
    localStorage.setItem('lastPlayed', now);
    
    setTimeout(() => {
      setCards(generateShuffledCards(pairs));
      setDisableClicks(false);
      setIsRunning(true);
      playSound('start');
      
      // Update the count of games played here as well for immediate consistency
      const newGamesPlayed = gamesPlayed + 1;
      setGamesPlayed(newGamesPlayed);
      localStorage.setItem('gamesPlayed', newGamesPlayed.toString());
      
      // Update the current stats
      const newWinRate = newGamesPlayed > 0 
        ? Math.round((gamesWon / newGamesPlayed) * 100) 
        : 0;
      
      setCurrentStats({
        gamesPlayed: newGamesPlayed,
        gamesWon: gamesWon,
        bestTime: bestTime,
        winRate: newWinRate,
        orngPoints: getPlayerPoints()
      });
    }, 500);
  };

  const returnToHome = () => {
    // If returning from a daily challenge that wasn't completed, mark as loss
    if (isDailyChallenge && result !== "win") {
      // Only update stats if the game wasn't already marked as a loss
      if (result !== "lose") {
        // Update stats to record the loss but don't lock the challenge
        const lossStats = updateGameStats(false);
        setCurrentStats(lossStats);
        
        // Do not increment challenge attempts here since we already do this in startGame
        // This prevents double-counting attempts
      }
    }
    // If returning from a duel that wasn't completed, mark as loss
    else if (isDuel && result !== "win" && duelInfo) {
      // Only update stats if the game wasn't already marked as a loss
      if (result !== "lose") {
        // Process the duel as a loss
        const duelResult = processChallengeResult({
          opponent: duelInfo.opponent,
          betAmount: duelInfo.betAmount
        }, false);
        
        // Store the result
        setDuelResult(duelResult);
        
        // Update stats
        const lossStats = updateGameStats(false);
        setCurrentStats(lossStats);
      }
    }
    
    // Always reset game state no matter what
    setGameStarted(false);
    setIsRunning(false);
    setIsPaused(false);
    setGameOver(false);
    setIsDailyChallenge(false);
    setIsDuel(false);
    setDuelInfo(null);
    
    // Clear any running timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    playSound('click');
    
    // Remove the flags from localStorage
    localStorage.removeItem('inDailyChallenge');
    localStorage.removeItem('inDuel');
  };
  
  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    playSound('click');
  };

  // Toggle game pause state
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    setDisableClicks(!isPaused); // Disable clicks when paused
    playSound('click');
  };

  // Update game finished stats (both win and lose)
  const updateGameStats = (isWin) => {
    // Update overall stats - increment immediately
    const newGamesPlayed = gamesPlayed + 1;
    setGamesPlayed(newGamesPlayed);
    
    // Record last played time
    const now = new Date().toISOString();
    localStorage.setItem('lastPlayed', now);
    
    // Set the updated stats to localStorage immediately
    localStorage.setItem('gamesPlayed', newGamesPlayed.toString());
    
    let newGamesWon = gamesWon;
    let newBestTime = bestTime;
    let earnedOrngPoints = 0;
    
    // Make sure we're incrementing the games played for the correct difficulty
    const difficultyKey = difficulty.toLowerCase();
    let difficultyGames = parseInt(localStorage.getItem(`${difficultyKey}Games`) || '0') + 1;
    localStorage.setItem(`${difficultyKey}Games`, difficultyGames.toString());
    
    // Calculate time spent if it's a win
    let timeSpent = 0;
    
    if (isWin) {
      // Calculate time spent if win
      timeSpent = initialTimeRef.current - timer;
      newGamesWon = gamesWon + 1;
      setGamesWon(newGamesWon);
      localStorage.setItem('gamesWon', newGamesWon.toString());
      
      // Update best time if this is better
      if (!bestTime || timeSpent < bestTime) {
        newBestTime = timeSpent;
        setBestTime(timeSpent);
        localStorage.setItem('bestTime', timeSpent.toString());
      }
      
      // Update difficulty-specific stats for wins
      // Update difficulty wins count
      const difficultyWins = parseInt(localStorage.getItem(`${difficultyKey}Wins`) || '0') + 1;
      localStorage.setItem(`${difficultyKey}Wins`, difficultyWins.toString());
      
      // Update difficulty best time
      const difficultyBestTime = parseInt(localStorage.getItem(`${difficultyKey}BestTime`) || '0');
      if (!difficultyBestTime || timeSpent < difficultyBestTime) {
        localStorage.setItem(`${difficultyKey}BestTime`, timeSpent.toString());
      }
      
      // Daily challenge-specific handling is done separately in the completion handler
      // We don't need to update dailyChallengeAttempts here to avoid double-counting
      
      // Award points based on difficulty and game type (only in regular games and daily challenges)
      // For duels, points are handled in the processChallengeResult function
      if (!isDuel) {
        const streak = parseInt(localStorage.getItem('dailyChallengeStreak') || '0');
        earnedOrngPoints = calculatePoints(difficulty, isDailyChallenge, streak);
        
        // Add points to the player's account (both local and Firebase)
        const pointsResult = addPointsToPlayer(earnedOrngPoints);
        setEarnedPoints(earnedOrngPoints);
        
        console.log(`Earned ${earnedOrngPoints} points! Total: ${pointsResult.currentPoints}`);
        
        // If user is logged in, update Firebase
        if (isLoggedIn && user) {
          // Create game result object for Firebase
          const gameResult = {
            isWin: true,
            difficulty: difficulty,
            timeSpent: timeSpent,
            isDailyChallenge: isDailyChallenge
          };
          
          // Update user points in Firebase
          updateUserPoints(user.id, earnedOrngPoints, gameResult)
            .then(success => {
              if (success) {
                console.log('Updated points in Firebase successfully');
              }
            });
        }
      }
    } else {
      // If it's a loss and the user is logged in, record the loss in Firebase
      if (isLoggedIn && user) {
        // Create game result object for Firebase
        const gameResult = {
          isWin: false,
          difficulty: difficulty,
          timeSpent: 0,
          isDailyChallenge: isDailyChallenge
        };
        
        // Update user stats in Firebase (with 0 points)
        updateUserPoints(user.id, 0, gameResult)
          .then(success => {
            if (success) {
              console.log('Recorded game loss in Firebase successfully');
            }
          });
      }
    }
    
    // Calculate win rate for this difficulty - do this after recording win/loss
    // Use the updated values to ensure accuracy
    const difficultyWins = parseInt(localStorage.getItem(`${difficultyKey}Wins`) || '0');
    const difficultyWinRate = difficultyGames > 0 ? Math.round((difficultyWins / difficultyGames) * 100) : 0;
    localStorage.setItem(`${difficultyKey}WinRate`, difficultyWinRate.toString());
    
    // Calculate and update overall win rate
    const newWinRate = Math.round((newGamesWon / newGamesPlayed) * 100);
    localStorage.setItem('winRate', newWinRate.toString());
    
    // Get current points
    const currentOrngPoints = getPlayerPoints();
    
    // Handle duel-specific logic
    if (isDuel && duelInfo) {
      // Process the challenge result
      const duelResult = processChallengeResult({
        opponent: duelInfo.opponent,
        betAmount: duelInfo.betAmount
      }, isWin);
      
      // Store the result for the game over screen
      setDuelResult(duelResult);
      
      // If the duel result processing was successful
      if (duelResult) {
        // Update earned points to reflect duel winnings instead of regular points
        earnedOrngPoints = isWin ? duelInfo.betAmount : 0;
        setEarnedPoints(earnedOrngPoints);
        
        // If user is logged in, update Firebase with duel result
        if (isLoggedIn && user && isWin) {
          // Update user points in Firebase
          updateUserPoints(user.id, duelInfo.betAmount, {
            isWin: true,
            difficulty: difficulty,
            timeSpent: timeSpent,
            isDuel: true,
            opponent: duelInfo.opponent,
            betAmount: duelInfo.betAmount
          })
            .then(success => {
              if (success) {
                console.log('Updated duel points in Firebase successfully');
              }
            });
        }
      }
    }
    
    // Return the updated stats for immediate use
    return {
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      bestTime: newBestTime,
      winRate: newWinRate,
      orngPoints: currentOrngPoints,
      earnedPoints: earnedOrngPoints
    };
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

    // Clear any existing timer before setting a new one
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
          
          // Update game stats for losing and store latest stats
          const latestStats = updateGameStats(false);
          setCurrentStats(latestStats);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, gameOver, isPaused]);

  // Page Visibility API - pause game when tab is hidden or app loses focus
  useEffect(() => {
    // Function to handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !gameOver && !isPaused) {
        // Page is now hidden, pause the game
        setIsPaused(true);
        setDisableClicks(true);
        console.log("Game auto-paused: tab/window hidden");
      }
    };

    // Listen for visibility change events
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isRunning, gameOver, isPaused]);

  // Global cleanup - ensure all resources and timers are properly cleared
  useEffect(() => {
    // This effect will run when component unmounts
    return () => {
      // Clear any running timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Clear in-progress game flags in localStorage
      localStorage.removeItem('inDailyChallenge');
      
      // Clean up any other resources as needed
      console.log("Memory game cleanup: all resources cleared");
    };
  }, []);

  // Card flipping logic
  useEffect(() => {
    // Only proceed if we have exactly 2 cards flipped
    if (flippedCards.length !== 2) return;

    const checkMatch = async () => {
      const [firstIndex, secondIndex] = flippedCards;
      const firstCard = cards[firstIndex];
      const secondCard = cards[secondIndex];
      
      // Disable clicks while checking
      setDisableClicks(true);
      
      // Allow cards to be fully visible
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if the cards match
      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Match found!
        playSound('match');
        setMatchedCards(prev => [...prev, firstIndex, secondIndex]);
        
        // Clear flipped cards after a short delay
        await new Promise(resolve => setTimeout(resolve, 300));
        setFlippedCards([]);
      } else {
        // No match
        playSound('noMatch');
        setShakeCard([firstIndex, secondIndex]);
        
        // Show the shake animation then hide cards
        await new Promise(resolve => setTimeout(resolve, 500));
        setShakeCard(null);
        setFlippedCards([]);
      }
      
      // Re-enable clicking
      setDisableClicks(false);
    };

    checkMatch();
  }, [flippedCards, cards]);

  const handleCardClick = index => {
    // Check all conditions that would prevent a card flip
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

    // Play flip sound
    playSound('flip');
    
    // Add this card to flipped cards
    setFlippedCards(prev => [...prev, index]);
  };

  // Check for win condition
  useEffect(() => {
    if (cards.length && matchedCards.length === cards.length) {
      setGameOver(true);
      setIsRunning(false);
      setResult("win");
      playSound('win');
      
      // Update game stats for winning and store latest stats
      const latestStats = updateGameStats(true);
      setCurrentStats(latestStats);
    }
  }, [matchedCards, cards]);

  // Get the total number of pairs for display
  const totalPairs = Math.floor(cards.length / 2);
  const matchedPairs = Math.floor(matchedCards.length / 2);

  // Calculate win rate for stats
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  // Calculate max card height based on screen size and difficulty
  const getMaxCardHeight = () => {
    const isLandscape = windowSize.width > windowSize.height;
    const totalPairs = difficultySettings[difficulty].pairs;
    
    if (windowSize.width < 640) {
      return isLandscape ? '60px' : '90px'; 
    } else if (windowSize.width < 1024) {
      return isLandscape ? '90px' : '110px';
    } else {
      return isLandscape ? '120px' : '140px';
    }
  };

  // Handle profile page toggle
  const handleOpenProfile = () => {
    setShowProfile(true);
    setShowLeaderboard(false);
    playSound('click');
  };
  
  const handleCloseProfile = () => {
    setShowProfile(false);
    playSound('click');
  };
  
  // Handle leaderboard toggle
  const handleOpenLeaderboard = () => {
    setShowLeaderboard(true);
    setShowProfile(false);
    playSound('click');
  };
  
  const handleCloseLeaderboard = () => {
    setShowLeaderboard(false);
    playSound('click');
  };

  // Handle daily challenge completion
  useEffect(() => {
    if (isDailyChallenge && result === "win") {
      // Mark daily challenge as completed for today
      const today = new Date().toDateString();
      localStorage.setItem('dailyChallengeLastPlayed', today);
      localStorage.setItem('dailyChallengeCompleted', 'true');
      
      // Update streak
      const currentStreak = parseInt(localStorage.getItem('dailyChallengeStreak') || '0');
      const newStreak = currentStreak + 1;
      localStorage.setItem('dailyChallengeStreak', newStreak.toString());
      
      // Record maximum streak
      const maxStreak = parseInt(localStorage.getItem('dailyChallengeMaxStreak') || '0');
      if (newStreak > maxStreak) {
        localStorage.setItem('dailyChallengeMaxStreak', newStreak.toString());
      }
      
      // Clear the in-progress flag
      localStorage.removeItem('inDailyChallenge');
      
      // Display success message to user (optional)
      console.log("Daily challenge completed successfully!");
      
      // Make isCompleted state true immediately
      setIsCompleted(true);
    } else if (isDailyChallenge && result === "lose") {
      // Do not track daily challenge attempts again here
      // They are already tracked once in startGame
      
      // Don't mark as completed, allowing more attempts
      localStorage.removeItem('inDailyChallenge');
    }
  }, [isDailyChallenge, result, difficulty]);

  // Add this useEffect after other useEffects
  useEffect(() => {
    // Give auth a moment to initialize
    const timer = setTimeout(() => {
      setAuthLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Simple Firebase connection monitoring
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  
  useEffect(() => {
    if (isLoggedIn && user) {
      // Simple ping to Firestore to check connection
      const checkConnection = async () => {
        try {
          // Try to get user data as a connection test
          await getUserData(user.id);
          setIsFirebaseConnected(true);
        } catch (error) {
          console.log("Firebase connection error:", error);
          setIsFirebaseConnected(false);
        }
      };
      
      // Check connection initially
      checkConnection();
      
      // Set up interval to check connection
      const intervalId = setInterval(checkConnection, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [isLoggedIn, user]);
  
  // User notification for connection issues (simplified)
  useEffect(() => {
    if (!isFirebaseConnected && isLoggedIn) {
      console.warn("Firebase connection is down. Data will be saved locally.");
    }
  }, [isFirebaseConnected, isLoggedIn]);

  // Track logged-in users and save to Firebase
  useEffect(() => {
    if (isLoggedIn && user) {
      // Save user to Firebase
      saveUserToFirebase(user).then(success => {
        if (success) {
          // Load user data from Firebase
          getUserData(user.id).then(userData => {
            if (userData) {
              // Sync local stats with Firebase
              const localStats = {
                gamesPlayed: parseInt(localStorage.getItem('gamesPlayed') || '0'),
                gamesWon: parseInt(localStorage.getItem('gamesWon') || '0'),
                bestTime: parseInt(localStorage.getItem('bestTime') || '0') || null
              };
              
              syncLocalStatsWithFirebase(user.id, localStats);
            }
          });
        }
      });
    }
  }, [isLoggedIn, user]);

  // Initialize game state
  useEffect(() => {
    // Resume audio context on first user interaction
    resumeAudio();
    
    // ... existing code ...
  }, []);
  
  // Handle user interactions that might need audio unblocking
  const handleUserInteraction = () => {
    // Resume audio context if it was suspended (needed for Safari and Chrome)
    resumeAudio();
  };
  
  // Add the interaction handler to the main container
  useEffect(() => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.addEventListener('click', handleUserInteraction);
      gameContainer.addEventListener('touchstart', handleUserInteraction);
    }
    
    return () => {
      if (gameContainer) {
        gameContainer.removeEventListener('click', handleUserInteraction);
        gameContainer.removeEventListener('touchstart', handleUserInteraction);
      }
    };
  }, []);

  return (
    <ErrorBoundary FallbackComponent={AuthErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800">
        {authLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-white">Loading...</div>
          </div>
        ) : !isLoggedIn ? (
          <Login />
        ) : (
          <>
            {/* Sound toggle button - moved to bottom right */}
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
                  winRate={winRate}
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
                    isDuel={isDuel}
                    duelInfo={duelInfo}
                    orngPoints={currentStats.orngPoints}
                    username={user?.displayName}
                  />
                </div>

                <div className="flex-grow flex items-center justify-center overflow-y-auto py-2" style={{ WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
                  {isPaused && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 backdrop-blur-sm">
                      <motion.div 
                        className="bg-slate-800 p-6 rounded-xl border-2 border-yellow-500 shadow-xl text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <h2 className="text-2xl font-bold text-yellow-300 mb-4">Game Paused</h2>
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
                    style={{ 
                      gridTemplateColumns: windowSize.width < 300 ? 'repeat(2, 1fr)' : 
                                          windowSize.width < 640 ? 'repeat(3, 1fr)' : 
                                          windowSize.width < 768 ? 'repeat(4, 1fr)' : 
                                          'repeat(5, 1fr)',
                      gridGap: windowSize.width < 400 ? '0.5rem' : windowSize.width < 640 ? '0.75rem' : '1rem'
                    }}
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
                  isDuel={isDuel}
                  duelInfo={duelInfo}
                  duelResult={duelResult}
                  matchedPairs={matchedCards.length / 2}
                  totalPairs={cards.length / 2}
                  currentStats={currentStats}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;