import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faUser,
  faGoogle,
  faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  
  const { login, register, loginWithGoogle, resetPassword } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      if (showResetForm) {
        await resetPassword(email);
        setResetSent(true);
        return;
      }
      
      if (isLogin) {
        await login(email, password);
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await register(email, password, displayName);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowResetForm(false);
    setResetSent(false);
  };
  
  const toggleResetForm = () => {
    setShowResetForm(!showResetForm);
    setError('');
    setResetSent(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 flex justify-center items-center p-4">
      <motion.div 
        className="bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-xl border border-slate-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Memory Game</h1>
          <p className="text-slate-400">
            {showResetForm 
              ? "Enter your email to reset password" 
              : isLogin 
                ? "Sign in to continue to the game" 
                : "Create an account to play"}
          </p>
        </div>
        
        {error && (
          <motion.div 
            className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
            <span>{error}</span>
          </motion.div>
        )}
        
        {resetSent && (
          <motion.div 
            className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Password reset email sent! Check your inbox.
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {!showResetForm && !isLogin && (
            <div>
              <label className="block text-slate-300 mb-2">Display Name</label>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faUser} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
                />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="bg-slate-700 w-full py-3 pl-10 pr-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Your display name"
                />
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <FontAwesomeIcon 
                icon={faEnvelope} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-700 w-full py-3 pl-10 pr-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          {!showResetForm && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-300">Password</label>
                {isLogin && (
                  <button 
                    type="button"
                    onClick={toggleResetForm}
                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <FontAwesomeIcon 
                  icon={faLock} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 w-full py-3 pl-10 pr-4 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                  required
                />
              </div>
            </div>
          )}
          
          <motion.button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 w-full py-3 rounded-lg text-white font-semibold"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </span>
            ) : showResetForm ? (
              "Send Reset Link"
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </motion.button>
          
          {!showResetForm && (
            <>
              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-slate-700 w-full"></div>
                <span className="bg-slate-800 px-3 text-slate-500 text-sm relative z-10">OR</span>
              </div>
              
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                className="bg-slate-700 hover:bg-slate-600 w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faGoogle} className="mr-2" />
                Sign {isLogin ? "in" : "up"} with Google
              </motion.button>
            </>
          )}
        </form>
        
        <div className="mt-8 text-center">
          {showResetForm ? (
            <button 
              onClick={toggleResetForm}
              className="text-indigo-400 hover:text-indigo-300"
            >
              Back to sign in
            </button>
          ) : (
            <p className="text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                onClick={toggleForm}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 