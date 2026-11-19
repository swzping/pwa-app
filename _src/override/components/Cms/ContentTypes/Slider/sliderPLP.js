import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Swiper from '@app/components/Swiper';
import {Styles} from '@app/styles';
import {useOsmosSliderAds} from './useOsmosSliderAds';

/**
 * PLP专用Slider组件：去掉分页点
 */
const SliderPLP = ({
  showSmallBanner,
  mode,
  behavior,
  autoplay,
  autoplaySpeed,
  infinite,
  bleeding = true,
  breakpoints,
  noPadding,
  children,
  isActiveDotStyle,
  isNeedPaddingBottom = false,
  cssClasses = [],
}) => {
  const {resolvedChildren} = useOsmosSliderAds({
    children,
    cssClasses,
  });
  const totalSlides = React.Children.count(resolvedChildren);

  // PLP版本：不显示分页点，默认启用自动滚动
  const dots = false;
  // 如果未指定autoplay，默认启用；如果未指定autoplaySpeed，默认4000ms
  const shouldAutoplay = true; // 默认true，除非明确设置为false
  const autoplayInterval = autoplaySpeed || 4000;

  const resolvedMode = useMemo(() => {
    if (
      !showSmallBanner ||
      (mode === 1 && (behavior === 'options' || totalSlides === 1))
    ) {
      return 0;
    }
    return mode;
  }, [showSmallBanner, mode, behavior, totalSlides]);

  const slideChildren = React.Children.map(resolvedChildren, (child, index) => {
    return React.cloneElement(child, {
      key: index,
      // 参考首页 BannerSlider：统一圆角 12
      borderRadius: 12,
      customStyles: {
        ...child.props.customStyles,
        // 统一用对象样式，便于下游读取 maxHeight / borderRadius（避免数组样式导致读取不到）
        container: {
          ...styles.bannerContainer,
          maxHeight: 230,
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    });
  });

  const containerStyle = StyleSheet.flatten([
    styles.container,
    !bleeding && styles.paddingRegularHorizontal,
    !resolvedMode && styles.paddingRegularHorizontal,
    noPadding && Styles.noPaddingVertical,
    noPadding && Styles.noPaddingHorizontal,
    isNeedPaddingBottom && styles.silderPaddingBottom,
  ]);

  const flatListContent =
    bleeding && resolvedMode ? styles.paddingRegularHorizontal : {};
  const removeClipped = totalSlides >= 10;

  return (
    <View style={containerStyle}>
      <Swiper
        mode={resolvedMode}
        behavior={behavior}
        spaceBetween={noPadding ? 0 : undefined}
        breakpoints={breakpoints}
        dots={dots}
        autoplay={shouldAutoplay}
        autoplaySpeed={autoplayInterval}
        infinite={infinite}
        normalizeSlidesPerView={true}
        activeDotStyle={isActiveDotStyle}
        flatListConfigs={{
          windowSize: 3,
          maxToRenderPerBatch: 3,
          initialNumToRender: 3,
          removeClippedSubviews: removeClipped,
        }}
        flatListContentContainerStyle={flatListContent}>
        {slideChildren}
      </Swiper>
    </View>
  );
};

const styles = StyleSheet.create({
  silderPaddingBottom: {
    paddingBottom: 5,
  },
  container: {
    paddingVertical: 8,
    paddingTop: 30,
  },
  bannerContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  flatListContent: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  paddingRegularHorizontal: {
    paddingLeft: 12,
    paddingRight: 12,
  },
});

export default SliderPLP;
