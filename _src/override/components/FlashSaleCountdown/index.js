import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import DateHelper from '@app/helpers/Date';

const normalizeDateValue = value => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const FlashSaleCountdown = ({
  startDate,
  endDate,
  isActive = true,
  containerStyle,
  contentStyle,
  progressTrackStyle,
  progressFillStyle,
  label,
}) => {
  const {t} = useTranslation();
  const normalizedStartDate = useMemo(() => {
    const normalized = normalizeDateValue(startDate);
    if (!normalized) return null;
    // Convert UTC to Indonesia timezone (UTC+7)
    const converted = DateHelper.convertUTCToIndonesia(normalized);
    return converted ? new Date(converted) : null;
  }, [startDate]);
  const normalizedEndDate = useMemo(() => {
    const normalized = normalizeDateValue(endDate);
    if (!normalized) return null;
    // Convert UTC to Indonesia timezone (UTC+7)
    const converted = DateHelper.convertUTCToIndonesia(normalized);
    return converted ? new Date(converted) : null;
  }, [endDate]);

  const getRemainingMs = useCallback(dateValue => {
    if (!dateValue) {
      return null;
    }
    // 使用印尼时间而不是系统时间
    const now = DateHelper.getIndonesiaTimeNow();
    return Math.max(dateValue.getTime() - now.getTime(), 0);
  }, []);

  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(normalizedEndDate),
  );
  const countdownIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive || !normalizedEndDate) {
      setRemainingMs(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    const updateRemaining = () => {
      if (!mountedRef.current) {
        return;
      }
      const nextRemaining = getRemainingMs(normalizedEndDate);
      setRemainingMs(nextRemaining);
      if (nextRemaining === 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };

    updateRemaining();
    countdownIntervalRef.current = setInterval(updateRemaining, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [getRemainingMs, isActive, normalizedEndDate]);

  const countdownDurationMs = useMemo(() => {
    if (!normalizedStartDate || !normalizedEndDate) {
      return null;
    }
    const diff =
      normalizedEndDate.getTime() - normalizedStartDate.getTime();
    return diff > 0 ? diff : null;
  }, [normalizedEndDate, normalizedStartDate]);

  const countdownProgress = useMemo(() => {
    if (!countdownDurationMs || remainingMs == null) {
      return null;
    }
    const safeRemaining = Math.min(
      Math.max(remainingMs, 0),
      countdownDurationMs,
    );
    return Number(((safeRemaining / countdownDurationMs) * 100).toFixed(2));
  }, [countdownDurationMs, remainingMs]);

  const formattedCountdown = useMemo(() => {
    if (remainingMs == null) {
      return null;
    }
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }, [remainingMs]);

  // 当 remainingMs 为 0 或更小时，不显示倒计时
  const showCountdown = isActive && remainingMs !== null && remainingMs > 0 && Boolean(formattedCountdown);

  if (!showCountdown) {
    return null;
  }

  const clampedProgress =
    countdownProgress !== null
      ? Math.min(Math.max(countdownProgress, 0), 100)
      : null;

  const resolvedLabel = label ?? t('flash_sale.ends_in', 'Ends in');
  const timeSegments =
    formattedCountdown?.split(':').map(segment => segment.trim()) ?? [];
  const [hoursSegment = '--', minutesSegment = '--', secondsSegment = '--'] =
    timeSegments;
  const formattedPrefix = `${hoursSegment} : ${minutesSegment} :`;
  const hasLabel =
    typeof resolvedLabel === 'string'
      ? resolvedLabel.trim().length > 0
      : Boolean(resolvedLabel);
  const countdownPrefix = hasLabel
    ? `${resolvedLabel} ${formattedPrefix}`
    : formattedPrefix;
  const secondsDisplay = secondsSegment;

  return (
    <CustomView style={[styles.container, containerStyle]}>
      <CustomView
        style={[styles.progressTrack, contentStyle, progressTrackStyle]}>
        <RenderIf condition={clampedProgress !== null}>
          <CustomView
            style={[
              styles.progressFill,
              progressFillStyle,
              {width: `${clampedProgress}%`},
            ]}
          />
        </RenderIf>
        <CustomView pointerEvents="none" style={styles.textWrapper}>
          <CustomView style={styles.textRow}>
            <Text
              style={[
                styles.value,
                Platform.OS === 'ios' && styles.valueIOS,
                Platform.OS === 'android' && styles.valueAndroid,
              ]}>
              {countdownPrefix}
            </Text>
            <CustomView style={styles.secondsWrapper}>
              <Text
                style={[
                  styles.value,
                  Platform.OS === 'ios' && styles.valueIOS,
                  Platform.OS === 'android' && styles.valueAndroid,
                ]}>
                {secondsDisplay}
              </Text>
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressTrack: {
    height: normalize(16),
    backgroundColor: '#FDB27F',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FC6500',
    borderTopRightRadius: normalize(18),
    borderBottomRightRadius: normalize(18),
  },
  textWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(12),
    width: '100%',
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: normalize(12),
    fontWeight: '600',
    color: Colors.WHITE,
    textAlign: 'center',
  },
  valueIOS: {
    fontVariant: ['tabular-nums'],
  },
  valueAndroid: {
    paddingBottom: normalize(2),
    marginTop: normalize(0),
  },
  secondsWrapper: {
    width: normalize(20),
    alignItems: 'center',
  },
});

export default memo(FlashSaleCountdown);

