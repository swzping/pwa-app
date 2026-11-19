import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Swiper from '@app/components/Swiper';
import {Styles} from '@app/styles';
import {useOsmosSliderAds} from './useOsmosSliderAds';

const Slider = ({
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
  bannerAspectRatio,
}) => {
  const {resolvedChildren} = useOsmosSliderAds({
    children,
    cssClasses,
  });
  const totalSlides = React.Children.count(resolvedChildren);

  const dots = useMemo(() => {
    // only one image
    return showSmallBanner ? mode === 1 && behavior === 'options' : true;
  }, [showSmallBanner, mode, behavior]);

  const resolvedMode = useMemo(() => {
    if (
      !showSmallBanner ||
      (mode === 1 && (behavior === 'options' || totalSlides === 1))
    ) {
      return 0;
    }
    return mode;
  }, [showSmallBanner, mode, behavior, totalSlides]);

  const isBannerHighlightSlider = cssClasses?.includes('banner-highlight-slider');

  const slideChildren = React.Children.map(resolvedChildren, (child, index) => {
    const containerStyle = isBannerHighlightSlider
      ? {
          ...StyleSheet.flatten(styles.bannerContainer),
          ...(bannerAspectRatio ? {aspectRatio: bannerAspectRatio} : {}),
          overflow: 'hidden',
        }
      : styles.bannerContainer;

    return React.cloneElement(child, {
      key: index,
      customStyles: {
        ...child.props.customStyles,
        container: containerStyle,
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
        autoplay={autoplay}
        autoplaySpeed={autoplaySpeed}
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

export default Slider;
