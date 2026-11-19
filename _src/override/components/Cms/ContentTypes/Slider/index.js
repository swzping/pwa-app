import Slider from './slider';
import SliderPLP from './sliderPLP';

/**
 * 根据isPLP标识选择使用普通版本还是PLP版本
 */
const SliderWrapper = props => {
  // 如果props中有isPLP标识，使用PLP版本
  if (props.isPLP) {
    return <SliderPLP {...props} />;
  }
  return <Slider {...props} />;
};

export default SliderWrapper;
