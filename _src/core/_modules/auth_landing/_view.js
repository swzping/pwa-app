import React from 'react';
import {Button} from 'react-native-paper';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';

const Views = ({t, onSkip}) => {
  return (
    <CustomView flex verticalCenter horizontalCenter>
      <RenderIf condition={modules.auth_signin.enable}>
        <CustomView marginVertical={10}>
          <Button
            mode="contained"
            style={{width: 150}}
            onPress={() =>
              navigateTo(modules.auth_signin.enable, modules.auth_signin.name)
            }>
            {t('auth_landing.btn.signin')}
          </Button>
        </CustomView>
      </RenderIf>

      <RenderIf condition={modules.auth_signup.enable}>
        <CustomView marginVertical={10}>
          <Button
            mode="contained"
            style={{width: 150}}
            onPress={() =>
              navigateTo(modules.auth_signup.enable, modules.auth_signup.name)
            }>
            {t('auth_landing.btn.signup')}
          </Button>
        </CustomView>
      </RenderIf>

      <CustomView style={{marginTop: 10}}>
        <Button mode="text" onPress={onSkip}>
          {t('auth_landing.btn.skip')}
        </Button>
      </CustomView>
    </CustomView>
  );
};

export default Views;
