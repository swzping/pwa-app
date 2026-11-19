import React from 'react';
import {Colors} from '@app/styles';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {TouchableRipple} from 'react-native-paper';

import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';
import RenderIf from '@app/components/RenderIf';
import CheckBox from '@app/components/CheckBox/index';

const AtomShippingAddressAccountItem = ({
  isSelected = false,
  address,
  onSelectedAddressItem,
  onUpdateAddress,
}) => {
  const {t} = useTranslation();

  return (
    <CustomView marginHorizontal={20} marginVertical={10}>
      <CustomView
        padding={20}
        border={1}
        borderRadius={10}
        borderColor={isSelected ? Colors.PRIMARY : Colors.GRAY_LIGHT}
        onPress={onSelectedAddressItem}>
        <RenderIf condition={address.default_shipping}>
          <CustomView
            paddingVertical={3}
            paddingHorizontal={15}
            marginBottom={10}
            borderRadius={5}
            backgroundColor={Colors.PRIMARY}
            style={{alignSelf: 'flex-start'}}>
            <Text color={'white'} bold style={{fontSize: 12}}>
              {t('account_myaddress.label.defaultShipping')}
            </Text>
          </CustomView>
        </RenderIf>
        <CustomView row horizontalCenter spaceBetween>
          <CustomView row horizontalCenter>
            <CheckBox
              checkedColor={Colors.PRIMARY}
              selected={isSelected}
              size={22}
            />
            <Text bold style={{fontSize: 16, marginLeft: 10}}>
              {address.firstname} {address.lastname}
            </Text>
          </CustomView>
          <TouchableRipple style={styles.btnOutline} onPress={onUpdateAddress}>
            <CustomView
              horizontalCenter
              paddingHorizontal={22}
              paddingVertical={5}>
              <Text bold style={{fontSize: 13, color: Colors.PRIMARY}}>
                {t('edit')}
              </Text>
            </CustomView>
          </TouchableRipple>
        </CustomView>
        <Text
          style={{fontSize: 14, lineHeight: 22, color: '#444', marginTop: 5}}>
          {address.telephone}
        </Text>
        {address.street.map(street => {
          return (
            <Text style={{fontSize: 14, lineHeight: 22, color: '#444'}}>
              {street}
            </Text>
          );
        })}
        <Text style={{fontSize: 14, lineHeight: 22, color: '#444'}}>
          {address.city} {address.region} {address.postcode}
        </Text>
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  btnOutline: {
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    borderRadius: 6,
  },
});

export default AtomShippingAddressAccountItem;
