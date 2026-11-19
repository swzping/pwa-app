import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';
import Icon from 'react-native-vector-icons/Feather';

import Clipboard from '@react-native-clipboard/clipboard';

import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import {formatDateBy} from '@app/helpers/General';
import * as Colors from '@app/styles/colors';

import EventBookingBg from './EventBookingBg';
import EventBookingBoxBg from './EventBookingBoxBg';

const LabelItem = ({label, value}) => (
  <View style={itemStyles.container}>
    <Text style={styles.label}>{String(label ?? '-')}</Text>
    <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
      {String(value ?? '-')}
    </Text>
  </View>
);

const CopyableCode = ({code, copied, onCopy}) => (
  <View style={[styles.codeRow, {position: 'relative', marginTop: 0}]}>
    <Text
      style={[styles.value, {flexShrink: 1}]}
      numberOfLines={1}
      ellipsizeMode="middle">
      {String(code ?? '-')}
    </Text>

    <CustomView onPress={onCopy} marginTop={6}>
      <Icon name="copy" size={20} color={Colors.PRIMARY} />
    </CustomView>

    {/* tooltip */}
    <View style={{...styles.copyTip, opacity: copied ? 1 : 0}}>
      <View style={styles.copyTipArrow} />
      <Text style={styles.copyTipText}>Code copied</Text>
    </View>
  </View>
);

const TicketDetailModal = ({modalInfo = {}}) => {
  const [copied, setCopied] = useState(false);

  const eventDateTime = modalInfo.event_date_time;

  const onCopyCode = async () => {
    if (!modalInfo?.ticket_code) {
      return;
    }
    await Clipboard.setString(String(modalInfo.ticket_code));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <SafeAreaView style={{flex: 1}} edges={['bottom']}>
      {/* Background */}
      <LinearGradient
        colors={['#FFD38B', '#FFA12E']}
        locations={[0.0126, 0.8576]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFillObject}
      />
      <EventBookingBg />

      <NavBar
        useBack
        center
        stylesContainer={{backgroundColor: 'transparent'}}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <CustomView style={styles.headerBox}>
          <LocalSvg
            asset={require('@app/assets/svg/congratulation.svg')}
            style={styles.congratsSvg}
          />
          <Text style={styles.title}>{String(modalInfo.title ?? '-')}</Text>
          <Text style={styles.subTitle}>
            {String(modalInfo.subTitle ?? '-')}
          </Text>
        </CustomView>

        {/* Ticket Info */}
        <View style={styles.ticketBox}>
          <EventBookingBoxBg />

          {/* Name + Code */}
          <View style={styles.row}>
            <View style={itemStyles.half}>
              <LabelItem
                label="Name"
                value={
                  (modalInfo.attendee?.first_name || '') +
                  ' ' +
                  (modalInfo.attendee?.last_name || '')
                }
              />
            </View>
            <View style={itemStyles.half}>
              <Text style={styles.label}>Unique Code</Text>
              <CopyableCode
                code={modalInfo.ticket_code}
                copied={copied}
                onCopy={onCopyCode}
              />
            </View>
          </View>

          {/* Event + Place */}
          <View style={styles.row}>
            <View style={itemStyles.half}>
              <LabelItem label="Event Name" value={modalInfo.event_name} />
            </View>
            <View style={itemStyles.half}>
              <LabelItem label="Place" value={modalInfo.location} />
            </View>
          </View>

          {/* Date */}
          <View style={styles.row}>
            <LabelItem
              label="Date"
              value={
                eventDateTime ? formatDateBy(eventDateTime, 'd en-M yyyy') : '-'
              }
            />
          </View>

          {/* Time */}
          <View style={[styles.row, {marginTop: -2}]}>
            <Text style={styles.value}>
              {eventDateTime ? formatDateBy(eventDateTime, 'hh:mm') : '-'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TicketDetailModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerBox: {
    marginTop: 82,
    borderRadius: 16,
    alignItems: 'center',
    paddingBottom: 24,
    backgroundColor: Colors.WHITE,
  },
  congratsSvg: {
    position: 'absolute',
    top: -58,
    alignSelf: 'center',
    width: 114,
    height: 114,
    zIndex: 10,
  },
  title: {
    marginTop: 70,
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1A19',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  subTitle: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  ticketBox: {
    marginTop: 28,
    borderRadius: 16,
    paddingVertical: 24,
    paddingBottom: 98,
    overflow: 'hidden',
    backgroundColor: Colors.WHITE,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  label: {
    color: '#9E9E9E',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 22,
  },
  value: {
    marginTop: 8,
    color: Colors.PRIMARY,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 2,
  },
  copyTip: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: '#666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 10,
  },
  copyTipArrow: {
    position: 'absolute',
    top: -6,
    left: '50%',
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#666',
  },
  copyTipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

/* Specifically addressing the issue of "width: 50%". */
const itemStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  half: {
    flex: 1,
    maxWidth: '50%',
  },
});
