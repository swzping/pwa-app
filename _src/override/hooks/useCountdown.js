import {useCallback, useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';

const MS_PER_SECOND = 1000;

/**
 * Generic countdown hook (extracted from OrderCard, reusable across pages)
 * ---------------------------------------------------------------
 * Usage:
 *  1. Absolute expiration timestamp (ms), e.g. order expiry:
 *     const {formatted} = useCountdown({expireTimestamp, onExpire});
 *  2. Relative duration (seconds), e.g. 60s verification code resend:
 *     const {remaining, restart} = useCountdown({durationSeconds: 60});
 *
 * Features:
 *  - Recalculates from Date.now() on every tick, immune to timer drift
 *  - onExpire is kept in a ref: changing the callback identity never
 *    rebuilds the timer, and it is guaranteed to fire only once
 *  - RN suspends timers while backgrounded; remaining time is
 *    recalibrated automatically when the app returns to foreground
 *  - Supports manual start / pause / restart control (e.g. driven by
 *    FlatList visibility)
 * ---------------------------------------------------------------
 */
const useCountdown = ({
  expireTimestamp = null,
  durationSeconds = null,
  onExpire = null,
  autoStart = true,
  intervalMs = 1000,
} = {}) => {
  // Resolve the absolute expiration timestamp (ms):
  // prefer expireTimestamp, fall back to durationSeconds
  const resolveExpireAt = useCallback(() => {
    const timestamp = Number(expireTimestamp);
    if (Number.isFinite(timestamp) && timestamp > 0) {
      return timestamp;
    }
    const duration = Number(durationSeconds);
    if (Number.isFinite(duration) && duration > 0) {
      return Date.now() + duration * MS_PER_SECOND;
    }
    return null;
  }, [durationSeconds, expireTimestamp]);

  const calcRemaining = useCallback(
    targetExpireAt =>
      targetExpireAt
        ? Math.max(0, Math.floor((targetExpireAt - Date.now()) / MS_PER_SECOND))
        : 0,
    [],
  );

  const [expireAt, setExpireAt] = useState(() => resolveExpireAt());
  const [remaining, setRemaining] = useState(() => calcRemaining(expireAt));
  const [isRunning, setIsRunning] = useState(autoStart);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Always hold the latest onExpire reference, so it never enters
  // effect deps and never causes the timer to be rebuilt
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Recalibrate when inputs change (e.g. server refreshes the expiry time)
  useEffect(() => {
    const nextExpireAt = resolveExpireAt();
    expiredRef.current = false;
    setExpireAt(nextExpireAt);
    setRemaining(calcRemaining(nextExpireAt));
  }, [resolveExpireAt, calcRemaining]);

  const fireExpire = useCallback(() => {
    if (expiredRef.current) {
      return;
    }
    expiredRef.current = true;
    onExpireRef.current?.();
  }, []);

  // Core ticking logic: the interval only depends on expireAt / isRunning,
  // so it is never torn down and recreated every second
  useEffect(() => {
    if (!expireAt || !isRunning) {
      return undefined;
    }

    if (calcRemaining(expireAt) <= 0) {
      setRemaining(0);
      setIsRunning(false);
      fireExpire();
      return undefined;
    }

    const timerId = setInterval(() => {
      const next = calcRemaining(expireAt);
      setRemaining(next);
      if (next <= 0) {
        clearInterval(timerId);
        setIsRunning(false);
        fireExpire();
      }
    }, intervalMs);

    return () => clearInterval(timerId);
  }, [expireAt, isRunning, intervalMs, calcRemaining, fireExpire]);

  // Recalibrate immediately when the app returns to foreground
  // (setInterval is suspended while backgrounded; waiting for the next
  // tick alone would lag behind the real remaining time)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active') {
        return;
      }
      const next = calcRemaining(expireAt);
      setRemaining(next);
      if (expireAt && next <= 0) {
        setIsRunning(false);
        fireExpire();
      }
    });
    return () => subscription.remove();
  }, [expireAt, calcRemaining, fireExpire]);

  const start = useCallback(() => {
    if (expireAt && calcRemaining(expireAt) > 0) {
      expiredRef.current = false;
      setIsRunning(true);
    }
  }, [expireAt, calcRemaining]);

  const pause = useCallback(() => setIsRunning(false), []);

  // Reset and start over: for flows like verification code resend,
  // optionally pass a new duration (seconds)
  const restart = useCallback(
    nextDurationSeconds => {
      const duration = Number(nextDurationSeconds ?? durationSeconds);
      const nextExpireAt =
        Number.isFinite(duration) && duration > 0
          ? Date.now() + duration * MS_PER_SECOND
          : resolveExpireAt();
      expiredRef.current = false;
      setExpireAt(nextExpireAt);
      setRemaining(calcRemaining(nextExpireAt));
      setIsRunning(Boolean(nextExpireAt));
    },
    [calcRemaining, durationSeconds, resolveExpireAt],
  );

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const formatted = [hours, minutes, seconds]
    .map(part => String(part).padStart(2, '0'))
    .join(':');

  return {
    /** Remaining seconds */
    remaining,
    hours,
    minutes,
    seconds,
    /** Formatted HH:MM:SS string */
    formatted,
    isExpired: remaining <= 0 && Boolean(expireAt),
    isRunning,
    start,
    pause,
    restart,
  };
};

export default useCountdown;
