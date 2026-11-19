import React, { useEffect, useMemo,useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { tabsApp } from '@root/swift.config';

import PropTypes from 'prop-types';

import styles from '@app/_modules/auth_signin/styles';
import Forms from '@app/components/_Forms/index';
import Alert from '@app/components/Alert';
import CloseConfirmModal from '@app/components/CloseConfirmModal';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import { navReset } from '@app/helpers/Navigation';

import PhoneNumberField from './atoms/PhoneNumberField';
import VerificationMethodModal from './atoms/VerificationMethodModal';
import VerifyCodeScreen from './atoms/VerifyCodeScreen';
import { createPasswordFormSchema, createPasswordLoginFormSchema,formSchema } from './forms';

/** 页面模式枚举 - 用于统一管理登录页的不同表单场景 */
export const FormTypeMap = {
  /** 登录/注册（手机号输入） */
  LOGIN: 'LOGIN',
  /** 创建密码（验证码校验通过后 next_step = ADD_PASSWORD） */
  CREATE_PASSWORD: 'CREATE_PASSWORD',
  /** 密码登录（已有密码的手机号，直接显示密码输入框） */
  PASSWORD_LOGIN: 'PASSWORD_LOGIN',
  /** 忘记密码（后续扩展） */
  FORGET_PASSWORD: 'FORGET_PASSWORD',
};

/**
 * ---------------------------------------------------- *
 * @component AuthSigningView
 * @param {Object} Views.propTypes - defined using PropTypes
 * @summary View Component for Sign In
 * @returns Components
 * ---------------------------------------------------- *
 */
const Views = ({
  t,
  loading,
  alert,
  background,
  onSignin,
  onError,
  onNavigateSignup,
  onNavigateEmailSignin,
  onNavigateForgot,
  onSelectVerificationMethod,
  onVerifyCode,
  onResendCode,
  showVerifyScreen,
  verifyPhoneNumber,
  handleCheckPhoneNumber,
  onShowPasswordInput,
  onBackToPhoneInput,
  onPasswordLogin,
  showPasswordInput,
  passwordPhoneNumber,
  formType,
  onCreatePasswordSubmit,
  createPasswordFormError,
  handleForgotPassword,
  onCancelForgotPassword,
  verifyMethod,
  onBackFromVerify,
  route,
  smsDisabled,
  showBindPhone,
  bindPhoneEmail,
  onBackFromBindPhone,
  onBackToHome,
  renderRecaptchaBridge,
  renderForgotPasswordRecaptchaBridge,
}) => {
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+62');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [useEmailSignin, setUseEmailSignin] = useState(false);
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const [phoneNumberError, setPhoneNumberError] = useState(null);
  const isLogin = useMemo(() => formType === FormTypeMap.LOGIN, [formType]);
  const isPasswordLogin = useMemo(() => formType === FormTypeMap.PASSWORD_LOGIN, [formType]);
  const isCreatePassword = useMemo(() => formType === FormTypeMap.CREATE_PASSWORD, [formType]);
  const isForgotPassword = useMemo(() => formType === FormTypeMap.FORGET_PASSWORD, [formType]);
  const passwordLoginFormSchema = useMemo(
    () => createPasswordLoginFormSchema(t),
    [t],
  );

  // 验证手机号格式
  const validatePhoneNumber = number => {
    if (!number || number.trim().length === 0) {
      return { message: 'Phone number is required.' };
    }
    // 验证手机号格式：只检查是否超过15位，不检查最小长度
    if (!/^(8[1-9][0-9]{7,10})$/.test(number)) {
      return { message: 'Please enter a valid phone number.' };
    }
    return null;
  };

  // 处理手机号变化
  const handlePhoneNumberChange = text => {
    setPhoneNumber(text);
  };

  // 处理实时验证变化（来自 PhoneNumberField）
  const handleValidationChange = error => {
    // 如果 PhoneNumberField 报告有错误，设置错误
    if (error) {
      setPhoneNumberError(error);
    } else {
      // 如果 PhoneNumberField 说没有错误（输入有效），清除所有错误
      // 包括点击 Next 时设置的"必须输入"错误
      setPhoneNumberError(null);
    }
  };

  const handleForgotPasswordPress = async () => {
    if (!handleForgotPassword) {
      return;
    }

    const opened = await handleForgotPassword();
    if (opened) {
      setShowVerificationModal(true);
    }
  };

  // 处理输入框失焦，显示验证错误
  const handlePhoneNumberBlur = () => {
    const error = validatePhoneNumber(phoneNumber);
    setPhoneNumberError(error);
  };

  useEffect(() => {
    if (route?.params?.useEmailSignin) {
      setUseEmailSignin(true);
    } else if (route?.params?.forceReset) {
      // 如果是强制重置，且没有 useEmailSignin，则回到手机号登录
      setUseEmailSignin(false);
    }

    // 如果 params 中有电话号码，自动填入
    if (route?.params?.phoneNumber) {
      setPhoneNumber(route?.params?.phoneNumber);
    }
  }, [route?.params]);

  const handlePhoneSignIn = async () => {
    // 先检查基础验证（是否为空、长度）
    const error = validatePhoneNumber(phoneNumber);
    if (error) {
      setPhoneNumberError(error);
      return;
    }

    // 检查是否为纯数字且不超过15位（实时验证）
    const isNumeric = /^\d+$/.test(phoneNumber);
    const isValidLength = phoneNumber.length <= 15;

    if (!isNumeric || !isValidLength) {
      // 如果超过15位，显示特定错误信息
      if (!isValidLength) {
        setPhoneNumberError({ message: 'only save 15 initial numbers' });
      } else {
        setPhoneNumberError({ message: 'Please enter a valid phone number.' });
      }
      return;
    }

    // 检查是否有实时验证错误（来自 PhoneNumberField）
    if (phoneNumberError) {
      return;
    }

    // 所有验证都通过，清除错误
    setPhoneNumberError(null);

    // 校验是否有密码
    const checkPhoneNumberRes = await handleCheckPhoneNumber(`${countryCode}${phoneNumber}`);

    // api error return undefined
    if(checkPhoneNumberRes === undefined) {
      return;
    }

    if (checkPhoneNumberRes) {
      // 有密码 -> 切换到密码输入模式
      if (onShowPasswordInput) {
        onShowPasswordInput(`${countryCode}${phoneNumber}`);
      }
    } else {
      // 无密码或异常 -> 弹出验证方式弹窗
      setShowVerificationModal(true);
    }
  };

  const handleSelectWhatsApp = async () => {
    // 先关闭弹窗，然后调用 API（API 调用中会显示 loading）
    setShowVerificationModal(false);
    if (onSelectVerificationMethod) {
      try {
        await onSelectVerificationMethod({
          phoneNumber: `${countryCode}${phoneNumber}`,
          method: 'whatsapp',
        });
        // 成功后会由 controller 导航，这里不需要处理
      } catch (err) {
        // 错误由 controller 处理，这里不需要额外处理
        console.error('handleSelectWhatsApp error:', err);
      }
    }
  };

  const handleSelectSMS = async () => {
    // 先关闭弹窗，然后调用 API（API 调用中会显示 loading）
    setShowVerificationModal(false);
    if (onSelectVerificationMethod) {
      try {
        await onSelectVerificationMethod({
          phoneNumber: `${countryCode}${phoneNumber}`,
          method: 'sms',
        });
        // 成功后会由 controller 导航，这里不需要处理
      } catch (err) {
        // 错误由 controller 处理，这里不需要额外处理
        console.error('handleSelectSMS error:', err);
      }
    }
  };

  // reCAPTCHA 隐藏 WebView：手机号登录/绑定手机号/验证码/邮箱登录各分支都可能触发带 reCAPTCHA 的接口，各分支均需挂载
  const recaptchaBridges = (
    <>
      {renderRecaptchaBridge()}
      {renderForgotPasswordRecaptchaBridge()}
    </>
  );

  // 绑定手机号页面（从邮箱登录来的）
  if (showBindPhone && !showVerifyScreen) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <NavBar
          center
          useWhite
          useClose
          useBackPress={() => setShowCloseConfirmDialog(true)}
          titleBold
          title=""
          childrenRight={<CustomView width={'12%'} />}
        />
        <ScrollView contentContainerStyle={styles.mainContainer}>
          <RenderIf condition={alert}>
            <CustomView width={'90%'} marginBottom={20} style={{ alignSelf: 'center' }}>
              <Alert type={alert?.type} message={alert?.message} />
            </CustomView>
          </RenderIf>

          {/* Main Title */}
          <Text style={styles.mainTitle}>Bind Phone Number</Text>

          {/* Instruction Text */}
          <Text style={styles.instructionText}>
            Please bind your phone number to ensure account security and successful login.
          </Text>

          {/* Phone Number Input Section */}
          <PhoneNumberField
            label="Phone Number*"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={handlePhoneNumberBlur}
            error={phoneNumberError}
            disabled={loading}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            onValidationChange={handleValidationChange}
          />

          {/* Next Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.primaryButtonDisabled,
            ]}
            onPress={() => {
              const error = validatePhoneNumber(phoneNumber);
              if (error) {
                setPhoneNumberError(error);
                return;
              }
              setPhoneNumberError(null);
              setShowVerificationModal(true);
            }}
            disabled={loading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {loading && <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />}
              <Text style={styles.primaryButtonText}>Next</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Verification Method Modal */}
        <VerificationMethodModal
          visible={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false);
            if (onCancelForgotPassword && formType === FormTypeMap.FORGET_PASSWORD) {
              onCancelForgotPassword();
            }
          }}
          onSelectWhatsApp={handleSelectWhatsApp}
          onSelectSMS={handleSelectSMS}
          loading={loading}
          smsDisabled={smsDisabled}
        />

        {/* reCAPTCHA hidden WebView */}
        {recaptchaBridges}

        {/* Close Confirm Dialog */}
        <CloseConfirmModal
          visible={showCloseConfirmDialog}
          onCancel={() => {
            // Close 按钮：关闭弹框，留在当前页面
            setShowCloseConfirmDialog(false);
          }}
          onConfirm={() => {
            // Back 按钮：回到首页并显示错误消息
            setShowCloseConfirmDialog(false);
            if (onBackToHome) {
              onBackToHome();
            }
          }}
        />
      </View>
    );
  }

  // 验证码页面
  if (showVerifyScreen) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <RenderIf condition={alert}>
          <View style={styles.errorAlert}>
            <Alert type={alert?.type} message={alert?.message} />
          </View>
        </RenderIf>

        <VerifyCodeScreen
          phoneNumber={verifyPhoneNumber}
          verificationMethod={verifyMethod}
          onConfirm={onVerifyCode}
          onResend={onResendCode}
          loading={loading}
          // 点击返回时，先弹出确认框
          onBack={() => setShowCloseConfirmDialog(true)}
        />

        {/* reCAPTCHA hidden WebView */}
        {recaptchaBridges}

        <CloseConfirmModal
          visible={showCloseConfirmDialog}
          onCancel={() => {
            // Close 按钮：关闭弹框，留在当前页面
            setShowCloseConfirmDialog(false);
          }}
          onConfirm={() => {
            // Back 按钮：回到首页并显示错误消息
            setShowCloseConfirmDialog(false);
            if (onBackToHome) {
              onBackToHome();
            }
          }}
        />
      </View>
    );
  }

  // 如果使用邮箱登录，显示老的登录界面
  if (useEmailSignin) {
    return (
      <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <NavBar
          center
          useWhite
          useClose
          useBackPress={() => {
            // 如果从 account 页面进入，返回 account 页面；否则回到首页
            if (route?.params?.fromAccount) {
              navigation.goBack();
            } else {
              navReset(tabsApp.name);
            }
          }}
          titleBold
          title={t('auth_signin.welcome_guardian') || 'Welcome to Guardian'}
        />
        <RenderIf condition={alert}>
          <View style={styles.errorAlert}>
            <Alert type={alert?.type} message={alert?.message} />
          </View>
        </RenderIf>
        <ScrollView contentContainerStyle={styles.emailSigninContainer}>
          {/* SIGN IN Title */}
          <Text style={styles.emailSigninTitle}>LOGIN</Text>

          {/* Instruction Text */}
          <Text style={styles.emailSigninInstruction}>
            Please enter your account information below to login!
          </Text>

          <Forms
            fields={formSchema}
            onSubmit={onSignin}
            onError={onError}
            loading={loading}
            buttonTitle="NEXT"
            buttonStyle={styles.emailSigninButton}
            buttonLabelStyle={styles.emailSigninButtonText}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={onNavigateForgot} style={styles.forgotPasswordLink}>
            <Text style={styles.forgotPasswordText}>
              {t('auth_signin.captionForgotPassword') || 'Forgot Password?'}
            </Text>
          </TouchableOpacity>

          {/* OR Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Sign in/Sign up with Phone Number Button */}
          <TouchableOpacity style={styles.phoneNumberButton} onPress={() => setUseEmailSignin(false)}>
            <Text style={styles.phoneNumberButtonText}>Login/Register with Phone Number</Text>
          </TouchableOpacity>
        </ScrollView>
        {/* reCAPTCHA hidden WebView */}
        {recaptchaBridges}
      </View>
    );
  }

  // ====== 主模板：根据 formType 渲染不同内容 ======
  // 密码模式下提取可读手机号
  let readablePhone = '';
  if (passwordPhoneNumber) {
    readablePhone = passwordPhoneNumber;
    if (readablePhone.startsWith('+62')) {
      readablePhone = readablePhone.substring(3);
    } else if (readablePhone.startsWith('62')) {
      readablePhone = readablePhone.substring(2);
    }
  }



  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <NavBar
        center
        useWhite
        useClose={isLogin}
        useBack={!isLogin}
        useBackPress={() => {
          if (isPasswordLogin) {
            if (onBackToPhoneInput) {
              onBackToPhoneInput();
            }
          } else if (isCreatePassword) {
            // navReset(tabsApp.name);
            onBackToPhoneInput();
          } else {
            // 如果从 account 页面进入，返回 account 页面；否则回到首页
            if (route?.params?.fromAccount) {
              navigation.goBack();
            } else {
              navReset(tabsApp.name);
            }
          }
        }}
        titleBold
        title={t('auth_signin.welcome_guardian') || 'Welcome to Guardian'}
        childrenRight={isLogin ? <CustomView width={'12%'} /> : null}
      />
      <RenderIf condition={alert}>
        <View style={styles.errorAlert}>
          <Alert type={alert?.type} message={alert?.message} />
        </View>
      </RenderIf>
      <ScrollView contentContainerStyle={styles.mainContainer}>
        {/* Main Title */}
        <Text style={styles.mainTitle}>
          {isCreatePassword && 'Create new password'}
          {(isLogin || isPasswordLogin || isForgotPassword) && 'Login/Register'}
        </Text>

        {/* Instruction Text */}
        {(isCreatePassword || isLogin) && (<Text style={styles.instructionText}>
          Please enter your account information below to login/register!
        </Text>)}

        {/* ====== 密码登录模式（PASSWORD_LOGIN） ====== */}
        {(isPasswordLogin || isForgotPassword) && (
          <>
            <View style={styles.phoneDisplayContainer}>
              <Text style={styles.phoneDisplayLabel}>Phone Number</Text>
              <Text style={styles.phoneDisplayText}>{countryCode} {readablePhone}</Text>
            </View>

            {/* Password Input */}
            <Forms
              formContainerStyle={styles.createPasswordFormContainer}
              fields={passwordLoginFormSchema}
              onSubmit={data => {
                if (onPasswordLogin) {
                  onPasswordLogin(passwordPhoneNumber, data.password);
                }
              }}
              onError={() => {}}
              loading={loading}
              buttonTitle="NEXT"
              buttonStyle={[styles.emailSigninButton, loading && styles.primaryButtonDisabled]}
              buttonLabelStyle={styles.primaryButtonText}
            />

            {/* Forgot Password Link */}
            <TouchableOpacity onPress={handleForgotPasswordPress} style={styles.forgotPasswordLinkPwd}>
              <Text style={styles.forgotPasswordTextPwd}>
                {t('auth_signin.captionForgotPassword') || 'Forgot Password?'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* ====== 手机号输入模式（LOGIN / CREATE_PASSWORD） ====== */}
        {isLogin && (
          <PhoneNumberField
            label="Phone Number*"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            onBlur={handlePhoneNumberBlur}
            error={phoneNumberError}
            disabled={loading}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            onValidationChange={handleValidationChange}
          />
        )}

        {/* ====== 创建密码表单（CREATE_PASSWORD） ====== */}
        {isCreatePassword && (
          <Forms
            formContainerStyle={styles.createPasswordFormContainer}
            fields={createPasswordFormSchema}
            onSubmit={onCreatePasswordSubmit}
            onError={() => {}}
            loading={loading}
            buttonTitle="NEXT"
            buttonStyle={styles.emailSigninButton}
            buttonLabelStyle={styles.primaryButtonText}
          />
        )}

        {/* ====== 主要按钮（LOGIN） ====== */}
        {!isCreatePassword && !isPasswordLogin && !isForgotPassword && (
          <TouchableOpacity
            style={[
              styles.primaryButton,
              loading && styles.primaryButtonDisabled,
              isLogin && phoneNumberError && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (isLogin) {
                // 手机号模式 -> 检查手机号
                handlePhoneSignIn();
              }
            }}
            disabled={loading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {loading && <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: 8 }} />}
              <Text style={styles.primaryButtonText}>
                {t('auth_signin.loginOrRegister')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ====== OR 分隔线 + Login with Email（仅 LOGIN 模式） ====== */}
          <>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>
            {/* If you have email account hint */}
            <Text style={styles.emailAccountHint}>If you already have an email account.</Text>
            {/* Secondary Email Sign In Button */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                if (onNavigateEmailSignin) {
                  onNavigateEmailSignin();
                } else {
                  setUseEmailSignin(true);
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Login with Email</Text>
            </TouchableOpacity>
          </>

        {/* ====== OR 分隔线 + Sign in with Email（CREATE_PASSWORD 模式） ====== */}
        {/* {isCreatePassword && (
          <>
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>OR</Text>
              <View style={styles.separatorLine} />
            </View>
            <Text style={styles.emailAccountHint}>If you already have an email account.</Text>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                if (onNavigateEmailSignin) {
                  onNavigateEmailSignin();
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Sign in with Email</Text>
            </TouchableOpacity>
          </>
        )} */}
      </ScrollView>

      {/* Verification Method Modal */}
      <VerificationMethodModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSelectWhatsApp={handleSelectWhatsApp}
        onSelectSMS={handleSelectSMS}
        loading={loading}
        smsDisabled={smsDisabled}
      />

      {/* Close Confirm Dialog */}
      <CloseConfirmModal
        visible={showCloseConfirmDialog}
        onCancel={() => {
          // Close 按钮：关闭弹框，留在当前页面
          setShowCloseConfirmDialog(false);
        }}
        onConfirm={() => {

          setShowCloseConfirmDialog(false);
          if (onBackToHome) {
            onBackToHome();
          }
        }}
      />

      {/* reCAPTCHA hidden WebView */}
      {recaptchaBridges}
    </View>
  );
};

Views.propTypes = {
  // use for displaying label from translation module
  t: PropTypes.func.isRequired,
  // use to determined loading state
  loading: PropTypes.bool,
  alert: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  background: PropTypes.string,
  // use as callback function on Submit
  onSignin: PropTypes.func.isRequired,
  // use as callback function for onError from the useForm
  onError: PropTypes.func,
  // use as callback on register touchable
  onNavigateSignup: PropTypes.func.isRequired,
  // use as callback for email sign in
  onNavigateEmailSignin: PropTypes.func,
  // use as callback for forgot password
  onNavigateForgot: PropTypes.func,
  // use as callback for verification method selection
  onSelectVerificationMethod: PropTypes.func,
  onVerifyCode: PropTypes.func,
  onResendCode: PropTypes.func,
  showVerifyScreen: PropTypes.bool,
  verifyPhoneNumber: PropTypes.string,
  handleCheckPhoneNumber: PropTypes.func,
  onShowPasswordInput: PropTypes.func,
  onBackToPhoneInput: PropTypes.func,
  onPasswordLogin: PropTypes.func,
  showPasswordInput: PropTypes.bool,
  passwordPhoneNumber: PropTypes.string,
  formType: PropTypes.string,
  onCreatePasswordSubmit: PropTypes.func,
  createPasswordFormError: PropTypes.object,
  verifyMethod: PropTypes.string,
  onBackFromVerify: PropTypes.func,
  onCancelForgotPassword: PropTypes.func,
  route: PropTypes.object,
  smsDisabled: PropTypes.bool,
  showBindPhone: PropTypes.bool,
  bindPhoneEmail: PropTypes.string,
  onBackFromBindPhone: PropTypes.func,
  onBackToHome: PropTypes.func,
  renderRecaptchaBridge: PropTypes.func,
  renderForgotPasswordRecaptchaBridge: PropTypes.func,
};

export default Views;
