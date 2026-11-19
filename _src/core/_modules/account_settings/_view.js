import React from 'react';
import {Switch} from 'react-native';
import {useTheme} from 'react-native-paper';
import NavBar from '@app/components/NavBar';
import FontSizeSelector from '@app/components/FontSizeSelector';
import _ from 'lodash';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';

const SettingsScreen = ({t, isDarkMode, onSwitchTheme}) => {
  const theme = useTheme();
  const {disabled} = _.get(theme, 'colors');
  return (
    <>
      <NavBar title={t('account_settings.title.settings')} />
      <CustomView
        style={{
          width: '100%',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: disabled,
          paddingHorizontal: 10,
          justifyContent: 'space-between',
          flexDirection: 'row',
        }}>
        <Text large>{t('account_settings.view.darkAppearance')}</Text>
        <Switch value={isDarkMode} onValueChange={onSwitchTheme} />
      </CustomView>
      <FontSizeSelector />
    </>
  );
};

export default SettingsScreen;
