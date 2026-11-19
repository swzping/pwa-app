import React from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {useTranslation} from 'react-i18next';

const NoData = ({condition, children}) => {
  const {t} = useTranslation();
  return (
    <CustomView style={{marginVertical: 30}}>
      <Text center> {t('label.noData')}</Text>
    </CustomView>
  );
};

export default NoData;
