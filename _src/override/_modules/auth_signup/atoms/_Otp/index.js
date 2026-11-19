import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Feather';
import {Caption, Portal, Modal, Text} from 'react-native-paper';
import CustomView from '@app/components/CustomView';
import Forms from '@app/components/_Forms/index';

import styles from '@app/_modules/auth_signup/atoms/_Otp/styles';

/**
 * @component AtomOtpSignUp
 * @param {type} AtomOtpComponent.propTypes
 * @summary Atom Component for Sign up OTP
 * @returns Components
 */
function AtomOtpComponent({
  t,
  fields,
  modalOtp,
  loading,
  onVerifyCreate,
  onCloseModal,
  phoneNumber,
}) {
  return (
    <Portal>
      <Modal
        visible={modalOtp}
        dismissable={false}
        contentContainerStyle={styles.modalContainer}>
        <Icon
          name={'x'}
          size={30}
          style={styles.close}
          onPress={onCloseModal}
        />
        <Text style={styles.title}>{t('auth_signup.view.verifyPhone')}</Text>
        <Caption style={styles.caption}>
          {t('auth_signup.view.codeSent')} {phoneNumber}
        </Caption>

        <Forms
          fields={fields}
          buttonTitle={t('auth_signup.label.verifyAndCreate')}
          loading={loading}
          onSubmit={onVerifyCreate}
        />
        <CustomView row horizontalCenter verticalCenter>
          <Text style={styles.label}>
            {t('auth_signup.view.didntReceive')}{' '}
          </Text>
          <CustomView>
            <Text style={styles.labelBold}>
              {t('auth_signup.view.requestAgain')}
            </Text>
          </CustomView>
        </CustomView>
      </Modal>
    </Portal>
  );
}

AtomOtpComponent.propTypes = {
  // use for translation
  t: PropTypes.func.isRequired,
  // use for rendering Form Field
  fields: PropTypes.array.isRequired,
  //use for modal visibility state
  modalOtp: PropTypes.bool,
  //use for loader state
  loading: PropTypes.bool,
  // use for submit button onPress
  onVerifyCreate: PropTypes.func.isRequired,
  // use for closing modal
  onCloseModal: PropTypes.func.isRequired,
  // use for displaying phone number in modal
  phoneNumber: PropTypes.func.isRequired,
};

export default AtomOtpComponent;
