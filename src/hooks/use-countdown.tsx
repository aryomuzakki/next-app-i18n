import { useCallback, useEffect, useRef, useState } from "react";

interface CountdownOptions {
  autoStart?: boolean;
  onComplete?: () => void;
}

export function useCountdown(initialMs: number, options: CountdownOptions = {}) {
  const { autoStart = true, onComplete } = options;

  const [timeLeft, setTimeLeft] = useState(initialMs);
  const [isRunning, setIsRunning] = useState(autoStart);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialRef = useRef(initialMs);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((ms?: number) => {
    setTimeLeft(ms ?? initialRef.current);
    setIsRunning(autoStart);
  }, [autoStart]);

  // countdown logic
  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clear();
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clear();
  }, [isRunning, onComplete]);

  const formatted = useCallback(() => {
    const totalSeconds = Math.floor(timeLeft / 1000);
    const hours = Math.floor(timeLeft / 1000 / 60 / 60);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");

    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  }, [timeLeft]);

  return {
    timeLeft,
    isRunning,
    seconds: Math.floor(timeLeft / 1000),
    minutes: Math.floor(timeLeft / 1000 / 60),
    hours: Math.floor(timeLeft / 1000 / 60 / 60),
    formatted: formatted(),
    start,
    pause,
    reset,
  };
}
