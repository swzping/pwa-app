
import React from 'react';

import DateOfBirthField from '@app/_modules/auth_signup/atoms/DateOfBirthField';
import GenderField from '@app/_modules/auth_signup/atoms/GenderField';
import {FORM_FIELD} from '@app/helpers/Constants';

import EmailVerificationField from './atoms/EmailVerificationField';
import HobbiesField from './atoms/HobbiesField';
import PhoneNumberField from './atoms/PhoneNumberField';

/**
 * @constant {Array} formSchema
 * @summary use as Account Information form fields
 */
export const formSchema = ({
  firstName,
  lastName,
  hide,
  phoneNumber,
  whatsAppNumber,
  gender,
  dateOfBirth,
  email,
  hobbies,
  hobbyCategories,
  genderOptions = [],
}) => [
  {
    name: 'firstName',
    label: 'First Name*',
    type: FORM_FIELD.INPUT,
    defaultValue: firstName || '',
    autoCapitalized: 'words',
    textContentType: 'givenName',
    placeholder: 'First Name*',
    rules: {
      required: 'First Name is required',
    },
  },
  {
    name: 'lastName',
    label: 'Last Name*',
    textContentType: 'familyName',
    type: FORM_FIELD.INPUT,
    defaultValue: lastName || '',
    autoCapitalized: 'words',
    placeholder: 'Last Name*',
    rules: {
      required: 'Last Name is required',
    },
  },
  {
    name: 'gender',
    label: 'Gender*',
    type: FORM_FIELD.CUSTOM,
    defaultValue: gender || 'male',
    rules: {
      required: 'Gender is required',
    },
    renderItem: <GenderField />,
    extraProps: {
      options: genderOptions,
    },
  },
  {
    name: 'dateOfBirth',
    label: 'Date of Birth*',
    type: FORM_FIELD.CUSTOM,
    defaultValue: dateOfBirth || '',
    rules: {
      required: 'Date of Birth is required',
    },
    renderItem: <DateOfBirthField hideDescriptions={true} />,
    disabled: true, // 在 Personal Information 页面中，生日不能更改
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number*',
    type: FORM_FIELD.CUSTOM,
    defaultValue: phoneNumber || '',
    rules: {
      required: 'Phone Number is required',
      pattern: {
        value: /^(8[1-9][0-9]{7,10})$/,
        message: 'Please enter a valid phone number.',
      },
    },
    renderItem: <PhoneNumberField />,
    // extraProps will be passed from controller
  },
  {
    name: 'email',
    label: 'Email Address',
    type: FORM_FIELD.CUSTOM,
    defaultValue: email || '',
    rules: {
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'The email address format seems incorrect, please check it.',
      },
    },
    renderItem: <EmailVerificationField />,
    // extraProps will be passed from controller
  },
  {
    name: 'hobbies',
    label: 'Interests',
    type: FORM_FIELD.CUSTOM,
    defaultValue: hobbies || [],
    rules: {},
    renderItem: <HobbiesField />,
    extraProps: {
      hobbyCategories: hobbyCategories || [],
    },
  },
];
