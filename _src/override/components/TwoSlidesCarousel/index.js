import React, {useRef} from 'react';
import {TouchableOpacity} from 'react-native';
import {Mixins} from '@app/styles';
import {Colors} from '@app/styles/index';
import Carousel from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/FontAwesome';
import CustomView from '@app/components/CustomView';

const TwoSlidesCarousel = ({
  data,
  navigatorButtonHeight = 0,
  renderItem,
  slideIntervalTime,
}) => {
  const ref = useRef();
  const SLIDER_WIDTH = Mixins.MAX_WIDTH - 8;
  const ITEM_WIDTH = SLIDER_WIDTH * 0.5;

  const SliderNavigatorButton = ({isRight = false}) => {
    const iconName = isRight ? 'chevron-right' : 'chevron-left';
    let style = {
      elevation: 2,
      backgroundColor: 'white',
      marginLeft: isRight ? 0 : 1,
      marginRight: isRight ? 1 : 0,
      padding: 14,
      borderRadius: 50,
      position: 'absolute',
      top: navigatorButtonHeight,
    };
    if (isRight) {
      style = {...style, right: 0};
    }

    const onPress = () => {
      isRight ? ref.current.snapToNext() : ref.current.snapToPrev();
    };

    return (
      <TouchableOpacity onPress={onPress} style={style}>
        <Icon
          name={iconName}
          size={12}
          color={'#ef7d00'}
          style={{opacity: 0.8}}
        />
      </TouchableOpacity>
    );
  };

  return (
    <CustomView
      backgroundColor={Colors.TRANSPARENT}
      paddingHorizontal={0}
      style={[
        {alignSelf: 'center', flex: 1, backgroundColor: Colors.TRANSPARENT},
      ]}>
      <Carousel
        loop
        autoplay={true}
        ref={ref}
        data={data}
        renderItem={renderItem}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        slideStyle={{width: ITEM_WIDTH}}
        autoplayInterval={slideIntervalTime}
        activeSlideAlignment={'start'}
        inactiveSlideScale={1}
        inactiveSlideOpacity={1}
        removeClippedSubviews={false}
      />
      <SliderNavigatorButton />
      <SliderNavigatorButton isRight />
    </CustomView>
  );
};

export default React.memo(TwoSlidesCarousel);
