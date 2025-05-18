// Constants for point rewards
export const POINTS = {
  EASY_WIN: 50,
  MEDIUM_WIN: 100,
  HARD_WIN: 150,
  DAILY_MULTIPLIER: 2,
  STREAK_BONUS: 25 // Bonus points per day of streak
};

// Initialize the leaderboard from localStorage or with an empty array
const initializeLeaderboard = () => {
  let leaderboard = localStorage.getItem('orngLeaderboard');
  let networkLeaderboard = [];
  
  try {
    // Fetch network leaderboard from API endpoint
    networkLeaderboard = JSON.parse(localStorage.getItem('networkLeaderboard') || '[]');
  } catch (e) {
    console.error('Error parsing network leaderboard:', e);
  }
  
  if (!leaderboard) {
    localStorage.setItem('orngLeaderboard', JSON.stringify(networkLeaderboard));
    return networkLeaderboard;
  }
  
  const parsedLeaderboard = JSON.parse(leaderboard);
  const combinedLeaderboard = [...parsedLeaderboard, ...networkLeaderboard]
    .filter((player, index, self) => 
      index === self.findIndex(p => p.id === player.id)
    )
    .sort((a, b) => b.points - a.points);
    
  localStorage.setItem('orngLeaderboard', JSON.stringify(combinedLeaderboard));
  return combinedLeaderboard;
};

// Get the current player's ID (use a consistent ID for demo)
export const getCurrentPlayerId = () => {
  let playerId = localStorage.getItem('orngPlayerId');
  
  if (!playerId) {
    // Generate a random ID for the player with a prefix indicating it's a real user
    playerId = 'user-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('orngPlayerId', playerId);
  }
  
  return playerId;
};

// Get the current player's name (use a consistent name for demo)
export const getCurrentPlayerName = () => {
  let playerName = localStorage.getItem('orngPlayerName');
  
  if (!playerName) {
    // Default name
    playerName = "You";
    localStorage.setItem('orngPlayerName', playerName);
  }
  
  return playerName;
};

// Calculate points for a win based on difficulty and whether it's a daily challenge
export const calculatePoints = (difficulty, isDailyChallenge, streak = 0) => {
  // Base points by difficulty
  let points = 0;
  
  switch(difficulty.toLowerCase()) {
    case 'easy':
      points = POINTS.EASY_WIN;
      break;
    case 'medium':
      points = POINTS.MEDIUM_WIN;
      break;
    case 'hard':
      points = POINTS.HARD_WIN;
      break;
    default:
      points = POINTS.MEDIUM_WIN;
  }
  
  // Apply daily challenge multiplier if applicable
  if (isDailyChallenge) {
    points *= POINTS.DAILY_MULTIPLIER;
  }
  
  // Add streak bonus if applicable
  if (streak > 1) {
    points += (streak - 1) * POINTS.STREAK_BONUS;
  }
  
  return points;
};

// Add points to the current player
export const addPointsToPlayer = (points) => {
  const playerId = getCurrentPlayerId();
  const playerName = getCurrentPlayerName();
  const leaderboard = getLeaderboard();
  
  // Find the current player in the leaderboard
  const playerIndex = leaderboard.findIndex(p => p.id === playerId);
  
  if (playerIndex >= 0) {
    // Player already exists in leaderboard
    leaderboard[playerIndex].points += points;
  } else {
    // Add player to leaderboard
    leaderboard.push({
      id: playerId,
      name: playerName,
      points: points
    });
  }
  
  // Sort the leaderboard by points in descending order
  leaderboard.sort((a, b) => b.points - a.points);
  
  // Save the updated leaderboard
  localStorage.setItem('orngLeaderboard', JSON.stringify(leaderboard));
  
  return {
    leaderboard,
    currentPoints: leaderboard.find(p => p.id === playerId).points,
    pointsEarned: points
  };
};

