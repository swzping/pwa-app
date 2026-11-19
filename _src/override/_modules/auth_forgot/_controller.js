import React, {useState, useEffect} from 'react';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useTranslation} from 'react-i18next';
import {FORGOT_PASSWORD} from '@app/_modules/auth_forgot/services/schema';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import {
  ERROR_UNFILLED_FORM,
  TYPE_FAILED,
  ERROR_EMAIL_NOT_EXIST,
  ERROR_CANNOT_RESET_PASSWORD,
  ERROR_MAX_RESET_ATTEMPTS,
} from '@app/helpers/Constants';
import {useGoogleReCaptcha} from '@app/hooks/useGoogleReCaptcha';

import Views from '@app/_modules/auth_forgot/_view';

const AuthForgotController = ({route}) => {
  if (!modules.auth_signin.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const {generateReCaptchaData, renderRecaptchaBridge} = useGoogleReCaptcha({
    currentForm: 'CUSTOMER_FORGOT_PASSWORD',
    formAction: 'forgotPassword',
  });
  const {onRefetchData: onPostForgot} = useCustomMutation({
    schema: FORGOT_PASSWORD,
    // 忘记密码页面自己用顶部 Alert 展示错误/提示，避免全局 ErrorHandler 再弹一次 toast
    configErr: {isBypass: true},
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [requestEmail, setRequestEmail] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (route) {
      setAlert(route?.params?.alert);
      if(route?.params?.email) {
        setEmail(route.params.email);
        setRequestEmail(true);
      }
    }
  }, [route]);

  // Alert 自动消失（3 秒后清除）
  useEffect(() => {
    if (alert && alert.message) {
      const timer = setTimeout(() => {
        setAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  /**
   * ---------------------------------------------------- *
   * @function onSubmit
   * @summary on event request to server
   * ---------------------------------------------------- *
   */
  const onSubmit = async data => {
    setAlert(false);
    setLoading(true);
    const variables = {
      email: data.email,
    };
    let recaptchaData = {};
    try {
      recaptchaData = await Promise.race([
        generateReCaptchaData(),
        new Promise(resolve =>
          setTimeout(() => {
            resolve({});
          }, 2000),
        ),
      ]);
    } catch (error) {
      recaptchaData = {};
    }
    try {
      const res = await onPostForgot({
        params: variables,
        paramsOpt: {
          isReturn: true,
          opts: {
            ...recaptchaData,
          },
        },
      });

      const message = res?.message;
      const requestPasswordResetEmail = res.data?.requestPasswordResetEmail;
      if (message) {
        const ERROR_LIST = [
          ERROR_EMAIL_NOT_EXIST,
          ERROR_CANNOT_RESET_PASSWORD,
          ERROR_MAX_RESET_ATTEMPTS,
        ];
        if (
          ERROR_LIST.some(item => message.includes(item)) ||
          (message && !requestPasswordResetEmail)
        ) {
          throw message;
        }
      }

      if (requestPasswordResetEmail) {
        setRequestEmail(requestPasswordResetEmail);
        setEmail(data.email);
      }
      setLoading(false);
    } catch (err) {
      setAlert({type: TYPE_FAILED, message: err.toString()});
      setLoading(false);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onErrorSubmit
   * @summary on event for error in forms
   * ---------------------------------------------------- *
   */
  const onErrorSubmit = () => {
    setAlert({type: TYPE_FAILED, message: ERROR_UNFILLED_FORM});
  };

  /**
   * ---------------------------------------------------- *
   * @function {onNavigateToCart}
   * @summary for navigate to cart page
   * ---------------------------------------------------- *
   */
  const onNavigateToCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  /**
   * ---------------------------------------------------- *
   * @constant {controllerProps}
   * @summary set controller props
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    t,
    loading,
    alert,
    email,
    requestEmail,
    onNavigateToCart,
    onSignin: onSubmit,
    onError: onErrorSubmit,
    renderRecaptchaBridge,
  };

  return <Views {...controllerProps} />;
};

export default AuthForgotController;
