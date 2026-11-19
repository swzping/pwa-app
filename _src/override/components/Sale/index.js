import React from 'react';
import {Colors} from '@app/styles';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';

const Sale = ({sale, isPDP = true}) => {
  return (
    <CustomView
      verticalCenter
      horizontalCenter
      height={isPDP ? 60 : 50}
      width={isPDP ? 60 : 50}
      backgroundColor={Colors.RED_LIGHT}
      style={{borderRadius: 50}}>
      <Text bold white style={{fontSize: isPDP ? 24 : 20}}>
        {sale}
      </Text>
    </CustomView>
  );
};

export default Sale;
