import {useCallback, useRef, useState} from 'react';

/**
 * button submit logic looks like this:
 * - lock button when clicked
 * - unlock button when done
 * - prevent multiple click
 * - prevent multiple submit
 * @param {*} fn onPress
 * @param {*} options {timeout}
 * @returns
 */
export function useSubmitLock(fn, options = {}) {
  const {timeout = 0, manual = false} = options;

  const [loading, setLoading] = useState(false);
  const lockRef = useRef(false);
  const timerRef = useRef(null);

  const run = useCallback(
    async (...args) => {
      // Prevent multiple click
      if (lockRef.current) {
        return;
      }

      lockRef.current = true;
      setLoading(true);

      // Fallback timer (prevents RN crash / page unloading)
      if (timeout > 0) {
        timerRef.current = setTimeout(() => {
          lockRef.current = false;
          setLoading(false);
        }, timeout);
      }

      try {
        return await fn(...args);
      } finally {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        // If the lock has been unlocked by the timeout mechanism, do not attempt to unlock it again.
        if (!lockRef.current) {
          return;
        }

        setLoading(false);

        if (manual) {
          return;
        }

        lockRef.current = false;
      }
    },
    [fn, timeout, manual],
  );

  const unlock = () => {
    lockRef.current = false;
  };

  return {
    loading,
    running: lockRef.current,
    run,
    unlock,
  };
}
