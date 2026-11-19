import {useEffect, useRef} from 'react';
import {useReactiveVar} from '@apollo/client';
import {rxUserType, rxCartId} from '@app/services/cache';
import {useCartId} from '@app/hooks/useCartId';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import {useRefetchWishlist} from '@app/hooks/useRefetchWishlist';
import {USER_GUEST, USER_CUSTOMER} from '@app/helpers/Constants';
import {Storage} from '@app/helpers/Storage';
import crashlytics from '@react-native-firebase/crashlytics';
import DeviceInfo from 'react-native-device-info';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';

const useNavAppInitialize = () => {
  const {refetch: onFetchAddress} = useRefetchAddress();
  const {refetch: onFetchWishlist} = useRefetchWishlist();
  const {getStoredCartId} = useCartId();
  const userType = useReactiveVar(rxUserType);
  const getRxCartId = useReactiveVar(rxCartId);
  const mount = useRef();

  const {setCart: getItems} = useCarts({
    initialized: true,
    type: TYPES.ITEM,
  });
  const {setCart: getPrices} = useCarts({
    initialized: true,
    type: TYPES.PRICE,
  });
  /**
   * ---------------------------------------------------- *
   * @function {lifecycle hooks}
   * @summary handling from hooks userType
   * store cart id from local to client
   * when customer fetch data customer
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const handleUserType = async () => {
      if (userType) {
        await getStoredCartId();
        if (userType === USER_CUSTOMER) {
          onFetchAddress();
          onFetchWishlist();
        }
      } else {
        Storage.set(Storage.name.USER_TYPE, USER_GUEST);
        rxUserType(USER_GUEST);
      }
    };

    handleUserType();
  }, [userType]);

  /**
   * ---------------------------------------------------- *
   * @function {lifecycle hooks}
   * @summary handling from hooks getRxCartId
   * when get cart id from server call API get items & prices
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const handleCartId = async () => {
      if (getRxCartId) {
        getItems();
        getPrices();
      }
    };

    handleCartId();
  }, [getRxCartId]);

  /**
   * ---------------------------------------------------- *
   * @function {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    crashlytics().setUserId(DeviceInfo.getUniqueId());
    return () => (mount.current = false);
  }, []);

  return null;
};

export default useNavAppInitialize;
