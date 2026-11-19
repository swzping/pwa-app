import {useReactiveVar} from '@apollo/client';
import {Storage} from '@app/helpers/Storage';
import {
  SET_BILLING_ADDRESS,
  SET_SHIPPING_ADDRESS,
} from '@app/_modules/cart/services/schema';
import {rxCartIsVirtual} from '@app/services/cache';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useRefetchCart} from '@app/hooks/useRefetchCart';

export function useSelectShippingAddress() {
  const {refetch: refetchCart} = useRefetchCart();
  const cartIsVirtual = useReactiveVar(rxCartIsVirtual);
  const {onRefetchData: selectShippingAddressHook} = useCustomMutation({
    schema: SET_SHIPPING_ADDRESS,
  });
  const {onRefetchData: selectBillingAddressHook} = useCustomMutation({
    schema: SET_BILLING_ADDRESS,
  });

  const setDefautShippingToCart = async addressId => {
    if (!cartIsVirtual) {
      const cartId = await Storage.get(Storage.name.CART_ID);
      const gqlReturn = await selectShippingAddressHook({
        params: {
          input: {
            cart_id: cartId,
            shipping_addresses: [{customer_address_id: addressId}],
          },
        },
        paramsOpt: {isReturn: true},
      });
      if (gqlReturn) {
        refetchCart(gqlReturn.data.setShippingAddressesOnCart);
      }
    }
  };

  const setDefautBillingToCart = async addressId => {
    if (!cartIsVirtual) {
      const cartId = await Storage.get(Storage.name.CART_ID);
      await selectBillingAddressHook({
        params: {
          input: {
            cart_id: cartId,
            billing_address: {customer_address_id: addressId},
          },
        },
        paramsOpt: {isReturn: true},
      });
    }
  };

  return {setDefautShippingToCart, setDefautBillingToCart};
}
