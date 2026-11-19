import React from 'react';
import BannerSlider from '@app/components/BannerSlider/index';
import {Colors, MixinsNew} from '@app/styles/index';
import {StyleSheet} from 'react-native';
import CustomView from '@app/components/CustomView/index';

const styles = StyleSheet.create({
  mainFrame: {
    width: MixinsNew.MAX_WIDTH,
  },
  bannerFrame: {
    width: MixinsNew.MAX_WIDTH,
    alignSelf: 'center',
    backgroundColor: Colors.TRANSPARENT,
  },
  bannerWrapper: {
    backgroundColor: Colors.TRANSPARENT,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 5,
  },
});

const WidgetSliderBanner = ({
  autoplay = true,
  autoplayInterval = 4000,
  data,
}) => {
  return (
    <CustomView style={styles.bannerWrapper}>
      <BannerSlider
        key={'node-1'}
        autoplay={Boolean(autoplay)}
        autoplayInterval={autoplayInterval}
        data={data}
        clickable={true}
        styleFrame={styles.bannerFrame}
      />
    </CustomView>
  );
};

export default WidgetSliderBanner;
