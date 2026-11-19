import React from 'react';
import {Image, TouchableOpacity} from 'react-native';
import CustomView from '@root/_src/core/components/CustomView/index';

export const ScrollToTopButton = ({onPress}) => {
  return (
    <CustomView
      style={{
        position: 'absolute',
        bottom: 10,
        zIndex: 10,
        right: 10,
      }}>
      <TouchableOpacity onPress={onPress}>
        <Image
          source={require('@app/assets/images/back_to_top.png')}
          style={{
            width: 50,
            height: 50,
            resizeMode: 'contain',
          }}
        />
      </TouchableOpacity>
    </CustomView>
  );
};
