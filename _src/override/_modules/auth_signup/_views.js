import React, { useState } from 'react';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useNavigation } from '@react-navigation/native';

import { modules } from '@root/swift.config';

import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import Otp from '@app/_modules/auth_signup/atoms/_Otp';
import EmailVerification from '@app/_modules/auth_signup/atoms/EmailVerification';
import RegistrationSuccessModal from '@app/_modules/auth_signup/atoms/RegistrationSuccessModal';
import { formSchema, formSchemaOtp } from '@app/_modules/auth_signup/forms';
import styles from '@app/_modules/auth_signup/styles';
import Forms from '@app/components/_Forms/index';
import Alert from '@app/components/Alert';
import CloseConfirmModal from '@app/components/CloseConfirmModal';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf';
import SafeScreenView from '@app/components/SafeScreenView';
import { TYPE_FAILED } from '@app/helpers/Constants';
import { Colors } from '@app/styles';

import HobbySelection from './atoms/HobbySelection';

// Get phone number from route params
const getPhoneNumberFromParams = (route) => {
  return route?.params?.phoneNumber || '';
};

/**
 * @component AuthSignupView
 * @param {Object} Views.propTypes - defined using PropTypes
 * @profiler {Sentry}
 * @summary View Component for Sign Up
 * @returns Components
 */
