import React from 'react';
import {useTranslation} from 'react-i18next';
import {SafeAreaView} from 'react-native';
import {formSchema} from '@app/_modules/account_trackorder/forms';

import AppBar from '@app/components/AppBar';
import Forms from '@app/components/_Forms/index';

const TrackOrderScreen = ({loading, onPostData, onPostError}) => {
  const {t} = useTranslation();
  return (
    <SafeAreaView>
      <AppBar useBack title={t('account_trackorder.title.trackOrder')} />
      <Forms
        fields={formSchema}
        onSubmit={onPostData}
        onError={onPostError}
        loading={loading}
        buttonTitle={t('account_trackorder.label.trackOrder')}
      />
    </SafeAreaView>
  );
};

export default TrackOrderScreen;
