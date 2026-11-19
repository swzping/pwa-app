import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {BackHandler, ScrollView, StyleSheet, Text, View} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';

import {useFocusEffect, useNavigation} from '@react-navigation/native';

import {useTranslation} from 'react-i18next';

import NavBar from '@app/components/NavBar';
import useStoreConfig from '@app/hooks/useStoreConfig';
import * as Colors from '@app/styles/colors';
import {normalize} from '@app/styles/mixins';

import {pollQueueStatus} from '../services/fetchAPI';
import {setOfflineWaitingRoomExpireTime} from '../services/util';

import EventBookingBg from './EventBookingBg';

const ORANGE = '#F97800';

const THUMB_SIZE = normalize(24);
const THUMB_RADIUS = THUMB_SIZE / 2;

const getQueueProgress = (basePosition, currentPosition, trackWidth) => {
  const base = Number(basePosition) || 0;
  const current = Number(currentPosition) || 0;
  // 计算当前进度，范围 0 ~ 1
  const progressValue =
    base > 0 ? Math.min(Math.max((base - current) / base, 0), 1) : 0;
  // 小球中心位置
  const thumbCenter =
    trackWidth > 0
      ? THUMB_RADIUS + (trackWidth - THUMB_SIZE) * progressValue
      : 0;
  // 填充条宽度 = 小球中心位置
  const fillWidth = thumbCenter;
  // 小球 left = 中心位置 - 半径
  const thumbLeft = thumbCenter - THUMB_RADIUS;
  // 是否完成
  const isComplete = progressValue >= 1;
  return {
    fillWidth,
    thumbLeft,
    isComplete,
  };
};

