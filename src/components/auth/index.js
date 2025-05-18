// This file is deprecated. Please use index.jsx instead.
// Export everything from the new file
export * from './index.jsx';

// Temporarily providing mock components for local development
import React from 'react';

// Mock components for local development - using plain JS, no JSX
export const PassportProvider = ({ children }) => children;

export const AuthCallback = () => {
  return {
    type: 'div',
    props: {
      children: 'Authentication bypassed for local development'
    }
  };
};

export const Login = () => {
  return {
    type: 'div',
    props: {
      children: 'Login bypassed for local development'
    }
  };
};

export const Profile = () => {
  return {
    type: 'button',
    props: {
      className: 'px-3 py-2 bg-slate-700 rounded-lg text-white',
      children: 'Local User'
    }
  };
};

// Comment out original exports for reference
// export { default as PassportProvider } from './PassportProvider';
// export { default as AuthCallback } from './AuthCallback';
// export { default as Login } from './Login';
// export { default as Profile } from './Profile'; 