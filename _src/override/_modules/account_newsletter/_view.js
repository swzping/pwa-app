import React from 'react';
import { View } from 'react-native';
import { formSchema } from '@app/_modules/account_newsletter/forms';

import Alert from '@app/components/Alert';
import RenderIf from '@app/components/RenderIf';
import AppBar from '@app/components/AppBar';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import Forms from '@app/components/_Forms/index';
import { Colors } from '@app/styles';

const NewsletterScreen = ({
  t,
  alert,
  loading,
  onPostData,
  onPostError,
  onPressCart,
}) => {
  return (
    <View>
      <AppBar useBack useCart onPressCart={onPressCart} />
      <CustomView paddingTop={30} horizontalCenter>
        <Text xlarge bold center>
          {t('account_newsletter.view.subscribeNewsletter')}
        </Text>
      </CustomView>
      <RenderIf condition={alert}>
        <CustomView
          width={'90%'}
          marginVertical={10}
          style={{ alignSelf: 'center' }}>
          <Alert type={alert?.type} message={alert?.message} />
        </CustomView>
      </RenderIf>
      <Forms
        fields={formSchema}
        onSubmit={onPostData}
        onError={onPostError}
        loading={loading}
        buttonTitle={t('account_newsletter.label.subscribe')}
        buttonLabelColor={Colors.WHITE}
        centerButton
      />
    </View>
  );
};

export default NewsletterScreen;
