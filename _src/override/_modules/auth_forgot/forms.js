import {FORM_FIELD} from '@app/helpers/Constants';

/**
 * @constant {Array} formSchema
 * @summary use as Sign in form fields
 */
export const formSchema = [
  {
    name: 'email',
    label: 'Email address',
    textContentType: 'emailAddress',
    type: FORM_FIELD.INPUT,
    defaultValue: '',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    rules: {
      required: 'Email required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Entered value does not match email format',
      },
    },
  },
];
