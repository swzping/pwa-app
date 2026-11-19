import React, {useEffect,useState} from 'react';
import {Alert} from 'react-native';

import {useMutation,useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import {REVOKE_CUSTOMER_TOKEN} from '@app/_modules/account/services/schema';
import {DELETE_CUSTOMER} from '@app/_modules/account_deletion/services/schema';
import {clearOfflineQueueCookies} from '@app/_modules/account_eventbooking/services/util';
import Views from '@app/_modules/account_settings/_view';
import {USER_GUEST} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import { clearOAuthSessionFromStorage, getRevokeTokenOpts } from '@app/helpers/TokenRefresh';
import {onSessionExpired} from '@app/hooks/customer/useDataCustomer';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxAppLoading, rxAppSnackbar, rxUserInformation,rxUserToken, rxUserType} from '@app/services/cache';
import {
  GET_USER_SETTINGS,
  UPDATE_USER_SETTINGS,
} from '@app/services/queries/user';

const Settings = () => {
  if (!modules.account_settings.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const userToken = useReactiveVar(rxUserToken);
  const userType = useReactiveVar(rxUserType);
  const isLoggedIn = userToken !== null && userType !== USER_GUEST;

  const {data} = useCustomQuery({
    schema: GET_USER_SETTINGS,
    useInitData: isLoggedIn,
    opts: {fetchPolicy: 'network-only'},
  });
  const {onRefetchData: updateCustomer} = useCustomMutation({
    schema: UPDATE_USER_SETTINGS,
  });
  const {onRefetchData: onRevokeCustomerToken} = useCustomMutation({
    schema: REVOKE_CUSTOMER_TOKEN,
  });

  const [postDeleteCustomer, {data: deleteData, error: deleteError}] = useMutation(DELETE_CUSTOMER);

  const userInfo = useReactiveVar(rxUserInformation);

  useEffect(() => {
    if (data && data?.data) {
      setIsSubscribed(data?.data?.customer.is_subscribed);
      setLoading(false);
    } else if (!isLoggedIn) {
      setLoading(false);
    }
  }, [data, isLoggedIn]);

  /**
   * ---------------------------------------------------- *
   * @function onChangeSubscription
   * @summary change subscription setting
   * ---------------------------------------------------- *
   */
  const onChangeSubscription = async () => {
    setLoading(true);
    const res = await updateCustomer({
      params: {
        input: {is_subscribed: !isSubscribed},
      },
      paramsOpt: {isReturn: true},
    });

    if (res?.data && res?.data?.updateCustomer) {
      const dataSettings = res.data.updateCustomer.customer;
      setIsSubscribed(dataSettings.is_subscribed);
      setLoading(false);
      rxAppSnackbar({
        message: t('account_settings.message.updateSucceed'),
      });
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onLogOut
   * @summary clear all client and local storage
   * ---------------------------------------------------- *
   */
  const onLogOut = async () => {
    try {
      rxAppLoading(true);
      // revoke header 需要 refresh_token，需在清 OAuth 存储前读取
      const revokeOpts = await getRevokeTokenOpts();
      await clearOAuthSessionFromStorage();
      await onRevokeCustomerToken({
        params: null,
        paramsOpt: {opts: revokeOpts},
      });
      await onSessionExpired();
      await clearOfflineQueueCookies();
      rxAppLoading(false);
      rxAppSnackbar({message: t('message.sessionExpired')});
    } catch (err) {
      rxAppLoading(false);
      console.log('[err] logout-3', err);
    }
  };

  // Handle delete account success
  useEffect(() => {
    // 新接口返回 status 和 message，status 为 true 表示成功
    if (deleteData?.deleteCustomerAcount?.status) {
      const email = _.get(userInfo, 'email');
      rxAppSnackbar({
        message: deleteData?.deleteCustomerAcount?.message || `${t('account_deletion.success')} ${email} ${t('account_deletion.success1')}`,
      });
      onSessionExpired().then(() => {
        navigateTo(modules.main_home.enable, modules.main_home.name);
      });
    }
  }, [deleteData]);

  // Handle delete account error
  useEffect(() => {
    if (deleteError) {
      rxAppSnackbar({
        message: t('account_deletion.error'),
      });
    }
  }, [deleteError]);

  const onDeleteAccount = () => {
    Alert.alert(
      '',
      'Are you sure you want to permanently delete your account? By doing so, you will lose all your points, benefits & transaction history',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            // 新接口 deleteCustomerAcount 不需要参数
            postDeleteCustomer();
          },
        },
      ],
    );
  };

  const controllerProps = {
    t,
    loading,
    isSubscribed,
    onChangeSubscription,
    onLogOut,
    onDeleteAccount,
    isLoggedIn,
  };

  return <Views {...controllerProps} />;
};

export default Settings;
