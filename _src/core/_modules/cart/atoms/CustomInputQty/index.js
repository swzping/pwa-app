import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import {TextInput} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
// import useCustomMutation from '@app/hooks/useCustomMutation';
import {rxUserTheme} from '@app/services/cache';
// import {useRefetchCart} from '@app/hooks/useRefetchCart';
// import {UPDATE_CART_ITEMS} from '@app/_modules/cart/services/schema';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import CustomView from '@app/components/CustomView';
import styles from '@app/_modules/cart/atoms/CustomInputQty/styles';
import useCarts from '@app/hooks/carts/useCarts';

/**
 * ----------------------------------------- *
 * CustomInputQuantity
 * it will be rendered only if
 * (modules.cart.atoms.update_item_qty_input.enable)
 * is true (enabled)
 * @param {initialQuantity, cartItemId}
 * ----------------------------------------- *
 */
const CustomInputQty = ({initialQuantity = 0, cartItemId, item}) => {
  const {updateQuantity} = useCarts({
    initialized: false,
  });

  const [loading] = useState(false);

  const [quantity] = useState(initialQuantity);
  /**
   * ----------------------------------------- *
   * call color hooks fro theme (dark mode)
   * @return color, scheme
   * ----------------------------------------- *
   */
  const scheme = useReactiveVar(rxUserTheme);
  const color = scheme === 'dark' ? Colors.WHITE : Colors.BLACK;
  // const {t} = useTranslation();

  /**
   * ----------------------------------------- *
   * @function onIncreaseQuantity
   * this function will be called when
   * we incrase the qty of an item on cart page
   * then will trigger onUpdateCartItem
   * function to run which will be update qty
   * item by one up (addition)
   * ----------------------------------------- *
   */
  const onIncreaseQuantity = async () => {
    await updateQuantity({
      item,
      qty: quantity + 1,
    });
  };

  /**
   * ----------------------------------------- *
   * @function onDecreaseQuantity
   * this function will be called when
   * we incrase the qty of an item on cart page
   * then will trigger onUpdateCartItem
   * function to run which will be update qty
   * item by one down (substraction)
   * ----------------------------------------- *
   */
  const onDecreaseQuantity = async () => {
    if (quantity > 1) {
      await updateQuantity({
        item,
        qty: quantity - 1,
      });
    }
  };

  switch (loading) {
    case true:
      return <ActivityIndicator />;
    default:
      return (
        <CustomView style={styles.customInputQty}>
          <CustomView onPress={onDecreaseQuantity}>
            <Icon name="minuscircleo" size={normalize(20)} color={color} />
          </CustomView>
          <TextInput
            value={quantity.toString()}
            keyboardType="number-pad"
            editable={false}
            style={[
              styles.quantityInput,
              {
                color: color,
                borderColor: color,
              },
            ]}
          />
          <CustomView onPress={onIncreaseQuantity}>
            <Icon name="pluscircleo" size={normalize(20)} color={color} />
          </CustomView>
        </CustomView>
      );
  }
};

export default CustomInputQty;
