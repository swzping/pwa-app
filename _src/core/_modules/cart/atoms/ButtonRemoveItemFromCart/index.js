import React, {useState} from 'react';
import {Text} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
// import AnalyticsHelper from '@app/helpers/Analytics';
import useCarts from '@app/hooks/carts/useCarts';
// import {useReactiveVar} from '@apollo/client';
// import useCustomMutation from '@app/hooks/useCustomMutation';
// import {REMOVE_ITEM} from '@app/_modules/cart/services/schema';
// import {rxCartId, rxAppSnackbar} from '@app/services/cache';
// import {useRefetchCart} from '@app/hooks/useRefetchCart';
// import AnalyticsHelper from '@app/helpers/Analytics';
import CustomView from '@app/components/CustomView';
import {useTranslation} from 'react-i18next';

const ButtonRemoveItemFromCart = ({
  cartItemId,
  product,
  children,
  item,
  propStyle = {},
  loadingChange = false,
}) => {
  const [loading] = useState(false);
  const {removeFromCart} = useCarts({
    initialized: false,
  });

  const {t} = useTranslation();

  /**
   * ----------------------------------------- *
   * @function onLogRemoveCartToAnalytics
   * @summary log remove product  to analytics
   * @profiler {googleAnalytics} removeItem
   * ----------------------------------------- *
   */
  // const onLogRemoveCartToAnalytics = () => {
  //   const {id, sku, name, currency, price} = product;
  //   let items = {
  //     id,
  //     sku,
  //     name,
  //     currency,
  //     price,
  //   };
  //   AnalyticsHelper.eventRemoveItemCart({items});
  // };

  /**
   * ----------------------------------------- *
   * @function onRemoveCartItem
   * @summary remove item on cart
   * ----------------------------------------- *
   */
  const onRemoveCartItem = async () => {
    await removeFromCart({item});
    // onLogRemoveCartToAnalytics();
  };

  if (loading) {
    return <ActivityIndicator />;
  }
  return (
    <CustomView
      onPress={loadingChange ? false : onRemoveCartItem}
      style={propStyle}>
      {children ? (
        children
      ) : (
        <Text>{t('cart.button_remove_item_from_cart.view.delete')}</Text>
      )}
    </CustomView>
  );
};

export default ButtonRemoveItemFromCart;
