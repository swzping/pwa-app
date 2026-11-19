import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {Colors} from '@app/styles';

const GradientView = ({children}) => {
  return (
    <LinearGradient colors={[Colors.ORANGE_LIGHT, Colors.WHITE]}>
      {children}
    </LinearGradient>
  );
};

export default React.memo(GradientView);
