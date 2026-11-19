import React from 'react';
import {TouchableOpacity} from 'react-native';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

import styles from '../styles';

/**
 * ---------------------------------------------------- *
 * One filter pill: selected = white bg + orange border
 * + orange text, unselected = light gray bg
 * ---------------------------------------------------- *
 */
const FilterChip = ({label, selected = false, onPress}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <CustomView
        horizontalCenter
        style={[
          styles.chip,
          selected ? styles.chipSelected : styles.chipUnselected,
        ]}>
        <Text style={{fontSize: 14, fontWeight: selected ? '500' : '400'}} color={selected ? Colors.PRIMARY : '#212121'}>
          {String(label ?? '')}
        </Text>
      </CustomView>
    </TouchableOpacity>
  );
};

export default FilterChip;
