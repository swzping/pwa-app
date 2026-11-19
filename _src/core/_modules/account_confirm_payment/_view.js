import React from 'react';
import {SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {formSchema} from '@app/_modules/account_confirm_payment/forms';
import Forms from '@app/components/_Forms/index';
import Appbar from '@app/components/AppBar';
import {FORM_FIELD} from '@app/helpers/Constants';
import ImagePicker from '@app/components/ImagePicker';

import styles from '@app/_modules/account_confirm_payment/styles';

const imagePicker = ({t, onSelectImage}) => {
  return (
    <ImagePicker
      label={t('account_confirm_payment.label.uploadImage')}
      callback={imageData => onSelectImage(imageData)}
    />
  );
};

function Views({navigation, loading, onSubmit, onError, onSelectImage, t}) {
  const forms = formSchema({
    custom: [
      {
        name: 'filename',
        type: FORM_FIELD.CUSTOM,
        renderItem: imagePicker({t, onSelectImage}),
      },
    ],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Appbar
        useBack
        title={t('account_confirm_payment.title.confirmPayment')}
      />
      <KeyboardAwareScrollView>
        <Forms
          fields={forms}
          onSubmit={onSubmit}
          onError={onError}
          loading={loading}
          buttonTitle={t('account_confirm_payment.title.confirmPayment')}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
export default Views;
