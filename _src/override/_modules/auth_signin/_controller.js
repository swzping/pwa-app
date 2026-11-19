import React, {useEffect, useRef, useState} from 'react';

import {useTheme} from 'react-native-paper';

import {useNavigation} from '@react-navigation/native';

import crashlytics from '@react-native-firebase/crashlytics';
import {modules, tabsApp} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/auth_signin/_view';
import {FormTypeMap} from '@app/_modules/auth_signin/_view';
import {
  ADD_PHONE_PASSWORD,
  BIND_PHONE_NUMBER,
  LOGIN,
  LOGIN_BY_PHONE_AND_PASSWORD,
  PHONE_NUMBER_CHECK,
  REQUEST_FORGOT_PASSWORD_OTP,
  REQUEST_PHONE_OTP,
  REQUEST_RESET_PASSWORD,
  VERIFY_FORGOT_PASSWORD_OTP,
  VERIFY_PHONE_OTP,
} from '@app/_modules/auth_signin/services/schema';
import {REFRESH_ACCESS_TOKEN} from '@app/_modules/auth_signup/services/schema';
import {_onFormHandleSetErrorRef} from '@app/components/_Forms/index';
import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {
  BEARER,
  EMAIL,
  ERROR_UNFILLED_FORM,
  TYPE_BLOCK,
  TYPE_FAILED,
  TYPE_PAGE,
  TYPE_SUCCESS,
  USER_CUSTOMER,
  USER_TYPE,
} from '@app/helpers/Constants';
import {navigateTo, navReset, stackReset} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {getAccessToken, persistOAuthBundle} from '@app/helpers/TokenRefresh';
import {useCartId} from '@app/hooks/useCartId';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useGoogleReCaptcha} from '@app/hooks/useGoogleReCaptcha';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {rxUserToken, rxUserType} from '@app/services/cache';
import {rxAppLoading} from '@app/services/cache';
import {insertAppToken} from '@app/services/fcmToken';
import {syncCdpMemberId} from '@app/track/cdpUser';

const infoSection = [
  {label: 'Tentang Kami', type: TYPE_PAGE, identifier: 'guardian-about-us'},
  {label: 'Cara Berbelanja'},
  {label: 'Karir', url: 'https://www.hero.co.id/'},
  {label: 'Rilis Pers'},
  {label: 'Pertanyaan Umum', type: TYPE_BLOCK, identifier: 'faq'},
  {label: 'Hubungi Kami'},
];
const rulesSection = [
  {label: 'Kebijakan Privasi', type: TYPE_PAGE, identifier: 'privacy-policy'},
  {
    label: 'Syarat & Ketentuan',
    type: TYPE_PAGE,
    identifier: 'terms-conditions',
  },
  {
    label: 'Kebijakan Retur & Refund',
    type: TYPE_PAGE,
    identifier: 'return-refund',
  },
  {label: 'Pembatasan Tanggung Jawab'},
  {
    label: 'Pengungkapan yang Bertanggung Jawab',
    type: TYPE_PAGE,
    identifier: 'return-replace-refund',
  },
];
const followUsSection = [
  {type: 'instagram', icon: 'instagram', url: null},
  {type: 'facebook', icon: 'facebook-f', url: null},
  {type: 'twitter', icon: 'twitter', url: null},
  {type: 'youtube', icon: 'youtube', url: null},
  {type: 'tiktok', icon: 'tiktok', url: null},
];

const decodeJwtPayload = token => {
  const parts = token.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT');
  }

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  );
  const json = atob(paddedBase64);

  return JSON.parse(json);
};

