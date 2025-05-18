import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVolumeHigh, faVolumeXmark } from "@fortawesome/free-solid-svg-icons";
import { toggleSound, isSoundEnabled, playSound, resumeAudio } from './sounds.js';

function SoundButton() {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  
  // Ensure state is in sync with localStorage
  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);
  
  const handleToggleSound = () => {
    // Resume audio context first to ensure sound plays
    resumeAudio();
    
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) {
      // Short delay to ensure context is resumed
      setTimeout(() => playSound('click'), 10);
    }
  };
  
  return (
    <button 
      className="fixed top-4 right-4 z-50 bg-slate-800 p-3 rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 transition-colors"
      onClick={handleToggleSound}
      aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
    >
      <FontAwesomeIcon 
        icon={soundOn ? faVolumeHigh : faVolumeXmark} 
        className={soundOn ? "text-yellow-300" : "text-white"}
        size="lg"
      />
    </button>
  );
}

export default SoundButton; 