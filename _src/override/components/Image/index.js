import React, {memo} from 'react';
import FastImage from '@d11/react-native-fast-image';

const RNFImage = memo(
  ({
    defaultSource,
    localSource,
    source,
    style = [],
    resizeMode,
    fallbackImg = false,
    onLoadEnd = undefined,
  }) => (
    <FastImage
      style={style}
      defaultSource={defaultSource}
      source={
        localSource ?? {
          uri: source,
          priority: FastImage.priority.normal,
        }
      }
      resizeMode={resizeMode}
      fallback={fallbackImg}
      onLoadEnd={onLoadEnd}
    />
  ),
);

export default RNFImage;