// Process challenge results - add/subtract points based on challenge outcome
export const processChallengeResult = (challengeInfo, isWin) => {
  const { opponent, betAmount } = challengeInfo;
  const playerId = getCurrentPlayerId();
  const leaderboard = getLeaderboard();
  
  // Find current player and opponent in leaderboard
  const playerIndex = leaderboard.findIndex(p => p.id === playerId);
  const opponentIndex = leaderboard.findIndex(p => p.id === opponent.id);
  
  if (playerIndex === -1 || opponentIndex === -1) {
    console.error("Player or opponent not found in leaderboard");
    return null;
  }
  
  // Process the bet outcome
  if (isWin) {
    // Player wins, gets opponent's bet amount
    leaderboard[playerIndex].points += betAmount;
    
    // Opponent loses the bet amount (but ensure they don't go below 0)
    leaderboard[opponentIndex].points = Math.max(0, leaderboard[opponentIndex].points - betAmount);
    
    // Track challenge wins for stats
    localStorage.setItem('challengeWins', (parseInt(localStorage.getItem('challengeWins') || '0') + 1).toString());
    
    // Store challenge history
    addChallengeToHistory({
      opponent: opponent.name,
      betAmount,
      outcome: 'win',
      date: new Date().toISOString(),
      pointsEarned: betAmount
    });
  } else {
    // Player loses, forfeits bet amount
    leaderboard[playerIndex].points = Math.max(0, leaderboard[playerIndex].points - betAmount);
    
    // Opponent wins the bet
    leaderboard[opponentIndex].points += betAmount;
    
    // Track challenge losses for stats
    localStorage.setItem('challengeLosses', (parseInt(localStorage.getItem('challengeLosses') || '0') + 1).toString());
    
    // Store challenge history
    addChallengeToHistory({
      opponent: opponent.name,
      betAmount,
      outcome: 'loss',
      date: new Date().toISOString(),
      pointsLost: betAmount
    });
  }
  
  // Resort the leaderboard
  leaderboard.sort((a, b) => b.points - a.points);
  
  // Save updated leaderboard
  localStorage.setItem('orngLeaderboard', JSON.stringify(leaderboard));
  
  // Calculate new rank
  const newRank = leaderboard.findIndex(p => p.id === playerId) + 1;
  const currentPoints = leaderboard[playerIndex].points;
  
  return {
    isWin,
    pointsEarned: isWin ? betAmount : 0,
    pointsLost: isWin ? 0 : betAmount,
    currentPoints,
    newRank
  };
};

// Add a challenge to the player's history
const addChallengeToHistory = (challenge) => {
  const history = JSON.parse(localStorage.getItem('challengeHistory') || '[]');
  history.unshift(challenge); // Add to beginning
  
  // Keep only the last 20 challenges
  const trimmedHistory = history.slice(0, 20);
  localStorage.setItem('challengeHistory', JSON.stringify(trimmedHistory));
};

// Get the player's challenge history
export const getChallengeHistory = () => {
  return JSON.parse(localStorage.getItem('challengeHistory') || '[]');
};

// Get challenge stats (total wins, losses, points earned, points lost)
export const getChallengeStats = () => {
  const wins = parseInt(localStorage.getItem('challengeWins') || '0');
  const losses = parseInt(localStorage.getItem('challengeLosses') || '0');
  const history = getChallengeHistory();
  
  // Calculate points earned and lost
  let pointsEarned = 0;
  let pointsLost = 0;
  
  history.forEach(challenge => {
    if (challenge.outcome === 'win') {
      pointsEarned += challenge.pointsEarned || 0;
    } else {
      pointsLost += challenge.pointsLost || 0;
    }
  });
  
  // Calculate win rate
  const totalChallenges = wins + losses;
  const winRate = totalChallenges > 0 ? Math.round((wins / totalChallenges) * 100) : 0;
  
  return {
    wins,
    losses,
    totalChallenges,
    winRate,
    pointsEarned,
    pointsLost,
    netGain: pointsEarned - pointsLost
  };
};

// Get the current player's rank
export const getPlayerRank = () => {
  const playerId = getCurrentPlayerId();
  const leaderboard = getLeaderboard();
  
  // Find the player's position
  const playerIndex = leaderboard.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    // Player not found
    return {
      rank: 'N/A',
      points: 0
    };
  }
  
  return {
    rank: playerIndex + 1, // +1 because array indices start from 0
    points: leaderboard[playerIndex].points
  };
};

// Get the current player's points
export const getPlayerPoints = () => {
  const playerId = getCurrentPlayerId();
  const leaderboard = getLeaderboard();
  
  // Find the player in the leaderboard
  const player = leaderboard.find(p => p.id === playerId);
  
  // Return the points (or 0 if player not found)
  return player ? player.points : 0;
};

// Get the top N players from the leaderboard
export const getTopPlayers = (count = 25) => {
  const leaderboard = getLeaderboard();
  return leaderboard.slice(0, count);
};

// Get the entire leaderboard
export const getLeaderboard = () => {
  // Note: This function returns the localStorage leaderboard
  // For Firebase leaderboard, use the Firebase service functions
  return initializeLeaderboard();
};

// Reset the player's points (for testing)
export const resetPlayerPoints = () => {
  const playerId = getCurrentPlayerId();
  const leaderboard = getLeaderboard();
  const playerIndex = leaderboard.findIndex(p => p.id === playerId);
  
  if (playerIndex >= 0) {
    leaderboard[playerIndex].points = 0;
    localStorage.setItem('orngLeaderboard', JSON.stringify(leaderboard));
  }
  
  return leaderboard;
}; 