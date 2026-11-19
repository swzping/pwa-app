

import i18next from 'i18next';

import {FORM_FIELD} from '@app/helpers/Constants';

/**
 * @constant {Array} formSchema
 * @summary use as Change password form fields
 */
export const formSchema = [
  {
    name: 'currentPassword',
    label: i18next.t('account_change_password.label.currentPassword'),
    textContentType: 'password',
    type: FORM_FIELD.INPUT,
    isPassword: true,
    defaultValue: '',
    rules: {
      required: i18next.t('account_change_password.required.currentPassword'),
      pattern: {
        value:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&=?_.,:;-]).{8,}$/,
        message: i18next.t('account_change_password.error.message'),
      },
    },
  },
  {
    name: 'newPassword',
    label: i18next.t('account_change_password.label.newPassword'),
    textContentType: 'password',
    type: FORM_FIELD.INPUT,
    isPassword: true,
    defaultValue: '',
    rules: {
      required: i18next.t('account_change_password.required.newPassword'),
      pattern: {
        value:
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%&=?_.,:;-]).{8,}$/,
        message: i18next.t('account_change_password.error.message'),
      },
    },
  },
];
