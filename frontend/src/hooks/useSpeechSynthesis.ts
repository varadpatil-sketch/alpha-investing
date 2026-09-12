import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setRate: (rate: number) => void;
  isSpeaking: boolean;
  isPaused: boolean;
  rate: number;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [rate, setRateState] = useState<number>(1.0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(60);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const textRef = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      stop();
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 60) return 60;
        return prev + 1;
      });
    }, 1000 / rate);
  };

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopTimer();
    setIsSpeaking(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      stopTimer();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      startTimer();
      setIsPaused(false);
    }
  }, [rate]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Web Speech Synthesis API is not supported in this browser.');
        return;
      }

      window.speechSynthesis.cancel();
      stopTimer();

      textRef.current = text;
      const wordCount = text.split(/\s+/).length;
      // Average speech rate is ~150 words per minute (2.5 words/sec)
      const estimatedDuration = Math.round(wordCount / 2.5);
      setTotalDurationSeconds(estimatedDuration || 60);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      // Pick a natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        null;

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setElapsedSeconds(0);
        startTimer();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        stopTimer();
        setElapsedSeconds(estimatedDuration || 60);
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setIsSpeaking(false);
        setIsPaused(false);
        stopTimer();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate]
  );

  const setRate = useCallback(
    (newRate: number) => {
      setRateState(newRate);
      if (isSpeaking && !isPaused && textRef.current) {
        // Re-speak with new speed
        speak(textRef.current);
      }
    },
    [isSpeaking, isPaused, speak]
  );

  return {
    speak,
    pause,
    resume,
    stop,
    setRate,
    isSpeaking,
    isPaused,
    rate,
    elapsedSeconds,
    totalDurationSeconds,
    isSupported,
  };
}
