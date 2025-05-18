# MatchUp Memory Game

MatchUp is an engaging card-matching memory game built with React, featuring user authentication, global leaderboards, and persistent game statistics using Firebase.

![MatchUp Memory Game](https://i.imgur.com/placeholder-image.jpg)

## Live Demo

Visit [MatchUp Memory Game](https://matchup-5c8a1.web.app) to play the game online.

## Game Overview

MatchUp challenges players to test their memory by matching pairs of cards displaying various tech icons. The game features:

- **Multiple Difficulty Levels**: Choose from Easy (6 pairs), Medium (8 pairs), or Hard (9 pairs) modes
- **Time Challenge**: Complete the game before the timer runs out
- **Daily Challenges**: Special daily puzzles with bonus points
- **Duel Mode**: Challenge other players and bet points
- **Point System**: Earn points based on difficulty level and gameplay achievements
- **Global Leaderboard**: Compare your performance with players worldwide
- **Customizable Profile**: Change your display name to personalize your experience

## Key Features

### Gameplay

- **Smooth Card Animations**: Elegant card flipping animations using Framer Motion
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Sound Effects**: Audio feedback enhances the gaming experience
- **Visual Feedback**: Special effects for matches, mismatches, and game completion

### User Experience

- **User Authentication**: Secure login via Bedrock Passport
- **Persistent Progress**: Your game statistics are stored in the cloud
- **Profile Customization**: Update your display name that appears on the leaderboard
- **Offline Support**: Basic gameplay functions even without internet connection
- **Theme and Accessibility**: High-contrast visuals and responsive controls

### Technical Features

- **Firebase Integration**: Real-time database for user data and leaderboards
- **Mobile Optimization**: Touch-friendly controls and mobile viewport adaptations
- **Performance**: Optimized rendering and animations for smooth gameplay
- **Cross-Browser Compatibility**: Works on all modern browsers

## Firebase Integration

The game uses Firebase Firestore to provide:

1. **User Authentication**: Secure login and user management
2. **Real-time Leaderboard**: Global rankings updated instantly
3. **Game Statistics**: Track and store your gameplay metrics:
   - Games played and won
   - Best completion times
   - Win rates across difficulty levels
   - Points earned
4. **Game History**: Review past game performance
5. **Daily Challenge Tracking**: Track daily challenge completions and streaks

## How to Play

1. **Login**: Sign in with your account credentials
2. **Select Difficulty**: Choose your desired difficulty level
3. **Match Cards**: Click cards to flip them and find matching pairs
4. **Beat the Clock**: Complete all matches before time runs out
5. **Earn Points**: Win games to earn points and climb the leaderboard
6. **Daily Challenge**: Complete the daily challenge for bonus points
7. **Duel Mode**: Challenge other players to win their points

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase account (if you want to set up your own instance)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MemoryGame
```

2. Install dependencies:
```bash
npm install
```

### Firebase Setup (Only if creating your own instance)

The game is already connected to a Firebase backend. If you want to set up your own:

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Set up Firestore Database in your project
3. Go to Project Settings > General > Your apps > Web app
4. Click "Add app" if you haven't already added a web app
5. Register your app with a nickname (e.g., "MatchUp")
6. Copy the Firebase configuration object
7. Replace the configuration in `src/firebase/config.js`

### Running the App Locally

Start the development server:

```bash
npm start
```

Visit `http://localhost:3000` in your browser to see the app running.

## Firebase Data Structure

The app uses the following Firestore collections:

### users

Each document is structured as follows:

```
{
  id: string,                   // User's unique ID
  displayName: string,          // User's display name
  email: string,                // User's email (if provided)
  points: number,               // Total points earned
  gamesPlayed: number,          // Total games played
  gamesWon: number,             // Total games won
  bestTime: number | null,      // Best completion time (in seconds)
  winRate: number,              // Win percentage
  createdAt: timestamp,         // Account creation time
  lastLogin: timestamp,         // Last login time
  gameHistory: [                // Array of past games
    {
      timestamp: timestamp,     // When the game was played
      pointsEarned: number,     // Points earned in this game
      result: 'win' | 'loss',   // Game outcome
      difficulty: string,       // Game difficulty
      timeSpent: number         // Time taken to complete (wins only)
    }
  ]
}
```

## Technologies Used

- **React**: Front-end UI library
- **Framer Motion**: Animation library
- **Firebase**: Backend database and authentication
- **TailwindCSS**: Utility-first CSS framework
- **FontAwesome**: Icon library
- **Web Audio API**: Sound effects management

## Deployment

The game is deployed using Firebase Hosting. To deploy your own version:

```bash
npm run build
firebase deploy
```

## Performance Optimizations

- **Dynamic Loading**: Components and assets load as needed
- **Mobile Viewport Fixes**: Special handling for mobile browsers
- **Touch Event Optimization**: Enhanced touch controls for mobile play
- **Caching Strategy**: Local storage backup for offline play

## License

[MIT License](LICENSE)

## Acknowledgments

- Icons provided by FontAwesome
- Sound effects from [source]
- Authentication powered by Bedrock Passport
