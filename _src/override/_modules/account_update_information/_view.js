import React from 'react';
import {ActivityIndicator, Platform, View} from 'react-native';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import {modules} from '@root/swift.config';

import PropTypes from 'prop-types';

import PhoneVerification from '@app/_modules/account_update_information/atoms/PhoneVerification';
import styles from '@app/_modules/account_update_information/styles';
import VerificationMethodModal from '@app/_modules/auth_signin/atoms/VerificationMethodModal';
import EmailVerification from '@app/_modules/auth_signup/atoms/EmailVerification';
import FormComponent from '@app/components/_Forms/index';
import Alert from '@app/components/Alert';
import CustomView from '@app/components/CustomView/index';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf';
import {FORM_FIELD} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {useKeyboardHeight} from '@app/hooks/useKeyboardHeight';
import {Colors} from '@app/styles';

/**
 * @component UpdateAccountInformationView
 * @function FunctionName
 * @param {Object} Views.propTypes - defined on prop types
 * @profiler {Sentry}
 * @summary Stateless Component for UpdateAccountInformation
 * @returns Components
 */
const Views = ({
  t,
  loading,
  alert,
  formSchema,
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
}) => {
  // Will render nothing when update account disable
  if (!modules.account_update_information.enable) {
    return null;
  }

  const keyboardHeight = useKeyboardHeight();

  // 跳转地址列表（Save 按钮上方的附加按钮）
  const onNavigateToMyAddress = () =>
    navigateTo(
      modules.account_myaddress.enable,
      modules.account_myaddress.name,
    );

  // 不再使用 VerifyCodeScreen，改用 PhoneVerification 弹框

  // 为邮箱和电话号码字段添加验证相关的 props
  const fieldsWithVerification = React.useMemo(() => {
    return formSchema.map(field => {
      if (field.name === 'email' && field.type === FORM_FIELD.CUSTOM) {
        return {
          ...field,
          extraProps: {
            verificationStatus: emailVerificationStatus,
            loading: emailVerificationLoading,
            onVerify: onSendEmailVerification,
            emailVerificationError: emailVerificationError,
            onEmailChange: onEmailChange,
            showVerifiedSuccessMessage: showEmailVerifiedMessage,
          },
        };
      }
      if (field.name === 'phoneNumber' && field.type === FORM_FIELD.CUSTOM) {
        return {
          ...field,
          extraProps: {
            onVerify: onSendPhoneVerification,
            isVerified: phoneVerificationStatus === 'verified',
            phoneVerificationError: phoneVerificationError,
            onPhoneChange: onPhoneChange,
            showVerifiedSuccessMessage: showPhoneVerifiedMessage,
            phoneVerificationLoading: phoneVerificationLoading,
          },
        };
      }
      return field;
    });
  }, [
    formSchema,
    emailVerificationStatus,
    emailVerificationLoading,
    onSendEmailVerification,
    emailVerificationError,
    onEmailChange,
    phoneVerificationStatus,
    phoneVerificationLoading,
    phoneVerificationError,
    onSendPhoneVerification,
    onPhoneChange,
    showPhoneVerifiedMessage,
    showEmailVerifiedMessage,
  ]);

  return (
    <View style={{flex: 1, backgroundColor: Colors.WHITE}}>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        childrenRight={<CustomView width={'12%'} />}
        title="My Profile"
      />
      {/* 报错/成功提示使用浮层，不占据页面布局 */}
      <RenderIf condition={alert}>
        <View
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            zIndex: 1000,
            paddingHorizontal: '5%',
            alignSelf: 'center',
          }}
          pointerEvents="box-none">
          <Alert type={alert?.type} message={alert?.message} />
        </View>
      </RenderIf>
      <KeyboardAwareScrollView
        style={{...styles.subContainer, flex: 1}}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === 'android' ? 100 : 0,
        }}
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'android' ? keyboardHeight + 32 : 0}
        keyboardShouldPersistTaps="handled">
        <RenderIf condition={isDataLoading}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 100,
            }}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </View>
        </RenderIf>
        <RenderIf
          condition={!isDataLoading && formSchema && formSchema.length > 0}>
          <FormComponent
            loading={loading}
            fields={fieldsWithVerification}
            buttonTitle="Save"
            onSubmit={updateAccountInformation}
            buttonLabelColor={Colors.WHITE}
            buttonStyle={{backgroundColor: Colors.PRIMARY}}
            extraButtonTitle="Add Address"
            onExtraButtonPress={onNavigateToMyAddress}
          />
        </RenderIf>
      </KeyboardAwareScrollView>

      {/* Verification Method Modal */}
      <VerificationMethodModal
        visible={showPhoneVerificationModal}
        onClose={onClosePhoneVerificationModal}
        onSelectWhatsApp={() => {
          requestAnimationFrame(() => {
            onSelectPhoneVerificationMethod('whatsapp');
          });
        }}
        onSelectSMS={() => {
          requestAnimationFrame(() => {
            onSelectPhoneVerificationMethod('sms');
          });
        }}
        smsDisabled={smsDisabled}
      />

      {/* Email Verification - 使用覆盖层模式，toast 可显示在弹框之上 */}
      <EmailVerification
        visible={showEmailVerifyCodeScreen}
        email={emailToVerify}
        onClose={onBackFromEmailVerify}
        onConfirm={onVerifyEmailCode}
        onResend={onResendEmailCode}
        loading={emailVerificationLoading}
        outerAlert={alert}
        useOverlayInsteadOfModal
      />

      {/* Phone Verification - 使用覆盖层模式，toast 可显示在弹框之上 */}
      <PhoneVerification
        visible={showPhoneVerifyCodeScreen}
        phoneNumber={phoneToVerify}
        verificationMethod={verificationMethod}
        onClose={onBackFromPhoneVerify}
        onConfirm={onVerifyPhoneCode}
        onResend={onResendPhoneCode}
        loading={phoneVerificationLoading}
        outerAlert={alert}
        useOverlayInsteadOfModal
      />

      {/* reCAPTCHA hidden WebView */}
      {renderRecaptchaBridge()}
    </View>
  );
};

Views.propTypes = {
  // translation for any labels
  t: PropTypes.func,
  //  loading state to disable/enable submit button
  loading: PropTypes.bool.isRequired,
  // form scheme fields for Forms
  formSchema: PropTypes.array.isRequired,
  // function callback onsubmit for Forms
  updateAccountInformation: PropTypes.func.isRequired,
  // function callback for button change password
  onNavigateToChangePassword: PropTypes.func,
  // function to render reCAPTCHA hidden WebView
  renderRecaptchaBridge: PropTypes.func,
};

export default Views;
