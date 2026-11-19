import React from 'react';
import {View} from 'react-native';

const TabItemWidget = ({backgroundColor, children}) => {
  if (backgroundColor) {
    return <View style={{backgroundColor: backgroundColor}}>{children}</View>;
  }
  return <>{children}</>;
};

export default TabItemWidget;
