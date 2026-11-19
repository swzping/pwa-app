import React from 'react';
import FastImage from '@d11/react-native-fast-image';

const NodeImage = ({uri}) => {
  return (
    <FastImage
      style={{width: 300, height: 200}}
      source={{
        uri: uri,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.contain}
    />
  );
};

export default NodeImage;
