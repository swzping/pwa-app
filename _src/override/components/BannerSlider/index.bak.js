import React, {useState} from 'react';
import {Colors, Mixins} from '@app/styles/index';

import Carousel, {Pagination} from 'react-native-snap-carousel';
import CustomView from '@app/components/CustomView/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import styles from '@app/components/BannerSlider/styles';
import BannerSliderImage from '@app/components/BannerSlider/atoms/BannerSliderImage/index';

const BannerSlider = ({
  style,
  styleFrame,
  data,
  clickable,
  section = null,
  title,
  autoplay = true,
  autoplayInterval = 4000,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderWidth = Mixins.MAX_WIDTH;
  const itemWidth =
    section === 'featured-brands' ? Mixins.MAX_WIDTH * 0.35 : Mixins.MAX_WIDTH;

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
      <CustomView
        key={'banner-slider-' + index}
        style={[getBackground, styles.sliderFrame]}>
        <BannerSliderImage
          clickable={clickable}
          index={index}
          section={section}
          item={item}
        />
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
  const carouselStyle = {
    overflow: 'visible',
    paddingBottom: 25,
    backgroundColor: 'transparent',
  };

  return (
    <CustomView style={[styleFrame]}>
      <RenderIf condition={title}>
        <Text center bold style={{fontSize: 20, marginVertical: 10}}>
          {title}
        </Text>
      </RenderIf>
      <CustomView style={style} bg={Colors.WHITE}>
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
          inactiveDotScale={1}
          dotContainerStyle={{
            marginHorizontal: data.length < 15 ? 5 : 1,
          }}
        />
      </CustomView>
    </CustomView>
  );
};

export default BannerSlider;
