import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Platform, StatusBar} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Path} from 'react-native-svg';
import {rxAppSnackbar} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';
import {normalize} from '@app/styles/mixins';
import {GRAY_DARK2} from '@app/styles/colors';

const SnackBar = () => {
  const snackbar = useReactiveVar(rxAppSnackbar);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef(null);
  
  // 计算顶部位置：使用 StatusBar 高度
  const topPosition = (StatusBar.currentHeight || (Platform.OS === 'ios' ? 44 : 0)) + normalize(10);

  useEffect(() => {
    if (snackbar) {
      // 清除之前的定时器
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // 显示动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // 自动隐藏
      const duration = snackbar.duration || 3000;
      timerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          rxAppSnackbar(null);
        });
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      // 当 snackbar 变为 null 时，立即隐藏
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [snackbar, fadeAnim, slideAnim]);

  if (!snackbar) {
    return null;
  }

  // 成功态：显式 type === 'success'，或文案包含成功相关关键词（防止 type 未传递时仍显示绿对勾）
  const msg = (snackbar?.message || '').toLowerCase();
  const isSuccess =
    snackbar.type === 'success' ||
    /successfully|berhasil|diperbarui|success/.test(msg);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topPosition,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}
      pointerEvents="box-none">
      <View style={[styles.messageBox, {backgroundColor: GRAY_DARK2}]}>
        {isSuccess ? (
          <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            style={styles.icon}>
            <Path
              d="M12 21.25C8.76562 21.25 5.8125 19.5625 4.19531 16.75C2.57812 13.9727 2.57812 10.5625 4.19531 7.75C5.8125 4.97266 8.76562 3.25 12 3.25C15.1992 3.25 18.1523 4.97266 19.7695 7.75C21.3867 10.5625 21.3867 13.9727 19.7695 16.75C18.1523 19.5625 15.1992 21.25 12 21.25ZM15.9727 10.5977H15.9375C16.2891 10.2812 16.2891 9.75391 15.9375 9.40234C15.6211 9.08594 15.0938 9.08594 14.7773 9.40234L10.875 13.3398L9.22266 11.6875C8.87109 11.3359 8.34375 11.3359 8.02734 11.6875C7.67578 12.0039 7.67578 12.5312 8.02734 12.8477L10.2773 15.0977C10.5938 15.4492 11.1211 15.4492 11.4727 15.0977L15.9727 10.5977Z"
              fill="#30D158"
            />
          </Svg>
        ) : (
          <Icon 
            name="alert-circle" 
            size={24} 
            color="#FFFFFF" 
            style={styles.icon} 
          />
        )}
        <Text style={styles.messageText}>{snackbar?.message || ''}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: normalize(16),
    right: normalize(16),
    zIndex: 99999,
    elevation: 99999,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(14),
    paddingHorizontal: normalize(20),
    borderRadius: normalize(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  icon: {
    marginRight: normalize(12),
  },
  messageText: {
    flex: 1,
    fontSize: normalize(14),
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: normalize(20),
  },
});

export default SnackBar;
