import React, { useState } from 'react';
import { useBedrockPassport } from "@bedrock_org/passport";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faUserCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Profile = () => {
  const { isLoggedIn, user, signOut } = useBedrockPassport();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    // Refresh page after logout
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Profile button to toggle dropdown */}
      <button 
        onClick={toggleMenu}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
      >
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name || "User"} 
            className="w-8 h-8 rounded-full border-2 border-orange-400"
          />
        ) : (
          <FontAwesomeIcon icon={faUserCircle} className="w-8 h-8 text-orange-400" />
        )}
        <div className="text-left hidden sm:block">
          <p className="font-medium text-sm text-white">{user.displayName || user.name || "User"}</p>
        </div>
        <FontAwesomeIcon 
          icon={faChevronDown} 
          className={`text-xs text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {/* Dropdown menu */}
      {isMenuOpen && (
        <motion.div 
          className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg border border-slate-700 z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-3 border-b border-slate-700">
            <p className="text-sm font-medium text-white">{user.displayName || user.name}</p>
            {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-3 text-left text-sm text-white bg-red-600 hover:bg-red-700 transition-colors rounded-b-lg"
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Profile; 