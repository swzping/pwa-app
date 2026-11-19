import React from 'react';
import {Button} from 'react-native-paper';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text/index';

function MaintenanceModeScreen({t, onTryAgain, loading}) {
  return (
    <CustomView flex alignCenter horizontalCenter verticalCenter>
      <CustomView horizontalCenter verticalCenter margin={30}>
        <Text xlarge>{t('maintenance_mode.title')}</Text>
        <Text center>{t('maintenance_mode.subtitle')}</Text>
      </CustomView>
      <CustomView marginVertical={10}>
        <Button
          loading={loading}
          disabled={loading}
          mode="contained"
          style={{width: 150}}
          onPress={onTryAgain}>
          {t('maintenance_mode.button')}
        </Button>
      </CustomView>
    </CustomView>
  );
}

export default MaintenanceModeScreen;
