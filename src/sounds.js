// Sound effects using base64 encoded audio to avoid file dependencies
const SOUNDS = {
  // Short flip sound (encoded as base64) - fixed truncated version
  flip: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYSAAAAAAAAAbAv+Kc2AAAAAAAAAAAAAAAAAAAA/+MYxAAJCAZnVQEQACa7l3AMAAWdJvcoEQARsAPgAAAOB8H4Pg+D8QA+D8Hwfg+D4Pg+H/5QEQDlgfB8P//KAgCAIA+UBAEB',
  
  // Match success sound
  match: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYWAAAAAAAAAbCdtw3YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4xjEAAqYbqoNVhAAJkuXe0iAAAy8vEIQeBMD4Pg+CAYiAQB4Pg+H33nIOfAIBAIAgCCd5QEB33ggEAQBAEA74IBAEAQD4IBB+CAQBAEAQDvggEAQD373wQCAd8EAgCAIAgHe+CAQBAPhB9974IBAPggEAQD373wQCAIAgCAd8EAgEAQD373wQD4IBAPhB9974IB3wQCAfBAPggHfBAO+CAQD4IBAEAQDvggEAQBAO98EAgCAd8EAgCJE=',
  
  // No match sound
  noMatch: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYaAAAAAAAAAbDPCB9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4xjEAAqYbqoNVhAAJkuXe0iAAAy8vEIQeBMD4Pg+CAYiAQB4Pg+H33nIOfAIBAIAgCCd5QEB33ggEAQBAEA74IBAEAQD4IBB+CAQBAEAQDvggEAQD373wQCAd8EAgCAIAgHe+CAQBAPhB9974IBAPggEAQD373wQCAIAgCAd8EAgEAQD373wQD4IBAPhB9974IB3wQCAfBAPggHfBAO+CAQD4IBAEAQDvggEAQBAO98EAgCAd8EAgCJE=',
  
  // Win sound
  win: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYeAAAAAAAAAbCFFl4IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAKSE6PNUEQAGAvue8RIAhM9L7lEBAkJALACLChQocKDFmCoUKHChQoIsaHChQoUKFCxgsULFChQoUKFDhasaHFChQoUKFChY4UKFChQoUKHDBjBi0KFChQoUKFDxwocKFChQoUKFDBYoUKFChQoUKFDhQoUKFChQoUKHDBjBhQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKFChQoUKA==',
  
  // Lose sound
  lose: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYiAAAAAAAAAbCdaD2QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/+MYxAAKUG6iBVhAAJOu+jUhAAxy9+qRBEREYgPg+D4fB8UBAEAfB8HwfFAQP/B8HxQEDwfB8HwfB8UBAEAQDgf/FAQBAHwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8Hw=',
  
  // Click sound
  click: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYmAAAAAAAAAbCt6B1wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4xjEAAp4TonVQRAAG/AiNURAAJmu+lUhERERiAYHwfB8OB4Pg+D4fB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8HwfB8Hw=',
  
  // Start game sound
  start: 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAiIiIiIiIiIiIiIiIiIiIiIiIiIiIu7u7u7u7u7u7u7u7u7u7u7u7u7u7u93d3d3d3d3d3d3d3d3d3d3d3d3d3d3///////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAYqAAAAAAAAAbB977ugAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/4xjEAAqkNqGtYRAAJDe+pMhAAMy8vEIQeBMD4Pg+CAYiAQB4Pg+H33nIOfAIBAIAgCCd5QEB33ggEAQBAEA74IBAEAQD4IBB+CAQBAEAQDvggEAQD373wQCAd8EAgCAIAgHe+CAQBAPhB9974IBAPggEAQD373wQCAIAgCAd8EAgEAQD373wQD4IBAPhB9974IB3wQCAfBAPggHfBAO+CAQD4IBAEAQDvggEAQBAO98EAgCAd8EAgCJE='
};

// Create sound context for browsers that support it
let audioContext;
try {
  if (typeof window !== 'undefined' && window.AudioContext) {
    audioContext = new window.AudioContext();
  }
} catch (e) {
  console.log('WebAudio not supported, falling back to Audio elements');
}

// Cache for decoded audio data
const audioBufferCache = {};

// Sound element cache
const audioElements = {};

// Sound cache for faster playback
const soundInstances = {};
const MAX_INSTANCES = 3; // Maximum number of instances per sound

// Load audio as buffer for better performance if Web Audio API is available
const loadAudioBuffer = async (key, url) => {
  if (!audioContext) return null;
  
  try {
    // Check if the URL is a data URI with base64 content
    if (!url.startsWith('data:audio')) {
      console.error(`Invalid audio URL format for ${key}`);
      return null;
    }
    
    // Extract the base64 part more safely
    const base64Match = url.match(/^data:audio\/[^;]+;base64,(.*)$/);
    if (!base64Match || !base64Match[1]) {
      console.error(`Could not extract base64 data from URL for ${key}`);
      return null;
    }
    
    const base64Data = base64Match[1];
    
    // Convert base64 to array buffer safely
    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode the audio data
      const buffer = await audioContext.decodeAudioData(bytes.buffer);
      audioBufferCache[key] = buffer;
      return buffer;
    } catch (decodeError) {
      console.error(`Error decoding base64 data for ${key}:`, decodeError);
      return null;
    }
  } catch (error) {
    console.error(`Error loading audio buffer for ${key}:`, error);
    return null;
  }
};

