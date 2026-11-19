import React, {memo} from 'react';
import FastImage from '@d11/react-native-fast-image';
import CustomView from '@app/components/CustomView/index';
import styles from '@app/components/BannerSlider/atoms/_BannerItem/styles';
import {Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {IS_IOS} from '@root/_src/override/helpers/Constants';
import {thumborProductList} from '@app/helpers/Thumbor';

const BannerItem = ({
  keyIndex,
  clickable,
  imageSource,
  section,
  onPress,
  onError,
  onLoadEnd,
}) => {
  // const imageWidthOther = Mixins.MAX_WIDTH;
  const imageWidthOther = Mixins.MAIN_BANNER_WIDTH;
  // const imageHeightOther =
  //   Mixins.MAIN_BANNER_WIDTH - (IS_IOS ? normalize(156) : normalize(158));
  const imageHeightOther =
    parseInt(Mixins.MAIN_BANNER_WIDTH * Mixins.BANNER_WIDTH_HEIGHT_RATIO) +
    (IS_IOS ? normalize(1) : normalize(3));
  const isBrand = section === 'featured-brands';
  const imageUri = isBrand
    ? imageSource
    : thumborProductList(imageSource, {width: 412, height: 230});

  const imageProps = {
    onLoadEnd,
    onError,
    key: 1,
    resizeMode: isBrand
      ? FastImage.resizeMode.contain
      : FastImage.resizeMode.contain,
    style: {
      ...styles.sliderImage,
      width: isBrand ? Mixins.MAX_WIDTH * 0.25 : imageWidthOther,
      height: isBrand ? Mixins.MAX_HEIGHT * 0.06 : imageHeightOther,
    },
    source: {
      uri: imageUri,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    },
  };

  if (!clickable) {
    return <FastImage {...imageProps} />;
  }

  return (
    <CustomView key={keyIndex} onPress={onPress} style={styles.frameContainer}>
      <FastImage {...imageProps} />
    </CustomView>
  );
};

export default memo(BannerItem);
