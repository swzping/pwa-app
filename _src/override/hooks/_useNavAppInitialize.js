import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';

import DeviceInfo from 'react-native-device-info';

import {useReactiveVar} from '@apollo/client';
import crashlytics from '@react-native-firebase/crashlytics';

import {
  BYPASS_ERROR_APP_INITIAL_CUSTOMER,
  USER_CUSTOMER,
  USER_GUEST,
  // BYPASS_ERROR_APP_INITIAL_CART_ITEM,
  // BYPASS_ERROR_APP_INITIAL_CART_PRICE,
} from '@app/helpers/Constants';
import {Storage} from '@app/helpers/Storage';
import {warmProductCartItemMap} from '@app/hooks/carts/useCarts';
import useDataCustomer, {
  TYPES as TYPES_CUSTOMER,
} from '@app/hooks/customer/useDataCustomer';
import {useCartId} from '@app/hooks/useCartId';
// import {useRefetchCart} from '@app/hooks/useRefetchCart';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import {useRefetchWishlist} from '@app/hooks/useRefetchWishlist';
import {rxUserToken, rxUserType} from '@app/services/cache';
import {updateFcmToken} from '@app/services/fcmToken';

const useNavAppInitialize = (source = 'no-source') => {
  // const {refetch: onFetchUserCart} = useRefetchCart();
  const {refetch: onFetchAddress} = useRefetchAddress(true);
  const {refetch: onFetchWishlist} = useRefetchWishlist();
  useDataCustomer({
    initialized: true,
    type: TYPES_CUSTOMER.USER_REWARD_POINT,
    configErr: {
      logSource: BYPASS_ERROR_APP_INITIAL_CUSTOMER,
      isBypass: true,
    },
  });
  const {getStoredCartId} = useCartId('useNavAppInitialize ' + source);
  const userType = useReactiveVar(rxUserType);
  const mount = useRef();

  // const {setCart: getItems} = useCarts({
  //   initialized: true,
  //   type: TYPES.ITEM,
  //   configErr: {
  //     logSource: BYPASS_ERROR_APP_INITIAL_CART_ITEM,
  //     isBypass: true,
  //   },
  // });
  // const {setCart: getPrices} = useCarts({
  //   initialized: true,
  //   type: TYPES.PRICE,
  //   configErr: {
  //     logSource: BYPASS_ERROR_APP_INITIAL_CART_PRICE,
  //     isBypass: true,
  //   },
  // });
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
        // cart_id 恢复后立即预热数量映射表，使搜索页/深链等非首页入口进 PDP 时
        // 也能正确显示已在购物车商品的数量步进器（而非 "Add to cart"）。
        warmProductCartItemMap();
        // 登出时 rxUserType 可能经 Storage 异步竞态短暂回读为 CUSTOMER，
        // 此时 token 已清空；守卫避免 GET_USER_DATA/GET_USER_WISHLIST 以游客身份
        // 重复请求并 401 触发 signOut 循环（登录流程先设 rxUserToken 再设 rxUserType，不受影响）
        if (userType === USER_CUSTOMER && rxUserToken()) {
          // getItems();
          // getPrices();
          // onFetchUserCart();
          onFetchAddress();
          onFetchWishlist();
        }
      } else {
        const userTypeSaved = await Storage.get(Storage.name.USER_TYPE);
        if (userTypeSaved) {
          rxUserType(userTypeSaved);
        } else {
          Storage.set(Storage.name.USER_TYPE, USER_GUEST);
          rxUserType(USER_GUEST);
        }
      }
    };
    handleUserType();
  }, [userType]);

  useEffect(() => {
    updateFcmToken({source: 'app_initialize'}).catch(err =>
      console.log('[fcm-token] app initialize update error', err),
    );
  }, []);

  /**
   * ---------------------------------------------------- * @function {lifecycle}
   * @summary app 回到前台时重跑一次数量映射表预热。app 读购物车走的是启动时的
   * 快照，在 web/其它端加购后切回 app不会自动同步；监听 AppState 回前台刷新，
   * 使当前 PDP/列表底部的加购按钮随 rxProductIdCartItemIdMap（响应式）更新为最新数量。
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        warmProductCartItemMap();
      }
    });
    return () => subscription?.remove();
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function {lifecycle}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;

    // 使用异步方法获取设备唯一 ID
    DeviceInfo.getUniqueId()
      .then(uniqueId => {
        crashlytics().setUserId(uniqueId);
      })
      .catch(error => {
        console.log('[crashlytics] Failed to set user ID:', error);
      });

    return () => (mount.current = false);
  }, []);

  return null;
};

export default useNavAppInitialize;
