import {Alert} from 'react-native';

import crashlytics from '@react-native-firebase/crashlytics';

import _ from 'lodash';
import i18next from 'i18next';

import {CART_ID, USER_CUSTOMER} from '@app/helpers/Constants';
import {Storage} from '@app/helpers/Storage';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {rxCartId} from '@app/services/cache';
import {CREATE_EMPTY_CART, MERGE_CARTS} from '@app/services/queries/cart';

export function useCartId(source = 'no source') {
  const {onRefetchData: createEmptyCart} = useCustomMutation({
    schema: CREATE_EMPTY_CART,
  });
  const {onRefetchData: mergeCarts} = useCustomMutation({schema: MERGE_CARTS});

  const getEmptyCart = async (userType, retryCounter = 0) => {
    try {
      const res = await createEmptyCart({paramsOpt: {isReturn: true}});

      if (typeof res?.data?.createEmptyCart !== 'string') {
        console.log('[err] useCartId source', source);
        throw new Error('Cart ID invalid type');
      }
      crashlytics().setAttribute(CART_ID, _.get(res, 'data.createEmptyCart'));
      await Storage.set(Storage.name.CART_ID, res.data.createEmptyCart);

      if (userType === USER_CUSTOMER) {
        const guestCartId = await Storage.get(Storage.name.CART_ID_GUEST);
        if (guestCartId && false) {
          await Storage.set(Storage.name.CART_ID_GUEST, null);
          // TODO: remove guest cart merge logic
          // await mergeCarts({
          //   params: {
          //     source_cart_id: guestCartId,
          //     destination_cart_id: res.data.createEmptyCart,
          //   },
          // });
        }
      } else {
        await Storage.set(Storage.name.CART_ID_GUEST, res.data.createEmptyCart);
      }

      rxCartId(res.data.createEmptyCart);

      return res.data.createEmptyCart;
    } catch (err) {
      console.log('[err] use cart id', err);
      Alert.alert(
        i18next.t('cart.updating'),
        i18next.t('cart.productIsUpdating'),
        [
          {
            text: retryCounter < 2 ? 'Retry' : 'OK',
            onPress: () => {
              if (retryCounter < 2) {
                getEmptyCart(userType, retryCounter + 1);
              }
            },
          },
        ],
        {cancelable: false},
      );
    }
  };

  const getStoredCartId = async () => {
    const cartId = await Storage.get(Storage.name.CART_ID);
    const userType = await Storage.get(Storage.name.USER_TYPE);

    if (!cartId) {
      await getEmptyCart(userType);
    } else {
      await crashlytics().setAttribute(CART_ID, cartId);
      rxCartId(cartId);
    }
  };

  return {getStoredCartId, getEmptyCart};
}
