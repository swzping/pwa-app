import React, {useEffect, useMemo, useState} from 'react';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account_update_information/_view';
import {formSchema} from '@app/_modules/account_update_information/forms';
import {UPDATE_PASSWORD} from '@app/_modules/account_update_information/services/schema';
import {
  BIND_PHONE_NUMBER_V2,
  REQUEST_RESEND_PHONE_OTP_V2,
  VERIFY_PHONE_OTP_V2,
} from '@app/_modules/auth_signin/services/schema';
import {
  CONFIRM_EMAIL_VERIFICATION,
  VERIFY_EMAIL,
} from '@app/_modules/auth_signup/services/schema';
import {
  GET_CUSTOMER_HOBBIES,
  GET_GENDER_OPTIONS,
  UPDATE_CUSTOMER_PROFILE,
} from '@app/_modules/auth_signup/services/schema';
import {
  ERROR_INVALID_CURRENT_PASSWORD,
  ERROR_INVALID_LOGIN_OR_PASSWORD,
  ERROR_INVALID_NEW_PASSWORD,
  ERROR_PHONE_NUMBER_EXIST,
  TYPE_FAILED,
} from '@app/helpers/Constants';
import {getErrorGQL} from '@app/helpers/General';
import {Storage} from '@app/helpers/Storage';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {useGoogleReCaptcha} from '@app/hooks/useGoogleReCaptcha';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {
  rxAppSnackbar,
  rxUserInformation,
  rxUserToken,
} from '@app/services/cache';
import {GET_USER_DATA} from '@app/services/queries/user';
import {syncCdpMemberId} from '@app/track/cdpUser';

/** 从接口/GraphQL 错误中提取真实报错文案，用于页面 Alert 展示 */
const getDisplayErrorMessage = err => {
  if (err == null) {
    return '';
  }
  const gql = getErrorGQL(err);
  if (gql?.message) {
    return gql.message;
  }
  if (err?.networkError?.message) {
    return err.networkError.message;
  }
  if (err?.message) {
    return String(err.message);
  }
  if (typeof err === 'string') {
    return err;
  }
  return err?.toString?.() || '';
};

/**
 * @component UpdateAccountInformation
 * @param {Object} navigation
 * @param {Object} route
 * @summary Controller for update account screen
 */
/**
 * 从完整号码（可能含 +62/62）中取出本地号码，用于输入框回填（区号由 CountryCodePicker 单独展示）
 */
