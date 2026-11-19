import React from 'react';
import { normalize } from '@app/styles/mixins';
import { MD2Colors as ColorsPaper } from 'react-native-paper';
import CustomView from '@app/components/CustomView';

function Divider({ width = null, borderColor = null, borderWidth = 2 }) {
  return (
    <CustomView
      style={{
        width: width,
        borderColor: borderColor ?? ColorsPaper.grey200,
        borderBottomWidth: normalize(borderWidth),
      }}
    />
  );
}

export default Divider;
