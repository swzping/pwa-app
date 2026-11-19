import React from 'react';
import Views from '@app/_modules/guardian_run_register/_view';
import Config from 'react-native-config';

const GuardianRunRegisterController = () => {
  const url = Config.GUARDIAN_RUN_REGISTER_URL;

  return <Views webViewUrl={url} />;
};

export default GuardianRunRegisterController;
