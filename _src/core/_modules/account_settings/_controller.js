import React, {useState} from 'react';
import {useReactiveVar} from '@apollo/client';

import Views from '@app/_modules/account_settings/_view';
import {modules} from '@root/swift.config';
import {rxUserTheme} from '@app/services/cache';
import {Storage} from '@app/helpers/Storage';
import {DARK, LIGHT} from '@app/helpers/Constants';
import {useTranslation} from 'react-i18next';

const Settings = () => {
  if (!modules.account_settings.enable) {
    return null;
  }

  const userTheme = useReactiveVar(rxUserTheme);
  const [isDarkMode, setIsDarkMode] = useState(
    userTheme === 'dark' ? true : false,
  );
  const {t} = useTranslation();

  const onSwitchTheme = dark => {
    if (dark) {
      setIsDarkMode(true);
      rxUserTheme(DARK);
      Storage.set(Storage.name.USER_THEME, DARK);
    } else {
      setIsDarkMode(false);
      rxUserTheme(LIGHT);
      Storage.set(Storage.name.USER_THEME, LIGHT);
    }
  };

  return <Views t={t} isDarkMode={isDarkMode} onSwitchTheme={onSwitchTheme} />;
};

export default Settings;
