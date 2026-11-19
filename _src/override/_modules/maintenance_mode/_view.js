import React from 'react';
import {Image} from 'react-native';
import CustomView from '@app/components/CustomView';
import {Mixins} from '@app/styles';

function MaintenanceModeScreen({t, onTryAgain, loading}) {
  return (
    <CustomView flex alignCenter horizontalCenter verticalCenter>
      <Image
        source={require('@app/assets/images/maintenance-banner.png')}
        resizeMode="contain"
        style={{width: Mixins.MAX_WIDTH, height: Mixins.MAX_HEIGHT}}
      />
    </CustomView>
  );
}

export default MaintenanceModeScreen;
