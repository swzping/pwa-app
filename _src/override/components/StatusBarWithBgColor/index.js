import React from 'react';
import {StatusBar} from 'react-native';
import {IS_IOS} from '@app/helpers/Constants';
import {SafeAreaView} from 'react-native-safe-area-context';

const StatusBarWithBackgroundColor = ({backgroundColor, ...rest}) => {
  if (IS_IOS) {
    return (
      <SafeAreaView edges={['top']} style={{backgroundColor}}>
        <StatusBar translucent {...rest} />
      </SafeAreaView>
    );
  } else {
    return (
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={'dark-content'}
        {...rest}
      />
    );
  }
};

export default StatusBarWithBackgroundColor;
