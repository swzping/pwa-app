import React from 'react';
import { StyleSheet } from 'react-native';
import { Mixins } from '@app/styles';
import { normalize } from '@app/styles/mixins';
import { MD2Colors as ColorsPaper } from 'react-native-paper';
import CustomView from '@app/components/CustomView';

function Divider() {
  return <CustomView style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    width: Mixins.MAX_WIDTH,
    borderColor: ColorsPaper.grey200,
    borderBottomWidth: normalize(2),
    // marginVertical: normalize(10),
  },
});

export default Divider;
