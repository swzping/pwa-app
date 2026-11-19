import React, {useEffect, useRef, useState} from 'react';

import {CommonActions} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {REVOKE_CUSTOMER_TOKEN} from '@app/_modules/account/services/schema';
import Views from '@app/_modules/account_change_password/_view';
import {CHANGE_PASSWORD} from '@app/_modules/account_change_password/services/schema';
import {USER_GUEST} from '@app/helpers/Constants';
import {navigationRef,navReset} from '@app/helpers/Navigation';
// import {removeFcmToken} from '@app/services/fcmToken';
import {getRevokeTokenOpts} from '@app/helpers/TokenRefresh';
import {onSessionExpired} from '@app/hooks/customer/useDataCustomer';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {
  rxAppLoading,
  rxAppSnackbar,
  rxCartQty,
  rxProductIdCartItemIdMap,
  rxUserType,
} from '@app/services/cache';

/**
 * @component ChangePassword
 * @param {Object} props
 * @profiler {Sentry}
 * @summary Controller for update account screen
 */
const ChangePassword = props => {
  // render null on module false
  if (!modules.account_change_password.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [loading, setLoading] = useState(false);
  const successNavTimerRef = useRef(null);
  const {onRefetchData: changePasswordHook} = useCustomMutation({
    schema: CHANGE_PASSWORD,
  });
  const {onRefetchData: onRevokeCustomerToken} = useCustomMutation({
    schema: REVOKE_CUSTOMER_TOKEN,
  });

  useEffect(() => {
    return () => {
      if (successNavTimerRef.current) {
        clearTimeout(successNavTimerRef.current);
        successNavTimerRef.current = null;
      }
    };
  }, []);

  /**
   * @function changePassword
   * @param {Object} data - forms value {currentPassword, newPassword}
   * @summary function callback onSubmit event from
   * useForm to update password
   */
  const changePassword = async data => {
    try {
      setLoading(true);
      const result = await changePasswordHook({
        params: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        },
        paramsOpt: {isReturn: true},
      });

      // 统一检查错误：ApolloError 可能有 graphQLErrors、errors、networkError
      const hasError =
        (result?.graphQLErrors && result.graphQLErrors.length > 0) ||
        (result?.errors && result.errors.length > 0) ||
        result?.networkError ||
        !result?.data?.changeCustomerPasswordLr ||
        result.data?.changeCustomerPasswordLr === null;

      if (hasError) {
        setLoading(false);
        // 统一提取错误消息，按优先级：graphQLErrors > errors > networkError > message
        const errorMessage =
          result?.graphQLErrors?.[0]?.message ||
          result?.errors?.[0]?.message ||
          result?.networkError?.message ||
          result?.message ||
          'Failed to update password';
        rxAppSnackbar({
          message: errorMessage,
        });
        return;
      }

      setLoading(false);

      // 修改密码成功：先提示成功，再退出（跳转到登录页）
      rxAppSnackbar({
        message: 'Password updated successfully',
        type: 'success',
      });
      if (successNavTimerRef.current) {
        clearTimeout(successNavTimerRef.current);
      }
      successNavTimerRef.current = setTimeout(() => {
        // 使用 CommonActions.reset 强制重置导航栈，直接跳转到登录页面
        if (navigationRef?.current) {
          navigationRef.current.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: modules.auth_signin.name}],
            }),
          );
        } else {
          navReset(modules.auth_signin.name, {withDispatch: true});
        }
      }, 900);

      // 然后在后台清理数据
      try {
        rxAppLoading(true);
        try {
          const revokeOpts = await getRevokeTokenOpts();
          await onRevokeCustomerToken({
            params: null,
            paramsOpt: {opts: revokeOpts},
          });
        } catch (revokeErr) {}
        try {
          // BE requires that fcmToken cannot be removed after logging in
          // await removeFcmToken({source: 'change_password'});
        } catch (tokenErr) {}
        await onSessionExpired();
        rxCartQty(0);
        rxProductIdCartItemIdMap({});
        rxUserType(USER_GUEST);
        rxAppLoading(false);
      } catch (err) {
        rxAppLoading(false);
      }
    } catch (error) {
      setLoading(false);
      // 提取错误消息
      const errorMessage =
        error?.message ||
        error?.graphQLErrors?.[0]?.message ||
        error.toString() ||
        'Failed to update password';
      rxAppSnackbar({
        message: errorMessage,
      });
      // 密码错误时不导航，只显示错误提示
    }
  };

  const controllerProps = {
    t,
    loading,
    changePassword,
  };

  return <Views {...props} {...controllerProps} />;
};

export default ChangePassword;
