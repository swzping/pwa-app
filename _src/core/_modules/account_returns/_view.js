import React from 'react';
import {Text} from 'react-native';
import {useTranslation} from 'react-i18next';

import {modules} from '@root/swift.config';

const Views = () => {
  const {t} = useTranslation();

  if (!modules.account_returns.enable) {
    return null;
  }
  return <Text>{t('account_returns.view.blankView')}</Text>;
};

export default Views;
