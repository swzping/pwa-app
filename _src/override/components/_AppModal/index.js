import React from 'react';
import {
  TYPE_MODAL_AUTH_SIGNIN,
  TYPE_MODAL_PAYMENT_SNAP,
  TYPE_MODAL_SHIPPING_ADDRESS_FORM,
  TYPE_MODAL_SHIPPING_ADDRESS_LIST,
  TYPE_MODAL_SORT,
  TYPE_MODAL_SUBTOTAL_HELP,
} from '@app/helpers/Constants';

import AtomModalAuthSignin from '@app/components/_AppModal/atoms/ModalAuthSignin/index';
import AtomModalShippingAddressForm from '@app/components/_AppModal/atoms/ModalShippingAddressForm/index';
import AtomModalShippingAddressList from '@app/components/_AppModal/atoms/ModalShippingAddressList/index';
import AtomModalPaymentSnap from '@app/components/_AppModal/atoms/ModalPaymentSnap/index';
import AtomModalSort from '@app/components/_AppModal/atoms/ModalSort/index';
import AtomModalSubtotalHelp from '@app/components/_AppModal/atoms/ModalSubtotalHelp/index';

const AppModal = props => {
  if (props?.type === TYPE_MODAL_AUTH_SIGNIN) {
    return <AtomModalAuthSignin {...props} />;
  }
  if (props?.type === TYPE_MODAL_SHIPPING_ADDRESS_FORM) {
    return <AtomModalShippingAddressForm {...props} />;
  }
  if (props?.type === TYPE_MODAL_SHIPPING_ADDRESS_LIST) {
    return <AtomModalShippingAddressList {...props} />;
  }
  if (props?.type === TYPE_MODAL_PAYMENT_SNAP) {
    return <AtomModalPaymentSnap {...props} />;
  }
  if (props?.type === TYPE_MODAL_SORT) {
    return <AtomModalSort {...props} />;
  }
  if (props?.type === TYPE_MODAL_SUBTOTAL_HELP) {
    return <AtomModalSubtotalHelp {...props} />;
  }
  return null;
};

export default AppModal;
