import React, {useCallback, useEffect, useState} from 'react';
import {useRef} from 'react';
import {Platform} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {modules, tabsApp} from '@root/swift.config';

import _ from 'lodash';

import Views from '@app/_modules/auth_signup/_views';
import {
  COLLECT_CUSTOMER_HOBBIES,
  CONFIRM_EMAIL_VERIFICATION,
  GET_CUSTOMER_HOBBIES,
  GET_CUSTOMER_INFORMATION,
  GET_GENDER_OPTIONS,
  REFRESH_ACCESS_TOKEN,
  REGISTER,
  REQUEST_OTP,
  UPDATE_CUSTOMER_PROFILE,
  VERIFY_EMAIL,
  VERIFY_OTP,
} from '@app/_modules/auth_signup/services/schema';
import AnalyticsHelper from '@app/helpers/Analytics';
import {TYPE_FAILED, USER_CUSTOMER} from '@app/helpers/Constants';
import {navigationRef, navReset} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {
  isTokenExpiredError,
  persistOAuthBundle,
  refreshAccessToken,
} from '@app/helpers/TokenRefresh';
import {useCartId} from '@app/hooks/useCartId';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {useGoogleReCaptcha} from '@app/hooks/useGoogleReCaptcha';
import {
  rxAppLoading,
  rxAppSnackbar,
  rxUserToken,
  rxUserType,
} from '@app/services/cache';
import {insertAppToken} from '@app/services/fcmToken';
import {GET_LOYALTY_CARD_DATA} from '@app/services/queries/user';
import {syncCdpMemberId} from '@app/track/cdpUser';

/**
 * @controller AuthSignupController
 * @param {Object} props
 * @profiler {Sentry}
 * @summary Controller for Sign Up
 */
