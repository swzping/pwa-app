import {FORM_FIELD} from '@app/helpers/Constants';
import i18next from 'i18next';

/**
 * @constant {Array} formSchema
 * @summary use as Sign up form fields
 */
export const formSchema = [
  {
    name: 'fullName',
    label: i18next.t('customer_care.label.fullName'),
    type: FORM_FIELD.INPUT,
    defaultValue: '',
    autoCapitalized: 'words',
    textContentType: 'givenName',
    rules: {required: i18next.t('customer_care.required.required')},
  },
  {
    name: 'email',
    label: i18next.t('customer_care.label.email'),
    textContentType: 'emailAddress',
    type: FORM_FIELD.INPUT,
    defaultValue: '',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    rules: {
      required: i18next.t('customer_care.required.email'),
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: i18next.t('customer_care.error.email'),
      },
    },
  },
  {
    name: 'telephone',
    label: i18next.t('customer_care.label.telephone'),
    textContentType: 'telephoneNumber',
    keyboardType: 'phone-pad',
    type: FORM_FIELD.INPUT,
    defaultValue: '',
    affixLabel: '+62',
    rules: {required: i18next.t('customer_care.required.required')},
  },
  {
    name: 'message',
    label: i18next.t('customer_care.label.message'),
    type: FORM_FIELD.INPUT,
    defaultValue: '',
    autoCapitalized: 'words',
    textContentType: 'givenName',
    placeholder: 'Your Message ...',
    numberOfLines: 6,
    multiline: true,
    textStyleProp: {textAlignVertical: 'top'},
    rules: {required: i18next.t('customer_care.required.required')},
  },
];
