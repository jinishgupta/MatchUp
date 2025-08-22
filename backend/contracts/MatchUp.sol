// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MatchUpGame
 * @dev Smart contract for the MatchUp memory game
 * Stores user profiles, game results, leaderboard data, and daily challenges
 */
contract MatchUpGame {
    // Events
    event UserRegistered(address indexed user, string displayName);
    event GameCompleted(address indexed user, uint256 gameId, bool won, uint8 difficulty, uint256 timeSpent, uint256 pointsEarned);
    event DailyChallengeCompleted(address indexed user, uint256 date, uint8 difficulty, uint256 pointsEarned);
    event DisplayNameUpdated(address indexed user, string newDisplayName);

    // Structs
    struct User {
        string displayName;
        uint256 totalPoints;
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 bestTime; // Best completion time in seconds
        uint256 joinedAt;
        uint256 lastGameAt;
        bool exists;
    }

    struct GameResult {
        uint256 gameId;
        address player;
        bool won;
        uint8 difficulty; // 0=Easy, 1=Medium, 2=Hard
        uint256 timeSpent;
        uint256 pointsEarned;
        uint256 timestamp;
        bool isDailyChallenge;
    }

    struct DailyChallenge {
        uint256 date; // YYYYMMDD format
        uint8 difficulty;
        bool completed;
        uint256 pointsEarned;
        uint256 completedAt;
    }

    // State variables
    mapping(address => User) public users;
    mapping(uint256 => GameResult) public gameResults;
    mapping(address => mapping(uint256 => DailyChallenge)) public dailyChallenges; // user => date => challenge
    mapping(address => uint256[]) public userGameIds;
    
    address[] public userAddresses;
    uint256 public totalGames;
    uint256 public totalUsers;

    // Constants for points
    uint256 public constant EASY_POINTS = 50;
    uint256 public constant MEDIUM_POINTS = 100;
    uint256 public constant HARD_POINTS = 150;
    uint256 public constant DAILY_MULTIPLIER = 2;

    // Modifiers
    modifier userExists() {
        require(users[msg.sender].exists, "User not registered");
        _; 
    }

    modifier validDifficulty(uint8 _difficulty) {
        require(_difficulty <= 2, "Invalid difficulty level");
        _;
    }

    /**
     * @dev Register a new user or update existing user's last activity
     * @param _displayName Display name for the user
     */
    function registerUser(string memory _displayName) external {
        require(bytes(_displayName).length > 0, "Display name cannot be empty");
        require(bytes(_displayName).length <= 50, "Display name too long");

        if (!users[msg.sender].exists) {
            users[msg.sender] = User({
                displayName: _displayName,
                totalPoints: 0,
                gamesPlayed: 0,
                gamesWon: 0,
                bestTime: 0,
                joinedAt: block.timestamp,
                lastGameAt: 0,
                exists: true
            });
            userAddresses.push(msg.sender);
            totalUsers++;
            emit UserRegistered(msg.sender, _displayName);
        } else {
            users[msg.sender].displayName = _displayName;
            emit DisplayNameUpdated(msg.sender, _displayName);
        }
    }

    /**
     * @dev Record a completed game
     * @param _won Whether the player won
     * @param _difficulty Game difficulty (0=Easy, 1=Medium, 2=Hard)
     * @param _timeSpent Time spent in seconds (only for wins)
     * @param _isDailyChallenge Whether this was a daily challenge
     */
    function recordGame(
        bool _won,
        uint8 _difficulty,
        uint256 _timeSpent,
        bool _isDailyChallenge
    ) external userExists validDifficulty(_difficulty) {
        totalGames++;
        
        // Calculate points
        uint256 points = 0;
        if (_won) {
            if (_difficulty == 0) points = EASY_POINTS;
            else if (_difficulty == 1) points = MEDIUM_POINTS;
            else points = HARD_POINTS;
            
            if (_isDailyChallenge) {
                points *= DAILY_MULTIPLIER;
            }
        }

        // Update user stats
        User storage user = users[msg.sender];
        user.gamesPlayed++;
        user.lastGameAt = block.timestamp;
        
        if (_won) {
            user.gamesWon++;
            user.totalPoints += points;
            
            // Update best time if this is better (and not zero)
            if (_timeSpent > 0 && (user.bestTime == 0 || _timeSpent < user.bestTime)) {
                user.bestTime = _timeSpent;
            }
        }

        // Record game result
        GameResult memory gameResult = GameResult({
            gameId: totalGames,
            player: msg.sender,
            won: _won,
            difficulty: _difficulty,
            timeSpent: _won ? _timeSpent : 0,
            pointsEarned: points,
            timestamp: block.timestamp,
            isDailyChallenge: _isDailyChallenge
        });

        gameResults[totalGames] = gameResult;
        userGameIds[msg.sender].push(totalGames);

        // Handle daily challenge completion
        if (_won && _isDailyChallenge) {
            uint256 today = getCurrentDate();
            dailyChallenges[msg.sender][today] = DailyChallenge({
                date: today,
                difficulty: _difficulty,
                completed: true,
                pointsEarned: points,
                completedAt: block.timestamp
            });
            emit DailyChallengeCompleted(msg.sender, today, _difficulty, points);
        }

        emit GameCompleted(msg.sender, totalGames, _won, _difficulty, _timeSpent, points);
    }

    /**
     * @dev Get user profile information
     * @param _user Address of the user
     * @return User struct data
     */
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }

    /**
     * @dev Get user's game history
     * @param _user Address of the user
     * @param _offset Starting index
     * @param _limit Maximum number of games to return
     * @return Array of GameResult structs
     */
    function getUserGames(address _user, uint256 _offset, uint256 _limit) 
        external view returns (GameResult[] memory) {
        uint256[] memory gameIds = userGameIds[_user];
        require(_offset < gameIds.length, "Offset out of bounds");
        
        uint256 end = _offset + _limit;
        if (end > gameIds.length) {
            end = gameIds.length;
        }
        
        GameResult[] memory results = new GameResult[](end - _offset);
        for (uint256 i = _offset; i < end; i++) {
            results[i - _offset] = gameResults[gameIds[i]];
        }
        
        return results;
    }

    /**
     * @dev Get leaderboard (top players by points)
     * @param _limit Maximum number of players to return
     * @return Array of user addresses sorted by points (descending)
     * @return Array of corresponding point totals
     */
    function getLeaderboard(uint256 _limit) external view 
        returns (address[] memory, uint256[] memory) {
        require(_limit > 0 && _limit <= 100, "Invalid limit");
        
        uint256 length = totalUsers < _limit ? totalUsers : _limit;
        address[] memory topUsers = new address[](length);
        uint256[] memory topPoints = new uint256[](length);
        
        // Simple insertion sort for top players
        // Note: For large datasets, consider implementing pagination or off-chain sorting
        for (uint256 i = 0; i < userAddresses.length && i < _limit; i++) {
            address currentUser = userAddresses[i];
            uint256 currentPoints = users[currentUser].totalPoints;
            
            uint256 j = i;
            while (j > 0 && currentPoints > topPoints[j-1]) {
                if (j < length) {
                    topUsers[j] = topUsers[j-1];
                    topPoints[j] = topPoints[j-1];
                }
                j--;
            }
            
            if (j < length) {
                topUsers[j] = currentUser;
                topPoints[j] = currentPoints;
            }
        }
        
        return (topUsers, topPoints);
    }

    /**
     * @dev Check if user completed daily challenge
     * @param _user Address of the user
     * @param _date Date in YYYYMMDD format
     * @return Whether the challenge was completed
     */
    function isDailyChallengeCompleted(address _user, uint256 _date) 
        external view returns (bool) {
        return dailyChallenges[_user][_date].completed; 
    }

    /**
     * @dev Get current date in YYYYMMDD format
     * @return Current date
     */
    function getCurrentDate() public view returns (uint256) {
        // Simplified date calculation using block timestamp
        // For daily challenges, we use the day number since epoch
        uint256 daysSinceEpoch = block.timestamp / 86400;
        
        // Convert to a simple YYYYMMDD format
        // This is sufficient for daily challenges
        uint256 year = 2024; // Starting year for simplicity
        uint256 dayOfYear = daysSinceEpoch % 365;
        uint256 month = (dayOfYear / 30) + 1; // Approximate month
        uint256 day = (dayOfYear % 30) + 1; // Approximate day
        
        // Ensure values are within valid ranges
        if (month > 12) month = 12;
        if (day > 31) day = 31;
        
        return year * 10000 + month * 100 + day;
    }

    /**
     * @dev Get total number of users
     * @return Total users count
     */
    function getTotalUsers() external view returns (uint256) {
        return totalUsers;
    }

    /**
     * @dev Get total number of games
     * @return Total games count
     */
    function getTotalGames() external view returns (uint256) {
        return totalGames;
    }

    /**
     * @dev Get user's rank in leaderboard
     * @param _user Address of the user
     * @return User's rank (1-based, 0 if not found)
     */
    function getUserRank(address _user) external view returns (uint256) {
        if (!users[_user].exists) return 0;
        
        uint256 userPoints = users[_user].totalPoints;
        uint256 rank = 1;
        
        for (uint256 i = 0; i < userAddresses.length; i++) {
            if (userAddresses[i] != _user && users[userAddresses[i]].totalPoints > userPoints) {
                rank++;
            }
        }
        
        return rank;
    }
}