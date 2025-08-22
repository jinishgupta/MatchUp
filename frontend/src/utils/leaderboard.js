// Constants for point rewards
export const POINTS = {
  EASY_WIN: 50,
  MEDIUM_WIN: 100,
  HARD_WIN: 150,
  DAILY_MULTIPLIER: 2,
};

// Calculate points for a win based on difficulty and whether it's a daily challenge
export const calculatePoints = (difficulty, isDailyChallenge) => {
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
    
  return points;
}; 