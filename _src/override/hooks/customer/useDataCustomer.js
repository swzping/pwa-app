import {useCallback, useEffect, useMemo, useRef} from 'react';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import i18next from 'i18next';

import {REVOKE_CUSTOMER_TOKEN} from '@app/_modules/account/services/schema';
import {
  BYPASS_ERROR_MESSAGE_CART_ID,
  ERROR_CANNOT_RESET_PASSWORD,
  ERROR_COULDNT_FIND_ITEM,
  ERROR_EMAIL_NOT_EXIST,
  ERROR_GUEST_CHECKOUT,
  ERROR_INACTIVE_CART,
  ERROR_INTERNAL_SERVER,
  ERROR_INVALID_ID_OR_PASSWORD,
  ERROR_INVALID_LOGIN_OR_PASSWORD,
  ERROR_MAXIMUM_PURCHASE_QTY,
  ERROR_MINIMUM_PURCHASE_QTY,
  ERROR_NO_INTERNET_CONNECTION,
  ERROR_NO_ITEM_IN_CART,
  ERROR_NOT_FOUND_ID_CART,
  ERROR_PRODUCT_NOT_AVAILABLE,
  ERROR_QTY_OOS,
  ERROR_QTY_UPDATE,
  ERROR_SESSION_EXPIRED,
  ERROR_UNAUTHORIZHED,
  ERROR_USER_HAVENT_CART,
  ERROR_USER_NOT_EXIST,
} from '@app/helpers/Constants';
import {getErrorGQL} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {onClearAllDataCart} from '@app/hooks/carts/useCarts';
import {getEmptyCart} from '@app/hooks/carts/useCarts';
import schemaHooks from '@app/hooks/customer/schema';
import useSwitchQuery from '@app/hooks/useSwitchQuery';
import {mutate} from '@app/services/api';
import {
  rxAppSnackbar,
  rxUserAddresses,
  rxUserInformation,
  rxUserRewardPoint,
  rxUserStoreCredit,
  rxUserToken,
  rxUserType,
  rxUserWIshlistItems,
} from '@app/services/cache';
import {clearCdpUser} from '@app/track/cdpUser';

export const TYPES = {
  USER_STORE_CREDIT: 'USER_STORE_CREDIT',
  USER_REWARD_POINT: 'USER_REWARD_POINT',
  USER_CUSTOMER_ADDRESS_SIMPLE: 'USER_CUSTOMER_ADDRESS_SIMPLE',
};

/**
 * ---------------------------------------------------- *
 * @const {onClearAllDataUser}
 * @summary clear data user login
 * ---------------------------------------------------- *
 */

export const onClearAllDataUser = () => {
  rxUserInformation(null);
  rxUserType(null);
  rxUserToken(null);
  rxUserStoreCredit(null);
  rxUserRewardPoint(null);
  rxUserWIshlistItems(null);
  rxUserAddresses(null);
};

/**
 * ---------------------------------------------------- *
 * @const {onFullLogOut}
 * @summary 与 Settings 退出登录一致的方式：
 *  1) 清本地 OAuth 会话
 *  2) 调后端 revokeCustomerToken（token 失效，账号不存在时可能失败，容错忽略）
 *  3) 清购物车/用户数据/Storage/CDP
 * ---------------------------------------------------- *
 */
export const onFullLogOut = async () => {
  try {
    const {clearOAuthSessionFromStorage} = require('@app/helpers/TokenRefresh');
    await clearOAuthSessionFromStorage();
  } catch (err) {
    console.log('[err] clear oauth session', err);
  }
  try {
    await mutate(REVOKE_CUSTOMER_TOKEN);
  } catch (err) {
    console.log('[err] revoke customer token', err);
  }
  await onSessionExpired();
};

/**
 * ---------------------------------------------------- *
 * @const {onLogOut}
 * @summary for error session expired, clear data user login & cart
 * ---------------------------------------------------- *
 */
export const onSessionExpired = async () => {
  try {
    console.log('token -- > [i] session expired');
    onClearAllDataCart();
    onClearAllDataUser();
    await Storage.clear();
    await getEmptyCart();
    await clearCdpUser();
  } catch (err) {
    console.log('[err] logout', err);
  }
};

/**
 * ---------------------------------------------------- *
 * @const {handleError}
 * @summary handle error on cart from error BE response
 * @returns {boolean} true 表示展示已由本函数或调用方的定制路径接管，false 表示没人处理
 * ---------------------------------------------------- *
 */