const getLocalPhoneForDisplay = fullPhone => {
  if (!fullPhone || !String(fullPhone).trim()) {
    return '';
  }
  let cleaned = String(fullPhone).replace(/^\+/, '').replace(/\D/g, '');
  if (cleaned.startsWith('6262')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('62')) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

const UpdateAccountInformation = ({navigation, route}) => {
  if (!modules.account_update_information.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState(null);
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState(null);
  const [showEmailVerifyCodeScreen, setShowEmailVerifyCodeScreen] =
    useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [phoneVerificationStatus, setPhoneVerificationStatus] = useState(null);
  const [phoneVerificationLoading, setPhoneVerificationLoading] =
    useState(false);
  const [phoneVerificationError, setPhoneVerificationError] = useState(null);
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] =
    useState(false);
  const [showPhoneVerifyCodeScreen, setShowPhoneVerifyCodeScreen] =
    useState(false);
  const [phoneToVerify, setPhoneToVerify] = useState('');
  const [verificationMethod, setVerificationMethod] = useState('sms');
  // 仅当用户在本会话内完成验证时展示「验证成功」文案，初始化回填的已验证状态不展示
  const [showPhoneVerifiedMessage, setShowPhoneVerifiedMessage] =
    useState(false);
  const [showEmailVerifiedMessage, setShowEmailVerifiedMessage] =
    useState(false);
  const {onRefetchData: updateCustomerProfileHook} = useCustomMutation({
    schema: UPDATE_CUSTOMER_PROFILE,
  });
  const {onRefetchData: updatePasswordHook} = useCustomMutation({
    schema: UPDATE_PASSWORD,
  });
  // 使用和注册时相同的 mutation
  const {onRefetchData: verifyEmailApi} = useCustomMutation({
    schema: VERIFY_EMAIL,
  });
  const {onRefetchData: confirmEmailApi} = useCustomMutation({
    schema: CONFIRM_EMAIL_VERIFICATION,
  });
  const {onRefetchData: bindPhoneNumberV2} = useCustomMutation({
    schema: BIND_PHONE_NUMBER_V2,
  });
  const {onRefetchData: verifyPhoneOTPV2} = useCustomMutation({
    schema: VERIFY_PHONE_OTP_V2,
  });
  const {onRefetchData: requestResendPhoneOTPV2} = useCustomMutation({
    schema: REQUEST_RESEND_PHONE_OTP_V2,
  });

  // 手机号验证流程 reCAPTCHA：bindPhoneNumberV2 / requestResendPhoneOTPV2 / verifyPhoneOTPV2（formAction 与 pwa-guardian 保持一致）
  const {generateReCaptchaDataSafely, renderRecaptchaBridge} =
    useGoogleReCaptcha({
      currentForm: 'CUSTOMER_LOGIN',
      formAction: 'signUpModalPhone',
    });
  const userData = useReactiveVar(rxUserInformation);
  const {storeConfig} = useStoreConfig({useInitData: true});
  // login_radius_sms_enabled === false 时禁用 SMS 选项并置灰
  const smsDisabled = Boolean(
    storeConfig && storeConfig.login_radius_sms_enabled === false,
  );

  // 获取爱好分类数据
  const {data: hobbyData, loading: hobbyLoading} = useCustomQuery({
    schema: GET_CUSTOMER_HOBBIES,
    useInitData: true,
  });

  // 获取性别选项数据
  const {data: genderMetadata} = useCustomQuery({
    schema: GET_GENDER_OPTIONS,
    useInitData: true,
  });

  // 使用 useMemo 记忆化 hobbyCategories，避免每次渲染都创建新数组
  const hobbyCategories = useMemo(() => {
    return _.get(hobbyData, 'data.customerHobbies.items', []);
  }, [hobbyData]);

  // 使用 useMemo 记忆化 genderOptions
  const genderOptions = useMemo(() => {
    return _.get(
      genderMetadata,
      'data.customAttributeMetadata.items[0].attribute_options',
      [],
    );
  }, [genderMetadata]);

  // 使用 GET_USER_DATA 查询获取用户数据
  const {data: userDataQuery, loading: userDataLoading} = useCustomQuery({
    schema: GET_USER_DATA,
    useInitData: true,
    opts: {
      fetchPolicy: 'network-only',
    },
  });

  const customerData = userDataQuery?.data?.customer;

  // 使用 useMemo 来记忆化 hobbies 数据，避免每次渲染都重新计算
  const parsedHobbies = useMemo(() => {
    if (
      customerData?.hobbies &&
      Array.isArray(customerData.hobbies) &&
      customerData.hobbies.length > 0
    ) {
      const hobbies = customerData.hobbies.map(hobby => ({
        category: hobby.category,
        selectedOptions: hobby.selectedOptions || [],
      }));
      return hobbies;
    }
    return [];
  }, [customerData?.hobbies]);

  // 计算数据加载状态
  const isDataLoading = hobbyLoading || userDataLoading;

  // alert 自动消失（3 秒后消失）
  useEffect(() => {
    if (alert && alert.message) {
      const timer = setTimeout(() => {
        setAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    // 只在有 route 且数据准备好时才设置表单
    if (!route) {
      return;
    }

    // 等待爱好分类数据加载完成
    if (hobbyLoading) {
      return;
    }

    // 等待用户数据加载完成
    if (userDataLoading) {
      return;
    }

    if (customerData) {
      // 使用 GET_USER_DATA 查询的数据
      const firstname = customerData.firstname || '';
      const lastname = customerData.lastname || '';
      const email = customerData.customer_email || '';
      const phonenumber = customerData.phonenumber || '';
      const gender = customerData.gender || '';
      const date_of_birth = customerData.date_of_birth || '';

      // 只有当关键数据都存在时才设置表单（避免部分数据加载导致表单初始化不完整）
      // 至少需要有 firstname 和 lastname，其他字段可以为空
      if (!firstname || !lastname) {
        return;
      }
      // 号码回填不包含区号 62，仅显示本地号码（区号由 CountryCodePicker 单独展示）
      const phoneNumberForDisplay = getLocalPhoneForDisplay(phonenumber);
      const formSchemaState = formSchema({
        email: email,
        firstName: firstname,
        lastName: lastname,
        phoneNumber: phoneNumberForDisplay,
        gender: gender,
        dateOfBirth: date_of_birth,
        hobbies: parsedHobbies,
        hobbyCategories: hobbyCategories,
        genderOptions: genderOptions,
      });
      setForms(formSchemaState);
      // 使用号码注册/登录后该号码已验证，进入 personal info 无需再次验证，隐藏 Verify
      if (phoneNumberForDisplay) {
        setPhoneVerificationStatus('verified');
      }
      // 使用邮箱注册/登录后该邮箱已验证，进入 personal info 无需再次验证，隐藏 Verify
      if (email && email.trim()) {
        setEmailVerificationStatus('success');
      }
    } else if (userData) {
      // 如果没有 customerData，使用 userData 作为后备
      const {firstname, lastname, email, phonenumber, gender, date_of_birth} =
        userData;
      const phoneNumberForDisplay = getLocalPhoneForDisplay(phonenumber || '');
      const formSchemaState = formSchema({
        email: email,
        firstName: firstname,
        lastName: lastname,
        phoneNumber: phoneNumberForDisplay,
        gender: gender,
        dateOfBirth: date_of_birth,
        hobbies: [],
        hobbyCategories: hobbyCategories,
        genderOptions: genderOptions,
      });
      setForms(formSchemaState);
      if (phoneNumberForDisplay) {
        setPhoneVerificationStatus('verified');
      }
      if (email && email.trim()) {
        setEmailVerificationStatus('success');
      }
    }
  }, [
    route,
    customerData,
    userData,
    parsedHobbies,
    hobbyCategories,
    hobbyLoading,
    userDataLoading,
    genderOptions,
  ]);

  /**
   * @function updateAccountInformation
   * @param {Object} data - forms value {email, firstName, lastName}
   * @summary function callback onSubmit event from
   * useForm to update user information
   */
  const updateAccountInformation = async data => {
    setAlert(false);
    let saveFailed = false; // 有报错时不再执行 goBack，停留在当前页
    try {
      setLoading(true);
      let res;
      let result;
      let isUserError;
      // 检查是否有字段变化（号码比较使用规范化后的本地号码，因表单存的是不含区号的本地号）
      const userPhoneLocal = getLocalPhoneForDisplay(
        userData?.phonenumber || '',
      );
      const formPhoneLocal = getLocalPhoneForDisplay(
        (data.phoneNumber || '').trim().startsWith('+')
          ? (data.phoneNumber || '').trim()
          : '+62' + (data.phoneNumber || '').replace(/\D/g, ''),
      );
      const hasChanges =
        userData.firstname !== data.firstName ||
        userData.lastname !== data.lastName ||
        userPhoneLocal !== formPhoneLocal ||
        userData.gender !== data.gender ||
        customerData?.date_of_birth !== data.dateOfBirth ||
        JSON.stringify(parsedHobbies) !== JSON.stringify(data.hobbies || []);

      if (hasChanges) {
        // 使用 UPDATE_CUSTOMER_PROFILE 接口（$email: String! 不能为 null/undefined，空时传空字符）
        const updateParams = {
          email:
            data.email || customerData?.customer_email || userData.email || '',
          firstname: data.firstName,
          lastname: data.lastName,
        };

        // 添加可选字段 - phonenumber 需要添加 +62 前缀
        if (data.phoneNumber) {
          let phoneNumber = data.phoneNumber.trim();
          // 如果还没有 +62 前缀，添加它
          if (!phoneNumber.startsWith('+62')) {
            // 如果以 62 开头，添加 +
            if (phoneNumber.startsWith('62')) {
              phoneNumber = '+' + phoneNumber;
            } else if (phoneNumber.startsWith('0')) {
              // 如果以 0 开头，替换为 +62
              phoneNumber = '+62' + phoneNumber.substring(1);
            } else {
              // 其他情况，直接添加 +62
              phoneNumber = '+62' + phoneNumber;
            }
          }
          updateParams.phonenumber = phoneNumber;
        }

        // 添加 gender（转换为数字）
        if (
          data.gender !== undefined &&
          data.gender !== null &&
          data.gender !== ''
        ) {
          updateParams.gender =
            typeof data.gender === 'string'
              ? parseInt(data.gender, 10)
              : data.gender;
        }

        // 添加 date_of_birth
        if (data.dateOfBirth) {
          updateParams.date_of_birth = data.dateOfBirth;
        }

        // 添加 hobbies（转换格式）
        if (
          data.hobbies &&
          Array.isArray(data.hobbies) &&
          data.hobbies.length > 0
        ) {
          updateParams.hobbies = data.hobbies.map(hobby => ({
            category: hobby.category,
            selectedOptions: hobby.selectedOptions || [],
          }));
        } else {
          updateParams.hobbies = [];
        }

        res = await updateCustomerProfileHook({
          params: updateParams,
          paramsOpt: {
            isReturn: true,
          },
        });

        // 更新token
        const token = res?.data?.updateCustomerCustom?.token;
        if (token) {
          await Storage.set(Storage.name.TOKEN, token);
          rxUserToken(token);
        }

        try {
          await syncCdpMemberId();
        } catch (_e) {}

        // 接口报错时可能返回 err 而非 res；成功时在 res.data.updateCustomerCustom
        if (res?.graphQLErrors?.length || res?.message) {
          const errMsg = getDisplayErrorMessage(res) || res?.message || '';
          if (errMsg) {
            saveFailed = true;
            setLoading(false);
            setAlert({type: TYPE_FAILED, message: errMsg});
            return;
          }
        }
        const payload = res?.data?.updateCustomerCustom;
        const message = payload?.message;
        const status = payload?.status;
        const isStatusSuccess =
          status === true ||
          status === 'success' ||
          String(status).toLowerCase() === 'success';
        if (message) {
          isUserError = message.includes(ERROR_PHONE_NUMBER_EXIST);
          if (isUserError) {
            throw message;
          }
          // 仅在 status 非成功时把 message 当作报错（如 "Your account needs to be verified first"）；status 为 success 时的 message 不当作报错
          if (!isStatusSuccess) {
            saveFailed = true;
            setLoading(false);
            setAlert({type: TYPE_FAILED, message});
            return;
          }
        }
        rxAppSnackbar({
          message: t('account_update_information.message.profileUpdated'),
          type: 'success',
        });
      }
      if (data.newPassword) {
        try {
          result = await updatePasswordHook({
            params: {
              currentPassword: data.currentPassword,
              newPassword: data.newPassword,
            },
            paramsOpt: {isReturn: true},
          });
          const message = result?.message;
          if (message) {
            isUserError =
              message.includes(ERROR_INVALID_LOGIN_OR_PASSWORD) ||
              message.includes(ERROR_INVALID_CURRENT_PASSWORD) ||
              message.includes(ERROR_INVALID_NEW_PASSWORD);
            if (isUserError) {
              throw message;
            }
          }
          rxAppSnackbar({
            message: t('account_update_information.message.profileUpdated'),
            type: 'success',
          });
        } catch (error) {
          saveFailed = true;
          setLoading(false);
          const msg = getDisplayErrorMessage(error) || String(error);
          setAlert({type: TYPE_FAILED, message: msg || 'Something went wrong'});
          return;
        }
      }
      if (!saveFailed && !isUserError) {
        setLoading(false);
        // 保存成功后请求 LoyaltyCard 接口（姓名/手机号），更新 Apollo 缓存后首页和 MyAccount 的卡片会自动更新
        try {
          await syncCdpMemberId();
        } catch (_e) {}
        // 保存成功后停留当前页，不再 goBack（成功提示由上方 snackbar 展示）
        //  navigation.goBack();
      }
    } catch (err) {
      saveFailed = true;
      setLoading(false);
      const msg =
        getDisplayErrorMessage(err) ||
        (typeof err === 'string' ? err : err?.toString?.());
      setAlert({type: TYPE_FAILED, message: msg || 'Something went wrong'});
      return;
    }
  };

  /**
   * @function onSendEmailVerification
   * @summary 发送邮箱验证码
   */
  const onSendEmailVerification = async email => {
    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailVerificationError('Please enter a valid email address');
      return;
    }

    // 先不显示弹框，只开 loading，等接口返回成功后再显示验证码弹框
    setEmailToVerify(email);
    setEmailVerificationLoading(true);
    setEmailVerificationError(null);

    try {
      // 使用和注册时相同的 mutation 发送验证码
      // 已登录用户可能不需要 accessToken，传空字符串或 null
      const res = await verifyEmailApi({
        params: {
          email: email || '', // $email: String! 空时传空字符
          accessToken: '', // 已登录用户可能不需要 accessToken
        },
        paramsOpt: {isReturn: true},
      });

      if (res?.data?.verifyEmail) {
        const resData = res.data.verifyEmail;
        const status = resData?.status;

        // 检查是否是 VERIFIED_SUCCESS（邮箱已经验证过）
        const isVerifiedSuccess = status === 'VERIFIED_SUCCESS';

        // 支持多种成功状态：SUCCESS, success, true, SENT_VERIFIED_EMAIL
        const isSuccess =
          status === 'SUCCESS' ||
          status === 'success' ||
          status === true ||
          status === 'SENT_VERIFIED_EMAIL';

        if (isVerifiedSuccess) {
          // 邮箱已验证成功（VERIFIED_SUCCESS）：不弹验证码弹框，底部显示英文成功文案
          setEmailVerificationError(null);
          setEmailVerificationStatus('success');
          setShowEmailVerifiedMessage(true);
          setShowEmailVerifyCodeScreen(false);
          setEmailVerificationLoading(false);
        } else if (isSuccess) {
          // 清除之前的错误，再显示验证码弹框
          setEmailVerificationError(null);
          setEmailVerificationLoading(false);
          setShowEmailVerifyCodeScreen(true);
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
          throw new Error(
            resData?.message || 'Failed to send verification code',
          );
        }
      } else {
        throw new Error('Failed to send verification code');
      }
    } catch (err) {
      setEmailVerificationLoading(false);
      setEmailVerificationError(err.toString());
      // 如果发送失败，关闭弹框
      setShowEmailVerifyCodeScreen(false);
      setAlert({type: TYPE_FAILED, message: err.toString()});
    }
  };

  /**
   * @function onVerifyEmailCode
   * @summary 验证邮箱 OTP 码
   */
  const onVerifyEmailCode = async code => {
    setEmailVerificationLoading(true);
    setEmailVerificationError(null);

    try {
      // 使用和注册时相同的 mutation 验证验证码
      const res = await confirmEmailApi({
        params: {
          email: emailToVerify || '', // $email: String! 空时传空字符
          otp: code,
        },
        paramsOpt: {isReturn: true},
      });

      const resData = res?.data?.confirmEmailVerification;
      const isSuccess =
        resData?.status === 'SUCCESS' ||
        resData?.status === 'success' ||
        resData?.status === true;

      if (isSuccess) {
        // 验证成功，本会话内完成验证才在输入框下展示「验证成功」文案
        setEmailVerificationStatus('success');
        setShowEmailVerifiedMessage(true);
        setShowEmailVerifyCodeScreen(false);
        setEmailVerificationLoading(false);
        // 清除 alert，避免与 toast 重复显示
        setAlert(false);
        // 显示成功 toast（带绿色对勾）
        if (resData?.message) {
          rxAppSnackbar({message: resData.message, type: 'success'});
        } else {
          rxAppSnackbar({
            message: 'Email verified successfully',
            type: 'success',
          });
        }
        return true;
      } else {
        // 验证失败：显示错误 toast
        setEmailVerificationLoading(false);
        const errorMessage = resData?.message || 'Invalid verification code';
        rxAppSnackbar({message: errorMessage});
        throw new Error(errorMessage);
      }
    } catch (err) {
      // 验证失败：显示错误 toast
      setEmailVerificationLoading(false);
      const errorMessage =
        err?.message || err?.toString() || 'Failed to verify email code';
      rxAppSnackbar({message: errorMessage});
      throw err;
    }
  };

  /**
   * @function onResendEmailCode
   * @summary 重新发送邮箱验证码
   */
  const onResendEmailCode = async () => {
    setEmailVerificationLoading(true);
    try {
      // 使用和注册时相同的 mutation 重新发送验证码
      const res = await verifyEmailApi({
        params: {
          email: emailToVerify || '', // $email: String! 空时传空字符
          accessToken: '', // 已登录用户可能不需要 accessToken
        },
        paramsOpt: {isReturn: true},
      });

      if (res?.data?.verifyEmail) {
        const resData = res.data.verifyEmail;
        const status = resData?.status;
        const isSuccess =
          status === 'SUCCESS' ||
          status === 'success' ||
          status === true ||
          status === 'SENT_VERIFIED_EMAIL';

        if (isSuccess) {
          setEmailVerificationLoading(false);
          // 清除 alert，避免与 toast 重复显示
          setAlert(false);
          // 显示重新发送成功的 toast（带绿色对勾）
          if (resData?.message) {
            rxAppSnackbar({message: resData.message, type: 'success'});
          } else {
            rxAppSnackbar({
              message: 'Verification code has been resent to your email',
              type: 'success',
            });
          }
          return resData?.message;
        } else {
          // 显示错误 toast
          const errorMessage =
            resData?.message || 'Failed to resend verification code';
          rxAppSnackbar({message: errorMessage});
          throw new Error(errorMessage);
        }
      } else {
        const errorMessage = 'Failed to resend verification code';
        rxAppSnackbar({message: errorMessage});
        throw new Error(errorMessage);
      }
    } catch (err) {
      setEmailVerificationLoading(false);
      // 显示错误 toast
      const errorMessage =
        err?.message || err?.toString() || 'Failed to resend verification code';
      rxAppSnackbar({message: errorMessage});
      throw err;
    }
  };

  /**
   * @function onBackFromEmailVerify
   * @summary 从邮箱验证码界面返回，回到 personal info 并在邮箱输入框下展示错误提示
   */
  const onBackFromEmailVerify = () => {
    setShowEmailVerifyCodeScreen(false);
    setEmailVerificationLoading(false);
    setEmailVerificationError(
      'Verification cancelled. Please complete email verification.',
    );
  };

  /**
   * @function onEmailChange
   * @summary 邮箱改变时清除验证状态
   */
  const onEmailChange = () => {
    setEmailVerificationStatus(null);
    setEmailVerificationError(null);
  };

  /**
   * @function onSendPhoneVerification
   * @summary 发送电话号码验证码（弹窗之前校验：空、仅数字、长度）
   */
  const onSendPhoneVerification = phoneNumber => {
    if (!phoneNumber || phoneNumber.trim().length === 0) {
      setPhoneVerificationError('Please enter a valid phone number');
      return;
    }

    const trimmed = phoneNumber.trim();
    // 只允许数字与可选首位 +、中间空格；含其它特殊字符时在弹窗之前拦截
    const normalized = trimmed.replace(/^\+/, '').replace(/\s/g, '');
    const digitsOnly = normalized.replace(/\D/g, '');
    if (normalized.length !== digitsOnly.length || digitsOnly.length === 0) {
      setPhoneVerificationError('Please enter a valid phone number');
      return;
    }
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setPhoneVerificationError('Please enter a valid phone number');
      return;
    }

    // 清除之前的错误状态
    setPhoneVerificationError(null);

    // 显示验证方式选择模态框（同步操作，不阻塞 UI）
    setPhoneToVerify(phoneNumber);
    setShowPhoneVerificationModal(true);
  };

  /**
   * @function onClosePhoneVerificationModal
   * @summary 关闭验证方式选择模态框，回到 personal info 并在号码输入框下展示错误提示
   */
  const onClosePhoneVerificationModal = () => {
    setShowPhoneVerificationModal(false);
    setPhoneVerificationError(
      'Verification cancelled. Please complete phone verification.',
    );
  };

  /**
   * @function onSelectPhoneVerificationMethod
   * @summary 选择验证方式（WhatsApp 或 SMS）并发送 OTP
   */
  const onSelectPhoneVerificationMethod = async method => {
    // 先关闭选择方式弹框，只开 loading，等发送成功后再显示验证码弹框
    setVerificationMethod(method);
    setShowPhoneVerificationModal(false);
    setPhoneVerificationLoading(true);
    setPhoneVerificationError(null);
    setAlert(false); // 清除 alert，避免与 toast 重复显示

    try {
      // 格式化电话号码：移除重复的 62，确保格式为 +6217717892141
      let phoneId = phoneToVerify.replace(/^\+/, '').replace(/\D/g, ''); // 移除 + 和非数字字符
      // 移除重复的 62 前缀（如果以 6262 开头，只保留一个 62）
      if (phoneId.startsWith('6262')) {
        phoneId = '62' + phoneId.substring(4);
      } else if (phoneId.startsWith('62')) {
        // 已经是 62 开头，保持不变
      } else if (phoneId.startsWith('0')) {
        // 如果以 0 开头，移除 0 并添加 62
        phoneId = '62' + phoneId.substring(1);
      } else {
        // 其他情况，添加 62
        phoneId = '62' + phoneId;
      }
      phoneId = '+' + phoneId; // 添加 + 号

      // 发送 OTP（使用 bindPhoneNumberV2 接口）+ reCAPTCHA token（formAction 与 pwa-guardian 保持一致）
      const recaptchaData = await generateReCaptchaDataSafely();
      const res = await bindPhoneNumberV2({
        params: {
          phoneId: phoneId,
          method: method,
          access_token: '', // personal information 不需要 access_token
        },
        paramsOpt: {isReturn: true, opts: {...recaptchaData}},
      });

      const resData = res?.data?.bindPhoneNumberV2;
      if (resData?.success === true) {
        setPhoneVerificationLoading(false);
        setPhoneVerificationError(null); // 打开验证码弹框时清除之前的错误
        setShowPhoneVerifyCodeScreen(true);
        // 显示成功 toast（带绿色对勾）
        const message =
          resData?.message ||
          `Verification code has been sent via ${
            method === 'whatsapp' ? 'WhatsApp' : 'SMS'
          }`;
        rxAppSnackbar({
          message: message,
          type: 'success',
        });
      } else {
        // 后端返回 success: false 或 error（如手机号已注册）：关闭弹窗，错误在底部展示
        const errorMsg =
          resData?.message ||
          getDisplayErrorMessage(res) ||
          'Failed to send verification code';
        setPhoneVerificationLoading(false);
        setPhoneVerificationError(errorMsg);
        setShowPhoneVerifyCodeScreen(false);
        setShowPhoneVerificationModal(false);
      }
    } catch (err) {
      setPhoneVerificationLoading(false);
      const errorMessage =
        getDisplayErrorMessage(err) || 'Failed to send verification code';
      setPhoneVerificationError(errorMessage);
      setShowPhoneVerifyCodeScreen(false);
      setShowPhoneVerificationModal(false);
    }
  };

  /**
   * @function onVerifyPhoneCode
   * @summary 验证电话号码 OTP 码
   */
  const onVerifyPhoneCode = async code => {
    setPhoneVerificationLoading(true);
    setPhoneVerificationError(null);
    setAlert(false); // 清除 alert，避免与 toast 重复显示

    try {
      // 格式化电话号码：移除重复的 62，确保格式为 +6217717892141
      let phoneId = phoneToVerify.replace(/^\+/, '').replace(/\D/g, ''); // 移除 + 和非数字字符
      // 移除重复的 62 前缀（如果以 6262 开头，只保留一个 62）
      if (phoneId.startsWith('6262')) {
        phoneId = '62' + phoneId.substring(4);
      } else if (phoneId.startsWith('62')) {
        // 已经是 62 开头，保持不变
      } else if (phoneId.startsWith('0')) {
        // 如果以 0 开头，移除 0 并添加 62
        phoneId = '62' + phoneId.substring(1);
      } else {
        // 其他情况，添加 62
        phoneId = '62' + phoneId;
      }
      phoneId = '+' + phoneId; // 添加 + 号

      // 验证 OTP（使用 verifyPhoneOTPV2 接口，成功后 Magento 与 LR 同步更新）+ reCAPTCHA token
      const recaptchaData = await generateReCaptchaDataSafely();
      const res = await verifyPhoneOTPV2({
        params: {
          phoneId: phoneId,
          otp: code,
        },
        paramsOpt: {isReturn: true, opts: {...recaptchaData}},
      });

      const resData = res?.data?.verifyPhoneOTPV2;
      const isSuccess = resData?.status === 'success';

      if (isSuccess) {
        // 验证成功，本会话内完成验证才在输入框下展示「验证成功」文案
        setPhoneVerificationStatus('verified');
        setShowPhoneVerifiedMessage(true);
        setShowPhoneVerifyCodeScreen(false);
        setPhoneVerificationLoading(false);
        // 刷新 loyalty 卡片数据，使手机号即时更新（与 Save 按钮逻辑一致）
        try {
          await syncCdpMemberId();
        } catch (_e) {}
        return true;
      } else {
        // 验证失败：不关闭弹窗，停在当前页面，错误通过全局 toast 展示（与邮箱逻辑保持一致）
        const errorMessage = resData?.message || 'Invalid verification code';
        setPhoneVerificationLoading(false);
        rxAppSnackbar({message: errorMessage});
        return false;
      }
    } catch (err) {
      // 验证失败：不关闭弹窗，停在当前页面，错误通过全局 toast 展示（与邮箱逻辑保持一致）
      setPhoneVerificationLoading(false);
      const errorMessage =
        getDisplayErrorMessage(err) || 'Failed to verify phone code';
      rxAppSnackbar({message: errorMessage});
      return false;
    }
  };

  /**
   * @function onResendPhoneCode
   * @summary 重新发送电话号码验证码
   */
  const onResendPhoneCode = async () => {
    setAlert(false); // 清除 alert，避免与 toast 重复显示
    try {
      // 格式化电话号码：移除重复的 62，确保格式为 +6217717892141
      let phoneId = phoneToVerify.replace(/^\+/, '').replace(/\D/g, ''); // 移除 + 和非数字字符
      // 移除重复的 62 前缀（如果以 6262 开头，只保留一个 62）
      if (phoneId.startsWith('6262')) {
        phoneId = '62' + phoneId.substring(4);
      } else if (phoneId.startsWith('62')) {
        // 已经是 62 开头，保持不变
      } else if (phoneId.startsWith('0')) {
        // 如果以 0 开头，移除 0 并添加 62
        phoneId = '62' + phoneId.substring(1);
      } else {
        // 其他情况，添加 62
        phoneId = '62' + phoneId;
      }
      phoneId = '+' + phoneId; // 添加 + 号

      // 重新发送 OTP（使用 requestResendPhoneOTPV2 接口）+ reCAPTCHA token
      const recaptchaData = await generateReCaptchaDataSafely();
      const res = await requestResendPhoneOTPV2({
        params: {
          phoneId: phoneId,
          method: verificationMethod,
        },
        paramsOpt: {isReturn: true, opts: {...recaptchaData}},
      });

      const resData = res?.data?.requestResendPhoneOTPV2;
      if (resData?.success === true) {
        // 显示成功 toast（带绿色对勾）
        const message =
          resData?.message ||
          `Verification code has been resent via ${
            verificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'
          }`;
        rxAppSnackbar({
          message: message,
          type: 'success',
        });
      } else {
        // 后端返回 success: false（如手机号已注册）：关闭弹窗，错误在底部展示
        const errorMsg =
          resData?.message ||
          getDisplayErrorMessage(res) ||
          'Failed to resend verification code';
        setPhoneVerificationError(errorMsg);
        setShowPhoneVerifyCodeScreen(false);
        setShowPhoneVerificationModal(false);
      }
    } catch (err) {
      const errorMessage =
        getDisplayErrorMessage(err) || 'Failed to resend verification code';
      setPhoneVerificationError(errorMessage);
      setShowPhoneVerifyCodeScreen(false);
      setShowPhoneVerificationModal(false);
    }
  };

  /**
   * @function onBackFromPhoneVerify
   * @summary 从验证码界面返回，直接回到 personal info 并在号码输入框下展示错误提示
   */
  const onBackFromPhoneVerify = () => {
    setShowPhoneVerifyCodeScreen(false);
    setShowPhoneVerificationModal(false);
    setPhoneVerificationLoading(false);
    setPhoneVerificationError(
      'Verification cancelled. Please complete phone verification.',
    );
  };

  /**
   * @function onPhoneChange
   * @summary 电话号码改变时清除验证状态
   */
  const onPhoneChange = () => {
    setPhoneVerificationStatus(null);
    setPhoneVerificationError(null);
  };

  const controllerProps = {
    t,
    loading: loading,
    formSchema: forms,
    route,
    alert,
    navigation,
    updateAccountInformation,
    emailVerificationStatus,
    emailVerificationLoading,
    onSendEmailVerification,
    phoneVerificationStatus,
    phoneVerificationLoading,
    phoneVerificationError,
    onSendPhoneVerification,
    showPhoneVerificationModal,
    showPhoneVerifyCodeScreen,
    phoneToVerify,
    verificationMethod,
    onSelectPhoneVerificationMethod,
    onVerifyPhoneCode,
    onResendPhoneCode,
    onBackFromPhoneVerify,
    onPhoneChange,
    onClosePhoneVerificationModal,
    emailVerificationError,
    showEmailVerifyCodeScreen,
    emailToVerify,
    onVerifyEmailCode,
    onResendEmailCode,
    onBackFromEmailVerify,
    onEmailChange,
    isDataLoading,
    showPhoneVerifiedMessage,
    showEmailVerifiedMessage,
    smsDisabled,
    renderRecaptchaBridge,
  };

  return <Views {...controllerProps} />;
};

export default UpdateAccountInformation;
