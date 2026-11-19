import {FORM_FIELD} from '@app/helpers/Constants';
import i18next from 'i18next';

/**
 * @constant {Array} formSchema
 * @summary use as Add Address form fields
 */
export const formSchema = ({custom, defVal, isGuest}) => [
  {
    name: 'email',
    label: 'Email',
    textContentType: 'emailAddress',
    type: FORM_FIELD.INPUT,
    isVisible: isGuest,
    defaultValue: defVal ? defVal.email : '',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    styleProp: {marginBottom: 0},
    formInputInfo: i18next.t('cart.setPasswordGuestCheckout'),
    rules: {
      required: i18next.t('formError.required.email'),
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: i18next.t('formError.valid.email'),
      },
    },
  },
  {
    name: 'firstName',
    label: i18next.t('cart_checkout.label.firstName'),
    type: FORM_FIELD.INPUT,
    defaultValue: defVal ? defVal.firstname : '',
    autoCapitalized: 'words',
    textContentType: 'givenName',
    rules: {required: i18next.t('formError.required.firstName')},
  },
  {
    name: 'lastName',
    label: i18next.t('cart_checkout.label.lastName'),
    textContentType: 'familyName',
    type: FORM_FIELD.INPUT,
    defaultValue: defVal ? defVal.lastname : '',
    autoCapitalized: 'words',
    rules: {required: i18next.t('formError.required.lastName')},
  },
  /**
   {
     name: 'middleName',
     label: `${i18next.t('cart_checkout.label.middleName')} (${i18next.t(
       'optional',
     )})`,
     textContentType: 'givenName',
     type: FORM_FIELD.INPUT,
     defaultValue: defVal ? defVal.middlename : '',
     autoCapitalized: 'words',
   },
   */
  ...custom,
];
