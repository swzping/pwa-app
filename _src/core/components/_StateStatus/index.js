import React from 'react';
import { Text } from 'react-native';
import { MD2Colors as Colors } from 'react-native-paper';
import { MixinsNew } from '@app/styles/index';

import IconFeather from 'react-native-vector-icons/Feather';
import CustomView from '@app/components/CustomView';

const StatusState = ({ iconName = 'alert-circle' }) => {
  return (
    <CustomView
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        ...MixinsNew.margin({ top: 40 }),
      }}>
      <IconFeather name={iconName} size={50} color={Colors.grey400} />
      <Text style={{ color: Colors.grey400 }}>no data found</Text>
    </CustomView>
  );
};

export default StatusState;
