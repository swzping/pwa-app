import React from 'react';
import {StyleSheet} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';

import {useReactiveVar} from '@apollo/client';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import {SET_PRODUCT_ALERT_NOTIFY} from '@app/components/ButtonNotifyMe/services/schema';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {USER_GUEST} from '@app/helpers/Constants';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {
  rxAppSnackbar,
  rxUserInformation,
  rxUserType,
} from '@app/services/cache';
import {Colors} from '@app/styles';

const ButtonNotifyMe = ({
  item,
  styleProp = {},
  textStyleProp = {},
  loading = false,
  isWishlistSlider = false,
}) => {
  const {t} = useTranslation();
  const userData = useReactiveVar(rxUserInformation);
  const userType = useReactiveVar(rxUserType);
  const {onRefetchData: setProductAlertNotify} = useCustomMutation({
    schema: SET_PRODUCT_ALERT_NOTIFY,
    useInitData: false,
    configErr: {
      isBypass: true,
    },
  });

  const onPressNotify = async () => {
    if (userType === USER_GUEST) {
      rxAppSnackbar({message: t('label.pleaseLoginFirst')});
    } else {
      try {
        const res = await setProductAlertNotify({
          paramsOpt: {isReturn: true},
          params: {
            email: userData?.email,
            productId: item?.id,
          },
        });
        if (res) {
          const message = _.get(res, 'data.ProductAlertNotifyInStock.message');
          rxAppSnackbar({message: message || res.message});
        }
      } catch (error) {
        console.log('[err] set notify me', error);
        rxAppSnackbar({message: error.message});
      }
    }
  };

  return (
    <CustomView horizontalCenter verticalCenter style={{width: '100%'}}>
      {/* <RenderIf condition={!isWishlistSlider}>
        <CustomView
          horizontalCenter
          verticalCenter
          spaceBetween
          paddingVertical={10}
          backgroundColor={Colors.WHITE}
          border={1}
          borderColor={Colors.GRAY_LIGHT}
          width={buttonAddWidth ? buttonAddWidth : defaultButtonAddWidth}>
          <Text color={Colors.GRAY_DARK}>{t('product_detail.oos')}</Text>
        </CustomView>
      </RenderIf> */}
      <CustomView
        row
        onPress={onPressNotify}
        borderColor={Colors.BLACK}
        borderRadius={4}
        horizontalCenter
        verticalCenter
        marginVertical={10}
        width={'100%'}
        backgroundColor={Colors.PRIMARY}
        style={[{borderColor: Colors.BLACK}, styleProp]}>
        <RenderIf condition={loading}>
          <ActivityIndicator
            style={{
              padding: 5,
            }}
          />
        </RenderIf>
        <RenderIf condition={!loading}>
          <CustomView row>
            <Text
              center
              color={Colors.WHITE}
              style={[styles.textStyle, textStyleProp]}>
              {t('notifyMe')}
            </Text>
          </CustomView>
        </RenderIf>
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    padding: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ButtonNotifyMe;
