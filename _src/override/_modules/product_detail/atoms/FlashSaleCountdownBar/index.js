import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';

import CustomView from '@app/components/CustomView';
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

const FlashSaleCountdownBar = ({startDate, endDate, isActive = true}) => {
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
    const indonesiaTimeNow = DateHelper.getIndonesiaTimeNow();
    return Math.max(dateValue.getTime() - indonesiaTimeNow.getTime(), 0);
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

  const formattedSegments = useMemo(() => {
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
    return [hours, minutes, seconds];
  }, [remainingMs]);

  const shouldRender =
    isActive && normalizedEndDate && Array.isArray(formattedSegments);

  if (!shouldRender) {
    return null;
  }

  const [hours, minutes, seconds] = formattedSegments;

  return (
    <LinearGradient
      colors={['#FFD1AC', '#FF8200']}
      start={{x: 0, y: 0.5}}
      end={{x: 1, y: 0.5}}
      style={styles.container}>
      <CustomView style={styles.leftSection}>
        <Image
          source={require('@app/assets/images/image.png')}
          style={styles.flashSaleLogo}
          resizeMode="contain"
        />
      </CustomView>
      <CustomView style={styles.centerSection}>
        <Text style={styles.subtitle}>
          {t('flash_sale.ends_in', {defaultValue: 'ENDS IN'})}
        </Text>
      </CustomView>
      <CustomView style={styles.timerSection}>
        {[hours, minutes, seconds].map((segment, index) => (
          <Fragment key={`pdp-flash-${index}`}>
            <CustomView style={styles.timeBox}>
              <Text style={styles.timeText}>{segment}</Text>
            </CustomView>
            {index < 2 && <Text style={styles.colon}>:</Text>}
          </Fragment>
        ))}
      </CustomView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flashSaleLogo: {
    width: normalize(110),
    height: normalize(40),
  },
  title: {
    fontSize: normalize(14),
    fontWeight: '800',
    color: '#0052FF',
    marginLeft: normalize(8),
    textShadowColor: Colors.WHITE,
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
  centerSection: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: normalize(20),
  },
  subtitle: {
    fontSize: normalize(12),
    fontWeight: '700',
    fontFamily: 'Noto Sans',
    color: Colors.WHITE,
    letterSpacing: 1,
  },
  timerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBox: {
    minWidth: normalize(25),
    paddingVertical: normalize(3),
    paddingHorizontal: normalize(5),
    borderRadius: normalize(8),
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: Colors.BLACK,
  },
  colon: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: Colors.WHITE,
    marginHorizontal: normalize(4),
  },
});

export default memo(FlashSaleCountdownBar);


