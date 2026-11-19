import React from 'react';
import {StyleSheet} from 'react-native';
import {Colors, MixinsNew} from '@app/styles/index';
import {useTranslation} from 'react-i18next';
import {TouchableRipple} from 'react-native-paper';

import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';

const styles = StyleSheet.create({
  btnOutline: {
    paddingHorizontal: 20,
    paddingVertical: 2,
    borderColor: Colors.GRAY_DARK2,
    borderWidth: 1,
    borderRadius: 50,
  },
});

const BoxAuth = ({onPressAuth}) => {
  const {t} = useTranslation();
  return (
    <CustomView
      border={1}
      borderColor={Colors.GRAY_DARK}
      borderRadius={5}
      paddingHorizontal={10}
      paddingVertical={20}
      marginBottom={20}
      width={MixinsNew.MAX_WIDTH - 30}>
      <CustomView>
        <Text center bold>
          {t('cart_checkout.signInForExpressCheckout')}
        </Text>
      </CustomView>
      <CustomView horizontalCenter marginTop={20}>
        <TouchableRipple onPress={onPressAuth} style={styles.btnOutline}>
          <Text bold>{t('login.title')}</Text>
        </TouchableRipple>
      </CustomView>
    </CustomView>
  );
};

export default BoxAuth;
