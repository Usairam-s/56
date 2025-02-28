import { useEffect } from 'react';

// This is a simplified version that doesn't do any preloading
// to avoid complicating the voice system
export function useVoicePreloader() {
  // Intentionally empty to disable preloading completely
  useEffect(() => {
    console.log("Voice preloading disabled");
  }, []);

  return;
}