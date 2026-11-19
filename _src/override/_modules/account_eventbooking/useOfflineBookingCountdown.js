import {useCallback, useEffect, useState} from 'react';

import {useIsFocused} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {navigateTo, navigationRef} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';

const FLOW_MODAL_NAMES = ['ChooseCategory', 'CongratulationOne'];
const expiredEventIds = new Set();

const isFlowRoute = route => {
  if (route?.name === modules.event_detail.name) {
    return true;
  }

  return (
    route?.name === modules.event_config.name &&
    FLOW_MODAL_NAMES.includes(route?.params?.modalName)
  );
};

const getRemainingSeconds = expiresAt =>
  Math.max(0, expiresAt - Math.floor(Date.now() / 1000));

const readCountdown = async () => {
  try {
    const countdown = await Storage.get(
      Storage.name.OFFLINE_EVENT_BOOKING_CATEGORY_SELECTION,
    );
    const expiresAt = Number(countdown?.expiresAt);

    return Number.isFinite(expiresAt)
      ? {eventId: String(countdown?.eventId || ''), expiresAt}
      : null;
  } catch (error) {
    return null;
  }
};

const saveCountdown = countdown =>
  Storage.set(Storage.name.OFFLINE_EVENT_BOOKING_CATEGORY_SELECTION, countdown);

const removeCountdown = () =>
  Storage.del(Storage.name.OFFLINE_EVENT_BOOKING_CATEGORY_SELECTION);

const useOfflineBookingCountdown = ({
  enabled = false,
  eventId = '',
  durationSeconds = null,
} = {}) => {
  const isFocused = useIsFocused();
  const [expiresAt, setExpiresAt] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const clearCountdown = useCallback(() => {
    removeCountdown();
    setExpiresAt(null);
    setRemainingSeconds(0);
  }, []);

  useEffect(() => {
    if (!isFocused || !isFlowRoute(navigationRef.current?.getCurrentRoute())) {
      return;
    }

    let cancelled = false;

    const startCountdown = async () => {
      const savedCountdown = await readCountdown();
      const savedRemainingSeconds = savedCountdown
        ? getRemainingSeconds(savedCountdown.expiresAt)
        : 0;

      if (cancelled) {
        return;
      }

      if (savedCountdown && savedRemainingSeconds <= 0) {
        expiredEventIds.add(savedCountdown.eventId);
        clearCountdown();
        return;
      }

      const canReuseSavedCountdown =
        savedRemainingSeconds > 0 &&
        (!enabled || !eventId || savedCountdown.eventId === String(eventId));

      if (canReuseSavedCountdown) {
        setExpiresAt(savedCountdown.expiresAt);
        setRemainingSeconds(savedRemainingSeconds);
        return;
      }

      removeCountdown();

      const duration = Number(durationSeconds);
      if (
        !enabled ||
        !eventId ||
        expiredEventIds.has(String(eventId)) ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        setExpiresAt(null);
        setRemainingSeconds(0);
        return;
      }

      if (cancelled) {
        return;
      }

      const nextExpiresAt = Math.floor(Date.now() / 1000) + duration;
      await saveCountdown({
        eventId: String(eventId),
        expiresAt: nextExpiresAt,
      });

      if (cancelled) {
        return;
      }

      setExpiresAt(nextExpiresAt);
      setRemainingSeconds(duration);
    };

    startCountdown();

    return () => {
      cancelled = true;
    };
  }, [clearCountdown, durationSeconds, enabled, eventId, isFocused]);

  useEffect(() => {
    if (!expiresAt || !isFocused) {
      return undefined;
    }

    const updateCountdown = async () => {
      const remaining = getRemainingSeconds(expiresAt);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearCountdown();
        navigateTo(
          modules.account_eventbooking.enable,
          modules.account_eventbooking.name,
        );
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 1000);

    return () => clearInterval(intervalId);
  }, [clearCountdown, expiresAt, isFocused]);

  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      const currentRoute = navigationRef.current?.getCurrentRoute();

      if (!isFlowRoute(currentRoute)) {
        clearCountdown();
      }
    });

    return () => {
      unsubscribe?.();

      if (!isFlowRoute(navigationRef.current?.getCurrentRoute())) {
        clearCountdown();
      }
    };
  }, [clearCountdown]);

  return {
    expiresAt,
    remainingSeconds,
  };
};

export default useOfflineBookingCountdown;
