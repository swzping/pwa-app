import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
// import {useReactiveVar} from '@apollo/client';
// import {useSentryPerf} from '@app/helpers/Sentry';
// import useCustomMutation from '@app/hooks/useCustomMutation';
// import {useRefetchCart} from '@app/hooks/useRefetchCart';
// import {rxCartId, rxAppSnackbar} from '@app/services/cache';
import {Button} from 'react-native-paper';
import useCarts from '@app/hooks/carts/useCarts';

import Text from '@app/components/Text';
// import AnalyticsHelper from '@app/helpers/Analytics';
import QuantityModal from '@app/_modules/cart/atoms/QuantityModal/index';

const ButtonAddItemToCart = ({
  item,
  name = '',
  parent_sku,
  type,
  children,
  propStyle = {},
  selectedOptions,
  disabled = false,
}) => {
  const {addToCart: addItemToCart} = useCarts({
    initialized: false,
  });
  const {t} = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [loading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // const {startTransaction, finishTransaction} = useSentryPerf('Add to cart');

  /**
   * ---------------------------------------------------- *
   * @function addToCart
   * @summary for add item to cart event
   * ---------------------------------------------------- *
   */
  const addToCart = async () => {
    if (quantity > 0) {
      await addItemToCart(
        {item, quantity, types: type, parentSku: parent_sku, selectedOptions},
        () => setShowModal(false),
      );
      // startTransaction(`
      //   Add to cart mutation ${cartId}
      //   ${JSON.stringify(variables)}
      //   `);

      //   AnalyticsHelper.eventAddItemCart({item, quantity});

      //   rxAppSnackbar({
      //     message: t('cart.add_to_cart.label.productSuccess'),
      //   });

      //   finishTransaction();

      //   if (error.graphQLErrors[0]) {
      //     rxAppSnackbar({
      //       message: error.graphQLErrors[0].message,
      //     });
      //   }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onIncreaseQuantity
   * @summary for add +1 quantity product in modal
   * ---------------------------------------------------- *
   */
  const onIncreaseQuantity = () => {
    let newQty = 0;
    if (quantity !== '') {
      newQty = parseInt(quantity) + 1;
    } else {
      newQty = 1;
    }
    setQuantity(newQty);
  };

  /**
   * ---------------------------------------------------- *
   * @function decreaseQuantity
   * @summary for add -1 quantity product in modal
   * ---------------------------------------------------- *
   */
  const onDecreaseQuantity = () => {
    if (quantity !== '' && parseInt(quantity) > 1) {
      const newQty = parseInt(quantity) - 1;
      setQuantity(newQty);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function renderButtonText
   * @summary for rendering button with text
   * ---------------------------------------------------- *
   */
  const renderButtonText = () => {
    if (children) {
      return children;
    } else {
      return <Text>+</Text>;
    }
  };

  return (
    <>
      <QuantityModal
        visible={showModal}
        name={name}
        quantity={quantity}
        onChangeQuantity={qty => setQuantity(qty)}
        onIncreaseQuantity={onIncreaseQuantity}
        onDecreaseQuantity={onDecreaseQuantity}
        onSubmit={addToCart}
        submitLabel={t('cart.add_to_cart.label.addToCart')}
        loading={loading}
        onBackBackButtonPress={() => setShowModal(false)}
      />
      <Button
        style={[propStyle]}
        onPress={() => {
          if (!disabled) {
            setShowModal(true);
          }
        }}>
        {renderButtonText()}
      </Button>
    </>
  );
};

export default ButtonAddItemToCart;
