import React from 'react';
import {Colors, Mixins} from '@app/styles/index';
import CategorySlider from '@app/components/AddonCategorySlider/index';
const WidgetSliderCategory = ({data}) => {
  return (
    <CategorySlider
      categorySliderData={data}
      customFrameHeight={Mixins.MAX_HEIGHT * 0.5}
      frameStyle={{
        backgroundColor: Colors.TRANSPARENT,
        top: -3,
        marginLeft: 12,
        marginRight: 12,
      }}
      frameListContainerStyle={{paddingTop: 10, paddingBottom: 10}}
    />
  );
};

export default WidgetSliderCategory;
