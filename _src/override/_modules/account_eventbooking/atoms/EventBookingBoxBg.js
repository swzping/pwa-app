import React from 'react';
import {StyleSheet, View} from 'react-native';

import {LocalSvg} from 'react-native-svg/css';

const EventBookingBoxBg = () => {
  return (
    <View style={{...StyleSheet.absoluteFillObject, flex: 1}}>
      <LocalSvg
        asset={require('@app/assets/svg/eventBookingBoxBg1.svg')}
        width="100%"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
      <LocalSvg
        asset={require('@app/assets/svg/eventBookingBoxBg2.svg')}
        width="100%"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
        }}
      />
      <LocalSvg
        asset={require('@app/assets/svg/eventGuardian.svg')}
        width={103}
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 13,
          right: 18,
        }}
      />
    </View>
  );
};

export default EventBookingBoxBg;
