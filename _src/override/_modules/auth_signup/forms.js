

import React from 'react';

import i18next from 'i18next';

import {FORM_FIELD} from '@app/helpers/Constants';

import DateOfBirthField from './atoms/DateOfBirthField';
import EmailField from './atoms/EmailField';
import GenderField from './atoms/GenderField';

/**
 * @constant {Array} formSchema
 * @summary use as Sign up OTP module form fields
 */
export const formSchemaOtp = [
  {
    name: 'otp',
    label: i18next.t('auth_signup.label.verificationCode'),
    textContentType: 'oneTimeCode',
    keyboardType: 'number-pad',
    type: 'Input',
    defaultValue: '',
    rules: {required: i18next.t('auth_signup.required.required')},
  },
];

/**
 * @constant {Array} formSchema
 * @summary use as Sign up form fields
 */
export const formSchema = ({
  phoneNumber: defaultPhoneNumber,
  email: defaultEmail,
  firstName: defaultFirstName,
  lastName: defaultLastName,
  gender: defaultGender,
  dob: defaultDob,
  isEmailSignup = false,
  onEmailVerify,
  isEmailVerified = false,
  emailVerificationError = null,
  onEmailChange,
  requireEmailVerification = false, // 只有 sign up 页面需要邮箱验证
  genderOptions = [], // 新增性别选项参数
  emailVerificationLoading = false, // 邮箱验证 loading 状态
} = {}) => [
  {
    name: 'firstName',
    label: 'First Name*',
    type: FORM_FIELD.INPUT,
    defaultValue: defaultFirstName || '',
    autoCapitalized: 'words',
    textContentType: 'givenName',
    placeholder: 'Enter your First name',
    maxLength: 51,
    rules: {
      required: 'Please enter your First Name',
      maxLength: {
        value: 50,
        message: 'only save 50 initial numbers',
      },
    },
  },
  {
    name: 'lastName',
    label: 'Last Name*',
    textContentType: 'familyName',
    type: FORM_FIELD.INPUT,
    defaultValue: defaultLastName || '',
    autoCapitalized: 'words',
    placeholder: 'Enter your Lasts name',
    maxLength: 51,
    rules: {
      required: 'Please enter your Last Name',
      maxLength: {
        value: 50,
        message: 'only save 50 initial numbers',
      },
    },
  },
  {
    name: 'gender',
    label: 'Gender*',
    type: FORM_FIELD.CUSTOM,
    defaultValue: defaultGender || '',
    rules: {
      required: 'Please select your Gender',
    },
    renderItem: <GenderField options={genderOptions} />,
  },
  {
    name: 'dateOfBirth',
    label: 'Date of Birth*',
    type: FORM_FIELD.CUSTOM,
    defaultValue: defaultDob || '',
    rules: {required: 'Please enter your Date of Birth'},
    renderItem: <DateOfBirthField hideDescriptions={isEmailSignup} />,
    disabled: false, // COMPLETE_PROFILE 阶段允许修改生日；Sign up 也可编辑
  },
  {
    name: 'email',
    label: 'Email address',
    type: FORM_FIELD.CUSTOM,
    defaultValue: defaultEmail || '',
    rules: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'The email address format seems incorrect, please check it.',
      },
    },
    renderItem: (
      <EmailField
        onVerify={onEmailVerify}
        isVerified={isEmailVerified}
        disabled={false} // 从邮箱登录时，邮箱可以更改和验证
        emailVerificationError={emailVerificationError}
        onEmailChange={onEmailChange}
        requireEmailVerification={requireEmailVerification}
        emailVerificationLoading={emailVerificationLoading}
      />
    ),
  },
  {
    name: 'phoneNumber',
    label: i18next.t('auth_signup.label.phoneNumber'),
    textContentType: 'telephoneNumber',
    keyboardType: 'phone-pad',
    type: FORM_FIELD.INPUT,
    defaultValue: defaultPhoneNumber || '',
    affixLabel: '+62',
    disabled: !!defaultPhoneNumber || isEmailSignup, // 如果已经有手机号或邮箱注册流程，禁用编辑
    rules: !!defaultPhoneNumber || isEmailSignup
      ? {} // 已经验证过的手机号不需要校验
      : {required: i18next.t('auth_signup.required.required')},
    isVisible: false, // Sign up 页面和 Personal information 页面都不显示手机号字段
  },
  // {
  //   name: 'whatsAppNumber',
  //   label: i18next.t('auth_signup.label.whatsAppNumber'),
  //   type: FORM_FIELD.CHECKBOX,
  //   defaultValue: false,
  // },
  {
    name: 'terms',
    label: null,
    type: FORM_FIELD.CHECKBOX,
    isTerms: true,
    defaultValue: false,
    rules: {required: 'You have to agree to the Privacy Policy & Terms and Conditions'},
    // isVisible: !isEmailSignup, // 邮箱登录流程（Personal information）不显示 Terms
  },
  // {
  //   name: 'subscribeNewsletter',
  //   label: i18next.t('auth_signup.label.subscribeNewsletter'),
  //   type: FORM_FIELD.CHECKBOX,
  //   defaultValue: false,
  // },
];
