import React from 'react';
import {Text, Caption, Button} from 'react-native-paper';
import {navReset} from '@app/helpers/Navigation';
import CustomView from '@app/components/CustomView';
import {tabsApp} from '@root/swift.config';

import AppStyles from '@app/styles/app';

import styles from '@app/_modules/cart_thankyou/styles';

function ThankyouScreen({t, orderId}) {
  return (
    <CustomView style={AppStyles.flexCenter}>
      <CustomView style={styles.mainContainer}>
        <CustomView style={styles.contentContainer}>
          <Text>{t('cart_thankyou.view.thankYou')}</Text>
          <Caption>
            {t('cart_thankyou.view.orderNumber')} {orderId}
          </Caption>
        </CustomView>
        <Button mode="contained" onPress={() => navReset(tabsApp.name)}>
          {t('cart_thankyou.label.continueShipping')}
        </Button>
      </CustomView>
    </CustomView>
  );
}

export default ThankyouScreen;