const AuthSigninController = props => {
  if (!modules.auth_signin.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const navigation = useNavigation();

  // 登录成功后，根据redirectRoute跳转到指定页面, 否则跳转到 tabsApp
  const navigateAfterSignin = () => {
    // 内嵌登录（如未登录点购物车 tab 时的内嵌登录页）：
    // 登录成功后不做任何导航，宿主页面随 rxUserType 变化自动切回原页面内容
    if (params?.stayAfterSignin) {
      return;
    }
    if (params?.redirectRoute?.name) {
      stackReset([
        {key: tabsApp.name, name: tabsApp.name},
        {
          key: params.redirectRoute.name,
          name: params.redirectRoute.name,
          params: params.redirectRoute.params || {},
        },
      ]);
    } else {
      navReset(tabsApp.name);
    }
  };

  const {
    generateReCaptchaData,
    generateReCaptchaDataSafely,
    renderRecaptchaBridge,
  } = useGoogleReCaptcha({
    currentForm: 'CUSTOMER_LOGIN',
    formAction: 'signIn',
  });

  // 忘记密码 OTP 流程 reCAPTCHA：requestForgotPasswordOtp（formAction 与 pwa-guardian 保持一致）
  const {
    generateReCaptchaDataSafely: generateForgotPasswordOtpReCaptchaDataSafely,
    renderRecaptchaBridge: renderForgotPasswordRecaptchaBridge,
  } = useGoogleReCaptcha({
    currentForm: 'CUSTOMER_FORGOT_PASSWORD',
    formAction: 'forgotPasswordOtp',
  });
  const {onRefetchData: onPostSignin} = useCustomMutation({
    schema: LOGIN,
    configErr: {isBypass: true}, // 禁用全局 toast，使用页面顶部的 alert 显示错误
  });
  const {onRefetchData: requestPhoneOTP} = useCustomMutation({
    schema: REQUEST_PHONE_OTP,
  });
  const {onRefetchData: phoneNumberCheck} = useCustomMutation({
    schema: PHONE_NUMBER_CHECK,
    // configErr: {isBypass: true}, // 禁用全局 toast，使用页面顶部的 alert 显示错误
  });
  const {onRefetchData: verifyPhoneOTP} = useCustomMutation({
    schema: VERIFY_PHONE_OTP,
    configErr: {isBypass: true}, // 禁用全局 toast，由 VerifyCodeScreen 自己处理错误显示
  });
  const {onRefetchData: requestResetPassword} = useCustomMutation({
    schema: REQUEST_RESET_PASSWORD,
    // configErr: {isBypass: true},
  });
  const {onRefetchData: requestForgotPasswordOtp} = useCustomMutation({
    schema: REQUEST_FORGOT_PASSWORD_OTP,
    // configErr: {isBypass: true},
  });
  const {onRefetchData: verifyForgotPasswordOtp} = useCustomMutation({
    schema: VERIFY_FORGOT_PASSWORD_OTP,
    configErr: {isBypass: true},
  });
  const {onRefetchData: bindPhoneNumberApi} = useCustomMutation({
    schema: BIND_PHONE_NUMBER,
  });
  const {onRefetchData: loginByPhoneAndPasswordApi} = useCustomMutation({
    schema: LOGIN_BY_PHONE_AND_PASSWORD,
    configErr: {isBypass: true}, // 禁用全局 toast，使用页面顶部的 alert 显示错误
  });
  const {onRefetchData: addPhonePasswordApi} = useCustomMutation({
    schema: ADD_PHONE_PASSWORD,
    configErr: {isBypass: true}, // 禁用全局 toast，使用页面顶部的 alert 显示错误
  });
  const {onRefetchData: refreshAccessTokenApi} = useCustomMutation({
    schema: REFRESH_ACCESS_TOKEN,
  });
  const {getEmptyCart: forceCreateEmptyCart} = useCartId('Sign In');

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [showVerifyScreen, setShowVerifyScreen] = useState(false);
  const [verifyPhoneNumber, setVerifyPhoneNumber] = useState('');
  const [verifyMethod, setVerifyMethod] = useState('sms');
  const [showBindPhone, setShowBindPhone] = useState(false);
  const [bindPhoneEmail, setBindPhoneEmail] = useState('');
  const [bindPhoneFirstName, setBindPhoneFirstName] = useState('');
  const [bindPhoneLastName, setBindPhoneLastName] = useState('');
  const [bindPhoneGender, setBindPhoneGender] = useState('');
  const [bindPhoneDob, setBindPhoneDob] = useState('');
  const [bindPhoneTempToken, setBindPhoneTempToken] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [passwordPhoneNumber, setPasswordPhoneNumber] = useState('');
  const [formType, setFormType] = useState(FormTypeMap.LOGIN);
  const [isForgotPasswordFlow, setIsForgotPasswordFlow] = useState(false);
  const [prevStep, setPrevStep] = useState('');
  // const {getStoredCartId: updateCartId} = useCartId('Sign In');
  const params = props?.route?.params;
  const theme = useTheme();
  const {background} = _.get(theme, 'colors');
  const mount = useRef();
  const {storeConfig} = useStoreConfig({useInitData: true});
  // login_radius_sms_enabled === false 时禁用 SMS 选项并置灰
  const smsDisabled = Boolean(
    storeConfig && storeConfig.login_radius_sms_enabled === false,
  );

  /**
   * useEffect for component mounted status
   */
  useEffect(() => {
    mount.current = true;
    return () => (mount.current = false);
  }, []);

  useEffect(() => {
    if (mount.current) {
      // 如果收到强制重置标志，先重置状态
      if (params?.forceReset) {
        setShowBindPhone(false);
        setShowVerifyScreen(false);
        setVerifyPhoneNumber('');
        setShowPasswordInput(false);
        setPasswordPhoneNumber('');
        setFormType(FormTypeMap.LOGIN);
        // 清除 params 中的标志位，防止重复触发
        navigation.setParams({forceReset: false});
      }

      // 处理 alert（在 forceReset 之后，避免被覆盖）
      if (params?.alert) {
        setAlert(params?.alert);
      }
      if (props?.alert) {
        setAlert(props?.alert);
      }

      // 如果是绑定手机号流程
      if (params?.showBindPhone) {
        setShowBindPhone(true);
        setBindPhoneEmail(params?.email || '');
        setBindPhoneFirstName(params?.firstName || '');
        setBindPhoneLastName(params?.lastName || '');
        setBindPhoneGender(params?.gender || '');
        setBindPhoneDob(params?.dob || '');
        setBindPhoneTempToken(params?.tempToken || '');
      }
      // 如果是从 push 来的 verify screen
      if (params?.showVerifyScreen) {
        setPrevStep(params?.prevStep || '');
        setShowVerifyScreen(true);
        setVerifyPhoneNumber(params?.verifyPhoneNumber || '');
        setVerifyMethod(params?.verifyMethod || 'sms');
      }

      if (params?.formType) {
        setFormType(params.formType);
      }
    }
  }, [params]);

  // 错误提示自动消失逻辑（3秒后自动清除）
  useEffect(() => {
    if (alert) {
      const timeout = setTimeout(() => {
        if (mount.current) {
          setAlert(false);
        }
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
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
      password: data.password,
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
      const res = await onPostSignin({
        params: variables,
        paramsOpt: {
          isReturn: true,
          opts: {
            ...recaptchaData,
          },
        },
      });

      console.log('Email Signin Response:', JSON.stringify(res, null, 2));

      const generateTokenData = res?.data?.generateCustomerTokenCustom;
      const status = generateTokenData?.status;

      if (status !== 'SUCCESS' && status !== true) {
        throw (
          generateTokenData?.message ||
          res?.graphQLErrors?.[0]?.message ||
          'Login failed. Please check your credentials.'
        );
      }

      const USER_TOKEN = generateTokenData?.token;
      const nextStep = generateTokenData?.next_step;
      const lrData = generateTokenData?.lr_data;
      const profile = lrData?.profile;
      const customerData = generateTokenData?.customer_data;

      // 使用 lr_access_token 作为后续更新信息的临时 Token
      const currentTempToken = USER_TOKEN || lrData?.access_token;

      // 1. 登录成功
      if (nextStep === 'LOGIN_SUCCESS' && USER_TOKEN) {
        await Storage.set(Storage.name.TOKEN, USER_TOKEN);
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});
        await Storage.set(Storage.name.USER_TYPE, USER_CUSTOMER);

        // 存储 refresh_token 用于后续 token 刷新
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }

        if (params?.redirectTo === 'guardian-run') {
          await Storage.set(Storage.name.GUARDIAN_RUN_REDIRECT, 'true');
        }

        crashlytics().setAttribute(BEARER, USER_TOKEN);
        crashlytics().setAttribute(USER_TYPE, USER_CUSTOMER);
        // 先创建空购物车，确保 rxCartId 已设置
        try {
          await forceCreateEmptyCart(USER_CUSTOMER);
        } catch (e) {
          console.log('forceCreateEmptyCart error', e);
        }
        // 设置 rxUserToken 和 rxUserType（触发首页监听，此时 rxCartId 已就绪）
        rxUserToken(USER_TOKEN);
        rxUserType(USER_CUSTOMER);
        crashlytics().setAttribute(EMAIL, profile?.email || data.email);
        AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.LOGIN);

        try {
          await insertAppToken({source: 'login'});
        } catch (tokenErr) {
          console.log('[fcm-token] login insert error', tokenErr);
        }

        await syncCdpMemberId();

        // 立即导航，避免 loading 结束后停留在登录页
        navigateAfterSignin();

        // 导航后再设置 loading 为 false（虽然页面已切换，但保持状态一致性）
        if (mount.current) {
          setLoading(false);
        }

        if (props?.onSigninFinishCallback) {
          props?.onSigninFinishCallback();
        }
        return;
      }

      // 2. 需要绑定手机号
      if (nextStep === 'BIND_PHONE') {
        // 存储 refresh_token 用于后续 token 刷新
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        // 立即导航，避免 loading 结束后停留在登录页
        navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
          email: customerData?.email || profile?.email || data.email,
          firstName: customerData?.firstname || profile?.firstname || '',
          lastName: customerData?.lastname || profile?.lastname || '',
          gender: customerData?.gender || profile?.gender,
          dob: customerData?.date_of_birth || profile?.dob,
          tempToken: currentTempToken,
          showBindPhone: true, // 关键：触发当前模块显示绑定手机号界面
          nextStep: nextStep,
        });

        // 导航后再设置 loading 为 false
        if (mount.current) {
          setLoading(false);
        }

        if (props?.onSigninFinishCallback) {
          props?.onSigninFinishCallback();
        }
        return;
      }

      // 3. 需要完善资料 或 新用户注册
      if (nextStep === 'COMPLETE_PROFILE' || nextStep === 'SIGN_UP') {
        // 存储 refresh_token 用于后续 token 刷新
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        // 立即导航，避免 loading 结束后停留在登录页
        navigateTo(modules.auth_signup.enable, modules.auth_signup.name, {
          email: customerData?.email || profile?.email || data.email,
          firstName: customerData?.firstname || profile?.firstname || '',
          lastName: customerData?.lastname || profile?.lastname || '',
          gender: customerData?.gender || profile?.gender,
          dob: customerData?.date_of_birth || profile?.dob,
          // 带上手机号，供 COMPLETE_PROFILE 页面反显 & 保存；优先使用带 + 的 E.164
          phoneNumber:
            profile?.phone_number ||
            (customerData?.phonenumber ? `+${customerData.phonenumber}` : ''),
          tempToken: currentTempToken,
          // 只有 COMPLETE_PROFILE 才是补全资料模式，SIGN_UP 是正常注册流程
          isEmailSignup: nextStep === 'COMPLETE_PROFILE',
          nextStep: nextStep,
        });

        // 导航后再设置 loading 为 false
        if (mount.current) {
          setLoading(false);
        }

        if (props?.onSigninFinishCallback) {
          props?.onSigninFinishCallback();
        }
        return;
      }

      // 默认兜底逻辑：跳转到绑定手机号
      // 立即导航，避免 loading 结束后停留在登录页
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
        email: customerData?.email || profile?.email || data.email,
        firstName: customerData?.firstname || profile?.firstname || '',
        lastName: customerData?.lastname || profile?.lastname || '',
        gender: customerData?.gender || profile?.gender,
        dob: customerData?.date_of_birth || profile?.dob,
        tempToken: currentTempToken,
        showBindPhone: true,
      });

      // 导航后再设置 loading 为 false
      if (mount.current) {
        setLoading(false);
      }
    } catch (err) {
      if (mount.current) {
        setAlert({type: TYPE_FAILED, message: err.toString()});
        setLoading(false);
      }
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
   * @function onNavigateSignup
   * @summary navigation to sign up page
   * ---------------------------------------------------- *
   */
  const onNavigateSignup = () => {
    navigateTo(modules.auth_signup.enable, modules.auth_signup.name);
  };
  /**
   * ---------------------------------------------------- *
   * @function onNavigateForgot
   * @summary navigation to sign up page
   * ---------------------------------------------------- *
   */
  const onNavigateForgot = () => {
    navigateTo(modules.auth_forgot.enable, modules.auth_forgot.name);
  };

  const handleCheckPhoneNumber = async phone => {
    try {
      setLoading(true);
      // reCAPTCHA：phoneNumberCheck（formAction 与 pwa-guardian 保持一致）
      const recaptchaData = await generateReCaptchaDataSafely(
        'phoneNumberCheck',
      );
      const res = await phoneNumberCheck({
        params: {phone},
        paramsOpt: {isReturn: true, opts: {...recaptchaData}},
      });
      setLoading(false);

      const result = res?.data?.phoneNumberNextStep;
      if (!result?.status || !result?.token) {
        throw new Error('Invalid phone login response');
      }
      const payload = decodeJwtPayload(result.token);

      return payload?.next_step === 'PASSWORD';
    } catch (error) {
      setLoading(false);
      return;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onShowPasswordInput
   * @summary show password input mode for phone number that has password
   * ---------------------------------------------------- *
   */
  const onShowPasswordInput = phoneNumber => {
    setShowPasswordInput(true);
    setPasswordPhoneNumber(phoneNumber);
    setFormType(FormTypeMap.PASSWORD_LOGIN);
  };

  /**
   * ---------------------------------------------------- *
   * @function onBackToPhoneInput
   * @summary go back to phone number input mode
   * ---------------------------------------------------- *
   */
  const onBackToPhoneInput = () => {
    setShowPasswordInput(false);
    setPasswordPhoneNumber('');
    setFormType(FormTypeMap.LOGIN);
    setAlert(false);
  };

  /**
   * ---------------------------------------------------- *
   * @function onPasswordLogin
   * @summary handle login by phone + password
   * ---------------------------------------------------- *
   */
  const onPasswordLogin = async (phoneNumber, password) => {
    setAlert(false);
    setLoading(true);
    try {
      // reCAPTCHA：loginByPhoneAndPassword（formAction 与 pwa-guardian 保持一致）
      const recaptchaData = await generateReCaptchaDataSafely();
      const res = await loginByPhoneAndPasswordApi({
        params: {
          phoneNumber,
          password,
        },
        paramsOpt: {isReturn: true, opts: {...recaptchaData}},
      });

      const loginData = res?.data?.loginByPhoneAndPassword;
      const status = loginData?.status;

      if (status !== 'SUCCESS' && status !== true) {
        throw res?.message || 'Incorrect password. Please try again.';
      }

      const USER_TOKEN = loginData?.token;
      const nextStep = loginData?.next_step;
      const lrData = loginData?.lr_data;
      const profile = lrData?.profile;

      // 登录成功
      if (nextStep === 'LOGIN_SUCCESS' && USER_TOKEN) {
        await Storage.set(Storage.name.TOKEN, USER_TOKEN);
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});
        await Storage.set(Storage.name.USER_TYPE, USER_CUSTOMER);

        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }

        crashlytics().setAttribute(BEARER, USER_TOKEN);
        crashlytics().setAttribute(USER_TYPE, USER_CUSTOMER);
        crashlytics().setAttribute(EMAIL, profile?.email || '');
        // 先创建空购物车，确保 rxCartId 已设置
        try {
          await forceCreateEmptyCart(USER_CUSTOMER);
        } catch (e) {
          console.log('forceCreateEmptyCart error', e);
        }
        // 设置 rxUserToken 和 rxUserType（触发首页监听，此时 rxCartId 已就绪）
        rxUserToken(USER_TOKEN);
        rxUserType(USER_CUSTOMER);

        try {
          await insertAppToken({source: 'login'});
        } catch (tokenErr) {
          console.log('[fcm-token] login insert error', tokenErr);
        }

        await syncCdpMemberId();

        navigateAfterSignin();

        if (mount.current) {
          setLoading(false);
        }
        return;
      }

      // next_step 非 LOGIN_SUCCESS — 跳转到绑定/完善资料等流程
      if (nextStep === 'BIND_PHONE') {
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
          email: profile?.email || '',
          firstName: profile?.firstname || '',
          lastName: profile?.lastname || '',
          gender: profile?.gender,
          dob: profile?.dob,
          tempToken: USER_TOKEN || lrData?.access_token,
          showBindPhone: true,
        });

        if (mount.current) {
          setLoading(false);
        }
        return;
      }

      if (nextStep === 'COMPLETE_PROFILE' || nextStep === 'SIGN_UP') {
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        navigateTo(modules.auth_signup.enable, modules.auth_signup.name, {
          email: profile?.email || '',
          firstName: profile?.firstname || '',
          lastName: profile?.lastname || '',
          gender: profile?.gender,
          dob: profile?.dob,
          phoneNumber: phoneNumber,
          tempToken: USER_TOKEN || lrData?.access_token,
          isEmailSignup: nextStep === 'COMPLETE_PROFILE',
          nextStep: nextStep,
        });

        if (mount.current) {
          setLoading(false);
        }
        return;
      }

      // 兜底
      if (mount.current) {
        setLoading(false);
      }
    } catch (err) {
      if (mount.current) {
        // 将错误显示在 password 输入框下方（触发表单校验错误显示）
        if (_onFormHandleSetErrorRef.current) {
          _onFormHandleSetErrorRef.current('password', {
            type: 'manual',
            message: err.toString() || 'Incorrect password. Please try again.',
          });
        }
        setLoading(false);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onCreatePasswordSubmit
   * @summary handle create password submission (next_step = ADD_PASSWORD)
   *          复用 ADD_PHONE_PASSWORD mutation，后续 FORGET_PASSWORD 可传入不同 schema
   * ---------------------------------------------------- *
   */
  const onCreatePasswordSubmit = async data => {
    setAlert(false);
    setLoading(true);
    const accessToken = await getAccessToken(refreshAccessTokenApi);
    try {
      const res = await addPhonePasswordApi({
        params: {
          phone: verifyPhoneNumber,
          password: data.password,
          accessToken,
          prevStep,
        },
        paramsOpt: {isReturn: true},
      });

      console.log('Add Phone Password Response:', JSON.stringify(res, null, 2));

      const addPasswordData = res?.data?.addPhonePassword || {};

      const status = addPasswordData?.status;

      if (status !== 'SUCCESS') {
        throw res?.message || 'Failed to create password. Please try again.';
      }

      const USER_TOKEN = addPasswordData?.token;
      const nextStep = addPasswordData?.next_step;
      const lrData = addPasswordData?.lr_data;
      const profile = lrData?.profile;

      if (nextStep === 'LOGIN_SUCCESS' && USER_TOKEN) {
        // 直接登录成功 -> 首页
        await Storage.set(Storage.name.TOKEN, USER_TOKEN);
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});
        await Storage.set(Storage.name.USER_TYPE, USER_CUSTOMER);

        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }

        crashlytics().setAttribute(BEARER, USER_TOKEN);
        crashlytics().setAttribute(USER_TYPE, USER_CUSTOMER);
        crashlytics().setAttribute(EMAIL, profile?.email || '');
        // 先创建空购物车，确保 rxCartId 已设置
        try {
          await forceCreateEmptyCart(USER_CUSTOMER);
        } catch (e) {
          console.log('forceCreateEmptyCart error', e);
        }
        // 设置 rxUserToken 和 rxUserType（触发首页监听，此时 rxCartId 已就绪）
        rxUserToken(USER_TOKEN);
        rxUserType(USER_CUSTOMER);

        try {
          await insertAppToken({source: 'login'});
        } catch (tokenErr) {
          console.log('[fcm-token] login insert error', tokenErr);
        }

        await syncCdpMemberId();

        if (mount.current) {
          setLoading(false);
        }
        navigateAfterSignin();
        return;
      }

      if (nextStep === 'SIGN_UP' || nextStep === 'COMPLETE_PROFILE') {
        // 跳转到注册/完善资料页面
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        // 根据业务需求跳转到对应的流程
        navigateTo(modules.auth_signup.enable, modules.auth_signup.name, {
          email: profile?.email || '',
          firstName: profile?.firstname || '',
          lastName: profile?.lastname || '',
          gender: profile?.gender || '',
          dob: profile?.dob || '',
          // 传递完整 E.164 号码（带 +），避免后续注册时变成仅 "+62"
          phoneNumber: profile?.phone_number || verifyPhoneNumber,
          tempToken: USER_TOKEN || lrData?.access_token,
          isEmailSignup: showBindPhone,
          phoneVerified: true,
          nextStep: nextStep,
        });

        if (mount.current) {
          setFormType(FormTypeMap.LOGIN);
          setLoading(false);
        }
        return;
      }

      if (nextStep === 'CHANGE_PASSWORD_SUCCESS') {
        setAlert({type: TYPE_SUCCESS, message: addPasswordData.message});
        setTimeout(() => {
          // 修改密码成功提示。等待1秒让用户看到提示，返回首页，此时为未登录状态
          navReset(tabsApp.name);
        }, 1000);
      }
    } catch (err) {
      console.error('onCreatePasswordSubmit Error:', err);
      if (mount.current) {
        setAlert({type: TYPE_FAILED, message: err.toString()});
        setLoading(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    setAlert(false);
    if (!passwordPhoneNumber) {
      setAlert({type: TYPE_FAILED, message: 'Phone number is required.'});
      return false;
    }

    rxAppLoading(true);
    try {
      console.log('Requesting Forgot Password Reset:', {
        phoneNumber: passwordPhoneNumber,
      });
      const res = await requestResetPassword({
        params: {
          phoneNumber: passwordPhoneNumber,
        },
        paramsOpt: {isReturn: true},
      });

      const resetData = res?.data?.requestResetPassword || {};

      const {next_step, status, email, message} = resetData || {};

      if (status) {
        if (next_step === 'OTP_METHOD') {
          if (mount.current) {
            setFormType(FormTypeMap.FORGET_PASSWORD);
            setIsForgotPasswordFlow(true);
            setVerifyPhoneNumber(passwordPhoneNumber);
            setVerifyMethod('sms');
          }
        } else if (next_step === null && email) {
          navigateTo(modules.auth_forgot.enable, modules.auth_forgot.name, {
            email: email,
          });
          rxAppLoading(false);
          return false;
        } else {
          rxAppLoading(false);
          setAlert({type: TYPE_FAILED, message});
          return false;
        }
        rxAppLoading(false);
        return true;
      } else {
        rxAppLoading(false);
        setAlert({type: TYPE_FAILED, message});
        return false;
      }
    } catch (err) {
      console.error('handleForgotPassword Error:', err);
      if (mount.current) {
        setAlert({type: TYPE_FAILED, message: err?.message || err.toString()});
        rxAppLoading(false);
      }
      return false;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onSelectVerificationMethod
   * @summary handle verification method selection (WhatsApp or SMS)
   * ---------------------------------------------------- *
   */
  const onSelectVerificationMethod = async ({phoneNumber, method}) => {
    const handleSetLoading =
      formType === FormTypeMap.FORGET_PASSWORD ? rxAppLoading : setLoading;
    handleSetLoading(true);
    try {
      if (showBindPhone && bindPhoneTempToken) {
        // 绑定手机号流程：保持原有逻辑不变
        console.log('Binding Phone Number:', {
          phoneId: phoneNumber,
          method,
          access_token: bindPhoneTempToken,
        });
        // reCAPTCHA：bindPhoneNumber（formAction 与 pwa-guardian 保持一致）
        const recaptchaData = await generateReCaptchaDataSafely();
        const res = await bindPhoneNumberApi({
          params: {
            phoneId: phoneNumber,
            method: method,
            access_token: bindPhoneTempToken,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log(
          'Bind Phone Number Response:',
          JSON.stringify(res, null, 2),
        );

        const bindResult = res?.data?.bindPhoneNumber;

        // 绑定失败，重置loading
        if (!bindResult?.success) {
          if (mount.current) {
            handleSetLoading(false);
          }
          return;
        }

        // 绑定成功，关闭 loading 并导航
        if (mount.current) {
          handleSetLoading(false);
        }
        navigation.push(modules.auth_signin.name, {
          showVerifyScreen: true,
          verifyPhoneNumber: phoneNumber,
          verifyMethod: method,
          showBindPhone: showBindPhone,
          email: bindPhoneEmail,
          firstName: bindPhoneFirstName,
          lastName: bindPhoneLastName,
          gender: bindPhoneGender,
          dob: bindPhoneDob,
          tempToken: bindPhoneTempToken,
          prevStep: 'BIND_PHONE',
        });
      } else if (isForgotPasswordFlow) {
        // 忘记密码流程：使用专用接口发送忘记密码 OTP
        console.log('Requesting Forgot Password OTP:', {
          phoneNumber: phoneNumber,
          method,
        });
        // reCAPTCHA：requestForgotPasswordOtp（formAction 与 pwa-guardian 保持一致）
        const recaptchaData =
          await generateForgotPasswordOtpReCaptchaDataSafely();
        const res = await requestForgotPasswordOtp({
          params: {
            phoneNumber: phoneNumber,
            method: method,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log(
          'Request Forgot Password OTP Response:',
          JSON.stringify(res, null, 2),
        );

        const otpResult = res?.data?.requestForgotPasswordOtp || {};
        if (otpResult?.success) {
          if (mount.current) {
            setVerifyPhoneNumber(phoneNumber);
            setVerifyMethod(method);
            setShowVerifyScreen(true);
            handleSetLoading(false);
          }
        } else {
          if (mount.current) {
            handleSetLoading(false);
          }
        }
      } else {
        // 常规登录流程：只改这个部分
        console.log('Requesting Phone OTP:', {phoneId: phoneNumber, method});
        // reCAPTCHA：requestPhoneOTP（formAction 与 pwa-guardian 保持一致）
        const recaptchaData = await generateReCaptchaDataSafely();
        const res = await requestPhoneOTP({
          params: {
            phoneId: phoneNumber,
            method: method,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log(
          'Request Phone OTP Response:',
          JSON.stringify(res, null, 2),
        );

        // 检查响应是否成功
        const otpResult = res?.data?.requestPhoneOTP;
        if (
          otpResult?.success === true ||
          otpResult?.status === 'SUCCESS' ||
          otpResult?.status === 'success' ||
          otpResult?.status === true
        ) {
          // 成功：关闭 loading 并导航
          if (mount.current) {
            handleSetLoading(false);
          }
          navigation.push(modules.auth_signin.name, {
            showVerifyScreen: true,
            verifyPhoneNumber: phoneNumber,
            verifyMethod: method,
            showBindPhone: showBindPhone,
            email: bindPhoneEmail,
            firstName: bindPhoneFirstName,
            lastName: bindPhoneLastName,
            gender: bindPhoneGender,
            dob: bindPhoneDob,
            tempToken: bindPhoneTempToken,
          });
        } else {
          // 失败：关闭 loading，停留在当前页面（不导航，不显示错误）
          if (mount.current) {
            handleSetLoading(false);
          }
          // 不执行 navigation.push，停留在当前页面
        }
      }
    } catch (err) {
      console.error('onSelectVerificationMethod Error:', err);
      // 异常情况：关闭 loading，停留在当前页面
      if (mount.current) {
        handleSetLoading(false);
        // 如果是绑定手机号流程，显示错误；如果是常规登录流程，不显示错误
        if (showBindPhone && bindPhoneTempToken) {
          setAlert({type: TYPE_FAILED, message: err.toString()});
        }
        // 常规登录流程失败时不显示错误，只停留在当前页面
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onVerifyCode
   * @summary handle OTP code verification
   * ---------------------------------------------------- *
   */
  const onVerifyCode = async code => {
    setLoading(true);
    try {
      let generateTokenData = null;
      if (formType === FormTypeMap.FORGET_PASSWORD) {
        console.log('Verifying Forgot Password OTP:', {
          phoneNumber: verifyPhoneNumber,
          otp: code,
        });
        const res = await verifyForgotPasswordOtp({
          params: {
            phoneNumber: verifyPhoneNumber,
            otp: code,
          },
          paramsOpt: {isReturn: true},
        });
        console.log(
          'Verify Forgot Password OTP Response:',
          JSON.stringify(res, null, 2),
        );
        generateTokenData = res?.data?.verifyForgotPasswordOtp || {};
      } else {
        console.log('Verifying Phone OTP:', {
          phoneId: verifyPhoneNumber,
          otp: code,
        });
        // reCAPTCHA：verifyPhoneOTP（formAction 与 pwa-guardian 保持一致）
        const recaptchaData = await generateReCaptchaDataSafely();
        const res = await verifyPhoneOTP({
          params: {
            phoneId: verifyPhoneNumber,
            otp: code,
            prev_step: prevStep,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log('Verify Phone OTP Response:', JSON.stringify(res, null, 2));
        generateTokenData = res?.data?.verifyPhoneOTP;
      }

      const status = generateTokenData?.status;

      if (status !== 'SUCCESS') {
        throw (
          generateTokenData?.message || 'Verification failed. Please try again.'
        );
      }

      const USER_TOKEN = generateTokenData?.token;
      const nextStep = generateTokenData?.next_step;
      const lrData = generateTokenData?.lr_data;
      const profile = lrData?.profile;
      const customerData = generateTokenData?.customer_data;

      // 如果 Magento Token 为空，则使用 lr_access_token 作为后续更新信息的临时 Token
      const currentTempToken =
        USER_TOKEN || lrData?.access_token || bindPhoneTempToken;

      setLoading(false);

      if (nextStep === 'LOGIN_SUCCESS' && USER_TOKEN) {
        // 老用户：直接登录，不要先设置 setShowVerifyScreen(false)，直接跳转首页
        await Storage.set(Storage.name.TOKEN, USER_TOKEN);
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});
        await Storage.set(Storage.name.USER_TYPE, USER_CUSTOMER);

        // 存储 refresh_token 用于后续 token 刷新
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }

        crashlytics().setAttribute(BEARER, USER_TOKEN);
        crashlytics().setAttribute(USER_TYPE, USER_CUSTOMER);
        crashlytics().setAttribute(EMAIL, profile?.email || '');
        // 先创建空购物车，确保 rxCartId 已设置
        try {
          await forceCreateEmptyCart(USER_CUSTOMER);
        } catch (e) {
          console.log('forceCreateEmptyCart error', e);
        }
        // 设置 rxUserToken 和 rxUserType（触发首页监听，此时 rxCartId 已就绪）
        rxUserToken(USER_TOKEN);
        rxUserType(USER_CUSTOMER);

        try {
          await insertAppToken({source: 'login'});
        } catch (tokenErr) {
          console.log('[fcm-token] login insert error', tokenErr);
        }

        await syncCdpMemberId();

        // 直接跳转到首页，避免先显示登录初始页
        navigateAfterSignin();
      } else if (
        nextStep === 'CREATE_PASSWORD' ||
        nextStep === 'ADD_PASSWORD'
      ) {
        // 需要创建密码 -> 切换到创建密码模式（内部表单切换，不需要路由跳转）
        setShowVerifyScreen(false);
        setIsForgotPasswordFlow(false);

        // 存储 refresh_token 用于后续 token 刷新
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        // 设置 prev_step 供 onCreatePasswordSubmit 使用
        setPrevStep(nextStep);

        setFormType(FormTypeMap.CREATE_PASSWORD);
        setVerifyPhoneNumber(verifyPhoneNumber); // keep phone number for later use
      } else {
        setIsForgotPasswordFlow(false);
        // 其他情况才设置 setShowVerifyScreen(false)
        setShowVerifyScreen(false);

        // 存储 refresh_token 用于后续 token 刷新（在跳转到注册页面之前）
        if (lrData?.refresh_token) {
          const {storeRefreshToken} = require('@app/helpers/TokenRefresh');
          await storeRefreshToken(lrData.refresh_token);
        }
        const {access_token, refresh_token, expires_in} = lrData || {};
        persistOAuthBundle({access_token, refresh_token, expires_in});

        if (
          nextStep === 'SIGN_UP' ||
          nextStep === 'BIND_PHONE' ||
          nextStep === 'COMPLETE_PROFILE'
        ) {
          // 根据业务需求跳转到对应的流程
          navigateTo(modules.auth_signup.enable, modules.auth_signup.name, {
            email:
              customerData?.email || profile?.email || bindPhoneEmail || '',
            firstName:
              customerData?.firstname ||
              profile?.firstname ||
              bindPhoneFirstName ||
              '',
            lastName:
              customerData?.lastname ||
              profile?.lastname ||
              bindPhoneLastName ||
              '',
            gender: customerData?.gender || profile?.gender || bindPhoneGender,
            dob: customerData?.date_of_birth || profile?.dob || bindPhoneDob,
            // 传递完整 E.164 号码（带 +），避免后续注册时变成仅 "+62"
            phoneNumber: profile?.phone_number || verifyPhoneNumber,
            tempToken: currentTempToken,
            isEmailSignup: showBindPhone, // 如果是从邮箱登录来的，保持 Personal information 标题
            phoneVerified: true,
            nextStep: nextStep,
          });
        } else {
          // 兜底逻辑：如果 status 是 SUCCESS 但没有匹配的 next_step，跳转到完善信息
          navigateTo(modules.auth_signup.enable, modules.auth_signup.name, {
            email:
              customerData?.email || profile?.email || bindPhoneEmail || '',
            firstName: customerData?.firstname || profile?.firstname || '',
            lastName: customerData?.lastname || profile?.lastname || '',
            gender: customerData?.gender || profile?.gender || bindPhoneGender,
            dob: customerData?.date_of_birth || profile?.dob || bindPhoneDob,
            phoneNumber: verifyPhoneNumber,
            tempToken: currentTempToken,
            isEmailSignup: showBindPhone,
            phoneVerified: true,
          });
        }
      }
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onResendCode
   * @summary handle resend OTP code
   * ---------------------------------------------------- *
   */
  const onResendCode = async () => {
    try {
      if (showBindPhone && bindPhoneTempToken) {
        console.log('Resending Bind Phone OTP:', {
          phoneId: verifyPhoneNumber,
          method: verifyMethod,
          access_token: bindPhoneTempToken,
        });
        // reCAPTCHA：bindPhoneNumber 重发（formAction 与 pwa-guardian 保持一致）
        const recaptchaData = await generateReCaptchaDataSafely();
        const res = await bindPhoneNumberApi({
          params: {
            phoneId: verifyPhoneNumber,
            method: verifyMethod,
            access_token: bindPhoneTempToken,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log(
          'Resend Bind Phone OTP Response:',
          JSON.stringify(res, null, 2),
        );
      } else if (isForgotPasswordFlow) {
        console.log('Resending Forgot Password OTP:', {
          phoneNumber: verifyPhoneNumber,
          method: verifyMethod,
        });
        // reCAPTCHA：requestForgotPasswordOtp 重发（formAction 与 pwa-guardian 保持一致）
        const recaptchaData =
          await generateForgotPasswordOtpReCaptchaDataSafely();
        const res = await requestForgotPasswordOtp({
          params: {
            phoneNumber: verifyPhoneNumber,
            method: verifyMethod,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log(
          'Resend Forgot Password OTP Response:',
          JSON.stringify(res, null, 2),
        );
      } else {
        console.log('Resending Phone OTP:', {
          phoneId: verifyPhoneNumber,
          method: verifyMethod,
        });
        // reCAPTCHA：requestPhoneOTP 重发（formAction 与 pwa-guardian 保持一致）
        const recaptchaData = await generateReCaptchaDataSafely();
        const res = await requestPhoneOTP({
          params: {
            phoneId: verifyPhoneNumber,
            method: verifyMethod,
          },
          paramsOpt: {isReturn: true, opts: {...recaptchaData}},
        });
        console.log('Resend Phone OTP Response:', JSON.stringify(res, null, 2));
        const otpResult = res?.data?.requestPhoneOTP;
        if (otpResult?.success) {
          setAlert({
            type: TYPE_SUCCESS,
            message: otpResult?.message,
          });
        }
      }
      // 如果成功，不显示错误（由 VerifyCodeScreen 处理倒计时）
    } catch (err) {
      console.error('onResendCode Error:', err);
      // 如果 resend 失败，显示错误提示
      setAlert({
        type: TYPE_FAILED,
        message: "We couldn't send the code. Please try again.",
      });
      throw err; // 抛出错误，让 VerifyCodeScreen 知道失败了
    }
  };

  const onBackFromVerify = () => {
    // 强制重置状态并导航到初始登录页
    setShowBindPhone(false);
    setShowVerifyScreen(false);
    setVerifyPhoneNumber('');
    setFormType(FormTypeMap.LOGIN);
    setIsForgotPasswordFlow(false);

    // 强制重置导航栈到初始登录页，并带上重置参数
    navigation.reset({
      index: 0,
      routes: [{name: modules.auth_signin.name, params: {forceReset: true}}],
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateEmailSignin
   * @summary navigate to email signin (old interface)
   * ---------------------------------------------------- *
   */
  const onNavigateEmailSignin = () => {
    // Navigate to the same page but with email signin mode
    // We'll use a state to switch to email signin view
    setShowVerifyScreen(false);
    setShowBindPhone(false); // 确保重置绑定状态
    setVerifyPhoneNumber('');

    // 强制重置导航栈到初始登录页，并带上邮箱登录参数
    const routeParams = {
      useEmailSignin: true,
      forceReset: true,
    };

    if (params?.redirectRoute) {
      routeParams.redirectRoute = params.redirectRoute;
    }

    navigation.reset({
      index: 0,
      routes: [
        {
          name: modules.auth_signin.name,
          params: routeParams,
        },
      ],
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onBackFromBindPhone
   * @summary handle back from bind phone page to initial login page
   * ---------------------------------------------------- *
   */
  const onBackFromBindPhone = () => {
    // 强制重置状态并导航到初始登录页
    setShowBindPhone(false);
    setShowVerifyScreen(false);
    setVerifyPhoneNumber('');
    setFormType(FormTypeMap.LOGIN);
    setIsForgotPasswordFlow(false);
    setPrevStep('');

    // 强制重置导航栈到初始登录页，并带上重置参数
    navigation.reset({
      index: 0,
      routes: [{name: modules.auth_signin.name, params: {forceReset: true}}],
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onBackToHome
   * @summary handle back to initial login page with error message
   * ---------------------------------------------------- *
   */
  const onCancelForgotPassword = () => {
    setIsForgotPasswordFlow(false);
    setFormType(FormTypeMap.PASSWORD_LOGIN);
    setShowVerifyScreen(false);
    setVerifyPhoneNumber('');
    setVerifyMethod('sms');
  };

  const onBackToHome = () => {
    // 从 verifyPhoneNumber 中提取电话号码（去掉国家代码）
    // verifyPhoneNumber 格式通常是 "+62" + 电话号码，或者就是完整的电话号码
    let phoneNumberToFill = '';
    if (verifyPhoneNumber) {
      // 如果包含国家代码（如 +62），去掉它
      if (verifyPhoneNumber.startsWith('+62')) {
        phoneNumberToFill = verifyPhoneNumber.substring(3); // 去掉 "+62"
      } else if (verifyPhoneNumber.startsWith('62')) {
        phoneNumberToFill = verifyPhoneNumber.substring(2); // 去掉 "62"
      } else {
        phoneNumberToFill = verifyPhoneNumber;
      }
    }

    // 只进行导航，状态重置由 useEffect 中的 forceReset 逻辑处理
    // 通过 params 传递 alert 和电话号码，避免重复设置
    navigation.reset({
      index: 0,
      routes: [
        {
          name: modules.auth_signin.name,
          params: {
            forceReset: true,
            alert: {
              type: TYPE_FAILED,
              message: 'Sign-in/Sign-up Unsuccessful.',
            },
            phoneNumber: phoneNumberToFill, // 传递电话号码
          },
        },
      ],
    });
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
    infoSection,
    rulesSection,
    followUsSection,
    alert,
    background,
    onNavigateToCart,
    onSignin: onSubmit,
    onError: onErrorSubmit,
    onNavigateSignup,
    onNavigateForgot,
    onNavigateEmailSignin,
    onSelectVerificationMethod,
    onVerifyCode,
    onResendCode,
    handleCheckPhoneNumber,
    onShowPasswordInput,
    onBackToPhoneInput,
    onPasswordLogin,
    showPasswordInput,
    passwordPhoneNumber,
    formType,
    onCreatePasswordSubmit,
    handleForgotPassword,
    onCancelForgotPassword,
    showVerifyScreen,
    verifyPhoneNumber,
    verifyMethod,
    onBackFromVerify,
    route: props.route,
    smsDisabled,
    showBindPhone,
    bindPhoneEmail,
    onBackFromBindPhone,
    onBackToHome,
    renderRecaptchaBridge,
    renderForgotPasswordRecaptchaBridge,
  };

  return <Views {...controllerProps} />;
};

export default AuthSigninController;
