import React from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

import NavBar from '@app/components/NavBar';
import RadioButton from '@app/components/RadioButton';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';

const Views = ({languages, selectedLanguage, changeLanguage}) => {
  const {t} = useTranslation();
  const LanguageItemBar = ({label, onPress}) => {
    return (
      <TouchableOpacity style={styles.barContainer} onPress={onPress}>
        <RadioButton selected={selectedLanguage === label} onPress={onPress} />
        <Text style={styles.itemText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <NavBar useBack title={t('account.language.title')} />
      <CustomView>
        {languages.map(language => {
          return (
            <LanguageItemBar
              label={language}
              key={language}
              onPress={() => changeLanguage(language)}
            />
          );
        })}
      </CustomView>
    </>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    alignItems: 'center',
    borderColor: Colors.GRAY_DARK,
    borderBottomWidth: 0.5,
    width: '100%',
    flexDirection: 'row',
    padding: 15,
  },
  itemText: {
    marginHorizontal: normalize(10),
  },
});

export default Views;