const WaitingRoomView = () => {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {storeConfig} = useStoreConfig({useInitData: true});
  const waitingRoomExpireTime = storeConfig?.waiting_room_expire_time;
  const [trackWidth, setTrackWidth] = useState(0);
  const [detailData, setDetailData] = useState({});
  const basePositionRef = useRef(null);
  const pollingControlRef = useRef(null);

  // 禁用 iOS/Android 滑动手势返回
  useLayoutEffect(() => {
    navigation.setOptions({gestureEnabled: false});
  }, [navigation]);

  // 禁用 Android 物理返回键 / 全面屏手势返回
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );
      return () => subscription.remove();
    }, []),
  );

  const speedTime = useMemo(() => {
    const rawSec = Number(detailData?.pollAfterSeconds || 0);
    if (rawSec <= 0) {
      return 1000; // 兜底1s
    }
    return rawSec * 1000;
  }, [detailData?.pollAfterSeconds]);

  // 计算当前进度
  const {fillWidth, thumbLeft, isComplete} = getQueueProgress(
    basePositionRef.current,
    detailData?.ahead,
    trackWidth,
  );

  const stopPolling = () => {
    if (pollingControlRef.current?.stopPolling) {
      pollingControlRef.current.stopPolling();
      pollingControlRef.current = null;
    }
  };

  const startQueuePolling = () => {
    // 防止多个请求并发
    stopPolling();

    const control = pollQueueStatus({
      interval: speedTime,
      onSuccess: async data => {
        setDetailData(data);
        if (basePositionRef.current === null) {
          basePositionRef.current = data.ahead;
        }
        // 排到了停止轮询并跳转
        if (data?.admitted === true && data?.ahead <= 0) {
          stopPolling();
          await setOfflineWaitingRoomExpireTime(waitingRoomExpireTime);
          toEventbookingScreen();
        }
      },
      onError: err => {
        console.error('轮询出错:', err.message);
      },
    });
    pollingControlRef.current = control;
    return control;
  };

  // 首次挂载启动轮询
  useEffect(() => {
    if (waitingRoomExpireTime) {
      startQueuePolling();
    }
    return () => {
      stopPolling();
    };
  }, [waitingRoomExpireTime]);

  // 当speedTime变化，重启轮询，使用新的轮询间隔
  useEffect(() => {
    if (pollingControlRef.current && waitingRoomExpireTime) {
      startQueuePolling();
    }
  }, [speedTime, waitingRoomExpireTime]);

  const toEventbookingScreen = () => {
    navigation.goBack();
  };

  const getMinuteBySeconds = (seconds = 0) => {
    const minute = seconds / 60;
    const rounded = Math.round(minute);
    return Math.max(rounded, 1);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <LinearGradient
        colors={['#FFD38B', '#FFA12E']}
        locations={[0.0126, 0.8576]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFillObject}
      />
      <EventBookingBg />
      <NavBar
        center
        title={t('account_eventbooking.title.waitingRoom')}
        stylesContainer={styles.navBar}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>
                {t('account_eventbooking.waitingRoom.estimatedWait')}
              </Text>
            </View>

            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>
                ~{getMinuteBySeconds(detailData?.estimatedWaitSeconds)}
              </Text>
              <Text style={styles.statUnit}>minutes</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statLabel}>
                {t('account_eventbooking.waitingRoom.peopleAhead')}
              </Text>
            </View>

            <View style={styles.statValueRow}>
              <Text style={styles.statValue}>{detailData?.ahead ?? 1}</Text>
            </View>
          </View>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {t('account_eventbooking.waitingRoom.YourProgress')}
          </Text>
          {/* 进度条轨道：通过 onLayout 获取实际宽度 */}
          <View
            style={styles.progressTrack}
            onLayout={event => {
              const {width} = event.nativeEvent.layout;
              setTrackWidth(width);
            }}>
            <View style={styles.progressTrackBackground} />
            {/* 橙色填充条 */}
            <View style={[styles.progressFill, {width: fillWidth}]} />
            {/* 当前进度小球 */}
            <View style={[styles.progressThumb, {left: thumbLeft}]} />
            {/* 终点圆点：满进度时隐藏，避免重叠 */}
            {!isComplete && <View style={styles.progressEnd} />}
          </View>
        </View>

        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>
            {t('account_eventbooking.waitingRoom.YourAlmostIn')}
          </Text>

          <Text style={styles.messageBody}>
            {t('account_eventbooking.waitingRoom.YourAlmostInDes')}
          </Text>

          <View style={styles.queueBadge}>
            <ActivityIndicator size={normalize(20)} color={Colors.PRIMARY} />
            <Text style={styles.queueText}>
              {t('account_eventbooking.waitingRoom.YouAreInQueue')}
            </Text>
          </View>
        </View>

        <View style={styles.noticeCard}>
          <LocalSvg
            asset={require('@app/assets/svg/eventBookingBellRing.svg')}
            style={{
              width: normalize(20),
              height: normalize(20),
            }}
          />
          <Text style={styles.noticeText}>
            {t('account_eventbooking.waitingRoom.YouAreKeepInfo')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WaitingRoomView;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  navBar: {
    backgroundColor: 'transparent',
  },

  content: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(20),
    paddingBottom: normalize(36),
    gap: normalize(16),
  },

  statsRow: {
    flexDirection: 'row',
    gap: normalize(12),
  },

  statCard: {
    flex: 1,
    minWidth: 0,
    height: normalize(96),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(16),
    borderRadius: normalize(16),
    backgroundColor: '#FFFFFF',
  },

  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(11),
  },

  statLabel: {
    flexShrink: 1,
    color: ORANGE,
    fontSize: normalize(14),
    fontWeight: '500',
  },

  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: normalize(12),
  },

  statValue: {
    color: '#212121',
    fontSize: normalize(32),
    fontWeight: '600',
  },

  statUnit: {
    marginLeft: normalize(8),
    color: ORANGE,
    fontSize: normalize(14),
  },

  progressCard: {
    height: normalize(95),
    paddingHorizontal: normalize(16),
    paddingTop: normalize(15),
    borderRadius: normalize(16),
    backgroundColor: '#FFFFFF',
  },

  progressTitle: {
    color: ORANGE,
    fontSize: normalize(16),
  },

  progressTrack: {
    height: THUMB_SIZE,
    marginTop: normalize(13),
    marginHorizontal: 1,
    justifyContent: 'center',
    position: 'relative',
  },

  progressTrackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: '#FFE6B8',
  },

  progressFill: {
    position: 'absolute',
    left: 0,
    height: normalize(12),
    borderRadius: normalize(6),
    backgroundColor: '#FF8200',
  },

  progressThumb: {
    position: 'absolute',
    top: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    backgroundColor: '#FF941F',
    zIndex: 1,
  },

  progressEnd: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_RADIUS,
    backgroundColor: '#FFE1AC',
  },

  messageCard: {
    paddingHorizontal: normalize(39),
    paddingVertical: normalize(32),
    alignItems: 'center',
    borderRadius: normalize(16),
    backgroundColor: '#FFFFFF',
  },

  messageTitle: {
    color: '#1B1A19',
    fontSize: normalize(24),
    fontWeight: '700',
    textAlign: 'center',
  },

  messageBody: {
    marginTop: normalize(20),
    color: '#777777',
    fontSize: normalize(14),
    fontWeight: '700',
    textAlign: 'center',
  },

  queueBadge: {
    marginTop: normalize(20),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    borderRadius: normalize(8),
    backgroundColor: '#FFF7E8',
  },

  queueText: {
    color: ORANGE,
    fontSize: normalize(16),
    fontWeight: '500',
  },

  noticeCard: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(13),
    borderRadius: normalize(16),
    backgroundColor: '#FFFFFF',
  },

  noticeText: {
    flex: 1,
    color: '#A64B00',
    fontSize: normalize(14),
  },
});
