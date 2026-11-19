import React from 'react';
import {Button} from 'react-native-paper';
import {Colors, Typography} from '@app/styles';
import {useTranslation} from 'react-i18next';
import {IS_IOS} from '@app/helpers/Constants';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text/index';

const AtomShippingAddressAccountItem = ({
  address,
  deleteOverlayVisible,
  onUpdateAddress,
  onDeleteAddress,
  setDeleteOverlayVisible,
}) => {
  const {t} = useTranslation();

  const DeleteAddressOverlay = () => {
    if (deleteOverlayVisible !== address.addressId) {
      return null;
    }
    return (
      <CustomView
        horizontalCenter
        verticalCenter
        spaceBetween
        width={'100%'}
        height={'100%'}
        paddingVertical={10}
        backgroundColor={Colors.WHITE}
        style={{position: 'absolute', top: 20, left: 30, opacity: 0.95}}>
        <Button
          color={Colors.PRIMARY}
          onPress={() => onDeleteAddress(address.addressId)}
          style={{
            paddingHorizontal: 20,
            borderRadius: 25,
            borderColor: Colors.PRIMARY,
            borderWidth: 2,
          }}
          labelStyle={
            IS_IOS
              ? {
                  ...Typography.FONT_BOLD,
                  fontWeight: 'bold',
                }
              : {
                  ...Typography.FONT_BOLD,
                }
          }>
          {t('account_myaddress.label.delete')}
        </Button>
        <Button
          color={Colors.PRIMARY}
          onPress={() => setDeleteOverlayVisible(null)}
          style={{
            paddingHorizontal: 20,
            borderRadius: 25,
            borderColor: Colors.PRIMARY,
            borderWidth: 2,
          }}
          labelStyle={
            IS_IOS
              ? {
                  ...Typography.FONT_BOLD,
                  fontWeight: 'bold',
                }
              : {
                  ...Typography.FONT_BOLD,
                }
          }>
          {t('account_myaddress.label.cancel')}
        </Button>
      </CustomView>
    );
  };

  return (
    <CustomView
      paddingVertical={20}
      paddingHorizontal={30}
      style={{
        borderBottomWidth: 1,
        borderBottomColor: Colors.GRAY_LIGHT,
      }}>
      <Text bold style={{marginBottom: 10}}>
        {address.default_shipping
          ? t('account_myaddress.view.defaultShipping')
          : ''}
      </Text>
      <Text>
        {address.firstname} {address.lastname}
      </Text>
      {address.street.map((street, index) => {
        return <Text key={`street-${index}`}>{street}</Text>;
      })}
      <Text>
        {address.city} {address.region} {address.postcode}
      </Text>
      <Text>
        {t('account_myaddress.label.phone')}
        {': '}
        {address.telephone}
      </Text>
      <CustomView row marginTop={10}>
        <Text
          underline
          color={Colors.PRIMARY}
          style={{marginRight: 15}}
          onPress={onUpdateAddress}>
          {t('account_myaddress.btn.edit')}
        </Text>
        {!address.default_shipping && (
          <Text
            underline
            color={Colors.PRIMARY}
            onPress={() => setDeleteOverlayVisible(address.addressId)}>
            {t('account_myaddress.btn.delete')}
          </Text>
        )}
      </CustomView>
      <DeleteAddressOverlay />
    </CustomView>
  );
};

export default AtomShippingAddressAccountItem;
