import React, {useCallback, useEffect, useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';

import Icon from 'react-native-vector-icons/AntDesign';

import CustomView from '@app/components/CustomView';
import {Colors} from '@app/styles';

/**
 * ---------------------------------------------------- *
 * @component QtyStepper
 * @summary quantity stepper ( - [value] + ) to pick how
 *          many units of a product will be returned
 * ---------------------------------------------------- *
 */
function QtyStepper({initialValue = 0, maxQty, minQty = 0, onChangeQuantity}) {
  const [quantity, setQuantity] = useState(initialValue);

  const canIncrease = quantity < maxQty;
  const canDecrease = quantity > minQty;

  useEffect(() => {
    setQuantity(initialValue);
  }, [initialValue]);

  const updateQuantity = useCallback(
    nextQuantity => {
      setQuantity(nextQuantity);
      onChangeQuantity && onChangeQuantity(nextQuantity);
    },
    [onChangeQuantity],
  );

  const onIncreaseQuantity = useCallback(
    () => canIncrease && updateQuantity(quantity + 1),
    [canIncrease, quantity, updateQuantity],
  );

  const onDecreaseQuantity = useCallback(
    () => canDecrease && updateQuantity(quantity - 1),
    [canDecrease, quantity, updateQuantity],
  );

  const onChangeText = text => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      return updateQuantity('');
    }

    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) {
      return updateQuantity(Math.min(num, maxQty));
    }
  };

  const onEndEditing = () => {
    if (quantity === '' || quantity < minQty) {
      return updateQuantity(minQty);
    }
    if (quantity > maxQty) {
      updateQuantity(maxQty);
    }
  };

  return (
    <CustomView
      row
      horizontalCenter
      marginTop={12}
      style={styles.quantityContainer}>
      <CustomView
        row
        horizontalCenter
        verticalCenter
        width={32}
        height={32}
        borderColor={Colors.GRAY_LIGHT}
        onPress={onDecreaseQuantity}>
        <Icon
          name="minus"
          size={16}
          color={canDecrease ? Colors.PRIMARY : Colors.GRAY_DARK}
        />
      </CustomView>
      <CustomView
        row
        horizontalCenter
        verticalCenter
        flex={1}
        borderColor={Colors.GRAY_LIGHT}
        style={styles.quantityValue}>
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
        width={32}
        height={32}
        borderColor={Colors.GRAY_LIGHT}
        onPress={onIncreaseQuantity}>
        <Icon
          name="plus"
          size={16}
          color={canIncrease ? Colors.PRIMARY : Colors.GRAY_DARK}
        />
      </CustomView>
    </CustomView>
  );
}

export default QtyStepper;

const styles = StyleSheet.create({
  quantityContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 4,
    width: 132,
    height: 32,
  },
  quantityValue: {
    borderRightWidth: 0.5,
    borderLeftWidth: 0.5,
  },
  quantityText: {
    padding: 0,
    textAlign: 'center',
    fontSize: 12,
  },
});
