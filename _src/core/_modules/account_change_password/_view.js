import React from 'react';
import { View } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Button } from 'react-native-paper';

import PropTypes from 'prop-types';
import { useForm } from 'react-hook-form';

import { formSchema } from '@app/_modules/account_change_password/forms';
import styles from '@app/_modules/account_change_password/styles';
import FormComponent, { useFormConfig } from '@app/components/_Forms/index';
import AppBarComponent from '@app/components/AppBar';
import { Colors } from '@app/styles';
/**
 * @component ChangePasswordView
 * @param {Object} Views.propTypes - defined on prop types
 * @constant {Array} formSchema
 * @profiler {Sentry}
 * @summary Stateless  view for change password screen
 * @returns Components
 */
const Views = ({ t, loading, changePassword }) => {
  const form = useForm(useFormConfig);
  return (
    <View>
      <AppBarComponent
        useBack
        title={t('account_change_password.title.changePassword')}
      />
      <KeyboardAwareScrollView
        style={styles.subContainer}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <FormComponent
          loading={loading}
          fields={formSchema}
          useFormExternal={form}
        />
      </KeyboardAwareScrollView>

      <View style={styles.bottomBar}>
        <Button
          color={Colors.WHITE}
          disabled={loading}
          loading={loading}
          onPress={form.handleSubmit(changePassword)}
          style={{ backgroundColor: Colors.PRIMARY, borderRadius: 12 }}
          contentStyle={{ paddingVertical: 10 }}
          labelStyle={{ fontWeight: 'bold', fontSize: 16, color: Colors.WHITE }}>
          Save
        </Button>
      </View>
    </View>
  );
};

Views.propTypes = {
  //translation for any labels
  t: PropTypes.func,
  // loading state for button in form
  loading: PropTypes.bool,
  //onSubmit callback to use in form
  changePassword: PropTypes.func.isRequired,
};

export default Views;