// Function to create audio elements with error handling
const createAudioElement = (url) => {
  try {
    const audio = new Audio();
    
    // Set up error handling (silent)
    audio.onerror = () => { };
    
    // Prevent memory leaks by releasing resources when done
    audio.onended = () => {
      audio.src = '';
    };
    
    // Set the src after adding error handler
    audio.src = url;
    
    return audio;
  } catch (error) {
    // Return a dummy audio element that does nothing
    return { 
      play: () => Promise.resolve(), 
      cloneNode: () => ({ 
        play: () => Promise.resolve(), 
        volume: 0 
      }),
      load: () => {},
      volume: 0
    };
  }
};

// Initialize sound system
const initializeSounds = async () => {
  // Check if audio context is in suspended state and try to resume it
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (err) {
      // Silent error
    }
  }
  
  // Preload all sounds
  const preloadPromises = Object.entries(SOUNDS).map(async ([key, url]) => {
    try {
      // Create a fallback Audio element first (guaranteed to work)
      audioElements[key] = createAudioElement(url);
      
      // Adjust volume for each sound
      audioElements[key].volume = key === 'win' ? 0.5 : 0.2;
      
      // Initialize instance array for this sound
      soundInstances[key] = [];
      
      // Preload sound with Audio element
      audioElements[key].load();
      
      // Try to load as buffer only if audio context is available
      if (audioContext) {
        try {
          await loadAudioBuffer(key, url);
        } catch (bufferError) {
          // Silent error
        }
      }
    } catch (err) {
      // Create simple placeholders so the game doesn't crash on sound playback
      audioElements[key] = { 
        play: () => Promise.resolve(), 
        cloneNode: () => ({ 
          play: () => Promise.resolve(), 
          volume: 0 
        }),
        volume: 0
      };
      soundInstances[key] = [];
    }
  });
  
  try {
    // Wait for all sounds to initialize
    await Promise.allSettled(preloadPromises);
  } catch (err) {
    // Silent error
  }
};

// Initialize sounds as soon as possible
if (typeof window !== 'undefined') {
  // Initialize on page load to ensure browser is ready
  if (document.readyState === 'complete') {
    initializeSounds();
  } else {
    window.addEventListener('load', initializeSounds);
  }
}

// Sound toggle state
let soundEnabled = localStorage.getItem('soundEnabled') === 'false' ? false : true;

// Play sound function with Web Audio API when available
export const playSound = (soundName) => {
  if (!soundEnabled || !SOUNDS[soundName]) return;
  
  try {
    // Try Web Audio API first for better performance
    if (audioContext && audioBufferCache[soundName]) {
      // Check if context is in suspended state
      if (audioContext.state === 'suspended') {
        // Try to resume the context
        audioContext.resume().catch(() => {
          // Silent error
        });
      }
      
      try {
        // Create a source node
        const source = audioContext.createBufferSource();
        source.buffer = audioBufferCache[soundName];
        
        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        gainNode.gain.value = soundName === 'win' ? 0.5 : 0.2;
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Start playback
        source.start(0);
        return;
      } catch (webAudioError) {
        // Continue to Audio element fallback (silent error)
      }
    }
    
    // Fallback to Audio elements if Web Audio API is not available
    const audio = audioElements[soundName];
    if (!audio) {
      // Create a silent placeholder instead of warning
      return;
    }
    
    // Check if we have instances array
    if (!soundInstances[soundName]) {
      soundInstances[soundName] = [];
    }
    
    // Cleanup old instances
    soundInstances[soundName] = soundInstances[soundName].filter(instance => 
      !instance.ended && !instance.paused
    );
    
    // Create a fresh copy to avoid playback issues
    let soundClone;
    
    // Reuse an instance if we have too many
    if (soundInstances[soundName].length >= MAX_INSTANCES) {
      // Reuse oldest instance
      soundClone = soundInstances[soundName].shift();
      try {
        soundClone.currentTime = 0;
      } catch (resetError) {
        soundClone = audio.cloneNode();
      }
    } else {
      // Create new instance
      soundClone = audio.cloneNode();
    }
    
    // Set volume
    try {
      soundClone.volume = audio.volume;
    } catch (volumeError) {
      // Silent error
    }
    
    // Add to instances array
    soundInstances[soundName].push(soundClone);
    
    // Play with error handling
    soundClone.play().catch(() => {
      // Remove this instance from the array as it failed to play
      const index = soundInstances[soundName].indexOf(soundClone);
      if (index > -1) {
        soundInstances[soundName].splice(index, 1);
      }
    });
  } catch (error) {
    // Silent error
  }
};

// Toggle sound on/off
export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('soundEnabled', soundEnabled);
  return soundEnabled;
};

// Check if sound is enabled
export const isSoundEnabled = () => {
  return soundEnabled;
};

// Resume audio context if suspended (needed for browsers that block autoplay)
export const resumeAudio = () => {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(err => {
      console.error('Failed to resume audio context:', err);
    });
  }
};

export default {
  playSound,
  toggleSound,
  isSoundEnabled,
  resumeAudio
}; 