import React from 'react';
import { useWeb3 } from '../contexts/Web3Context.jsx';

const WalletConnect = () => {
  const { 
    address, 
    isConnected, 
    isConnecting, 
    isCorrectNetwork, 
    connect, 
    disconnect, 
    switchToSepolia 
  } = useWeb3();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
      alert(`Connection failed: ${error.message}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchToSepolia();
    } catch (error) {
      console.error('Network switch failed:', error);
      alert(`Network switch failed: ${error.message}`);
    }
  };

  if (isConnecting) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800">Connect Your Wallet</h3>
        <p className="text-gray-600 text-center">
          Connect your MetaMask wallet to start playing MatchUp!
        </p>
        <button
          onClick={handleConnect}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <span>Connect MetaMask</span>
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-xl font-semibold text-yellow-800">Wrong Network</h3>
        <p className="text-yellow-700 text-center">
          Please switch to Sepolia testnet to play MatchUp.
        </p>
        <button
          onClick={handleSwitchNetwork}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Switch to Sepolia
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg">
      <h3 className="text-xl font-semibold text-green-800">Wallet Connected!</h3>
      <p className="text-green-700 text-center">
        Connected to: {address?.slice(0, 6)}...{address?.slice(-4)}
      </p>
      <button
        onClick={handleDisconnect}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
      >
        Disconnect
      </button>
    </div>
  );
};

export default WalletConnect;