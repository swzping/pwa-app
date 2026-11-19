import React, {memo} from 'react';
import FastImage from '@d11/react-native-fast-image';
import CustomView from '@app/components/CustomView/index';
import styles from '@root/_src/core/components/BannerSlider/atoms/_BannerItem/styles';

const BannerItem = ({
  keyIndex,
  clickable,
  imageSource,
  onPress,
  onError,
  onLoadEnd,
}) => {
  const imageProps = {
    onLoadEnd,
    onError,
    key: keyIndex.toString(),
    style: styles.sliderImage,
    resizeMode: FastImage.resizeMode.cover,
    source: {
      uri: imageSource,
      priority: FastImage.priority.normal,
      cache: FastImage.cacheControl.immutable,
    },
  };

  if (!clickable) {
    return <FastImage {...imageProps} />;
  }

  return (
    <CustomView onPress={onPress} style={styles.frameContainer}>
      <FastImage {...imageProps} />
    </CustomView>
  );
};

export default memo(BannerItem);
