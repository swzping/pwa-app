import React from 'react';
import {StyleSheet, View} from 'react-native';

import {LocalSvg} from 'react-native-svg/css';

const EventBookingBg = () => {
  return (
    <View style={{...StyleSheet.absoluteFillObject, flex: 1}}>
      <LocalSvg
        asset={require('@app/assets/svg/eventBookingBg.svg')}
        width="100%"
        preserveAspectRatio="none"
      />
      <LocalSvg
        asset={require('@app/assets/svg/eventBookingBgBottom.svg')}
        width="100%"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
    </View>
  );
};

export default EventBookingBg;