const Views = ({
  isOtpEnabled,
  loading,
  modalOtp,
  onSubmit,
  onVerifyCreate,
  phoneNumber,
  alert,
  onCloseModal,
  route,
  isEmailSignup,
  emailFromLogin,
  onEmailVerify,
  isEmailVerified,
  showEmailVerification,
  onEmailVerificationConfirm,
  onEmailVerificationResend,
  onEmailVerificationClose,
  emailToVerify,
  emailVerificationError,
  emailVerificationLoading,
  onEmailChange,
  onFormError,
  showSuccessModal,
  onSuccessModalOk,
  genderOptions,
  firstNameFromLogin,
  lastNameFromLogin,
  genderFromLogin,
  dobFromLogin,
  showHobbySelection,
  hobbyCategories,
  hobbyLoading,
  onHobbyConfirm,
  onHobbySkip,
  finalToken,
  initialHobbies,
  nextStep,
  onBackFromVerify,
  renderRecaptchaBridge,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [showCloseConfirmDialog, setShowCloseConfirmDialog] = useState(false);
  const phoneFromParams = getPhoneNumberFromParams(route);
  // 只有 nextStep 是 COMPLETE_PROFILE 时才显示补全资料模式
  // SIGN_UP 应该显示正常的注册页面
  const isProfileCompletion = nextStep === 'COMPLETE_PROFILE';
  const fields = formSchema({
    phoneNumber: phoneFromParams || phoneNumber,
    email: emailFromLogin,
    firstName: firstNameFromLogin,
    lastName: lastNameFromLogin,
    gender: genderFromLogin,
    dob: dobFromLogin,
    isEmailSignup: isProfileCompletion,
    onEmailVerify: onEmailVerify,
    isEmailVerified: isEmailVerified,
    emailVerificationError: emailVerificationError,
    onEmailChange: onEmailChange,
    // 正常的 Sign up 页面和个人资料补全流程都需要邮箱验证
    requireEmailVerification: true,
    genderOptions: genderOptions,
    emailVerificationLoading: emailVerificationLoading,
  });

  return (
    <SafeScreenView>
      {!showHobbySelection && !showSuccessModal ? (
        <>
          <NavBar
            center
            useWhite
            useClose
            useBackPress={() => {
              setShowCloseConfirmDialog(true);
            }}
            titleBold
            title={isProfileCompletion ? 'Personal Information' : 'Register'}
            childrenRight={<CustomView width={'12%'} />}
          />
          <KeyboardAwareScrollView contentContainerStyle={styles.scrollContainer}>
            {/* 弹出 EmailVerification 弹框时，页面层的 alert 会被弹框遮住，
            所以这里不渲染，改为在弹框 overlay 最外层显示 */}
            <RenderIf condition={alert && !showEmailVerification}>
              <CustomView
                marginBottom={10}
                width={'90%'}
                style={{ alignSelf: 'center' }}>
                <Alert type={alert?.type} message={alert?.message} />
              </CustomView>
            </RenderIf>
            <Forms
              fields={fields}
              buttonTitle={isProfileCompletion ? 'NEXT' : 'SIGN UP'}
              buttonLabelColor={Colors.WHITE}
              buttonLabelStyle={{color: Colors.WHITE}}
              buttonStyle={{ backgroundColor: Colors.PRIMARY }}
              loading={loading}
              onSubmit={onSubmit}
              onError={onFormError}
            />
            {isOtpEnabled && (
              <Otp
                t={t}
                fields={formSchemaOtp}
                modalOtp={modalOtp}
                loading={loading}
                onVerifyCreate={onVerifyCreate}
                onCloseModal={onCloseModal}
                phoneNumber={phoneNumber}
              />
            )}
          </KeyboardAwareScrollView>
        </>
      ) : showHobbySelection && !showSuccessModal ? (
        <HobbySelection
          onConfirm={onHobbyConfirm}
          onSkip={onHobbySkip}
          tempToken={finalToken || route?.params?.tempToken}
          hobbyCategories={hobbyCategories}
          initialHobbies={initialHobbies}
          loading={loading}
          hobbyLoading={hobbyLoading}
        />
      ) : null}

      {/* Email Verification Modal - 使用覆盖层模式，避免挡住全局 toast */}
      <EmailVerification
        visible={showEmailVerification}
        email={emailToVerify}
        onClose={onEmailVerificationClose}
        onConfirm={onEmailVerificationConfirm}
        onResend={onEmailVerificationResend}
        loading={emailVerificationLoading}
        outerAlert={alert}
        useOverlayInsteadOfModal
      />

      {/* Registration Success Modal - 只有在 showSuccessModal 为 true 时显示 */}
      {showSuccessModal && (
        <RegistrationSuccessModal
          visible={showSuccessModal}
          onOk={onSuccessModalOk}
        />
      )}

      {/* Close Confirm Dialog：注册 / 补充信息点击返回时弹出，确认后回到登录/注册页 */}
      <CloseConfirmModal
        visible={showCloseConfirmDialog}
        onCancel={() => {
          // Close 按钮：关闭弹框，留在当前页面
          setShowCloseConfirmDialog(false);
        }}
        onConfirm={() => {
          // Back 按钮：回到登录页并显示错误消息
          setShowCloseConfirmDialog(false);
          if (onBackFromVerify) {
            onBackFromVerify();
          } else {
            // 兜底逻辑：如果 onBackFromVerify 没传，手动执行 reset
            navigation.reset({
              index: 0,
              routes: [{
                name: modules.auth_signin.name,
                params: {
                  forceReset: true,
                  alert: { type: TYPE_FAILED, message: 'Sign-in/Sign-up Unsuccessful.' },
                },
              }],
            });
          }
        }}
      />

      {/* reCAPTCHA hidden WebView */}
      {renderRecaptchaBridge()}
    </SafeScreenView>
  );
};

Views.propTypes = {
  // use to determined is module otp enabled
  isOtpEnabled: PropTypes.bool.isRequired,
  //  loading state to disable/enable submit button
  loading: PropTypes.bool.isRequired,
  // use to determined modal visibility
  modalOtp: PropTypes.bool,
  // used as a callback function for submit button
  onSubmit: PropTypes.func.isRequired,
  // used as a callback function on verify otp button
  onVerifyCreate: PropTypes.func,
  // used to display phone number on modal otp
  phoneNumber: PropTypes.string,
  // used to close the otp modal
  onCloseModal: PropTypes.func,
  // route params
  route: PropTypes.object,
  // email verification props
  onEmailVerify: PropTypes.func,
  isEmailVerified: PropTypes.bool,
  showEmailVerification: PropTypes.bool,
  onEmailVerificationConfirm: PropTypes.func,
  onEmailVerificationResend: PropTypes.func,
  onEmailVerificationClose: PropTypes.func,
  emailToVerify: PropTypes.string,
  emailVerificationError: PropTypes.string,
  emailVerificationLoading: PropTypes.bool,
  onEmailChange: PropTypes.func,
  onFormError: PropTypes.func,
  showSuccessModal: PropTypes.bool,
  onSuccessModalOk: PropTypes.func,
  showHobbySelection: PropTypes.bool,
  hobbyLoading: PropTypes.bool,
  hobbyCategories: PropTypes.array,
  onHobbyConfirm: PropTypes.func,
  onHobbySkip: PropTypes.func,
  finalToken: PropTypes.string,
  initialHobbies: PropTypes.array,
  nextStep: PropTypes.string,
  // function to render reCAPTCHA hidden WebView
  renderRecaptchaBridge: PropTypes.func,
};

export default Views;
