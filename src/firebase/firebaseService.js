import { db } from './config';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit as firestoreLimit, 
  updateDoc, 
  arrayUnion, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';

// User-related functions
export const saveUserToFirebase = async (user) => {
  try {
    const userRef = doc(db, 'users', user.id);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      // Create new user document
      await setDoc(userRef, {
        id: user.id,
        displayName: user.displayName || 'Anonymous Player',
        email: user.email || '',
        points: 0,
        gamesPlayed: 0,
        gamesWon: 0,
        bestTime: null,
        winRate: 0,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        gameHistory: []
      });
      
      return true;
    } else {
      // Update last login
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
      
      return true;
    }
  } catch (error) {
    return false;
  }
};

// Update user display name
export const updateUserDisplayName = async (userId, newDisplayName) => {
  try {
    if (!userId || !newDisplayName || newDisplayName.trim() === '') {
      return { success: false, message: 'Invalid user ID or display name' };
    }
    
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (!userSnapshot.exists()) {
      return { success: false, message: 'User not found' };
    }
    
    // Update the display name
    await updateDoc(userRef, {
      displayName: newDisplayName.trim()
    });
    
    return { success: true, message: 'Display name updated successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to update display name' };
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnapshot = await getDoc(userRef);
    
    if (userSnapshot.exists()) {
      return userSnapshot.data();
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

// Points and stats related functions
export const updateUserPoints = async (userId, points, gameResult) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Create a game record with a current date string instead of serverTimestamp
    const gameRecord = {
      timestamp: new Date().toISOString(), // Use ISO string instead of serverTimestamp
      pointsEarned: points,
      result: gameResult.isWin ? 'win' : 'loss',
      difficulty: gameResult.difficulty,
      timeSpent: gameResult.timeSpent || 0
    };
    
    // First update points and game counters
    await updateDoc(userRef, {
      points: increment(points),
      gamesPlayed: increment(1),
      gamesWon: gameResult.isWin ? increment(1) : increment(0),
      lastGamePlayed: serverTimestamp() // Add this field to track when last game was played
    });
    
    // Then add to game history in a separate update
    await updateDoc(userRef, {
      gameHistory: arrayUnion(gameRecord)
    });
    
    // If this is a winning game with improved time, update best time
    if (gameResult.isWin && gameResult.timeSpent) {
      const userData = await getUserData(userId);
      if (!userData.bestTime || gameResult.timeSpent < userData.bestTime) {
        await updateDoc(userRef, {
          bestTime: gameResult.timeSpent
        });
      }
    }
    
    // Calculate and update win rate
    const userData = await getUserData(userId);
    if (userData) {
      const winRate = userData.gamesPlayed > 0 
        ? Math.round((userData.gamesWon / userData.gamesPlayed) * 100) 
        : 0;
        
      await updateDoc(userRef, {
        winRate: winRate
      });
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// Leaderboard functions
export const getLeaderboard = async (limitCount = 50) => {
  try {
    const leaderboardQuery = query(
      collection(db, 'users'),
      orderBy('points', 'desc'),
      firestoreLimit(limitCount)
    );
    
    const leaderboardSnapshot = await getDocs(leaderboardQuery);
    const leaderboard = [];
    
    leaderboardSnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        id: data.id,
        name: data.displayName,
        points: data.points,
        gamesPlayed: data.gamesPlayed,
        winRate: data.winRate
      });
    });
    
    return leaderboard;
  } catch (error) {
    // Return empty array on error
    return [];
  }
};

// Game stats synchronization
export const syncLocalStatsWithFirebase = async (userId, localStats) => {
  try {
    const userData = await getUserData(userId);
    
    if (!userData) {
      return false;
    }
    
    // Merge local stats with Firebase stats
    // We take the higher value for games and wins
    const gamesPlayed = Math.max(localStats.gamesPlayed, userData.gamesPlayed || 0);
    const gamesWon = Math.max(localStats.gamesWon, userData.gamesWon || 0);
    
    // For bestTime, we take the lower value (faster time)
    let bestTime = userData.bestTime;
    if (localStats.bestTime && (!bestTime || localStats.bestTime < bestTime)) {
      bestTime = localStats.bestTime;
    }
    
    // Calculate the win rate
    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
    
    // Update Firebase with the merged stats
    await updateDoc(doc(db, 'users', userId), {
      gamesPlayed,
      gamesWon,
      bestTime,
      winRate
    });
    
    return true;
  } catch (error) {
    return false;
  }
}; 