const Controller = props => {
  if (!modules.auth_signup.enable) {
    return null;
  }
  const mount = useRef(null);
  const navigation = useNavigation();
  const withOTP = modules.auth_signup.atoms.otp.enable;

  const [dataReq, setDataReq] = useState({});
  const [modalOtp, setModalOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [alert, setAlert] = useState(false);
  const [showHobbySelection, setShowHobbySelection] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [finalToken, setFinalToken] = useState('');
  const isRegisteringRef = useRef(false);

  // Email verification states
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [emailVerificationError, setEmailVerificationError] = useState(null);
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const {getEmptyCart: forceCreateEmptyCart} = useCartId('Sign In');

  // Get phone number from route params if coming from verification
  const routePhoneNumber = props?.route?.params?.phoneNumber || '';
  const isVerified = props?.route?.params?.verified || false;

  // Get email signup params (from email login flow)
  const emailFromLogin = props?.route?.params?.email || '';
  const firstNameFromLogin = props?.route?.params?.firstName || '';
  const lastNameFromLogin = props?.route?.params?.lastName || '';
  const genderFromLogin = props?.route?.params?.gender || '';
  const dobFromLogin = props?.route?.params?.dob || '';
  const initialTempToken = props?.route?.params?.tempToken || '';
  const [currentAccessToken, setCurrentAccessToken] =
    useState(initialTempToken);
  const isEmailSignup = props?.route?.params?.isEmailSignup || false;
  const phoneVerified = props?.route?.params?.phoneVerified || false;
  const nextStep = props?.route?.params?.nextStep || '';

  const {onRefetchData: getLoyaltyCardData} = useCustomQuery({
    schema: GET_LOYALTY_CARD_DATA,
    opts: {fetchPolicy: 'network-only'},
  });

  // Update currentAccessToken when initialTempToken changes
  useEffect(() => {
    if (initialTempToken) {
      setCurrentAccessToken(initialTempToken);
    }
  }, [initialTempToken]);

  /**
   * @function saveTokenAndUpdateUserState
   * @summary 保存 token 到 Storage 并更新用户状态
   * @param {string} token - 要保存的 token
   */
  const saveTokenAndUpdateUserState = useCallback(
    async token => {
      if (token) {
        await Storage.set(Storage.name.TOKEN, token);
        await Storage.set(Storage.name.USER_TYPE, USER_CUSTOMER);
        rxUserToken(token);
        rxUserType(USER_CUSTOMER);

        try {
          await forceCreateEmptyCart(USER_CUSTOMER);
        } catch (e) {
          console.log('forceCreateEmptyCart error', e);
        }

        try {
          await insertAppToken({
            source:
              nextStep === 'COMPLETE_PROFILE' ? 'complete_profile' : 'signup',
          });
        } catch (tokenErr) {
          console.log('[fcm-token] signup insert error', tokenErr);
        }

        let memberId = '';
        try {
          const data = await getLoyaltyCardData({paramsOpt: {isReturn: true}});
          memberId = data?.data?.customer?.qr_code?.memberId;

          AnalyticsHelper.eventRegisterSuccess({
            sign_up_method: isEmailSignup ? 'email' : 'phone',
            loyalty_id: memberId,
            user_status: nextStep === 'COMPLETE_PROFILE' ? 'existing' : 'new',
            registration_source: Platform.OS === 'ios' ? 'IOS' : 'Android',
            registration_page: props?.route?.name,
          });
        } catch (e) {}

        await syncCdpMemberId({memberId});
      }
    },
    [nextStep],
  );

  const {data: genderMetadata} = useCustomQuery({
    schema: GET_GENDER_OPTIONS,
    useInitData: true,
  });

  const genderOptions =
    genderMetadata?.data?.customAttributeMetadata?.items?.[0]
      ?.attribute_options || [];

  const {onRefetchData: register} = useCustomMutation({
    schema: REGISTER,
    useTimeout: false, // 移除超时，确保能正确返回响应
  });

  // 注册流程 reCAPTCHA：createCustomerCustom（formAction 与 pwa-guardian 保持一致）
  const {generateReCaptchaDataSafely, renderRecaptchaBridge} =
    useGoogleReCaptcha({
      currentForm: 'CUSTOMER_CREATE',
      formAction: 'createAccountPage',
    });
  const {onRefetchData: requestOTP} = useCustomMutation({schema: REQUEST_OTP});
  const {onRefetchData: verifyOTP} = useCustomMutation({schema: VERIFY_OTP});
  const {onRefetchData: verifyEmailApi} = useCustomMutation({
    schema: VERIFY_EMAIL,
  });
  const {onRefetchData: confirmEmailApi} = useCustomMutation({
    schema: CONFIRM_EMAIL_VERIFICATION,
  });
  const {onRefetchData: collectHobbiesApi} = useCustomMutation({
    schema: COLLECT_CUSTOMER_HOBBIES,
  });
  const {onRefetchData: updateCustomerProfile} = useCustomMutation({
    schema: UPDATE_CUSTOMER_PROFILE,
  });
  const {onRefetchData: refreshAccessTokenApi} = useCustomMutation({
    schema: REFRESH_ACCESS_TOKEN,
  });

  const {data: customerInfoData} = useCustomQuery({
    schema: GET_CUSTOMER_INFORMATION,
    useInitData: false, // 不再自动加载，数据已从 params 传递
    opts: {
      fetchPolicy: 'network-only',
      context: {
        headers: {
          Authorization: currentAccessToken
            ? `Bearer ${currentAccessToken}`
            : '',
        },
      },
    },
  });

  const customerProfile = customerInfoData?.data?.customer;

  // 解析初始爱好数据
  const initialHobbies = (() => {
    const hobbyAttr = customerProfile?.custom_attributes?.find(
      attr => attr.code === 'hobbies',
    );
    if (hobbyAttr?.value) {
      try {
        return JSON.parse(hobbyAttr.value);
      } catch (e) {
        console.warn('Failed to parse initial hobbies:', e);
        return [];
      }
    }
    return [];
  })();

  const {
    data: hobbyData,
    onRefetchData: refetchHobbies,
    loading: hobbyLoading,
  } = useCustomQuery({
    schema: GET_CUSTOMER_HOBBIES,
    useInitData: false,
    opts: {
      fetchPolicy: 'network-only',
    },
  });

  // 使用 _.get 防止在 hobbyData 为空数组时访问属性报错
  const hobbyCategories = _.get(hobbyData, 'data.customerHobbies.items', []);

  useEffect(() => {
    if (showHobbySelection && !hobbyLoading && hobbyCategories.length === 0) {
      console.log('Fetching hobbies...');
      // 获取 token（优先使用 finalToken，否则使用 currentAccessToken）
      const tokenToUse = finalToken || currentAccessToken;

      // 传递一个空对象作为参数，防止解构报错
      refetchHobbies({
        paramsOpt: {
          opts: {
            context: {
              headers: {
                Authorization: tokenToUse ? `Bearer ${tokenToUse}` : '',
              },
            },
          },
        },
      });
    }
  }, [showHobbySelection]);

  // 记录挂载状态
  useEffect(() => {
    mount.current = true;
    console.log('AuthSignup Controller mounted');
    if (isEmailSignup) {
      setIsEmailVerified(true);
    }
    return () => {
      mount.current = false;
      console.log('AuthSignup Controller unmounted');
    };
  }, [isEmailSignup]);

  // alert 自动消失（3 秒后消失）
  useEffect(() => {
    if (alert && alert.message) {
      const timer = setTimeout(() => {
        if (mount.current) {
          setAlert(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  /**
   * @summary effect on dataReq states changes
   * determined which function need to execute later
   * based on dataReq state
   */
  useEffect(() => {
    if (isRegisteringRef.current) {
      return;
    }

    if (!withOTP && !_.isEmpty(dataReq)) {
      console.log('Effect: Triggering onRegister (no OTP)');
      isRegisteringRef.current = true;
      onRegister();
    }
    if (withOTP && _.get(dataReq, 'otp')) {
      console.log('Effect: Triggering onVerifyOTP');
      isRegisteringRef.current = true;
      onVerifyOTP();
    }
  }, [dataReq, withOTP]);

  /**
   * @function onRequestOTP
   * @param {Object} data Form fields
   * @summary Function to request an otp from phone number
   */
  const onRequestOTP = async data => {
    console.log('onRequestOTP: Requesting code for', data.phoneNumber);
    setPhone(data.phoneNumber);
    try {
      // 统一手机号格式：仅保留数字（后端期望如 6281xxxx）
      const digitsOnly = String(data.phoneNumber || '').replace(/\D/g, '');
      const res = await requestOTP({
        params: {
          phonenumber: digitsOnly,
        },
        paramsOpt: {isReturn: true},
      });

      if (res) {
        console.log('onRequestOTP: Code sent successfully');
        setDataReq(data);
        setLoading(false);
        setModalOtp(true);
      }
    } catch (err) {
      console.error('onRequestOTP Error:', err);
      setLoading(false);
      rxAppSnackbar({message: err.toString()});
    }
  };

  /**
   * @function onVerifyOTP
   * @summary Function to verifying OTP from User
   */
  const onVerifyOTP = async () => {
    console.log('onVerifyOTP: Verifying code', dataReq.otp);
    try {
      // 统一手机号格式：仅保留数字
      const digitsOnly = String(dataReq.phoneNumber || '').replace(/\D/g, '');
      const res = await verifyOTP({
        params: {
          otp: dataReq.otp,
          phonenumber: digitsOnly,
        },
        paramsOpt: {isReturn: true},
      });

      if (res) {
        console.log('onVerifyOTP: Code verified successfully');
        setModalOtp(false); // 验证成功，先关闭 OTP 弹窗

        // 验证成功后，更新状态移除 otp 标识，防止 Effect 再次触发 onVerifyOTP
        // 但保留其他数据用于注册
        setDataReq(prev => {
          const newData = {...prev};
          delete newData.otp;
          return newData;
        });

        await onRegister();
      }
    } catch (err) {
      console.error('onVerifyOTP Error:', err);
      if (mount.current) {
        setLoading(false);
        isRegisteringRef.current = false;
      }
      rxAppSnackbar({message: err.toString()});
    }
  };

  /**
   * @function onRegister
   * @summary Function to Signing up user
   */
  const onRegister = async () => {
    console.log('onRegister: Starting registration flow...');
    setLoading(true);

    // 直接使用 DateOfBirthField 传过来的 YYYY-MM-DD 格式
    const dob = dataReq.dateOfBirth || '';

    // 格式化手机号
    const rawPhone = routePhoneNumber || dataReq.phoneNumber || '';
    // 后端期望：E.164（带 +），如 +6281070xxxx；避免 rawPhone 为空时拼出 "+62"
    const phoneDigits = String(rawPhone).replace(/\D/g, '');
    const normalizedPhone =
      phoneDigits.length === 0
        ? ''
        : phoneDigits.startsWith('62')
        ? `+${phoneDigits}`
        : phoneDigits.startsWith('0')
        ? `+62${phoneDigits.slice(1)}`
        : `+62${phoneDigits}`;

    const variables = {
      email: dataReq.email || emailFromLogin,
      firstname: dataReq.firstName,
      lastname: dataReq.lastName,
      // 重要：如果手机号为空，不要传 phonenumber，避免把后端已有值覆盖成空/仅国家码
      ...(normalizedPhone ? {phonenumber: normalizedPhone} : {}),
      is_subscribed: !!dataReq.subscribeNewsletter,
      gender: parseInt(dataReq.gender, 10) || 9, // 默认 9 (Not Specified)
      date_of_birth: dob,
      hobbies: initialHobbies || [], // 传递已有的爱好或空数组
      access_token: currentAccessToken,
      request_channel: 'OFFICIAL_MALL',
    };

    try {
      // 如果 nextStep 是 COMPLETE_PROFILE，使用 updateCustomerCustom 接口
      const isCompleteProfile = nextStep === 'COMPLETE_PROFILE';
      const apiToCall = isCompleteProfile ? updateCustomerProfile : register;
      const apiName = isCompleteProfile
        ? 'updateCustomerCustom'
        : 'createCustomerCustom';

      let res;
      let resData;
      let retryCount = 0;
      const maxRetries = 1; // 最多重试一次

      // 仅注册接口 createCustomerCustom 需要 reCAPTCHA；资料补全接口 updateCustomerCustom 不需要
      let recaptchaData = {};
      if (!isCompleteProfile) {
        recaptchaData = await generateReCaptchaDataSafely();
      }

      // 尝试调用 API，如果 token 过期则刷新后重试
      while (retryCount <= maxRetries) {
        try {
          res = await apiToCall({
            params: variables,
            paramsOpt: {isReturn: true, opts: {...recaptchaData}},
          });

          // useCustomMutation 已提示请求错误，避免再显示注册失败 Alert。
          if (res instanceof Error) {
            if (mount.current) {
              setLoading(false);
              rxAppLoading(false);
              isRegisteringRef.current = false;
            }
            return;
          }

          console.log(
            `onRegister (${apiName}) Response:`,
            JSON.stringify(res, null, 2),
          );

          resData = res?.data?.[apiName];

          // 检查是否是 token 过期错误
          const errorMessage = resData?.message || '';
          const isExpired = isTokenExpiredError(errorMessage);

          if (isExpired && retryCount < maxRetries) {
            console.log('Access token expired, attempting to refresh...');

            // 尝试刷新 token
            const newTokens = await refreshAccessToken(refreshAccessTokenApi);

            if (newTokens && newTokens.access_token) {
              // 更新 variables 中的 access_token
              variables.access_token = newTokens.access_token;
              setCurrentAccessToken(newTokens.access_token); // 更新当前 access token
              retryCount++;
              console.log('Token refreshed, retrying request...');
              const {access_token, refresh_token, expires_in, customer_token} =
                newTokens || {};
              persistOAuthBundle({
                access_token,
                refresh_token,
                expires_in,
                customer_token,
              });
              continue; // 重试请求
            } else {
              // 刷新失败，跳出循环，显示错误
              console.warn('Failed to refresh access token');
              break;
            }
          } else {
            // 不是 token 过期错误，或者已经重试过，跳出循环
            break;
          }
        } catch (apiErr) {
          // API 调用错误，检查是否是 token 过期
          const apiErrorMessage = apiErr?.message || apiErr?.toString() || '';
          if (isTokenExpiredError(apiErrorMessage) && retryCount < maxRetries) {
            console.log(
              'Access token expired in catch, attempting to refresh...',
            );

            // 尝试刷新 token
            const newTokens = await refreshAccessToken(refreshAccessTokenApi);

            if (newTokens && newTokens.access_token) {
              // 更新 variables 中的 access_token
              variables.access_token = newTokens.access_token;
              setCurrentAccessToken(newTokens.access_token); // 更新当前 access token
              retryCount++;
              console.log('Token refreshed, retrying request...');
              const {access_token, refresh_token, expires_in, customer_token} =
                newTokens || {};
              persistOAuthBundle({
                access_token,
                refresh_token,
                expires_in,
                customer_token,
              });
              continue; // 重试请求
            } else {
              // 刷新失败，跳出循环
              console.warn('Failed to refresh access token in catch');
              break;
            }
          } else {
            // 不是 token 过期错误，或者已经重试过，抛出错误
            throw apiErr;
          }
        }
      }

      // 检查是否在重试后仍然失败且是 token 过期错误
      const finalErrorMessage = resData?.message || '';
      if (retryCount > 0 && isTokenExpiredError(finalErrorMessage)) {
        // 已经重试过但仍然失败，说明刷新 token 失败或刷新后的 token 仍然无效
        console.warn('Token refresh failed or refreshed token still invalid');
        if (mount.current) {
          setLoading(false);
          rxAppLoading(false);
          isRegisteringRef.current = false;
        }
        setAlert({
          type: TYPE_FAILED,
          message: 'Session expired. Please try again.',
        });
        return;
      }

      if (
        resData?.status === 'SUCCESS' ||
        resData?.status === 'success' ||
        resData?.status === true ||
        resData?.customer
      ) {
        if (mount.current) {
          setLoading(false);
          rxAppLoading(false); // 关闭全局 Loading
        }

        // 将获取到的 Token 保存到本地状态
        if (resData.token) {
          setFinalToken(resData.token);
        }

        // 特殊处理：邮箱登录后的 COMPLETE_PROFILE 流程，跳转到爱好选择页
        if (nextStep === 'COMPLETE_PROFILE') {
          const tokenToUse = resData.token || finalToken || currentAccessToken;
          if (tokenToUse) {
            // 只保存 token 到 Storage 和 finalToken，暂不更新 rxUserToken
            // 这样可以保持在当前导航栈，避免自动跳转
            await Storage.set(Storage.name.TOKEN, tokenToUse);
            await Storage.set(Storage.name.USER_TYPE, USER_CUSTOMER);
            setFinalToken(tokenToUse);
          }
          // 显示爱好选择页
          setShowHobbySelection(true);
          return;
        }

        // 正常注册流程：先显示注册成功对话框
        setShowSuccessModal(true);
      } else {
        console.warn('onRegister: Status not success', resData?.status);
        if (mount.current) {
          setLoading(false);
          rxAppLoading(false); // 关闭全局 Loading
          isRegisteringRef.current = false;
          // 显示错误消息，留在当前页面
          const errorMessage =
            resData?.message || 'Registration failed. Please try again.';
          setAlert({type: TYPE_FAILED, message: errorMessage});
        }

        // 检查是否是 token 过期错误（但已经重试过或无法刷新）
        const errorMessage = resData?.message || 'Operation failed';
        if (isTokenExpiredError(errorMessage)) {
          // Token 过期错误，但可能没有 refresh_token 或刷新失败
          setAlert({
            type: TYPE_FAILED,
            message: 'Session expired. Please try again.',
          });
          return;
        }

        // 检查是否是邮箱验证错误
        const isEmailVerificationError =
          errorMessage.toLowerCase().includes('verify') ||
          errorMessage.toLowerCase().includes('verification');

        if (isEmailVerificationError && variables.email) {
          // 如果是邮箱验证错误，在邮箱输入框下方显示错误
          setEmailVerificationError(errorMessage);
          setIsEmailVerified(false);
        } else {
          // 其他错误，显示全局提示
          setAlert({type: TYPE_FAILED, message: errorMessage});
        }
      }
    } catch (err) {
      console.error('onRegister Catch Error:', err);
      if (mount.current) {
        setLoading(false);
        rxAppLoading(false); // 关闭全局 Loading
        isRegisteringRef.current = false;
      }

      // 检查是否是 token 过期错误
      const errorMessage = err?.message || err?.toString() || '';
      if (isTokenExpiredError(errorMessage)) {
        rxAppSnackbar({message: 'Session expired. Please try again.'});
      } else {
        rxAppSnackbar({message: errorMessage});
      }
    }
  };

  /**
   * @function onSubmit
   * @param {Object} data - Fields from useForm
   * @summary Function callback for handleSubmit from useForm
   */
  const onSubmit = useCallback(
    async data => {
      // 清除之前的错误
      setAlert(false);
      setEmailVerificationError(null);

      // 检查邮箱验证：如果填写了邮箱但没有验证，阻止提交
      const email = data.email || emailFromLogin;
      const hasEmail = email && email.trim().length > 0;

      if (hasEmail && !isEmailVerified) {
        // 如果填写了邮箱但没有验证，显示错误并阻止提交
        setEmailVerificationError(
          'Please verify your email address before submitting.',
        );
        rxAppSnackbar({
          message: 'Please verify your email address before submitting.',
        });
        return;
      }

      if (!withOTP) {
        setLoading(true);
        setDataReq(data);
      }
      if (withOTP) {
        setLoading(true);
        await onRequestOTP(data);
      }
    },
    [withOTP, isEmailVerified, emailFromLogin],
  );

  /**
   * @function onVerifyCreate
   * @param {Object} data - Fields from useForm
   * @summary Function callback for handleSubmit
   * from useForm if module OTP enabled
   */
  const onVerifyCreate = useCallback(
    async data => {
      if (!_.isEmpty(dataReq)) {
        setDataReq({...dataReq, ...data});
      }
    },
    [dataReq],
  );

  /**
   * @function onCloseModal
   * @summary Function callback on close button modal OTP
   */
  const onCloseModal = useCallback(() => {
    if (dataReq.otp) {
      setDataReq({...dataReq, otp: null});
      setModalOtp(false);
    }
    setModalOtp(false);
  }, []);

  /**
   * @function onHobbyConfirm
   * @summary Function callback when user confirms hobby selection
   */
  const onHobbyConfirm = useCallback(
    async hobbies => {
      console.log('Saving hobbies:', JSON.stringify(hobbies, null, 2));

      // 获取 token（优先使用 finalToken，否则使用 currentAccessToken）
      const tokenToUse = finalToken || currentAccessToken;

      setLoading(true);
      try {
        const res = await collectHobbiesApi({
          params: {
            hobbies: hobbies,
          },
          paramsOpt: {
            isReturn: true,
            opts: {
              context: {
                headers: {
                  Authorization: tokenToUse ? `Bearer ${tokenToUse}` : '',
                },
              },
            },
          },
        });

      console.log('Collect Interests Response:', JSON.stringify(res, null, 2));

        // 爱好选择完成后，完成登录流程并跳转首页
        if (mount.current) {
          setLoading(false);
          setShowHobbySelection(false);
        }

        // 先重置导航栈到首页（在当前的 Auth 栈中操作
        navigationRef.current?.reset({
          index: 0,
          routes: [{key: tabsApp.name, name: tabsApp.name}],
        });

        // 更新全局状态并导航到首页
        await saveTokenAndUpdateUserState(tokenToUse);

      // 使用 setTimeout 确保状态更新后再导航
      setTimeout(() => {
        navReset(tabsApp.name);
      }, 0);
    } catch (err) {
      console.error('Save Interests Error:', err);

        // 对于补全资料流程，即使保存爱好失败也继续完成登录
        if (nextStep === 'COMPLETE_PROFILE') {
          if (mount.current) {
            setLoading(false);
            setShowHobbySelection(false);
          }

          // 更新全局状态并导航到首页
          await saveTokenAndUpdateUserState(tokenToUse);

          setTimeout(() => {
            navReset(tabsApp.name);
          }, 0);
        } else {
          // 普通注册流程，显示错误消息
          if (mount.current) {
            setLoading(false);
            const errorMessage =
              err?.message ||
              err?.toString() ||
              'Failed to save hobbies. Please try again.';
            setAlert({type: TYPE_FAILED, message: errorMessage});
          }
        }
      }
    },
    [collectHobbiesApi, finalToken, currentAccessToken],
  );

  /**
   * @function onSuccessModalOk
   * @summary Function callback when user clicks OK on success modal
   */
  const onSuccessModalOk = useCallback(async () => {
    setShowSuccessModal(false);

    // 正常注册流程：点击成功模块的 OK 后，跳转到爱好选择页面
    // 只有 COMPLETE_PROFILE 流程不需要爱好选择
    if (nextStep !== 'COMPLETE_PROFILE') {
      setShowHobbySelection(true);
      return;
    }

    // 否则（COMPLETE_PROFILE），直接完成登录流程并跳转首页
    const tokenToUse = finalToken || currentAccessToken;

    // 正式完成登录流程，更新全局状态
    await saveTokenAndUpdateUserState(tokenToUse);

    // 跳转到首页
    navReset(tabsApp.name);
  }, [finalToken, currentAccessToken, nextStep]);

  /**
   * @function onHobbySkip
   * @summary Function callback when user skips hobby selection
   */
  const onHobbySkip = useCallback(async () => {
    console.log('Hobby selection skipped');

    // 跳过爱好选择，直接完成登录流程并跳转首页
    const tokenToUse = finalToken || currentAccessToken;

    if (mount.current) {
      setShowHobbySelection(false);
    }

    // 先重置导航栈到首页（在当前的 Auth 栈中操作
    navigationRef.current?.reset({
      index: 0,
      routes: [{key: tabsApp.name, name: tabsApp.name}],
    });

    // 更新全局状态并导航到首页
    await saveTokenAndUpdateUserState(tokenToUse);

    // 使用 setTimeout 确保状态更新后再导航
    setTimeout(() => {
      navReset(tabsApp.name);
    }, 0);
  }, [finalToken, currentAccessToken]);

  /**
   * @function onEmailVerify
   * @summary Function to handle email verification button click
   */
  const onEmailVerify = useCallback(
    async email => {
      console.log('Requesting email verification for:', email);

      if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
        rxAppSnackbar({message: 'Please enter a valid email address'});
        return;
      }

      // 使用独立的邮箱验证 loading 状态，不影响 sign up 按钮的 loading
      setEmailVerificationLoading(true);

      let accessToken = currentAccessToken;
      let retryCount = 0;
      const maxRetries = 1;

      while (retryCount <= maxRetries) {
        try {
          const res = await verifyEmailApi({
            params: {
              email: email,
              accessToken: accessToken,
            },
            paramsOpt: {isReturn: true},
          });

          console.log('Verify Email Response:', JSON.stringify(res, null, 2));

          const resData = res?.data?.verifyEmail;
          const errorMessage = resData?.message || '';
          const status = resData?.status || '';

          // 检查是否是 token 过期错误
          const isExpired = isTokenExpiredError(errorMessage);
          if (isExpired && retryCount < maxRetries) {
            // 尝试刷新 token
            if (!refreshAccessTokenApi) {
              console.error('refreshAccessTokenApi is not available!');
              setEmailVerificationError('Session expired. Please try again.');
              break;
            }

            const newTokens = await refreshAccessToken(refreshAccessTokenApi);
            console.log(
              'Refresh token result:',
              newTokens ? 'success' : 'failed',
            );

            if (newTokens && newTokens.access_token) {
              accessToken = newTokens.access_token;
              setCurrentAccessToken(newTokens.access_token);
              retryCount++;
              console.log(
                'Token refreshed, retrying email verification with new token:',
                accessToken,
              );
              const {access_token, refresh_token, expires_in, customer_token} =
                newTokens || {};
              persistOAuthBundle({
                access_token,
                refresh_token,
                expires_in,
                customer_token,
              });
              continue; // 重试请求
            } else {
              // 刷新失败，显示错误
              console.warn(
                'Failed to refresh access token for email verification',
              );
              setEmailVerificationError('Session expired. Please try again.');
              break;
            }
          }

          // 如果已经重试过但仍然失败，或者不是 token 过期错误，处理结果
          // 检查是否是 VERIFIED_SUCCESS（邮箱已经验证过）
          const isVerifiedSuccess = status === 'VERIFIED_SUCCESS';

          // 支持多种成功状态：SUCCESS, success, true, SENT_VERIFIED_EMAIL
          const isSuccess =
            status === 'SUCCESS' ||
            status === 'success' ||
            status === true ||
            status === 'SENT_VERIFIED_EMAIL';

          if (isVerifiedSuccess) {
            // 邮箱已经验证成功，直接设置为已验证状态，不显示验证码弹框
            setEmailVerificationError(null);
            setAlert(false);
            setIsEmailVerified(true);
            // 显示成功消息
            if (resData?.message) {
              rxAppSnackbar({message: resData.message, type: 'success'});
            } else {
              rxAppSnackbar({
                message: 'Your email address has been verified successfully.',
                type: 'success',
              });
            }
          } else if (isSuccess) {
            // 清除之前的错误和 alert，避免与 toast 重复显示
            setEmailVerificationError(null);
            setAlert(false);
            setEmailToVerify(email);
            console.log(
              'Setting showEmailVerification to true for email:',
              email,
            );
            setShowEmailVerification(true);
            // 显示发送成功的 toast（带绿色对勾）
            if (resData?.message) {
              rxAppSnackbar({message: resData.message, type: 'success'});
            } else {
              rxAppSnackbar({
                message: 'Verification code has been sent to your email',
                type: 'success',
              });
            }
          } else {
            // 设置错误信息，在邮箱输入框下方显示
            const finalErrorMessage =
              errorMessage || 'Failed to send verification email';
            console.log('Setting email verification error:', finalErrorMessage);
            setEmailVerificationError(finalErrorMessage);
            // 同时显示全局 toast 提示
            rxAppSnackbar({message: finalErrorMessage});
          }
          break; // 成功或非 token 过期错误，跳出循环
        } catch (err) {
          console.error('Verify Email Error:', err);
          const errMessage = err?.message || err?.toString() || '';

          // 检查是否是 token 过期错误
          if (isTokenExpiredError(errMessage) && retryCount < maxRetries) {
            console.log(
              'Access token expired in email verification catch, attempting to refresh...',
            );

            // 尝试刷新 token
            const newTokens = await refreshAccessToken(refreshAccessTokenApi);

            if (newTokens && newTokens.access_token) {
              accessToken = newTokens.access_token;
              setCurrentAccessToken(newTokens.access_token);
              retryCount++;
              console.log('Token refreshed, retrying email verification...');
              const {access_token, refresh_token, expires_in, customer_token} =
                newTokens || {};
              persistOAuthBundle({
                access_token,
                refresh_token,
                expires_in,
                customer_token,
              });
              continue; // 重试请求
            } else {
              // 刷新失败，显示错误
              console.warn(
                'Failed to refresh access token for email verification in catch',
              );
              setEmailVerificationError('Session expired. Please try again.');
              break;
            }
          } else {
            // 不是 token 过期错误，或者已经重试过，显示错误
            rxAppSnackbar({message: errMessage});
            break;
          }
        }
      }

      if (mount.current) {
        setEmailVerificationLoading(false);
      }
    },
    [
      currentAccessToken,
      verifyEmailApi,
      refreshAccessTokenApi,
      isTokenExpiredError,
      refreshAccessToken,
      persistOAuthBundle,
    ],
  );

  /**
   * @function onEmailVerificationConfirm
   * @summary Function to handle email verification code confirmation
   */
  const onEmailVerificationConfirm = useCallback(
    async code => {
      console.log('Verifying email code:', code, 'for email:', emailToVerify);

      // 使用独立的邮箱验证 loading 状态，不影响 sign up 按钮的 loading
      setEmailVerificationLoading(true);
      try {
        const res = await confirmEmailApi({
          params: {
            email: emailToVerify,
            otp: code,
          },
          paramsOpt: {isReturn: true},
        });

        console.log('Confirm Email Response:', JSON.stringify(res, null, 2));

        const resData = res?.data?.confirmEmailVerification;
        if (
          resData?.status === 'SUCCESS' ||
          resData?.status === 'success' ||
          resData?.status === true
        ) {
          setIsEmailVerified(true);
          setShowEmailVerification(false);
          setEmailVerificationError(null);
          // 清除 alert，避免与 toast 重复显示
          setAlert(false);
          rxAppSnackbar({
            message: resData.message || 'Email verified successfully',
            type: 'success',
          });
          return true;
        } else {
          // 验证失败：显示错误 toast
          const errorMessage =
            resData?.message || 'Incorrect verification code';
          rxAppSnackbar({message: errorMessage});
          throw new Error(errorMessage);
        }
      } catch (err) {
        console.error('Confirm Email Error:', err);
        // 显示错误 toast
        const errorMessage =
          err?.message || err?.toString() || 'Failed to verify email code';
        rxAppSnackbar({message: errorMessage});
        // 抛出错误，以便 EmailVerification 组件捕获并在内部显示错误弹框
        throw err;
      } finally {
        if (mount.current) {
          setEmailVerificationLoading(false);
        }
      }
    },
    [emailToVerify, currentAccessToken, confirmEmailApi],
  );

  /**
   * @function onEmailVerificationResend
   * @summary Function to resend email verification code
   */
  const onEmailVerificationResend = useCallback(async () => {
    console.log('Resending verification code to:', emailToVerify);
    // 使用独立的邮箱验证 loading 状态，不影响 sign up 按钮的 loading
    setEmailVerificationLoading(true);
    let accessTokenToUse = currentAccessToken;
    let retryCount = 0;
    const maxRetries = 1;

    try {
      while (retryCount <= maxRetries) {
        const res = await verifyEmailApi({
          params: {
            email: emailToVerify,
            accessToken: accessTokenToUse,
          },
          paramsOpt: {isReturn: true},
        });

        // useCustomMutation 在 isReturn 模式下出错会 return Error，需要手动抛出
        if (res instanceof Error || (res?.message && !res?.data)) {
          throw res;
        }

        const resData = res?.data?.verifyEmail;
        const status = resData?.status;
        const message = resData?.message;

        const isSuccess =
          status === 'SUCCESS' ||
          status === 'success' ||
          status === true ||
          status === 'SENT_VERIFIED_EMAIL';

        // token 过期：刷新后重试一次
        if (
          message &&
          isTokenExpiredError(message) &&
          retryCount < maxRetries
        ) {
          const newTokens = await refreshAccessToken(refreshAccessTokenApi);
          if (newTokens?.access_token) {
            accessTokenToUse = newTokens.access_token;
            setCurrentAccessToken(newTokens.access_token);
            retryCount++;
            continue;
          }
        }

        if (isSuccess) {
          // 清除 alert，避免与 toast 重复显示
          setAlert(false);
          // 显示重新发送成功的 toast（带绿色对勾）
          if (message) {
            rxAppSnackbar({message: message, type: 'success'});
          } else {
            rxAppSnackbar({
              message: 'Verification code has been resent to your email',
              type: 'success',
            });
          }
          return message;
        }

        // 非成功：显示错误 toast
        if (message) {
          rxAppSnackbar({message: message});
        }
        throw new Error(message || 'RESEND_FAILED');
      }
    } catch (err) {
      const msg = err?.message || err?.toString();
      if (msg) {
        rxAppSnackbar({message: msg});
      }
      throw err;
    } finally {
      if (mount.current) {
        setEmailVerificationLoading(false);
      }
    }
  }, [
    emailToVerify,
    currentAccessToken,
    verifyEmailApi,
    refreshAccessTokenApi,
    isTokenExpiredError,
    refreshAccessToken,
  ]);

  /**
   * @function onEmailVerificationClose
   * @summary Function to close email verification modal
   */
  const onEmailVerificationClose = useCallback(() => {
    setShowEmailVerification(false);
  }, []);

  /**
   * @function onEmailChange
   * @summary Function to handle email change, clear verification state
   */
  const onEmailChange = useCallback(() => {
    // 当用户修改邮箱时，清除验证状态和错误
    setIsEmailVerified(false);
    setEmailVerificationError(null);
  }, []);

  /**
   * @function onFormError
   * @summary Function to handle form validation errors
   */
  const onFormError = useCallback(errors => {
    // 如果至少有一个必填字段没有输入值，显示 toast 消息
    if (errors && Object.keys(errors).length > 0) {
      rxAppSnackbar({message: 'Please enter the required information.'});
    }
  }, []);

  const onBackFromVerify = () => {
    // 从 routePhoneNumber 或 phone state 中提取电话号码（去掉国家代码）
    // 优先使用 routePhoneNumber，如果没有则使用 phone state
    let phoneNumberToFill = '';
    const phoneToProcess = routePhoneNumber || phone || '';
    if (phoneToProcess) {
      // 如果包含国家代码（如 +62），去掉它
      if (phoneToProcess.startsWith('+62')) {
        phoneNumberToFill = phoneToProcess.substring(3); // 去掉 "+62"
      } else if (phoneToProcess.startsWith('62')) {
        phoneNumberToFill = phoneToProcess.substring(2); // 去掉 "62"
      } else {
        phoneNumberToFill = phoneToProcess;
      }
    }

    // 强制重置导航栈到初始登录页，并带上重置参数、错误消息和电话号码
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

  return (
    <>
      <Views
        {...props}
        isOtpEnabled={
          withOTP && !isVerified && !isEmailSignup && !phoneVerified
        }
        onSubmit={onSubmit}
        onVerifyCreate={onVerifyCreate}
        loading={loading}
        modalOtp={modalOtp}
        setModalOtp={setModalOtp}
        phoneNumber={routePhoneNumber || phone}
        alert={alert}
        onCloseModal={onCloseModal}
        route={props.route}
        isEmailSignup={isEmailSignup}
        emailFromLogin={emailFromLogin}
        onEmailVerify={onEmailVerify}
        isEmailVerified={isEmailVerified}
        showEmailVerification={showEmailVerification}
        onEmailVerificationConfirm={onEmailVerificationConfirm}
        onEmailVerificationResend={onEmailVerificationResend}
        onEmailVerificationClose={onEmailVerificationClose}
        emailToVerify={emailToVerify}
        emailVerificationError={emailVerificationError}
        emailVerificationLoading={emailVerificationLoading}
        onEmailChange={onEmailChange}
        onFormError={onFormError}
        showSuccessModal={showSuccessModal}
        onSuccessModalOk={onSuccessModalOk}
        genderOptions={genderOptions}
        firstNameFromLogin={customerProfile?.firstname || firstNameFromLogin}
        lastNameFromLogin={customerProfile?.lastname || lastNameFromLogin}
        genderFromLogin={customerProfile?.gender || genderFromLogin}
        dobFromLogin={customerProfile?.date_of_birth || dobFromLogin}
        showHobbySelection={showHobbySelection}
        hobbyCategories={hobbyCategories}
        hobbyLoading={hobbyLoading}
        onHobbyConfirm={onHobbyConfirm}
        onHobbySkip={onHobbySkip}
        finalToken={finalToken}
        initialHobbies={initialHobbies}
        nextStep={nextStep}
        onBackFromVerify={onBackFromVerify}
        renderRecaptchaBridge={renderRecaptchaBridge}
      />
    </>
  );
};

export default Controller;
