import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// Import Firebase to ensure it's initialized
import firebaseApp from './firebase/config.js'

// Import Orange ID components
import { PassportProvider } from './components/auth/index.jsx'
import { AuthCallback } from './components/auth/index.jsx'
import '@bedrock_org/passport/dist/style.css'

// Store original console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Create a more efficient warning filter
const suppressedMessages = [
  'React Router Future Flag Warning',
  'v7_startTransition', 
  'v7_relativeSplatPath',
  'FirebaseError',
  'CONFIGURATION_NOT_FOUND',
  'getProjectConfig',
  'WalletConnect',
  'EventEmitter'
];

// More efficient message filtering
console.warn = function(msg, ...args) {
  if (typeof msg === 'string' && suppressedMessages.some(term => msg.includes(term))) {
    return; // Suppress matching warnings
  }
  originalConsoleWarn(msg, ...args);
};

console.error = function(msg, ...args) {
  if (typeof msg === 'string' && suppressedMessages.some(term => msg.includes(term))) {
    return; // Suppress matching errors
  }
  originalConsoleError(msg, ...args);
};

try {
  // Dynamically import memory icon
  import('./assets/memory-icon.svg')
    .then(module => {
      const memoryIcon = module.default;
      
      // Set favicon
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/svg+xml'
      link.href = memoryIcon
      document.head.appendChild(link)
    })
    .catch(err => {
      console.warn('Could not load favicon:', err);
    });
} catch (e) {
  console.warn('Error setting favicon:', e);
}

const root = document.getElementById('root');

// Add mobile viewport height fix
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Use a debounced version of setViewportHeight for better performance
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Create debounced handler
const debouncedSetViewportHeight = debounce(setViewportHeight, 100);

// Listeners to cleanup on unmount
const eventListeners = [
  { event: 'resize', handler: debouncedSetViewportHeight, options: undefined },
  { event: 'orientationchange', handler: debouncedSetViewportHeight, options: undefined },
  { event: 'scroll', handler: debouncedSetViewportHeight, options: { passive: true } }
];

// Add event listeners
eventListeners.forEach(({ event, handler, options }) => {
  window.addEventListener(event, handler, options);
});

// Also update when document is fully loaded
document.addEventListener('DOMContentLoaded', setViewportHeight);

// Create a custom error event handler to suppress Firebase errors
const errorHandler = (event) => {
  if (event.message && suppressedMessages.some(term => event.message.includes(term))) {
    console.log('Suppressed error:', event.message);
    event.preventDefault();
  }
};

// Add error event handler
window.addEventListener('error', errorHandler, true);

// Create a cleanup function for when the app unmounts
const cleanup = () => {
  // Restore original console methods
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  
  // Remove event listeners
  eventListeners.forEach(({ event, handler, options }) => {
    window.removeEventListener(event, handler, options);
  });
  
  // Remove error handler
  window.removeEventListener('error', errorHandler, true);
  
  // Remove DOMContentLoaded listener if app is remounted
  document.removeEventListener('DOMContentLoaded', setViewportHeight);
};

// Create a cleanup function for component unmounting
React.useEffect = ((originalUseEffect) => {
  return function(effect, deps) {
    return originalUseEffect(() => {
      const cleanup = effect();
      return () => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }, deps);
  };
})(React.useEffect);

// Create the React application
const app = (
  <React.StrictMode>
    <PassportProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </PassportProvider>
  </React.StrictMode>
);

// Mount the application
const rootInstance = createRoot(root);
rootInstance.render(app);

// If hot module replacement is enabled, add cleanup on reload
if (import.meta.hot) {
  import.meta.hot.dispose(cleanup);
}
