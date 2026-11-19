import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  PanResponder,
  Pressable,
  Animated,
} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import Video from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import Svg, {Circle, Path} from 'react-native-svg';
import PropTypes from 'prop-types';
import ToggleWishlist from '@app/components/ToggleWishlist';
import {USER_GUEST} from '@app/helpers/Constants';
import {useReactiveVar} from '@apollo/client';
import {rxUserType} from '@app/services/cache';
import {Colors} from '@app/styles';
import {useTranslation} from 'react-i18next';
import Text from '@app/components/Text/index';

// YouTube URL 检测和验证的正则表达式
const YOUTUBE_PATTERN =
  /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;

// 检测是否为 YouTube URL
const isYoutubeUrl = url => {
  return url && YOUTUBE_PATTERN.test(url);
};

// 提取 YouTube 视频 ID
const extractYoutubeId = url => {
  const match = url.match(YOUTUBE_PATTERN);
  return match && match[1].length === 11 ? match[1] : null;
};

// 格式化时间为 MM:SS
const formatTime = seconds => {
  if (!isFinite(seconds) || isNaN(seconds)) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

/**
 * VideoWidget - 视频播放组件
 * 支持 YouTube 视频和普通视频
 *
 * @param {Object} props - 组件属性
 * @param {string} props.src - 视频源 URL
 * @param {boolean} [props.autoplay=false] - 是否自动播放
 * @param {boolean} [props.useContainerHeight=false] - 是否使用容器高度
 * @param {Object} [props.product] - 产品信息，用于添加心愿单功能
 */
const VideoWidget = ({
  src,
  autoplay = false,
  useContainerHeight = false,
  product = null,
  activeIndex = undefined,
  currentIndex = undefined,
}) => {
  const [isYoutube, setIsYoutube] = useState(false);
  const [youtubeId, setYoutubeId] = useState(undefined);
  const [youtubeHeight, setYoutubeHeight] = useState(undefined);

  // 视频播放状态
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // 自定义全屏状态
  const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);

  // 视频进度和时长
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 音量状态
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1.0); // 音量值 0-1
  const previousVolumeRef = useRef(1.0); // 保存之前的音量值，用于取消静音时恢复

  // 控制栏显示状态（播放时自动隐藏）
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // 视频进度更新节流相关
  const progressUpdateTimerRef = useRef(null);
  const lastProgressUpdateTimeRef = useRef(0);
  const pendingCurrentTimeRef = useRef(0);
  const isUserInteractingRef = useRef(false); // 标记用户是否正在交互（点击按钮等）

  // Video 组件引用
  const videoRef = useRef(null);

  // 音量调节条拖拽状态引用
  const isDraggingVolumeRef = useRef(false);

  // 心愿单按钮 loading 状态
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // 获取用户类型
  const userType = useReactiveVar(rxUserType);
  const isGuest = userType === USER_GUEST;

  // 翻译
  const {t} = useTranslation();

  // 自定义全屏切换函数
  const toggleCustomFullscreen = useCallback(() => {
    // 标记用户正在交互
    isUserInteractingRef.current = true;

    setIsCustomFullscreen(prev => !prev);

    // 交互完成后恢复进度更新
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 100);
  }, []);

  // 全屏事件处理 - 当用户点击原生全屏按钮时，切换到自定义全屏
  const handleFullscreenWillPresent = useCallback(() => {
    // 立即阻止原生全屏，使用自定义全屏
    if (videoRef.current) {
      videoRef.current.dismissFullscreenPlayer();
    }
    // 立即切换到自定义全屏
    setIsCustomFullscreen(true);
  }, []);

  // 处理全屏即将消失事件
  const handleFullscreenWillDismiss = useCallback(() => {
    // 占位符回调，用于 react-native-video 的全屏事件
  }, []);

  // 处理全屏完全消失事件
  const handleFullscreenDidDismiss = useCallback(() => {
    // 占位符回调，用于 react-native-video 的全屏事件
  }, []);

  // 播放/暂停切换
  const onPlayPause = useCallback(() => {
    // 标记用户正在交互，暂停进度更新以避免干扰点击事件
    isUserInteractingRef.current = true;

    setIsPlaying(prev => !prev);
    setShowControls(true);
    // 立即清除并重置计时器
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    resetControlsTimeout();

    // 交互完成后，短暂延迟后恢复进度更新
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 100);
  }, [resetControlsTimeout]);

  // 重置控制栏隐藏计时器
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // 3秒后隐藏控制栏
    }
  }, [isPlaying]);

  // 音量切换
  const toggleMute = () => {
    // 标记用户正在交互
    isUserInteractingRef.current = true;

    if (isMuted) {
      // 如果当前是静音，恢复之前的音量
      setIsMuted(false);
      setVolume(previousVolumeRef.current);
    } else {
      // 如果当前有声音，保存当前音量并静音
      previousVolumeRef.current = volume;
      setIsMuted(true);
      setVolume(0);
    }
    setShowControls(true);
    resetControlsTimeout();

    // 交互完成后恢复进度更新
    setTimeout(() => {
      isUserInteractingRef.current = false;
    }, 100);
  };

  // 音量调节
  const onVolumeChange = useCallback(
    newVolume => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolume(clampedVolume);
      if (clampedVolume > 0) {
        setIsMuted(false);
        previousVolumeRef.current = clampedVolume;
      } else {
        setIsMuted(true);
      }
      setShowControls(true);
      resetControlsTimeout();
    },
    [resetControlsTimeout],
  );

  // 进度条拖拽处理
  const onSeek = useCallback(
    newPosition => {
      if (videoRef.current && duration > 0) {
        const seekTime = (newPosition / 100) * duration;
        videoRef.current.seek(seekTime);
        setCurrentTime(seekTime);
        setShowControls(true);
        resetControlsTimeout();
      }
    },
    [duration, resetControlsTimeout],
  );

  // 视频进度更新 - 使用节流减少更新频率，避免频繁渲染影响点击事件
  const onProgress = useCallback(data => {
    // 保存最新的进度值
    pendingCurrentTimeRef.current = data.currentTime;

    // 如果用户正在交互，不更新状态（避免频繁渲染干扰点击事件）
    if (isUserInteractingRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastProgressUpdateTimeRef.current;
    // 节流：最多每1000ms更新一次状态，减少重新渲染
    const THROTTLE_INTERVAL = 500;

    if (timeSinceLastUpdate >= THROTTLE_INTERVAL) {
      // 立即更新
      setCurrentTime(data.currentTime);
      lastProgressUpdateTimeRef.current = now;

      // 清除之前的定时器
      if (progressUpdateTimerRef.current) {
        clearTimeout(progressUpdateTimerRef.current);
        progressUpdateTimerRef.current = null;
      }
    } else if (!progressUpdateTimerRef.current) {
      // 设置定时器，确保延迟更新
      const remainingTime = THROTTLE_INTERVAL - timeSinceLastUpdate;
      progressUpdateTimerRef.current = setTimeout(() => {
        if (!isUserInteractingRef.current) {
          setCurrentTime(pendingCurrentTimeRef.current);
          lastProgressUpdateTimeRef.current = Date.now();
        }
        progressUpdateTimerRef.current = null;
      }, remainingTime);
    }
  }, []);

  // 视频加载完成
  const onLoad = useCallback(data => {
    setDuration(data.duration);
  }, []);

  // 视频播放状态变化
  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout();
    } else {
      // 暂停时，立即更新进度并清理定时器
      if (progressUpdateTimerRef.current) {
        clearTimeout(progressUpdateTimerRef.current);
        progressUpdateTimerRef.current = null;
        // 更新到最新的进度值
        if (pendingCurrentTimeRef.current !== currentTime) {
          setCurrentTime(pendingCurrentTimeRef.current);
        }
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (progressUpdateTimerRef.current) {
        clearTimeout(progressUpdateTimerRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout, currentTime]);

  // 检测是否为 YouTube URL
  useEffect(() => {
    if (src) {
      const isYt = isYoutubeUrl(src);
      setIsYoutube(isYt);
      if (isYt) {
        const id = extractYoutubeId(src);
        setYoutubeId(id);
      } else {
        setYoutubeId(undefined);
      }
    } else {
      setIsYoutube(false);
      setYoutubeId(undefined);
    }
  }, [src]);

  // 轮播切换时暂停上一个正在播放的视频
  useEffect(() => {
    if (
      activeIndex !== undefined &&
      currentIndex !== undefined &&
      activeIndex !== currentIndex &&
      isPlaying
    ) {
      setIsPlaying(false);
    }
  }, [activeIndex, currentIndex, isPlaying]);

  // 使用 ref 来跟踪是否正在执行操作（防止重复点击）
  const isExecutingRef = useRef(false);

  // 包装回调，操作完成后重置 loading
  const wrappedCallback = useCallback(() => {
    // 操作完成，重置执行标志和 loading 状态
    isExecutingRef.current = false;
    setIsWishlistLoading(false);
  }, []);

  // 播放按钮组件（中央大按钮）
  const PlayButton = () => (
    <TouchableOpacity
      style={styles.playButtonContainer}
      onPress={onPlayPause}
      activeOpacity={0.8}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
      <Svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <Circle cx="30" cy="30" r="30" fill="rgba(128, 128, 128, 0.8)" />
        <Path
          d={
            'M40.8284 32.1602C42.414 31.0534 42.4151 28.7067 40.8306 27.5984L30.1824 20.1504C26.9384 ' +
            '17.8813 22.4863 20.2259 22.522 24.1845L22.5744 30.003L22.5235 35.5556C22.4872 39.5125 ' +
            '26.9354 41.8582 30.1801 39.5932L40.8284 32.1602Z'
          }
          fill="white"
        />
      </Svg>
    </TouchableOpacity>
  );

  // 自定义控制栏组件
  const CustomControls = ({visible = true}) => {
    const progressPercentage =
      duration > 0 ? (currentTime / duration) * 100 : 0;
    const [isSeeking, setIsSeeking] = useState(false);
    const [seekValue, setSeekValue] = useState(0);
    const progressBarLayoutRef = useRef({x: 0, width: 0});

    // 音量调节相关状态
    const volumeBarLayoutRefLocal = useRef({x: 0, width: 0, height: 0});
    // 使用 ref 保存最新的拖拽音量值，避免状态更新延迟问题
    const latestTempVolumeRef = useRef(volume);
    // 跟踪拖动的初始位置，用于判断是点击还是拖动
    const volumeDragStartRef = useRef({x: 0, y: 0});
    // 使用 Animated.Value 来平滑更新滑块位置，避免抖动
    const animatedVolume = useRef(
      new Animated.Value(isMuted ? 0 : volume),
    ).current;

    // 同步外部音量状态到动画值（当不在拖拽状态时）
    // 使用 ref 而不是 state 来检查拖拽状态，避免状态更新延迟导致的闪动
    useEffect(() => {
      if (!isDraggingVolumeRef.current) {
        const targetValue = isMuted ? 0 : volume;
        animatedVolume.setValue(targetValue);
        latestTempVolumeRef.current = volume;
      }
    }, [volume, isMuted]);

    // 进度条拖拽处理 - 简化版本，只在进度条区域响应拖拽，不影响按钮
    const isDraggingRef = useRef(false);

    const panResponder = useRef(
      PanResponder.create({
        // 不在开始时立即响应，避免拦截按钮点击
        onStartShouldSetPanResponder: () => false,
        // 只在有明确移动时才响应（大于10px），区分点击和拖拽
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          const moved =
            Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
          if (moved) {
            isDraggingRef.current = true;
            return true;
          }
          return false;
        },
        onPanResponderGrant: evt => {
          isUserInteractingRef.current = true;
          setIsSeeking(true);
          setSeekValue(progressPercentage);
          setIsPlaying(false); // 拖拽时暂停
        },
        onPanResponderMove: (evt, gestureState) => {
          const {width} = progressBarLayoutRef.current;
          if (width > 0) {
            const touchX = evt.nativeEvent.locationX;
            const newValue = Math.max(0, Math.min(100, (touchX / width) * 100));
            setSeekValue(newValue);
          }
        },
        onPanResponderRelease: () => {
          setIsSeeking(false);
          onSeek(seekValue);
          isDraggingRef.current = false;
          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 100);
        },
        onPanResponderTerminate: () => {
          setIsSeeking(false);
          isDraggingRef.current = false;
          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 100);
        },
      }),
    ).current;

    // 音量调节条拖拽处理（水平滑块）
    const volumePanResponder = useRef(
      PanResponder.create({
        // 在 capture 阶段检查，确保优先于外层 responder
        onStartShouldSetPanResponderCapture: evt => {
          const {locationX, locationY} = evt.nativeEvent;
          const {width, height} = volumeBarLayoutRefLocal.current;
          if (width > 0 && height > 0) {
            // 扩展点击区域：左右各扩展8px（滑块按钮的一半宽度），上下扩展足够空间
            const horizontalPadding = 8;
            const verticalPadding = 16;
            const isInTouchArea =
              locationX >= -horizontalPadding &&
              locationX <= width + horizontalPadding &&
              locationY >= -verticalPadding &&
              locationY <= height + verticalPadding;
            return isInTouchArea;
          }
          return false;
        },
        // 开始时检查是否在滑块区域内
        onStartShouldSetPanResponder: evt => {
          // 如果 capture 已经捕获，这里直接返回 true
          return true;
        },
        // 移动时的 capture 检查
        onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
          // 如果已经开始拖动，继续在 capture 阶段响应
          if (isDraggingVolumeRef.current) {
            return true;
          }
          // 如果有明显移动，检查是否在滑块区域
          const moved =
            Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
          if (moved) {
            const {locationX, locationY} = evt.nativeEvent;
            const {width, height} = volumeBarLayoutRefLocal.current;
            if (width > 0 && height > 0) {
              const horizontalPadding = 8;
              const verticalPadding = 16;
              const isInTouchArea =
                locationX >= -horizontalPadding &&
                locationX <= width + horizontalPadding &&
                locationY >= -verticalPadding &&
                locationY <= height + verticalPadding;
              return isInTouchArea;
            }
          }
          return false;
        },
        // 移动时也响应（用于从外部拖入的情况）
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // 如果已经开始拖动，继续响应
          if (isDraggingVolumeRef.current) {
            return true;
          }
          // 如果有明显移动，且移动到滑块区域，开始响应
          const moved =
            Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
          if (moved) {
            const {locationX, locationY} = evt.nativeEvent;
            const {width, height} = volumeBarLayoutRefLocal.current;
            if (width > 0 && height > 0) {
              const horizontalPadding = 8;
              const verticalPadding = 16;
              const isInTouchArea =
                locationX >= -horizontalPadding &&
                locationX <= width + horizontalPadding &&
                locationY >= -verticalPadding &&
                locationY <= height + verticalPadding;
              return isInTouchArea;
            }
          }
          return false;
        },
        onPanResponderGrant: evt => {
          // 标记用户正在交互
          isUserInteractingRef.current = true;
          // 记录初始位置，用于判断是点击还是拖动
          const {locationX, locationY} = evt.nativeEvent;
          volumeDragStartRef.current = {x: locationX, y: locationY};

          isDraggingVolumeRef.current = true;
          // 计算初始音量位置
          const {width} = volumeBarLayoutRefLocal.current;
          if (width > 0) {
            const touchX = locationX;
            // 限制在有效范围内，但允许稍微超出以支持边界点击
            const clampedX = Math.max(0, Math.min(width, touchX));
            const newVolume = clampedX / width;
            animatedVolume.setValue(newVolume);
            latestTempVolumeRef.current = newVolume;
          } else {
            animatedVolume.setValue(volume);
            latestTempVolumeRef.current = volume;
          }
        },
        onPanResponderMove: evt => {
          if (!isDraggingVolumeRef.current) {
            return;
          }

          const {width} = volumeBarLayoutRefLocal.current;
          if (width > 0) {
            const touchX = evt.nativeEvent.locationX;
            // 限制在有效范围内
            const clampedX = Math.max(0, Math.min(width, touchX));
            const newVolume = clampedX / width;
            // 直接更新 Animated.Value，不触发重新渲染，避免抖动
            animatedVolume.setValue(newVolume);
            latestTempVolumeRef.current = newVolume;
          }
        },
        onPanResponderRelease: evt => {
          if (!isDraggingVolumeRef.current) {
            return;
          }

          // 判断是点击还是拖动（移动距离小于5px认为是点击）
          const {locationX, locationY} = evt.nativeEvent;
          const dx = Math.abs(locationX - volumeDragStartRef.current.x);
          const dy = Math.abs(locationY - volumeDragStartRef.current.y);
          const isClick = dx < 5 && dy < 5;

          // 先结束拖拽状态，避免 useEffect 在音量更新时被阻塞
          isDraggingVolumeRef.current = false;

          if (isClick) {
            // 如果是点击，使用点击位置设置音量
            const {width} = volumeBarLayoutRefLocal.current;
            if (width > 0) {
              const clampedX = Math.max(0, Math.min(width, locationX));
              const newVolume = clampedX / width;
              animatedVolume.setValue(newVolume);
              latestTempVolumeRef.current = newVolume;
              onVolumeChange(newVolume);
            }
          } else {
            // 如果是拖动，使用已经计算好的音量值
            const finalVolume = latestTempVolumeRef.current;
            onVolumeChange(finalVolume);
          }

          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 100);
        },
        onPanResponderTerminate: () => {
          if (!isDraggingVolumeRef.current) {
            return;
          }
          // 终止时也保存当前音量值
          // 先结束拖拽状态
          isDraggingVolumeRef.current = false;
          const finalVolume = latestTempVolumeRef.current;
          onVolumeChange(finalVolume);
          setTimeout(() => {
            isUserInteractingRef.current = false;
          }, 100);
        },
      }),
    ).current;

    return (
      <View
        style={[
          styles.controlsContainer,
          {
            backgroundColor: visible
              ? 'rgba(50, 50, 50, 0.8)'
              : 'rgba(50, 50, 50, 0)',
          },
        ]}
        pointerEvents={visible ? 'box-none' : 'none'}>
        {visible && (
          <View style={styles.controlsBar} pointerEvents="auto">
            {/* 播放/暂停按钮 */}
            <TouchableOpacity
              style={styles.controlButton}
              pointerEvents="auto"
              onPress={() => {
                onPlayPause();
                resetControlsTimeout();
              }}
              activeOpacity={0.7}
              delayPressIn={0}
              delayPressOut={0}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <View>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {isPlaying ? (
                    // 暂停图标
                    <>
                      <Path d="M6 4h4v16H6V4z" fill="white" />
                      <Path d="M14 4h4v16h-4V4z" fill="white" />
                    </>
                  ) : (
                    // 播放图标
                    <Path d="M8 5v14l11-7z" fill="white" />
                  )}
                </Svg>
              </View>
            </TouchableOpacity>

            {/* 时间显示和进度条 */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View
                style={styles.progressBarWrapper}
                {...panResponder.panHandlers}
                onLayout={event => {
                  const {x, width} = event.nativeEvent.layout;
                  progressBarLayoutRef.current = {x, width};
                }}>
                <TouchableOpacity
                  style={styles.progressBarBackground}
                  activeOpacity={1}
                  onPress={event => {
                    // 如果不在拖拽状态，处理点击跳转
                    if (!isDraggingRef.current && !isSeeking) {
                      isUserInteractingRef.current = true;
                      const {locationX} = event.nativeEvent;
                      const {width} = progressBarLayoutRef.current;
                      if (width > 0) {
                        const newValue = Math.max(
                          0,
                          Math.min(100, (locationX / width) * 100),
                        );
                        onSeek(newValue);
                      }
                      setTimeout(() => {
                        isUserInteractingRef.current = false;
                      }, 100);
                    }
                  }}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {width: `${isSeeking ? seekValue : progressPercentage}%`},
                    ]}
                  />
                  <View
                    style={[
                      styles.progressBarThumb,
                      {left: `${isSeeking ? seekValue : progressPercentage}%`},
                    ]}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* 音量控制（水平滑块样式） */}
            <View style={styles.volumeContainer}>
              {/* 音量按钮 */}
              <TouchableOpacity
                style={styles.controlButton}
                onPressIn={() => {
                  // 触摸开始时重置定时器，确保控制栏不会在交互时隐藏
                  resetControlsTimeout();
                }}
                onPress={toggleMute}
                activeOpacity={0.7}
                delayPressIn={0}
                delayPressOut={0}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {isMuted ? (
                    // 静音图标（带X）
                    <>
                      <Path
                        d={
                          'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 ' +
                          '.94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06' +
                          'c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42' +
                          '.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4' +
                          'L9.91 6.09 12 8.18V4z'
                        }
                        fill="white"
                      />
                    </>
                  ) : (
                    // 有声音图标
                    <Path
                      d={
                        'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 ' +
                        '2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 ' +
                        '7-8.77s-2.99-7.86-7-8.77z'
                      }
                      fill="white"
                    />
                  )}
                </Svg>
              </TouchableOpacity>

              {/* 水平音量滑块 */}
              <View style={styles.volumeSliderContainer}>
                <View
                  style={styles.volumeSliderTrack}
                  {...volumePanResponder.panHandlers}
                  onLayout={event => {
                    const {x, width, height} = event.nativeEvent.layout;
                    volumeBarLayoutRefLocal.current = {x, width, height};
                  }}>
                  <View style={styles.volumeSliderTrackInner}>
                    {/* 已填充部分（左侧） */}
                    <Animated.View
                      style={[
                        styles.volumeSliderFill,
                        {
                          width: animatedVolume.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                        },
                      ]}
                      pointerEvents="none"
                    />
                    {/* 滑块按钮 */}
                    <Animated.View
                      style={[
                        styles.volumeSliderThumb,
                        {
                          left: animatedVolume.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }),
                          transform: [
                            {
                              translateX: animatedVolume.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-8, -8], // 滑块宽度16的一半，保持居中对齐
                              }),
                            },
                          ],
                        },
                      ]}
                      pointerEvents="none"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* 全屏按钮 */}
            <TouchableOpacity
              style={[styles.controlButton, {marginLeft: 4}]} // 增加左边距，确保与音量滑块有足够间距
              onPressIn={() => {
                // 触摸开始时重置定时器，确保控制栏不会在交互时隐藏
                resetControlsTimeout();
              }}
              onPress={toggleCustomFullscreen}
              activeOpacity={0.7}
              delayPressIn={0}
              delayPressOut={0}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                  fill="white"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // YouTube 播放器容器布局变化处理
  const youtubeParentViewOnLayout = useCallback(
    event => {
      if (youtubeHeight) {
        return;
      }
      const containerHeight = event.nativeEvent.layout.height;
      const containerWidth = event.nativeEvent.layout.width;

      if (useContainerHeight) {
        if (containerHeight) {
          setYoutubeHeight(containerHeight);
        }
      } else {
        // 16:9 比例
        setYoutubeHeight((containerWidth * 9) / 16);
      }
    },
    [youtubeHeight, useContainerHeight],
  );

  return (
    <View
      style={[
        styles.container,
        {width: '100%', height: '100%'},
        isYoutube && youtubeHeight ? {height: youtubeHeight} : {},
      ]}>
      {isYoutube ? (
        <View
          style={[
            {
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            },
            youtubeHeight ? {height: youtubeHeight} : {},
          ]}
          onLayout={youtubeParentViewOnLayout}>
          {youtubeId && youtubeHeight && (
            <YoutubePlayer
              height={youtubeHeight}
              videoId={youtubeId}
              play={autoplay}
            />
          )}
        </View>
      ) : (
        <>
          <Pressable
            style={styles.videoWrapper}
            onPress={() => {
              if (!showControls) {
                // 控制栏隐藏时，点击显示控制栏
                setShowControls(true);
                resetControlsTimeout();
              } else if (isPlaying) {
                // 控制栏显示且正在播放时，点击隐藏控制栏
                setShowControls(false);
                resetControlsTimeout();
              }
            }}
            // 添加延迟，确保 Pressable 的 onPress 能正确触发
            delayPressIn={0}
            delayPressOut={0}>
            <Video
              ref={videoRef}
              source={{uri: src}}
              style={{width: '100%', height: '100%'}}
              resizeMode="contain"
              controls={false}
              paused={!isPlaying || isCustomFullscreen}
              repeat
              muted={isMuted}
              volume={isMuted ? 0 : volume}
              fullscreen={false}
              onProgress={onProgress}
              onLoad={onLoad}
              onFullscreenPlayerWillPresent={handleFullscreenWillPresent}
              onFullscreenPlayerWillDismiss={handleFullscreenWillDismiss}
              onFullscreenPlayerDidDismiss={handleFullscreenDidDismiss}
              playInBackground={false}
              playWhenInactive={false}
              pointerEvents="none"
            />
            {/* 播放按钮覆盖层 */}
            {!isPlaying && <PlayButton />}
            {/* 当控制栏隐藏时的独立播放/暂停按钮 */}
            {showControls ? null : (
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  styles.controlButtonAlwaysVisible,
                  {position: 'absolute', bottom: 8, left: 8, zIndex: 1000},
                ]}
                onPress={() => {
                  setShowControls(true);
                  resetControlsTimeout();
                  onPlayPause();
                }}
                activeOpacity={0.7}
                hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {isPlaying ? (
                    <>
                      <Path d="M6 4h4v16H6V4z" fill="white" />
                      <Path d="M14 4h4v16h-4V4z" fill="white" />
                    </>
                  ) : (
                    <Path d="M8 5v14l11-7z" fill="white" />
                  )}
                </Svg>
              </TouchableOpacity>
            )}
            {/* 自定义控制栏 - 始终渲染，通过样式控制可见性，确保按钮始终可点击 */}
            <CustomControls visible={showControls || !isPlaying} />
          </Pressable>

          {/* 自定义全屏 Modal */}
          <Modal
            visible={isCustomFullscreen}
            animationType="fade"
            onRequestClose={toggleCustomFullscreen}
            supportedOrientations={['landscape', 'portrait']}>
            <View style={styles.fullscreenContainer}>
              <Pressable
                style={styles.fullscreenVideoContainer}
                onPress={() => {
                  if (!showControls) {
                    // 控制栏隐藏时，点击显示控制栏
                    setShowControls(true);
                    resetControlsTimeout();
                  } else if (isPlaying) {
                    // 控制栏显示且正在播放时，点击隐藏控制栏
                    setShowControls(false);
                    resetControlsTimeout();
                  }
                }}>
                <Video
                  ref={videoRef}
                  source={{uri: src}}
                  style={styles.fullscreenVideo}
                  resizeMode="contain"
                  controls={false}
                  paused={!isPlaying}
                  repeat
                  muted={isMuted}
                  volume={isMuted ? 0 : volume}
                  onProgress={onProgress}
                  onLoad={onLoad}
                  onLoadStart={() => {
                    // 同步播放状态和位置
                    if (currentTime > 0) {
                      // 如果已经有播放进度，同步到全屏视频
                      setTimeout(() => {
                        if (videoRef.current) {
                          videoRef.current.seek(currentTime);
                        }
                      }, 100);
                    }
                    if (!isPlaying) {
                      setIsPlaying(true);
                    }
                  }}
                  pointerEvents="none"
                />
                {/* 播放按钮覆盖层 - 只在暂停时显示 */}
                {!isPlaying && (
                  <View style={styles.fullscreenPlayButtonContainer}>
                    <PlayButton />
                  </View>
                )}
                {/* 自定义控制栏 - 始终渲染，通过样式控制可见性，确保按钮始终可点击 */}
                <View style={styles.fullscreenControlsWrapper}>
                  <CustomControls visible={showControls || !isPlaying} />
                </View>
              </Pressable>

              {/* 关闭全屏按钮 */}
              <TouchableOpacity
                style={styles.closeFullscreenButton}
                onPress={toggleCustomFullscreen}
                activeOpacity={0.8}>
                <Svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                  <Circle
                    cx="15"
                    cy="15"
                    r="15"
                    fill="black"
                    fillOpacity="0.5"
                  />
                  <Path
                    d="M10 10L20 20M20 10L10 20"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </Svg>
              </TouchableOpacity>

              {/* 全屏时的心愿单按钮 - 放在底部 */}
              {product && !isGuest && (
                <View style={styles.fullscreenWishlistButtonContainer}>
                  <View
                    style={{width: '100%'}}
                    pointerEvents={isWishlistLoading ? 'none' : 'auto'}>
                    <ToggleWishlist
                      item={product}
                      productId={product?.id}
                      wishlistItemId={product.wishlistId}
                      productName={product.name}
                      productSku={product.sku}
                      productCurrency={
                        product?.price_range?.minimum_price?.final_price
                          ?.currency || ''
                      }
                      productPrice={
                        product?.price_range?.minimum_price?.final_price
                          ?.value || 0
                      }
                      styleProp={styles.fullscreenWishlistButton}
                      loadingChange={false}
                      callback={wrappedCallback}>
                      <View
                        style={styles.wishlistButtonContent}
                        onTouchStart={() => {
                          // 在触摸开始时立即设置 loading
                          if (!isExecutingRef.current && !isWishlistLoading) {
                            isExecutingRef.current = true;
                            setIsWishlistLoading(true);
                          }
                        }}>
                        {isWishlistLoading ? (
                          <ActivityIndicator
                            color={Colors.WHITE}
                            size="small"
                          />
                        ) : (
                          <Text white bold>
                            {product.wishlistId
                              ? t('product_detail.removeWishlist')
                              : t('product_detail.addWishlist')}
                          </Text>
                        )}
                      </View>
                    </ToggleWishlist>
                  </View>
                </View>
              )}
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  playButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    zIndex: 10,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullscreenWishlistButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 200, // 高于控制栏，确保可以接收点击事件
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenWishlistButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    flexShrink: 0,
    flexGrow: 0,
  },
  closeFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  // 自定义控制栏样式
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor 通过内联样式动态设置
    paddingVertical: 4,
    paddingHorizontal: 4,
    zIndex: 1000,
    elevation: 1000, // Android
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1001,
  },
  controlButton: {
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
    elevation: 1002, // Android
  },
  controlButtonAlwaysVisible: {
    opacity: 0.3,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 35,
    textAlign: 'center',
  },
  progressBarWrapper: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 4,
    // 确保进度条区域不会拦截按钮的触摸事件
    overflow: 'visible',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
  progressBarThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    position: 'absolute',
    top: -4,
    marginLeft: -6,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    flexShrink: 0,
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8, // 增加右边距，避免与全屏按钮重叠
    flexShrink: 0,
  },
  volumeSliderTrack: {
    width: 30,
    height: 20,
    justifyContent: 'center',
    flexShrink: 0,
    paddingVertical: 8, // 增加垂直内边距，扩大可触摸区域
  },
  volumeSliderTrackInner: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  volumeSliderFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  volumeSliderThumb: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    position: 'absolute',
    top: -6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fullscreenPlayButtonContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    zIndex: 10,
  },
  fullscreenControlsWrapper: {
    position: 'absolute',
    bottom: 100, // 放在心愿单按钮上方，紧贴视频底部
    left: 0,
    right: 0,
    zIndex: 100,
  },
});

// PropTypes 验证
VideoWidget.propTypes = {
  src: PropTypes.string.isRequired,
  autoplay: PropTypes.bool,
  useContainerHeight: PropTypes.bool,
  product: PropTypes.object,
};

VideoWidget.defaultProps = {
  autoplay: false,
  useContainerHeight: false,
  product: null,
};

export default VideoWidget;
