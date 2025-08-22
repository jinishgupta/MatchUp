import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { gameService } from '../web3/gameService.js';

// Create the Web3 context
const Web3Context = createContext();

// Custom hook to use the Web3 context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

// Web3 Provider component
export const Web3Provider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is on correct network (Sepolia chainId: 11155111)
  const isCorrectNetwork = chainId === 11155111;

  // Initialize gameService with provider and signer
  useEffect(() => {
    if (provider && signer) {
      console.log('🔌 Web3Context: Initializing gameService with provider and signer');
      gameService.setProvider(provider, signer);
    }
  }, [provider, signer]);

  // User registration function
  const registerUser = async (displayName) => {
    console.log('👤 Web3Context: registerUser called with displayName:', displayName);
    try {
      if (!gameService.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }
      
      const result = await gameService.registerUser(displayName);
      console.log('✅ Web3Context: User registration result:', result);
      
      if (result.success) {
        // Refresh user registration status after successful registration
        await checkUserRegistration(address);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Web3Context: Error in registerUser:', error);
      return { success: false, error: error.message };
    }
  };

  // Game recording function
  const recordGame = async (won, difficulty, timeSpent, isDailyChallenge = false) => {
    console.log('🎮 Web3Context: recordGame called with:', { won, difficulty, timeSpent, isDailyChallenge });
    try {
      if (!gameService.contract) {
        throw new Error('Contract not initialized. Please connect wallet first.');
      }
      
      const result = await gameService.recordGame(won, difficulty, timeSpent, isDailyChallenge);
      console.log('✅ Web3Context: Game recording result:', result);
      return result;
    } catch (error) {
      console.error('❌ Web3Context: Error in recordGame:', error);
      return { success: false, error: error.message };
    }
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    const installed = typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
    console.log('🔍 MetaMask installation check:', { installed, hasEthereum: !!window.ethereum, isMetaMask: !!window.ethereum?.isMetaMask });
    return installed;
  };

  // Connect to MetaMask
  const connect = async () => {
    console.log('🔌 Web3Context: Attempting to connect to MetaMask...');
    
    if (!isMetaMaskInstalled()) {
      const error = 'MetaMask is not installed. Please install MetaMask to continue.';
      console.error('❌ Web3Context: MetaMask not installed');
      throw new Error(error);
    }

    try {
      setIsConnecting(true);
      console.log('⏳ Web3Context: Requesting account access...');
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('📊 Web3Context: Accounts received:', accounts);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      console.log('✅ Web3Context: Account selected:', account);
      
      // Create provider and signer
      console.log('🔧 Web3Context: Creating Ethers.js provider and signer...');
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      
      // Get network info
      const network = await ethProvider.getNetwork();
      console.log('🌐 Web3Context: Network info:', {
        chainId: network.chainId.toString(),
        name: network.name,
        isCorrectNetwork: Number(network.chainId) === 11155111
      });
      
      setAddress(account);
      setProvider(ethProvider);
      setSigner(ethSigner);
      setChainId(Number(network.chainId));
      setIsConnected(true);
      setIsConnecting(false);

      console.log('✅ Web3Context: Wallet connected successfully!', {
        address: account,
        chainId: Number(network.chainId),
        isCorrectNetwork: Number(network.chainId) === 11155111
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Check user registration status after connection
      setTimeout(() => checkUserRegistration(account), 1000);

      return { success: true, address: account };
    } catch (error) {
      setIsConnecting(false);
      console.error('❌ Web3Context: Connection error:', error);
      console.error('🔍 Web3Context: Connection error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw error;
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts) => {
    console.log('🔄 Web3Context: Accounts changed:', accounts);
    
    if (accounts.length === 0) {
      // User disconnected
      console.log('🚫 Web3Context: No accounts, disconnecting...');
      disconnect();
    } else {
      console.log('👤 Web3Context: Account changed to:', accounts[0]);
      setAddress(accounts[0]);
      
      // Check user registration status for new account
      setTimeout(() => checkUserRegistration(accounts[0]), 1000);
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId) => {
    const newChainId = Number(chainId);
    console.log('🔄 Web3Context: Chain changed:', {
      oldChainId: chainId,
      newChainId: newChainId,
      isCorrectNetwork: newChainId === 11155111
    });
    
    setChainId(newChainId);
    // Reload the page to ensure proper state
    console.log('🔄 Web3Context: Reloading page due to chain change...');
    window.location.reload();
  };

  // Disconnect wallet
  const disconnect = () => {
    console.log('🚫 Web3Context: Disconnecting wallet...');
    
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
    setUser(null);
    setIsRegistered(false);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
    
    console.log('✅ Web3Context: Wallet disconnected successfully');
  };

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    console.log('🔄 Web3Context: Attempting to switch to Sepolia network...');
    
    if (!isMetaMaskInstalled()) {
      const error = 'MetaMask is not installed';
      console.error('❌ Web3Context: MetaMask not installed for network switch');
      throw new Error(error);
    }

    try {
      console.log('📝 Web3Context: Requesting network switch to Sepolia...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });
      console.log('✅ Web3Context: Successfully switched to Sepolia network');
    } catch (switchError) {
      console.log('⚠️ Web3Context: Network switch failed, attempting to add network...', switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          console.log('📝 Web3Context: Adding Sepolia network to MetaMask...');
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7', // Sepolia chainId in hex
                chainName: 'Sepolia Testnet',
              nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          console.log('✅ Web3Context: Sepolia network added to MetaMask successfully');
        } catch (addError) {
          console.error('❌ Web3Context: Failed to add Sepolia network:', addError);
          throw new Error('Failed to add Sepolia network to MetaMask');
        }
      } else {
        console.error('❌ Web3Context: Network switch error:', switchError);
        throw switchError;
      }
    }
  };

  // Check user registration status
  const checkUserRegistration = async (userAddress) => {
    if (!userAddress || !gameService.contract) return;
    
    try {
      console.log('🔍 Web3Context: Checking user registration status for:', userAddress);
      const userData = await gameService.getUser(userAddress);
      
      if (userData && userData.exists) {
        console.log('✅ Web3Context: User is registered:', userData);
        setUser(userData);
        setIsRegistered(true);
      } else {
        console.log('ℹ️ Web3Context: User is not registered');
        setUser(null);
        setIsRegistered(false);
      }
    } catch (error) {
      console.log('ℹ️ Web3Context: User not found or error checking registration:', error.message);
      setUser(null);
      setIsRegistered(false);
    }
  };

  // Initialize user data when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      // Initialize user data
      console.log('✅ Web3Context: Wallet connected and ready:', {
        address: address,
        chainId: chainId,
        isCorrectNetwork: isCorrectNetwork
      });
      
      // Check user registration status
      checkUserRegistration(address);
    }
  }, [isConnected, address, chainId, isCorrectNetwork]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      console.log('🔍 Web3Context: Checking for existing wallet connection...');
      
      if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
        try {
          console.log('📝 Web3Context: Found existing MetaMask connection, requesting accounts...');
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          console.log('📊 Web3Context: Existing accounts found:', accounts);
          
          if (accounts.length > 0) {
            console.log('🔧 Web3Context: Setting up existing connection...');
            const ethProvider = new ethers.BrowserProvider(window.ethereum);
            const ethSigner = await ethProvider.getSigner();
            const network = await ethProvider.getNetwork();
            
            console.log('🌐 Web3Context: Existing network info:', {
              chainId: network.chainId.toString(),
              name: network.name,
              isCorrectNetwork: Number(network.chainId) === 11155111
            });
            
            setAddress(accounts[0]);
            setProvider(ethProvider);
            setSigner(ethSigner);
            setChainId(Number(network.chainId));
            setIsConnected(true);
            
            // Set up event listeners
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            
            // Check user registration status after restoring connection
            setTimeout(() => checkUserRegistration(accounts[0]), 1000);
            
            console.log('✅ Web3Context: Existing connection restored successfully');
          }
        } catch (error) {
          console.error('❌ Web3Context: Error checking existing connection:', error);
          console.error('🔍 Web3Context: Connection check error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
          });
        }
      } else {
        console.log('ℹ️ Web3Context: No existing MetaMask connection found');
      }
    };

    checkConnection();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Web3Context: Cleaning up event listeners...');
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const value = {
    // Connection state
    address,
    isConnected,
    isConnecting,
    chainId,
    isCorrectNetwork,
    provider,
    signer,
    
    // User state
    user,
    isRegistered,
    loading,
    
    // Connection methods
    connect,
    disconnect,
    switchToSepolia,
    
    // Utility methods
    isMetaMaskInstalled,
    registerUser,
    recordGame
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};