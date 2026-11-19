import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Text from '@app/components/Text';
import SuccessIcon from './SuccessIcon';
import ErrorIcon from './ErrorIcon';

const MessageToast = ({visible, type, message, onDismiss, duration = 3000}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timerRef = useRef(null);

  // 导航栏高度 56 + 状态栏高度
  const topPosition = insets.top + 56;

  useEffect(() => {
    if (visible) {
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
          if (onDismiss) {
            onDismiss();
          }
        });
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      // 当 visible 变为 false 时，立即隐藏
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
  }, [visible]);

  const isSuccess = type === 'success';
  const backgroundColor = isSuccess ? '#FAFFFA' : '#FFFBFB';
  const borderColor = isSuccess ? '#DAECDA' : '#FBE4E2';
  const borderWidth = 4;

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: topPosition,
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <View
        style={[
          styles.messageBox,
          {backgroundColor, borderColor, borderWidth},
        ]}>
        <View style={styles.iconContainer}>
          {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
        </View>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
});

export default MessageToast;