export const onHandleError = (err, configErr = null) => {
  // show console
  if (configErr && configErr.log) {
    console.log('[err] on handler error', configErr, err);
  }
  // no configErr or bypass false
  if (!configErr || (configErr && !configErr.isBypass)) {
    let isBypassMessage = false;
    // let snackbarMessage = i18next.t('message.somethingWrong');
    let snackbarMessage = '';
    const {message, isError} = getErrorGQL(err);
    if (err.message && err.message.includes(ERROR_NO_INTERNET_CONNECTION)) {
      snackbarMessage = i18next.t('message.noInternetConnection');
    } else if (err.message && err.message.includes(ERROR_QTY_UPDATE)) {
      snackbarMessage = i18next.t('message.errorQtyUpdated');
    } else if (err.message && err.message.includes(ERROR_QTY_OOS)) {
      snackbarMessage = i18next.t('message.errorQtyUpdated');
    } else if (
      err.message &&
      err.message.includes(ERROR_PRODUCT_NOT_AVAILABLE)
    ) {
      snackbarMessage = i18next.t('message.productNotAvailable');
    } else if (
      err.message &&
      (err.message.includes(ERROR_MINIMUM_PURCHASE_QTY) ||
        err.message.includes(ERROR_MAXIMUM_PURCHASE_QTY))
    ) {
      snackbarMessage = err.message;
    } else if (
      err.message.includes(ERROR_INVALID_ID_OR_PASSWORD) ||
      err.message.includes(ERROR_USER_NOT_EXIST) ||
      err.message.includes(ERROR_INVALID_LOGIN_OR_PASSWORD)
    ) {
      isBypassMessage = true;
    } else if (isError) {
      if (
        message.includes(ERROR_SESSION_EXPIRED) ||
        message.includes(ERROR_UNAUTHORIZHED)
      ) {
        onSessionExpired();
        navigateTo(modules.account.enable, modules.account.name);
        snackbarMessage = i18next.t('message.sessionExpired');
      } else if (
        message.includes(ERROR_USER_HAVENT_CART) ||
        message.includes(ERROR_INACTIVE_CART) ||
        message.includes(ERROR_NO_ITEM_IN_CART) ||
        message.includes(ERROR_NOT_FOUND_ID_CART)
      ) {
        onClearAllDataCart();
        getEmptyCart();
        snackbarMessage = i18next.t('message.resetCart');
      } else if (message.includes(ERROR_COULDNT_FIND_ITEM)) {
        onClearAllDataCart();
        snackbarMessage = i18next.t('message.couldntFindItem');
      } else if (message.includes(ERROR_QTY_UPDATE)) {
        snackbarMessage = i18next.t('message.errorQtyUpdated');
      } else if (message.includes(ERROR_GUEST_CHECKOUT)) {
        snackbarMessage = i18next.t('message.guestCheckout');
      } else if (message.includes(ERROR_INTERNAL_SERVER)) {
        console.log('[e] internal server error', getErrorGQL(err));
        snackbarMessage = i18next.t('message.internalServerError');
        isBypassMessage = true;
      } else if (message.includes(ERROR_PRODUCT_NOT_AVAILABLE)) {
        snackbarMessage = i18next.t('message.productNotAvailable');
      } else if (message.includes(BYPASS_ERROR_MESSAGE_CART_ID)) {
        isBypassMessage = true;
      } else if (
        message.includes(ERROR_EMAIL_NOT_EXIST) ||
        message.includes(ERROR_CANNOT_RESET_PASSWORD)
      ) {
        isBypassMessage = true;
      }
    }

    if (isBypassMessage) {
      // 调用方自己接管展示（登录内联提示、内部错误日志等），不要重复提示
      return true;
    }
    if (snackbarMessage !== '') {
      rxAppSnackbar({
        message: snackbarMessage,
      });
      return true;
    }
  }
  // 调用方显式传 isBypass（如登录页用页面内 alert 接管错误）时同样算“已处理”，
  // 否则调用方的兜底提示会违背它自己的静默意图
  if (configErr && configErr.isBypass) {
    return true;
  }
  // 没匹配到任何已知文案 —— 返回 false 让调用方用服务端原文兜底，
  // 否则错误会被静默吞掉（用户点了没反应）
  return false;
};

const useDataCustomer = ({initialized = false, type, configErr = null}) => {
  const {GET_USER_STORE_CREDIT, GET_USER_REWARD_POINT} = schemaHooks();
  const getRxUserStoreCredit = useReactiveVar(rxUserStoreCredit);
  const getRxUserRewardPoint = useReactiveVar(rxUserRewardPoint);
  const mount = useRef();

  const {
    data: fromNetwork,
    error,
    loading,
    queryVariables,
    onRefetchData: fetchItems,
    setSchemas,
    setQueryVariables,
  } = useSwitchQuery({
    initialized,
    withVariables: false,
    configErr,
  });

  const getSchemaByType = useCallback(() => {
    switch (type) {
      case TYPES.USER_STORE_CREDIT:
        return GET_USER_STORE_CREDIT;
      case TYPES.USER_REWARD_POINT:
        return GET_USER_REWARD_POINT;
      default:
        return null;
    }
  }, []);

  const schemaType = getSchemaByType();

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for intialize query
   * @summary for initialize schema
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount) {
      mount.current = true;
      if (mount.current) {
        setQueryVariables(null);
        setSchemas(schemaType);

        if (initialized) {
          setDataResponse();
        }
      }
    }

    return () => (mount.current = false);
  }, []);

  /**
   * ---------------------------------------------------- *
   * @const {data}
   * @summary useMemo to filter spesific data
   * ---------------------------------------------------- *
   */
  const data = useMemo(() => {
    switch (type) {
      case TYPES.USER_STORE_CREDIT:
        return getRxUserStoreCredit;
      case TYPES.USER_REWARD_POINT:
        return getRxUserRewardPoint;
    }
  }, [type, getRxUserStoreCredit, getRxUserRewardPoint, fromNetwork]);

  /**
   * ---------------------------------------------------- *
   * @function setCart
   * @param {params} object
   * @summary for set spesific data cart
   * ---------------------------------------------------- *
   */
  const setDataResponse = async params => {
    if (params) {
      switch (type) {
        case TYPES.USER_REWARD_POINT:
          const dataRewardPoint = _.get(params, 'customerRewardPoints');
          if (dataRewardPoint) {
            rxUserRewardPoint(dataRewardPoint);
          }
          break;
        case TYPES.USER_STORE_CREDIT:
          const dataStoreCredit = _.get(params, 'customer.store_credit');
          if (dataStoreCredit) {
            rxUserStoreCredit(dataStoreCredit);
          }
          break;
      }
    } else {
      await fetchItems({params: queryVariables, schemaParam: schemaType});
    }
  };

  useEffect(() => {
    const response = _.get(fromNetwork, 'data');
    if (mount.current && response) {
      setDataResponse(response);
    }
  }, [fromNetwork, type]);

  return {
    data,
    error,
    loading,
    setDataResponse,
  };
};

export default useDataCustomer;
