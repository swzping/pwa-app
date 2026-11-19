import React, {useEffect, useState} from 'react';
import {useReactiveVar} from '@apollo/client';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {UPDATE_CART_ITEMS} from '@app/_modules/cart/services/schema';
import {rxCartId, rxAppSnackbar} from '@app/services/cache';
import {useRefetchCart} from '@app/hooks/useRefetchCart';
import {useTranslation} from 'react-i18next';
import QuantityModal from '@app/_modules/cart/atoms/QuantityModal';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';

const ModalUpdateCartItem = ({
  cartItemId,
  initialQuantity = 0,
  name = '',
  children,
  propStyle = {},
}) => {
  const cartId = useReactiveVar(rxCartId);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState({});
  const [quantity, setQuantity] = useState(0);
  const {t} = useTranslation();
  const {onRefetchData: updateCartItemHook} = useCustomMutation({
    schema: UPDATE_CART_ITEMS,
  });

  const {refetch: refetchCart} = useRefetchCart();

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  useEffect(() => {
    if (cartId) {
      setVariables({
        input: {
          cart_id: cartId,
          cart_items: [
            {
              cart_item_id: cartItemId,
              quantity,
            },
          ],
        },
      });
    }
  }, [cartId, cartItemId, quantity]);

  const updateCartItem = async () => {
    if (quantity > 0) {
      setLoading(true);
      const gqlReturn = await updateCartItemHook({
        params: variables,
        paramsOpt: {isReturn: true},
      });
      try {
        refetchCart(gqlReturn.data.updateCartItems);
        rxAppSnackbar({
          message: t('cart.modal_update_cart_item.message.cartUpdate'),
        });

        if (gqlReturn.data.updateCartItems?.user_errors?.length) {
          const message = gqlReturn.data.updateCartItems.user_errors[0]?.message || '';
          rxAppSnackbar({
            message: t(message),
          });
        }

        setLoading(false);
        setShowModal(false);
      } catch (error) {
        // console.log(error);
        rxAppSnackbar({
          message: t('cart.modal_update_cart_item.error.message'),
        });
        setLoading(false);
        setShowModal(false);
      }
    }
  };

  const incereaseQuantity = () => {
    let newQty = 0;
    if (quantity !== '') {
      newQty = parseInt(quantity) + 1;
    } else {
      newQty = 1;
    }
    setQuantity(newQty);
  };

  const decreaseQuantity = () => {
    if (quantity !== '' && parseInt(quantity) > 1) {
      const newQty = parseInt(quantity) - 1;
      setQuantity(newQty);
    }
  };

  const renderButtonText = () => {
    if (children) {
      return children;
    } else {
      return <Text>{t('cart.modal_update_cart_item.view.update')}</Text>;
    }
  };

  return (
    <>
      <QuantityModal
        visible={showModal}
        name={name}
        quantity={quantity}
        onChangeQuantity={qty => setQuantity(qty)}
        onIncreaseQuantity={incereaseQuantity}
        onDecreaseQuantity={decreaseQuantity}
        onSubmit={updateCartItem}
        submitLabel={t('cart.modal_update_cart_item.label.updateQuantity')}
        loading={loading}
        onBackBackButtonPress={() => setShowModal(false)}
      />
      <CustomView onPress={() => setShowModal(true)} style={propStyle}>
        {renderButtonText()}
      </CustomView>
    </>
  );
};

export default ModalUpdateCartItem;
