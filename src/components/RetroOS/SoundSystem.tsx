import React, { useEffect, useRef } from 'react';

interface SoundSystemProps {
  enabled: boolean;
}

export const SoundSystem: React.FC<SoundSystemProps> = ({ enabled }) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, [enabled]);

  const playBeep = (frequency: number, duration: number, volume: number = 0.1) => {
    if (!enabled || !audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'square';

    gainNode.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Expose sound functions globally for use in other components
  useEffect(() => {
    (window as any).retroSounds = {
      beep: () => playBeep(800, 0.1),
      error: () => playBeep(200, 0.3),
      success: () => playBeep(1000, 0.2),
      boot: () => {
        playBeep(440, 0.1);
        setTimeout(() => playBeep(880, 0.1), 100);
        setTimeout(() => playBeep(1320, 0.2), 200);
      }
    };

    return () => {
      delete (window as any).retroSounds;
    };
  }, [enabled]);

  return null;
};