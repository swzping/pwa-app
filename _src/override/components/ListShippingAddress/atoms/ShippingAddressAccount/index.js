import React, {useEffect, useState} from 'react';
import {useReactiveVar} from '@apollo/client';
import {useIsFocused} from '@react-navigation/native';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import {DELETE_ADDRESS} from '@app/_modules/account/services/schema';
import {useTranslation} from 'react-i18next';
import {ScrollView} from 'react-native';
import {Button} from 'react-native-paper';
import {Colors} from '@app/styles';
import {
  rxUserInformation,
  rxUserAddresses,
  rxAppSnackbar,
} from '@app/services/cache';

import AtomShippingAddressAccountItem from '@app/components/ListShippingAddress/atoms/ShippingAddressAccount/_item';
import useCustomMutation from '@app/hooks/useCustomMutation';
import CustomView from '@app/components/CustomView/index';
import AtomModalShippingAddressForm from '@app/components/_AppModal/atoms/ModalShippingAddressForm/index';
import Text from '@app/components/Text/index';

const ListShippingAddressAccount = () => {
  const {onRefetchData: deleteAddressHook} = useCustomMutation({
    schema: DELETE_ADDRESS,
  });
  const {refetch} = useRefetchAddress();

  const isFocused = useIsFocused();
  useReactiveVar(rxUserInformation);
  const addressClientData = useReactiveVar(rxUserAddresses);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addresses, setAddressData] = useState([]);
  const [editAddressData, setEditAddressData] = useState({});
  const [deleteOverlayVisible, setDeleteOverlayVisible] = useState(null);
  const {t} = useTranslation();

  useEffect(() => {
    if (isFocused) {
      if (addressClientData) {
        setAddressData(addressClientData);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (addressClientData) {
      setAddressData(addressClientData);
    }
  }, [addressClientData]);

  const onDeleteAddress = async addressId => {
    try {
      const res = await deleteAddressHook({
        params: {
          id: addressId,
        },
        paramsOpt: {isReturn: true},
      });
      if (res?.data) {
        await refetch();
        setDeleteOverlayVisible(null);
        rxAppSnackbar({message: 'Address deleted'});
      }
    } catch (error) {
      rxAppSnackbar({message: 'Something went wrong'});
    }
  };

  const onCloseModal = () => {
    setEditAddressData({});
    setShowAddAddressModal(false);
  };

  const onUpdateAddress = address => {
    setEditAddressData(address);
    setShowAddAddressModal(true);
  };

  const isEmptyData = addresses?.length < 1;
  return (
    <>
      <ScrollView style={{flex: 1}}>
        {!isEmptyData && (
          <CustomView marginBottom={10}>
            {addresses &&
              addresses.map((address, index) => {
                return (
                  <AtomShippingAddressAccountItem
                    key={`atom-shipping-address-item-${index}`}
                    address={address}
                    deleteOverlayVisible={deleteOverlayVisible}
                    onUpdateAddress={() => onUpdateAddress(address)}
                    onDeleteAddress={onDeleteAddress}
                    setDeleteOverlayVisible={setDeleteOverlayVisible}
                  />
                );
              })}
          </CustomView>
        )}
        {isEmptyData && (
          <CustomView style={{marginTop: 20}}>
            <Text center>{t('account_myaccount.view.addressNotFound')}</Text>
          </CustomView>
        )}
      </ScrollView>
      <CustomView
        paddingTop={20}
        paddingBottom={20}
        width={'98%'}
        horizontalCenter
        verticalCenter
        safe>
        <Button
          mode={'outlined'}
          onPress={() => setShowAddAddressModal(true)}
          labelStyle={{fontWeight: 'bold', color: Colors.BLACK, fontSize: 12}}
          contentStyle={{paddingVertical: 5}}
          style={{
            borderRadius: 20,
          }}>
          {t('account_myaccount.btn.addAddress')}
        </Button>
      </CustomView>
      <AtomModalShippingAddressForm
        isEdit={editAddressData}
        show={showAddAddressModal}
        onClose={onCloseModal}
      />
    </>
  );
};

export default ListShippingAddressAccount;
