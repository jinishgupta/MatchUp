# MatchUp Memory Game - Web3 Edition

A blockchain-powered memory matching game built with React, Solidity, and deployed on Sepolia testnet. Players can register, compete in daily challenges, and track their progress on-chain.

## 🌟 Features

- **MetaMask Authentication**: Connect with your Ethereum wallet
- **On-Chain Data Storage**: User profiles, game results, and leaderboard stored on blockchain
- **Daily Challenges**: Complete daily challenges for bonus rewards
- **Real-time Leaderboard**: Compete with other players
- **Multiple Difficulty Levels**: Easy, Medium, and Hard modes
- **Progressive Web App**: Mobile-friendly responsive design

## 🛠 Tech Stack

- **Frontend**: React + Vite, TailwindCSS, Framer Motion
- **Web3**: Wagmi, Viem, MetaMask integration
- **Smart Contract**: Solidity 0.8.19
- **Deployment**: Hardhat, Sepolia testnet
- **Subgraph**: The Graph Protocol (optional)

## 📋 Prerequisites

- Node.js 18+ 
- MetaMask browser extension
- Sepolia testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-username/MatchUp.git
cd MatchUp

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Set up Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# - Get Sepolia RPC URL from Infura/Alchemy
# - Export private key from MetaMask
# - Get Etherscan API key from etherscan.io
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Contract address will be automatically updated after deployment
```

### 3. Deploy Smart Contract

```bash
cd backend

# Compile contract
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# The deployment script will:
# - Deploy the contract
# - Verify on Etherscan
# - Update frontend config automatically
# - Save deployment info
```

### 4. Start Frontend

```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` and connect your MetaMask wallet!

## 🔧 Smart Contract Details

### MatchUpGame Contract Features

- **User Registration**: Players register with display names
- **Game Recording**: All game results stored on-chain
- **Leaderboard**: Real-time rankings by total points
- **Daily Challenges**: Special challenges with bonus rewards
- **Point System**: 
  - Easy: 50 points
  - Medium: 100 points  
  - Hard: 150 points
  - Daily Challenge: 2x multiplier

### Contract Functions

```solidity
// User management
function registerUser(string memory _displayName) external
function getUser(address _user) external view returns (User memory)

// Game mechanics  
function recordGame(bool _won, uint8 _difficulty, uint256 _timeSpent, bool _isDailyChallenge) external
function getLeaderboard(uint256 _limit) external view returns (address[] memory, uint256[] memory)

// Daily challenges
function isDailyChallengeCompleted(address _user, uint256 _date) external view returns (bool)
```

## 🎮 How to Play

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask connection
2. **Register**: Enter your display name to create on-chain profile
3. **Choose Difficulty**: Select Easy (6 pairs), Medium (8 pairs), or Hard (10 pairs)
4. **Play**: Match all pairs before time runs out
5. **Earn Points**: Win games to earn points and climb the leaderboard
6. **Daily Challenge**: Complete special daily challenges for bonus rewards

## 📱 Game Modes

- **Regular Game**: Choose your difficulty and play
- **Daily Challenge**: Special challenge with fixed difficulty and bonus rewards
- **Leaderboard**: View top players and your ranking

## 🌐 Deployment Options

### Local Development
```bash
# Start local hardhat network
npx hardhat node

# Deploy to local network  
npx hardhat run scripts/deploy.js --network localhost
```

### Sepolia Testnet (Recommended)
```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
```

### Production Deployment

#### Frontend (Netlify/Vercel)
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting provider
3. Set environment variables in your hosting provider's dashboard

#### Smart Contract (Mainnet)
1. Update hardhat.config.cjs with mainnet settings
2. Fund your deployer wallet with ETH
3. Deploy: `npx hardhat run scripts/deploy.js --network mainnet`

## 🔍 Contract Verification

The deployment script automatically verifies contracts on Etherscan. Manual verification:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 📊 The Graph Subgraph (Optional)

For enhanced performance, deploy a subgraph:

1. Update `backend/subgraph/subgraph.yaml` with your contract address
2. Deploy to The Graph Protocol
3. Update `VITE_SUBGRAPH_URL` in frontend `.env`

## 🛡 Security Considerations

- Private keys stored in `.env` files (never commit!)
- Smart contract uses OpenZeppelin patterns
- Frontend validates all inputs
- MetaMask signature required for transactions

## 🧪 Testing

```bash
# Test smart contracts
cd backend
npx hardhat test

# Test frontend
cd frontend  
npm run test
```

## 📝 Environment Variables Reference

### Backend `.env`
```bash
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
REPORT_GAS=true
```

### Frontend `.env`
```bash
VITE_CONTRACT_ADDRESS=0x...
VITE_SUBGRAPH_URL=https://api.thegraph.com/subgraphs/name/...
VITE_DEBUG=false
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://your-app-url.netlify.app)
- [Smart Contract](https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS)
- [Documentation](https://github.com/your-username/MatchUp/wiki)

## 🆘 Troubleshooting

### Common Issues

1. **MetaMask not connecting**: Refresh page and try again
2. **Wrong network**: Switch to Sepolia in MetaMask
3. **Transaction failed**: Check you have enough Sepolia ETH
4. **Contract not found**: Verify contract address in `.env`

### Getting Help

- Check console for error messages
- Verify network and contract address
- Ensure wallet has sufficient balance
- Review transaction on Etherscan

---

Built with ❤️ for the Web3 gaming community 