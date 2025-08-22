import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_CONFIG = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS || '0x36aF60f920406586bdBE9CeD484De4b022CB2648',
  abi: null // Will be set when provider is initialized
};

/**
 * Web3 Game Service
 * Handles all blockchain interactions for the MatchUp game using Ethers.js
 */
export class GameService {
  constructor() {
    this.contractConfig = CONTRACT_CONFIG;
    this.provider = null;
    this.signer = null;
    this.contract = null;

  }

  setProvider(provider, signer) {

    this.provider = provider;
    this.signer = signer;
    
    // Load contract ABI and create contract instance
    this.loadContractABI();
  }

  async loadContractABI() {
    try {
      // Import the ABI dynamically
      const abiModule = await import('./MatchUpGame.json');
      this.contractConfig.abi = abiModule.default.abi;
      
      // Create contract instance
      this.contract = new ethers.Contract(
        this.contractConfig.address,
        this.contractConfig.abi,
        this.signer
      );
          } catch (error) {
        throw new Error('Failed to load contract ABI');
      }
  }

  async registerUser(displayName) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      const tx = await this.contract.registerUser(displayName);
      const receipt = await tx.wait();
      
      return { success: true, hash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async recordGame(won, difficulty, timeSpent, isDailyChallenge = false) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      const difficultyNum = this.getDifficultyNumber(difficulty);
      
      const tx = await this.contract.recordGame(
        won,
        difficultyNum,
        BigInt(timeSpent),
        isDailyChallenge
      );
      
      const receipt = await tx.wait();
      
      return { success: true, hash: tx.hash, receipt };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUser(address) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      const userData = await this.contract.getUser(address);
      
      // Convert BigInt values to numbers for frontend use
      // Map to match the actual smart contract User struct
      const processedUserData = {
        displayName: userData.displayName,
        totalPoints: Number(userData.totalPoints),
        gamesPlayed: Number(userData.gamesPlayed),
        gamesWon: Number(userData.gamesWon),
        totalLosses: Number(userData.gamesPlayed) - Number(userData.gamesWon), // Calculate losses
        bestTime: Number(userData.bestTime),
        joinedAt: Number(userData.joinedAt),
        lastGameAt: Number(userData.lastGameAt),
        exists: userData.exists
      };
      
      return processedUserData;
    } catch (error) {
      return null;
    }
  }

  async getLeaderboard(limit = 25) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      const result = await this.contract.getLeaderboard(limit);
      
      // Convert BigInt values to numbers
      // Map to match the actual smart contract User struct
      const processedLeaderboard = result[0].map((address, index) => {
        const userData = result[1][index]; // Points are in the second array
        return {
          address: address,
          displayName: '', // Will need to fetch separately if needed
          totalPoints: Number(userData),
          gamesPlayed: 0, // Not available in leaderboard result
          gamesWon: 0,    // Not available in leaderboard result
          totalLosses: 0, // Not available in leaderboard result
          bestTime: 0,    // Not available in leaderboard result
          joinedAt: 0,    // Not available in leaderboard result
          lastGameAt: 0   // Not available in leaderboard result
        };
      });
      
      return processedLeaderboard;
    } catch (error) {
      return [];
    }
  }

  async getUserRank(address) {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      const rank = await this.contract.getUserRank(address);
      const numericRank = Number(rank);
      
      return numericRank;
    } catch (error) {
      return 0;
    }
  }

  async isDailyChallengeCompleted(address, date) {
    try {
      console.log('📅 Checking daily challenge completion:', {
        address: address,
        date: date
      });
      
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      console.log('📝 Calling contract.isDailyChallengeCompleted()...');
      const completed = await this.contract.isDailyChallengeCompleted(address, date);
      
      console.log('✅ Daily challenge status checked successfully:', {
        address: address,
        date: date,
        completed: completed
      });
      
      return completed;
    } catch (error) {
      console.error('❌ Error checking daily challenge:', error);
      console.error('🔍 Daily challenge check error details:', {
        message: error.message,
        code: error.code,
        method: error.method,
        address: address,
        date: date
      });
      return false;
    }
  }

  async getTotalUsers() {
    try {
      console.log('👥 Fetching total users count...');
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      console.log('📝 Calling contract.getTotalUsers()...');
      const total = await this.contract.getTotalUsers();
      const numericTotal = Number(total);
      
      console.log('✅ Total users count fetched successfully:', {
        rawTotal: total.toString(),
        numericTotal: numericTotal
      });
      
      return numericTotal;
    } catch (error) {
      console.error('❌ Error getting total users:', error);
      console.error('🔍 Get total users error details:', {
        message: error.message,
        code: error.code,
        method: error.method
      });
      return 0;
    }
  }

  async getTotalGames() {
    try {
      console.log('🎮 Fetching total games count...');
      if (!this.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }

      console.log('📝 Calling contract.getTotalGames()...');
      const total = await this.contract.getTotalGames();
      const numericTotal = Number(total);
      
      console.log('✅ Total games count fetched successfully:', {
        rawTotal: total.toString(),
        numericTotal: numericTotal
      });
      
      return numericTotal;
    } catch (error) {
      console.error('❌ Error getting total games:', error);
      console.error('🔍 Get total games error details:', {
        message: error.message,
        code: error.code,
        method: error.method
      });
      return 0;
    }
  }

  // Helper method to convert difficulty string or number to number
  getDifficultyNumber(difficulty) {
    // If difficulty is already a number, return it directly
    if (typeof difficulty === 'number') {
      console.log('🎯 Difficulty already numeric:', { input: difficulty, output: difficulty });
      return difficulty;
    }
    
    // If difficulty is a string, convert it
    if (typeof difficulty === 'string') {
      const difficultyMap = {
        'easy': 0,
        'medium': 1,
        'hard': 2
      };
      const result = difficultyMap[difficulty.toLowerCase()] || 1;
      console.log('🎯 Difficulty string conversion:', { input: difficulty, output: result });
      return result;
    }
    
    // Default fallback
    console.log('🎯 Difficulty fallback to medium:', { input: difficulty, output: 1 });
    return 1;
  }
}

// Export singleton instance
export const gameService = new GameService();
export default gameService;