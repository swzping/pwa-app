import React, {useState} from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {Colors, Mixins} from '@app/styles/index';

import Carousel, {Pagination} from 'react-native-snap-carousel';
import CustomView from '@app/components/CustomView';
import styles from '@app/components/BannerSlider/styles';
import BannerSliderImage from './atoms/BannerSliderImage/index';

const BannerSlider = ({
  style,
  styleFrame,
  data,
  clickable,
  autoplay = false,
  autoplayInterval = 3000,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderWidth = Mixins.MAX_WIDTH;
  const itemWidth = Mixins.MAX_WIDTH * 0.88;

  /**
   * ----------------------------------------- *
   * @function _renderItem
   * @param {object} item
   * @summary load single item
   * @return Component
   * ----------------------------------------- *
   */
  const _renderItem = ({item, index}) => {
    const getBackground = {backgroundColor: Colors.TRANSPARENT};
    return (
      <CustomView style={[getBackground, styles.sliderFrame]}>
        <BannerSliderImage clickable={clickable} index={index} item={item} />
      </CustomView>
    );
  };

  /**
   * ----------------------------------------- *
   * @constant rendering
   * @dependency [loading, data, activeSlide]
   * @summary load banner slider
   * @return Sections
   * ----------------------------------------- *
   */
  const customViewStyle = {
    height: Mixins.MAX_HEIGHT * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const carouselStyle = {
    overflow: 'visible',
    paddingBottom: 20,
    backgroundColor: 'transparent',
  };

  if (data.length < 1) {
    return (
      <CustomView style={[styleFrame]}>
        <CustomView style={[styleFrame, customViewStyle]}>
          <ActivityIndicator color={Colors.PRIMARY} />
        </CustomView>
      </CustomView>
    );
  }
  return (
    <CustomView style={[styleFrame]}>
      <CustomView style={style}>
        <Carousel
          loop
          autoplay={autoplay}
          autoplayDelay={autoplayInterval}
          autoplayInterval={autoplayInterval}
          enableMomentum={false}
          lockScrollWhileSnapping
          data={data}
          renderItem={_renderItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          onSnapToItem={index => setActiveSlide(index)}
          containerCustomStyle={carouselStyle}
        />
        <Pagination
          containerStyle={styles.sliderPaginationStyles}
          dotsLength={data.length}
          activeDotIndex={activeSlide}
          dotStyle={styles.sliderPaginationDot}
          inactiveDotStyle={styles.sliderPaginationDotInactive}
          inactiveDotOpacity={0.4}
          inactiveDotScale={0.6}
          dotContainerStyle={{
            marginHorizontal: data.length < 15 ? 5 : 1,
          }}
        />
      </CustomView>
    </CustomView>
  );
};

export default BannerSlider;
