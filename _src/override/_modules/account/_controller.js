import React, {useEffect, useRef, useState} from 'react';

import {useIsFocused} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account/_view';
import {
  REGISTER_MEDICAL_TEST,
  REVOKE_CUSTOMER_TOKEN,
} from '@app/_modules/account/services/schema';
import {clearExpiredOfflineQueueCookies} from '@app/_modules/account_eventbooking/services/util';
import {USER_GUEST} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import {getRevokeTokenOpts} from '@app/helpers/TokenRefresh';
import {onSessionExpired} from '@app/hooks/customer/useDataCustomer';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {
  rxAppLoading,
  rxAppSnackbar,
  rxCartQty,
  rxProductIdCartItemIdMap,
  rxUserInformation,
  rxUserRewardPoint,
  rxUserStoreCredit,
  rxUserToken,
  rxUserType,
  rxUserWIshlistItems,
} from '@app/services/cache';
import {removeFcmToken} from '@app/services/fcmToken';

const Account = ({navigation}) => {
  if (!modules.account.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @summary collections constant for
   * this contorller
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  const accountTraceRef = useRef(null);
  const loyaltyCardRef = useRef(null);
  const [loadingRegisterMedical, setLoadingRegisterMedical] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const userData = useReactiveVar(rxUserInformation);
  const userToken = useReactiveVar(rxUserToken);
  const userType = useReactiveVar(rxUserType);
  const userStoreCredit = useReactiveVar(rxUserStoreCredit);
  const userWishlist = useReactiveVar(rxUserWIshlistItems);
  const getRxUserRewardPoint = useReactiveVar(rxUserRewardPoint);
  const {refetch} = useRefetchAddress();
  const {onRefetchData: onRevokeCustomerToken} = useCustomMutation({
    schema: REVOKE_CUSTOMER_TOKEN,
  });

  const {onRefetchData: onSetRegisterMedical} = useCustomMutation({
    schema: REGISTER_MEDICAL_TEST,
  });

  // 注册状态不再依赖后端 customer.is_register_test 字段（该字段已从 schema 移除），
  // 改用本地状态：默认未注册，注册成功后置为已注册。
  const [isRegisterTest, setIsRegisterTest] = useState(false);

  const {storeConfig} = useStoreConfig({useInitData: true});

  useEffect(() => {
    const startAccountTrace = async () => {
      const startTime = Date.now();
      accountTraceRef.current = await startPerfTrace('myAccountPageInit');
      accountTraceRef.current.startTime = startTime;
      requestAnimationFrame(() => {
        if (accountTraceRef.current) {
          const duration = Date.now() - accountTraceRef.current.startTime;
          accountTraceRef.current.putMetric('duration_ms', duration);
          accountTraceRef.current.putAttribute('status', 'success');
          accountTraceRef.current.stop();
          accountTraceRef.current = null;
        }
      });
    };
    startAccountTrace();
    return () => {
      if (accountTraceRef.current) {
        accountTraceRef.current.stop();
        accountTraceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isFocused) {
      // 回到 MyAccount 页面时，过期后清除 offline Waiting Room 队列 Cookie
      clearExpiredOfflineQueueCookies();
    }
  }, [isFocused]);
  /**
   * ---------------------------------------------------- *
   * @function onLogOut
   * @summary clear all client and local storage
   * ---------------------------------------------------- *
   */
  const onLogOut = async () => {
    try {
      rxAppLoading(true);
      try {
        const revokeOpts = await getRevokeTokenOpts();
        await onRevokeCustomerToken({
          params: null,
          paramsOpt: {opts: revokeOpts},
        });
      } catch (revokeErr) {
        console.log('[logout] revoke token error', revokeErr);
      }
      try {
        await removeFcmToken({source: 'logout'});
      } catch (tokenErr) {
        console.log('[fcm-token] logout remove error', tokenErr);
      }
      await onSessionExpired();
      rxCartQty(0);
      rxProductIdCartItemIdMap({});
      // is_register_test 已改为本地状态，登出时显式重置，避免切换账号后残留上一用户的“已注册”状态
      setIsRegisterTest(false);
      rxUserType(USER_GUEST);
      rxAppLoading(false);
      rxAppSnackbar({message: t('message.sessionExpired')});
    } catch (err) {
      rxAppLoading(false);
      console.log('[err] logout-1', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loyaltyCardRef?.current?.refresh();
    await refetch();
    setRefreshing(false);
  };

  /**
   * ---------------------------------------------------- *
   * @function onEditProfile
   * @summary navigate to edit profile
   * ---------------------------------------------------- *
   */
  const onEditProfile = () => {
    // 如果未登录，跳转到登录页面
    if (userToken === null || userType === USER_GUEST) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
        fromAccount: true, // 标识从 account 页面进入
      });
      return;
    }
    navigateTo(
      modules.account_update_information.enable,
      modules.account_update_information.name,
      {accountInformationData: userData},
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateMenuPage
   * @param {object} item
   * @summary on navigate to each menu page
   * ---------------------------------------------------- *
   */
  const onNavigateMenuPage = item => {
    // Customer Care、FAQ 不需要登录即可进入
    const noLoginRequired =
      item?.label === 'customerCare' || item?.label === 'faq';
    if (!noLoginRequired && (userToken === null || userType === USER_GUEST)) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
        fromAccount: true, // 标识从 account 页面进入
      });
      return;
    }
    navigateTo(item.enable, item.moduleName);
  };
  /**
   * ---------------------------------------------------- *
   * @function onPressWishlist
   * @summary on navigate to wishlist Page
   * ---------------------------------------------------- *
   */
  const onPressWishlist = () => {
    // 如果未登录，跳转到登录页面
    if (userToken === null || userType === USER_GUEST) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
        fromAccount: true, // 标识从 account 页面进入
      });
      return;
    }
    navigateTo(modules.account_wishlist.enable, modules.account_wishlist.name);
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToMedicalTest
   * @summary on navigate to medical test Page
   * ---------------------------------------------------- *
   */
  const onNavigateToMedicalTest = params => {
    navigateTo(
      modules.account_medical_test.enable,
      modules.account_medical_test.name,
      params,
    );
  };

  const onRegisterMedicalTest = async () => {
    setLoadingRegisterMedical(true);
    try {
      const res = await onSetRegisterMedical({paramsOpt: {isReturn: true}});
      if (res?.data?.setIsRegisterTest?.message === 'SUCCESS') {
        setIsRegisterTest(true);
        onNavigateToMedicalTest({isSuccessRegister: true});
      }
      setLoadingRegisterMedical(false);
    } catch (error) {
      console.log('[err onRegisterMedicalTest]', error);
      setLoadingRegisterMedical(false);
      if (error?.message) {
        rxAppSnackbar({message: error?.message});
      }
    }
  };

  const onGoCheckIt = () => {
    navigateTo(
      modules.account_eventbooking.enable,
      modules.account_eventbooking.name,
    );
  };

  const noLoginGoCheckIt = () => {
    navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
      redirectRoute: {
        name: modules.account_eventbooking.name,
        params: {},
      },
    });
  };

  // 不再在未登录时跳转到登录页面，而是显示 account 页面（LoyaltyCard 会处理未登录状态的显示）
  const controllerProps = {
    t,
    navigation,
    userData,
    userStoreCredit,
    userWishlist,
    userRewardPoint: getRxUserRewardPoint,
    onLogOut,
    onEditProfile,
    onNavigateMenuPage,
    onPressWishlist,
    isRegisterTest,
    onNavigateToMedicalTest,
    onRefresh,
    refreshing,
    loadingRegisterMedical,
    onRegisterMedicalTest,
    userToken,
    userType,
    loyaltyCardRef,
    onGoCheckIt,
    noLoginGoCheckIt,
    storeConfig,
  };

  return <Views {...controllerProps} />;
};

export default Account;
