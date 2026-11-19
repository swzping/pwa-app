import React, {memo} from 'react';
import {StyleSheet, TextInput} from 'react-native';

import Icon from 'react-native-vector-icons/AntDesign';

import CustomView from '@app/components/CustomView';
import {Colors} from '@app/styles';

/**
 * Quantity stepper: minus button + editable qty input + plus button.
 * Increase/decrease and manual input are all controlled by the parent
 * (see useVariantPicker for limit / stock validation logic).
 */
const QtyStepper = ({
  width,
  height = 26,
  quantity,
  canIncrease,
  canDecrease,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onChangeText,
  onEndEditing,
}) => {
  return (
    <CustomView
      row
      width={width ?? height * 4}
      height={height}
      horizontalCenter
      style={styles.quantityContainer}>
      <CustomView
        row
        horizontalCenter
        verticalCenter
        width={height}
        height="100%"
        borderColor={Colors.GRAY_LIGHT}
        style={styles.minusButton}
        onPress={onDecreaseQuantity}>
        <Icon
          name="minus"
          size={height / 2}
          color={canDecrease ? Colors.PRIMARY : Colors.GRAY_DARK}
        />
      </CustomView>
      <CustomView
        row
        horizontalCenter
        verticalCenter
        flex
        height={height}
        border={1}
        borderColor={Colors.GRAY_LIGHT}>
        <TextInput
          style={styles.quantityText}
          value={String(quantity)}
          editable
          selectTextOnFocus
          keyboardType="number-pad"
          returnKeyType="done"
          onChangeText={onChangeText}
          onEndEditing={onEndEditing}
        />
      </CustomView>
      <CustomView
        row
        horizontalCenter
        verticalCenter
        width={height}
        height="100%"
        borderColor={Colors.GRAY_LIGHT}
        style={styles.plusButton}
        onPress={onIncreaseQuantity}>
        <Icon
          name="plus"
          size={height / 2}
          color={canIncrease ? Colors.PRIMARY : Colors.GRAY_DARK}
        />
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  quantityContainer: {
    marginTop: 12,
  },
  minusButton: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  plusButton: {
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  quantityText: {
    padding: 0,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default memo(QtyStepper);
