import {useReactiveVar} from '@apollo/client';
import {Storage} from '@app/helpers/Storage';
import {
  SET_BILLING_ADDRESS,
  SET_SHIPPING_ADDRESS,
} from '@app/_modules/cart/services/schema';
import {
  rxCartIsVirtual,
  rxUserDefaultShippingAddressId,
} from '@app/services/cache';
import useCustomMutation from '@app/hooks/useCustomMutation';
// import {useRefetchCart} from '@app/hooks/useRefetchCart';
import {
  BYPASS_ERROR_SELECT_SHIPPING_ADDRESS_SHIPPING,
  BYPASS_ERROR_SELECT_SHIPPING_ADDRESS_BILLING,
} from '@app/helpers/Constants';

export function useSelectShippingAddress() {
  const cartIsVirtual = useReactiveVar(rxCartIsVirtual);
  // const {refetch: refetchCart} = useRefetchCart();
  const {
    onRefetchData: selectShippingAddressHook,
    loading: loadingSetShipping,
  } = useCustomMutation({
    schema: SET_SHIPPING_ADDRESS,
    configErr: {
      logSource: BYPASS_ERROR_SELECT_SHIPPING_ADDRESS_SHIPPING,
      isBypass: true,
    },
  });
  const {onRefetchData: selectBillingAddressHook, loading: loadingSetBilling} =
    useCustomMutation({
      schema: SET_BILLING_ADDRESS,
      configErr: {
        logSource: BYPASS_ERROR_SELECT_SHIPPING_ADDRESS_BILLING,
        isBypass: true,
      },
    });

  const setDefautShippingToCart = async addressId => {
    if (!cartIsVirtual) {
      const cartId = await Storage.get(Storage.name.CART_ID);
      const gqlReturn = await selectShippingAddressHook({
        paramsOpt: {isReturn: true},
        params: {
          input_shipping: {
            cart_id: cartId,
            shipping_addresses: [{customer_address_id: addressId}],
          },
          input_billing: {
            cart_id: cartId,
            billing_address: {customer_address_id: addressId},
          },
        },
      });

      if (gqlReturn) {
        if (gqlReturn?.data?.setShippingAddressesOnCart) {
          rxUserDefaultShippingAddressId(addressId);
          // refetchCart(gqlReturn?.data?.setShippingAddressesOnCart);
        }
        return gqlReturn;
      }
    }
  };

  const setDefautBillingToCart = async addressId => {
    if (!cartIsVirtual) {
      const cartId = await Storage.get(Storage.name.CART_ID);
      await selectBillingAddressHook({
        paramsOpt: {isReturn: true},
        params: {
          input: {
            cart_id: cartId,
            billing_address: {customer_address_id: addressId},
          },
        },
      });
    }
  };

  return {
    loadingSetShipping,
    loadingSetBilling,
    setDefautShippingToCart,
    setDefautBillingToCart,
  };
}
