import React, {useRef, useMemo, useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {useIsFocused} from '@react-navigation/native';
import {Colors} from '@app/styles';

const {width: screenWidth} = Dimensions.get('window');

// 定义不同的布局模式及响应式 breakpoints
const DefaultBreakpoints = {
  0: {slidesPerView: 1, spaceBetween: 8},
  1: {slidesPerView: 1.25, spaceBetween: 8},
  2: {slidesPerView: 1.33, spaceBetween: 8},
  3: {slidesPerView: 2.25, spaceBetween: 8},
  4: {slidesPerView: 2.25, spaceBetween: 8},
};

const groupChildren = (items, totalSlides, rows) => {
  if (rows <= 1) {
    return items;
  }

  const grouped = [];
  const groupSize = Math.ceil(totalSlides / rows);

  for (let i = 0; i < groupSize; i++) {
    const group = [];

    for (let j = 0; j < rows; j++) {
      const childIndex = i + j * groupSize;

      if (childIndex < totalSlides) {
        group.push(items[childIndex]);
      }
    }
    grouped.push(group);
  }
  return grouped;
};

const getBehaviorSetting = (setting, {mode, behavior, totalSlides}) => {
  if (!mode) {
    return setting;
  }

  if (behavior === 'options') {
    const isPerViewSame = mode === totalSlides;
    if (mode === 4 && isPerViewSame) {
      setting.rows = 2;
      setting.slidesPerView = 2;
    } else if (mode === 3 && isPerViewSame) {
      setting.slidesPerView = 1.33;
    } else if (mode === 2 && !isPerViewSame) {
      setting.slidesPerView = 2.25;
    } else if (mode === 1 && !isPerViewSame) {
      setting.slidesPerView = 1;
    }
  }

  if (mode === 1 && totalSlides === 1) {
    setting.slidesPerView = 1;
  }

  return setting;
};

const getEffectivePadding = (style, isCenteredLayout) => {
  if (!style) {
    return 0;
  }

  const left =
    typeof style.paddingLeft === 'number'
      ? style.paddingLeft
      : typeof style.paddingHorizontal === 'number'
      ? style.paddingHorizontal
      : 0;

  const right =
    typeof style.paddingRight === 'number'
      ? style.paddingRight
      : typeof style.paddingHorizontal === 'number'
      ? style.paddingHorizontal
      : 0;

  return left + (isCenteredLayout ? right : 0);
};

// 将 MemoizedSlideItem 组件定义移到外部
const MemoizedSlideItem = React.memo(
  ({item, isLast, itemWidth, itemSpaceBetween}) => (
    <View
      style={{
        width: itemWidth,
        marginRight: isLast ? 0 : itemSpaceBetween,
        gap: 4,
      }}>
      {item}
    </View>
  ),
);

const Swiper = ({
  mode,
  behavior,
  autoplaySpeed = 3000,
  autoplay = false,
  dots = false,
  infinite = false,
  slidesPerView,
  slidesPerGroup = 1,
  spaceBetween,
  breakpoints,
  rows = 1,
  normalizeSlidesPerView = false,
  initialWidth,
  children,
  style,
  dotStyle,
  activeDotStyle,
  onIndexChange,
  extraData,
  onViewableItemsChanged,
  viewabilityConfig,
  flatListConfigs,
  flatListContainerStyle,
  flatListContentContainerStyle,
}) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(
    initialWidth || screenWidth,
  );
  const currentIndexRef = useRef(currentIndex);
  const isAutoRef = useRef(false);
  const autoplaySpeedRef = useRef(autoplaySpeed);

  const [dimensions, setDimensions] = useState({
    itemWidth: 0,
    slideStep: 0,
    groupWidth: 0,
    totalWidth: 0,
  });

  const isFocused = useIsFocused();

  const bp = breakpoints || DefaultBreakpoints;
  const layoutConfig =
    bp[mode] || DefaultBreakpoints[mode] || DefaultBreakpoints[0];
  const resolvedSlidesPerView = slidesPerView ?? layoutConfig.slidesPerView;
  const resolvedSpaceBetween = spaceBetween ?? layoutConfig.spaceBetween;

  const resolvedSetting = getBehaviorSetting(
    {
      rows,
      slidesPerView: resolvedSlidesPerView,
      spaceBetween: resolvedSpaceBetween,
    },
    {mode, behavior, totalSlides: children.length},
  );

  const groupedChildren = useMemo(
    () =>
      groupChildren(
        React.Children.toArray(children),
        children.length,
        resolvedSetting.rows,
      ),
    [children, resolvedSetting.rows],
  );

  const totalSlides = groupedChildren.length;
  const finalSlidesPerView = normalizeSlidesPerView
    ? Math.max(1, Math.min(resolvedSetting.slidesPerView, children.length))
    : resolvedSetting.slidesPerView;
  const finalSpaceBetween = resolvedSetting.spaceBetween;
  const groupSize = Math.max(1, Math.floor(slidesPerGroup));

  const loopBuffer = Math.ceil(finalSlidesPerView);
  const step = dimensions.itemWidth + finalSpaceBetween;
  const startRealIdx = loopBuffer;
  const endRealIdx = loopBuffer + totalSlides - 1;
  const data = useMemo(() => {
    if (!infinite || totalSlides <= 1) {
      return groupedChildren;
    }

    const clonesBefore = groupedChildren.slice(-loopBuffer);
    const clonesAfter = groupedChildren.slice(0, loopBuffer);

    return [...clonesBefore, ...groupedChildren, ...clonesAfter];
  }, [infinite, groupedChildren, loopBuffer]);

  const finalFlatListConfigs = useMemo(() => {
    if (!flatListConfigs) {
      return {};
    }

    const result = {...flatListConfigs};

    const numKeys = ['windowSize', 'initialNumToRender', 'maxToRenderPerBatch'];
    numKeys.forEach(key => {
      if (typeof result[key] === 'number') {
        result[key] = result[key] * loopBuffer;
      }
    });

    return result;
  }, [flatListConfigs, loopBuffer]);

  const canScroll = useMemo(
    () => totalSlides > finalSlidesPerView,
    [totalSlides, finalSlidesPerView],
  );

  useEffect(() => {
    if (!containerWidth || finalSlidesPerView === 0 || totalSlides === 0) {
      return;
    }

    const padding = getEffectivePadding(
      flatListContentContainerStyle,
      !canScroll,
    );
    const itemWidth =
      (containerWidth -
        padding -
        finalSpaceBetween * (Math.ceil(finalSlidesPerView) - 1)) /
      finalSlidesPerView;
    const slideStep = itemWidth + finalSpaceBetween;
    const groupWidth = slideStep * groupSize;
    const totalWidth =
      totalSlides * (itemWidth + finalSpaceBetween) - finalSpaceBetween;
    setDimensions({
      itemWidth,
      slideStep,
      groupWidth,
      totalWidth,
    });
  }, [
    containerWidth,
    finalSlidesPerView,
    finalSpaceBetween,
    groupSize,
    totalSlides,
  ]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    autoplaySpeedRef.current = autoplaySpeed;
  }, [autoplaySpeed]);

  const startAutoplay = useCallback(() => {
    if (!autoplay || intervalRef.current || totalSlides <= 1) {
      return;
    }
    clearInterval(intervalRef.current);

    const interval = setInterval(() => {
      if (!flatListRef.current || !data || data.length === 0) {
        return;
      }
      const curr = currentIndexRef.current;
      const nextIndex = (curr + groupSize) % totalSlides;
      const scrollIndex = infinite ? loopBuffer + nextIndex : nextIndex;

      if (scrollIndex >= data.length) {
        return;
      }

      isAutoRef.current = true;
      safeScrollToIndex({
        index: scrollIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
      onIndexChange?.(nextIndex);
    }, autoplaySpeedRef.current);

    intervalRef.current = interval;
    return interval;
  }, [
    autoplay,
    groupSize,
    totalSlides,
    onIndexChange,
    loopBuffer,
    data.length,
    safeScrollToIndex,
  ]);

  const stopAutoplay = useCallback(() => {
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  const getSafeScrollIndex = useCallback(
    index => {
      if (!data.length || !Number.isFinite(index)) {
        return null;
      }

      return Math.max(0, Math.min(index, data.length - 1));
    },
    [data.length],
  );

  const safeScrollToIndex = useCallback(
    ({index, animated}) => {
      if (!flatListRef.current) {
        return false;
      }

      const safeIndex = getSafeScrollIndex(index);
      if (safeIndex === null) {
        return false;
      }

      flatListRef.current.scrollToIndex({
        index: safeIndex,
        animated,
      });

      return true;
    },
    [getSafeScrollIndex],
  );

  useEffect(() => {
    if (isFocused && autoplay && data.length > 1) {
      const interval = startAutoplay();
      return () => {
        clearInterval(interval);
        stopAutoplay();
      };
    } else {
      stopAutoplay();
    }
  }, [isFocused, autoplay, data.length, startAutoplay, stopAutoplay]);

  const handleLayout = event => {
    const width = event.nativeEvent.layout.width;
    if (width && width !== containerWidth) {
      setContainerWidth(width);
    }
  };

  const handleScrollReposition = useCallback(
    e => {
      if (!isFocused || !step || !Number.isFinite(step) || totalSlides === 0) {
        return;
      }

      const x = e.nativeEvent.contentOffset.x;
      const rawIndex = Math.round(x / step);

      if (infinite) {
        if (rawIndex < startRealIdx) {
          safeScrollToIndex({
            index: rawIndex + totalSlides,
            animated: false,
          });
        } else if (rawIndex > endRealIdx) {
          safeScrollToIndex({
            index: rawIndex - totalSlides,
            animated: false,
          });
        }
      }

      if (!isAutoRef.current) {
        const newIdx = infinite
          ? (rawIndex - loopBuffer + totalSlides) % totalSlides
          : rawIndex;

        if (newIdx !== currentIndexRef.current) {
          currentIndexRef.current = newIdx;
          setCurrentIndex(newIdx);
          onIndexChange?.(newIdx);
        }
      }
    },
    [
      isFocused,
      infinite,
      step,
      startRealIdx,
      endRealIdx,
      totalSlides,
      loopBuffer,
      onIndexChange,
      safeScrollToIndex,
    ],
  );

  const handleMomentumScrollEnd = useCallback(
    e => {
      if (isAutoRef.current) {
        isAutoRef.current = false;
      }

      if (autoplay) {
        startAutoplay();
      }
    },
    [autoplay, startAutoplay],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <MemoizedSlideItem
        item={item}
        isLast={index === data.length - 1}
        itemWidth={dimensions.itemWidth}
        itemSpaceBetween={finalSpaceBetween}
      />
    ),
    [dimensions.itemWidth, finalSpaceBetween, data.length],
  );

  const renderDots = () => {
    if (!dots) {
      return null;
    }

    const totalGroups = Math.ceil(totalSlides / groupSize);
    const activeGroup = Math.floor(currentIndex / groupSize);

    if (totalGroups === 1) {
      return null;
    }
    return (
      <View
        style={[
          styles.dotsContainer,
          finalSlidesPerView === 1 ? {position: 'absolute', bottom: 10} : {},
        ]}>
        {Array.from({length: totalGroups}).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => scrollToGroup(index)}
            style={[
              styles.dot,
              dotStyle,
              activeGroup === index && [styles.activeDot, activeDotStyle],
            ]}
          />
        ))}
      </View>
    );
  };

  const scrollToGroup = groupIndex => {
    if (!flatListRef.current || !data || data.length === 0) {
      return;
    }

    if (autoplay) {
      stopAutoplay();
    }
    const targetIndex = Math.min(groupIndex * groupSize, totalSlides - 1);

    const scrollIndex = infinite ? loopBuffer + targetIndex : targetIndex;

    if (scrollIndex >= data.length) {
      return;
    }

    safeScrollToIndex({
      index: scrollIndex,
      animated: true,
    });

    setCurrentIndex(targetIndex);
    onIndexChange?.(targetIndex);
  };

  const getItemLayout = useCallback(
    (_, index) => ({
      length: dimensions.itemWidth + finalSpaceBetween,
      offset: (dimensions.itemWidth + finalSpaceBetween) * index,
      index,
    }),
    [dimensions.itemWidth, finalSpaceBetween],
  );

  useEffect(() => {
    if (totalSlides === 0) {
      currentIndexRef.current = 0;
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      return;
    }

    const nextIndex = Math.min(currentIndexRef.current, totalSlides - 1);
    if (nextIndex !== currentIndexRef.current) {
      currentIndexRef.current = nextIndex;
    }
    if (nextIndex !== currentIndex) {
      setCurrentIndex(nextIndex);
    }
  }, [currentIndex, totalSlides]);

  useEffect(() => {
    if (!flatListRef.current || !data || data.length === 0) {
      return;
    }
    if (dimensions.itemWidth === 0) {
      return;
    }
    const idx = infinite && data.length > loopBuffer ? loopBuffer : 0;

    if (idx >= data.length) {
      return;
    }
    safeScrollToIndex({index: idx, animated: false});
  }, [dimensions.itemWidth, infinite, data.length, loopBuffer, safeScrollToIndex]);

  if (dimensions.itemWidth === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      <FlatList
        ref={flatListRef}
        {...finalFlatListConfigs}
        scrollEnabled={canScroll}
        overScrollMode="never"
        data={data}
        horizontal
        style={flatListContainerStyle}
        contentContainerStyle={flatListContentContainerStyle}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(_, index) => `slide-${index}`}
        snapToInterval={step}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={handleScrollReposition}
        onMomentumScrollEnd={e => {
          handleMomentumScrollEnd(e);
          if (autoplay) {
            startAutoplay();
          }
        }}
        onScrollBeginDrag={() => {
          if (autoplay) {
            stopAutoplay();
          }
          isAutoRef.current = false;
        }}
        onTouchStart={() => {
          if (autoplay) {
            stopAutoplay();
          }
          isAutoRef.current = false;
        }}
        onScrollEndDrag={() => {
          if (autoplay) {
            startAutoplay();
          }
        }}
        extraData={extraData}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.GRAY_MEDIUM,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.PRIMARY,
  },
});

export default Swiper;
