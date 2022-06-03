import { useEffect, useRef } from 'react';
import {
  clearHarmonicInterval,
  setHarmonicInterval,
} from 'set-harmonic-interval';

// eslint-disable-next-line @typescript-eslint/ban-types
const useHarmonicIntervalFn = (fn: () => void, delay: number | null = 0) => {
  const latestCallback = useRef<() => void>(() => {
    /* do nothing */
  });

  useEffect(() => {
    latestCallback.current = fn;
  });

  useEffect(() => {
    if (delay !== null) {
      const interval = setHarmonicInterval(() => {
        latestCallback.current();
      }, delay);
      return () => {
        clearHarmonicInterval(interval);
      };
    }

    return undefined;
  }, [delay]);
};

export default useHarmonicIntervalFn;
