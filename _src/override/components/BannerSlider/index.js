import React, {useState, useRef} from 'react';
import {Colors, Mixins} from '@app/styles/index';
// import {IS_IOS} from '@app/helpers/Constants';
// import {normalize} from '@app/styles/mixins';
// import {default as CarouselReanimated} from 'react-native-reanimated-carousel';

import Carousel, {Pagination} from 'react-native-snap-carousel';
import CustomView from '@app/components/CustomView/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import BannerSliderImage from '@app/components/BannerSlider/atoms/BannerSliderImage/index';
import styles from '@app/components/BannerSlider/styles';

const BannerSlider = ({
  style,
  styleFrame,
  data,
  clickable,
  section = null,
  title,
  autoplay = true,
  autoplayInterval = 3000,
}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const refSlider = useRef();
  const isBrand = section === 'featured-brands';
  const [activeSlide, setActiveSlide] = useState(0);
  const sliderWidth = Mixins.MAX_WIDTH;
  const itemWidth = isBrand ? Mixins.MAX_WIDTH * 0.35 : sliderWidth;

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
    paddingBottom: 0,
    backgroundColor: Colors.TRANSPARENT,
  };

  // if (!IS_IOS && !isBrand) {
  //   return (
  //     <CustomView style={[styleFrame]}>
  //       <RenderIf condition={title}>
  //         <Text center bold style={{fontSize: 20, marginVertical: 10}}>
  //           {title}
  //         </Text>
  //       </RenderIf>
  //       <CustomView style={style} bg={Colors.TRANSPARENT}>
  //         <CarouselReanimated
  //           ref={refSlider}
  //           loop
  //           width={Mixins.MAX_WIDTH}
  //           height={Mixins.MAIN_BANNER_WIDTH - normalize(155)}
  //           autoPlay={autoplay}
  //           autoplayDelay={1000}
  //           autoplayInterval={autoplayInterval}
  //           data={data}
  //           scrollAnimationDuration={2000}
  //           pagingEnabled
  //           onSnapToItem={index => setActiveSlide(index)}
  //           renderItem={_renderItem}
  //         />

  //         <Pagination
  //           containerStyle={{
  //             position: 'absolute',
  //             bottom: -20,
  //             width: '100%',
  //           }}
  //           dotsLength={data.length}
  //           activeDotIndex={activeSlide}
  //           dotStyle={styles.sliderPaginationDot}
  //           inactiveDotStyle={styles.sliderPaginationDotInactive}
  //           inactiveDotOpacity={0.4}
  //           inactiveDotScale={1}
  //           dotContainerStyle={{
  //             marginHorizontal: data.length < 15 ? 5 : 1,
  //           }}
  //         />
  //       </CustomView>
  //     </CustomView>
  //   );
  // }

  return (
    <CustomView style={[styleFrame]}>
      <RenderIf condition={title}>
        <Text center bold style={{fontSize: 20, marginVertical: 10}}>
          {title}
        </Text>
      </RenderIf>
      <CustomView style={style} bg={Colors.TRANSPARENT}>
        <Carousel
          ref={refSlider}
          loop
          autoplay={autoplay}
          autoplayDelay={1000}
          autoplayInterval={autoplayInterval}
          enableMomentum={false}
          lockScrollWhileSnapping
          data={data}
          renderItem={_renderItem}
          sliderWidth={sliderWidth}
          itemWidth={itemWidth}
          slideStyle={{width: itemWidth}}
          inactiveSlideOpacity={1}
          inactiveSlideScale={1}
          removeClippedSubviews={false}
          onSnapToItem={index => setActiveSlide(index)}
          containerCustomStyle={carouselStyle}
        />
        <RenderIf condition={!isBrand}>
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
        </RenderIf>
      </CustomView>
    </CustomView>
  );
};

export default BannerSlider;
