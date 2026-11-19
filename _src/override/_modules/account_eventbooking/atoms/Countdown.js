import React from 'react';
import {StyleSheet, Text} from 'react-native';

import {useTranslation} from 'react-i18next';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {normalize} from '@app/styles/mixins';

const formatCountdown = seconds => {
  const totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    remainingSeconds,
  ).padStart(2, '0')}`;
};

const CountdownLabel = React.memo(({text}) => (
  <Text style={styles.countdownText}>{text}</Text>
));

const CountdownValue = React.memo(
  ({remainingSeconds, styleColor = '#FF8200'}) => (
    <Text style={[styles.countdown, {color: styleColor}]}>
      {formatCountdown(remainingSeconds)}
    </Text>
  ),
);

const Countdown = ({eventType, remainingSeconds, styleColor = '#FF8200'}) => {
  const {t} = useTranslation();

  return (
    <CustomView row verticalCenter style={styles.countdownRow}>
      <RenderIf condition={eventType === 'GUARDIAN_RUN'}>
        <CountdownLabel
          text={t('account_eventbooking.desc.registerBeforeTimerEnds')}
        />
        <CountdownValue
          remainingSeconds={remainingSeconds}
          styleColor={styleColor}
        />
      </RenderIf>
    </CustomView>
  );
};

export default Countdown;

const styles = StyleSheet.create({
  countdownRow: {
    alignItems: 'center',
  },
  countdownText: {
    flexShrink: 0,
    fontSize: normalize(14),
    color: '#212121',
    fontWeight: '400',
    marginRight: normalize(8),
  },
  countdown: {
    flexShrink: 0,
    fontSize: normalize(16),
    fontWeight: '700',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
