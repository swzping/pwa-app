import React from 'react';
import {SafeAreaView} from 'react-native';
import PropTypes from 'prop-types';
import {Caption, TouchableRipple} from 'react-native-paper';

import {modules} from '@root/swift.config';
import styles from '@app/_modules/account_update_information/styles';
import AppBarComponent from '@app/components/AppBar';
import FormComponent from '@app/components/_Forms/index';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

/**
 * @component UpdateAccountInformationView
 * @function FunctionName
 * @param {Object} Views.propTypes - defined on prop types
 * @summary Stateless Component for UpdateAccountInformation
 * @returns Components
 */
const Views = ({
  t,
  loading,
  formSchema,
  updateAccountInformation,
  onNavigateToChangePassword,
}) => {
  // Will render nothing when update account disable
  if (!modules.account_update_information.enable) {
    return null;
  }

  return (
    <SafeAreaView>
      <AppBarComponent
        useBack
        title={t('account_update_information.title.accountInformation')}
      />
      <KeyboardAwareScrollView style={styles.subContainer}>
        <FormComponent
          loading={loading}
          fields={formSchema}
          buttonTitle={t('account_update_information.label.save')}
          onSubmit={updateAccountInformation}
        />
        <TouchableRipple
          style={styles.footer}
          onPress={onNavigateToChangePassword}>
          <Caption style={styles.labelBold}>Change Password</Caption>
        </TouchableRipple>
      </KeyboardAwareScrollView>
    </SafeAreaView>
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
};

export default Views;
