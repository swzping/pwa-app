import React, { useEffect, useState } from 'react';
import useCarts, { TYPES } from '@app/hooks/carts/useCarts';
import { StyleSheet } from 'react-native';
import { useReactiveVar } from '@apollo/client';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { TouchableRipple, Button } from 'react-native-paper';
import { Colors, Typography } from '@app/styles/index';
import { IS_IOS } from '@app/helpers/Constants';
import { rxUserAddresses, rxAppSnackbar } from '@app/services/cache';
import { useSelectShippingAddress } from '@app/hooks/useSelectShippingAddress';
import NavBar from '@app/components/NavBar/index';
import Icon from 'react-native-vector-icons/Feather';
import AtomShippingAddressCheckoutItem from '@app/components/ListShippingAddress/atoms/ShippingAddressCheckout/_item';
import Text from '@app/components/Text/index';
import CustomView from '@app/components/CustomView/index';
import RenderIf from '@app/components/RenderIf/index';
import AtomModalShippingAddressForm from '@app/components/_AppModal/atoms/ModalShippingAddressForm/index';
import _ from 'lodash';
import AppSnackBar from '@app/components/SnackBar';

const styles = StyleSheet.create({
  flex: { flex: 1 },
  btnAddAddress: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.GRAY_MEDIUM,
    borderRadius: 5,
    paddingVertical: 35,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnApply: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 4,
    borderRadius: 8,
  },
  btnApplyDisabled: {
    backgroundColor: Colors.GRAY_MEDIUM,
    paddingVertical: 4,
    borderRadius: 8,
  },
  btnApplyLabel: {
    ...Typography.FONT_BOLD,
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
});

const ListShippingAddressCheckout = ({ onClose }) => {
  const isFocused = useIsFocused();
  const addressClientData = useReactiveVar(rxUserAddresses);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addresses, setAddressData] = useState([]);
  const [editAddressData, setEditAddressData] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isLoadingSelectedAddress, setIsLoadingSelectedAddress] =
    useState(false);
  const { t } = useTranslation();
  const isEmptyData = addresses?.length < 1;
  //   const {setCart: setDataCartInfo} = useCarts({
  //     initialized: false,
  //     type: TYPES.INFO,
  //   });
  const { setCart: setDataCartAddress, data: getCartAddress } = useCarts({
    initialized: true,
    type: TYPES.ADDRESS,
  });
  const { setDefautShippingToCart } = useSelectShippingAddress();
  /**
   * ---------------------------------------------------- *
   * @dependency [isFocused]
   * @summary for set new address data
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (isFocused) {
      if (addressClientData) {
        let getSelectedAddressIndex = _.findIndex(addressClientData, {
          default_shipping: true,
        });
        if (getCartAddress?.shipping_addresses[0]?.hasOwnProperty('street')) {
          getSelectedAddressIndex = _.findIndex(addressClientData, {
            city: getCartAddress?.shipping_addresses[0]?.city,
            telephone: getCartAddress?.shipping_addresses[0]?.telephone,
            street: getCartAddress?.shipping_addresses[0]?.street,
          });
        }
        if (
          getSelectedAddressIndex !== -1 &&
          addressClientData[getSelectedAddressIndex].hasOwnProperty('addressId')
        ) {
          const getSelectedAddressId =
            addressClientData[getSelectedAddressIndex]?.addressId;
          setSelectedAddress({
            index: getSelectedAddressIndex,
            addressId: getSelectedAddressId,
          });
        }
        setAddressData(addressClientData);
      }
    }
  }, [isFocused, addressClientData]);

  /**
   * ---------------------------------------------------- *
   * @const {onSelectedAddressItem}
   * @summary on selected address item
   * ---------------------------------------------------- *
   */
  const onSelectedAddressItem = ({ index, item }) => {
    const addressId = item?.addressId;
    setSelectedAddress({ index, addressId });
  };

  /**
   * ---------------------------------------------------- *
   * @const {onUpdateAddress}
   * @summary for update address
   * ---------------------------------------------------- *
   */
  const onUpdateAddress = address => {
    setEditAddressData(address);
    setShowAddAddressModal(true);
  };

  /**
   * ---------------------------------------------------- *
   * @const {onCloseModal}
   * @summary for close modal
   * ---------------------------------------------------- *
   */
  const onCloseModal = () => {
    setEditAddressData({});
    setShowAddAddressModal(false);
  };

  /**
   * ---------------------------------------------------- *
   * @const onShowAddressModal
   * @summary for show modal
   * ---------------------------------------------------- *
   */
  const onShowAddressModal = () => setShowAddAddressModal(true);

  /**
   * ---------------------------------------------------- *
   * @const onApplyCartShippingAddress
   * @summary for for apply selected shipping address
   * ---------------------------------------------------- *
   */
  const onApplyCartShippingAddress = async () => {
    try {
      setIsLoadingSelectedAddress(true);
      const res = await setDefautShippingToCart(selectedAddress?.addressId);
      // await setDefautBillingToCart(selectedAddress?.addressId);
      // await setDataCartInfo();
      if (res?.data?.setBillingAddressOnCart?.cart) {
        setDataCartAddress(res?.data?.setBillingAddressOnCart?.cart);
      }

      setIsLoadingSelectedAddress(false);
      onClose();
    } catch (err) {
      console.log('[err] apply cart shipping', err);
      setIsLoadingSelectedAddress(false);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const ItemAddress
   * @summary child component of shipping address list item
   * ---------------------------------------------------- *
   */
  const ItemAddress = ({ data }) => {
    return (
      <CustomView marginBottom={10}>
        {data &&
          data.map((address, index) => {
            const isSelected = selectedAddress?.index === index;
            return (
              <AtomShippingAddressCheckoutItem
                key={index}
                address={address}
                isSelected={isSelected}
                onUpdateAddress={() => onUpdateAddress(address)}
                onSelectedAddressItem={() =>
                  onSelectedAddressItem({ index, item: address })
                }
              />
            );
          })}
      </CustomView>
    );
  };

  const loadingMessage = () => {
    return rxAppSnackbar({
      message: t('cart_checkout.error.loadingMessage'),
    });
  };

  return (
    <>
      <NavBar
        center
        useClose
        useWhite
        useShadow={false}
        useBackPress={isLoadingSelectedAddress ? loadingMessage : onClose}
        title={t('cart_checkout.changeShippingInformation')}
        titleStyle={{
          ...Typography.FONT_BOLD,
          fontWeight: IS_IOS ? 'bold' : null,
        }}
        childrenRight={<CustomView width={'12%'} />}
      />
      <ScrollView style={styles.flex}>
        <RenderIf condition={!isEmptyData}>
          <ItemAddress data={addresses} />
        </RenderIf>
        <RenderIf condition={isEmptyData}>
          <CustomView style={{ marginTop: 20 }}>
            <Text center>{t('account_myaccount.view.addressNotFound')}</Text>
          </CustomView>
        </RenderIf>
        <CustomView marginHorizontal={20} paddingBottom={20}>
          <TouchableRipple
            onPress={
              isLoadingSelectedAddress ? loadingMessage : onShowAddressModal
            }
            style={styles.btnAddAddress}>
            <CustomView horizontalCenter verticalCenter row>
              <CustomView marginRight={10}>
                <Icon name="plus-circle" size={30} color={Colors.PRIMARY} />
              </CustomView>
              <Text primary bold>
                {t('account_myaccount.btn.addAddress')}
              </Text>
            </CustomView>
          </TouchableRipple>
        </CustomView>
      </ScrollView>
      <CustomView row paddingHorizontal={20} paddingVertical={10}>
        <CustomView width={'50%'} paddingHorizontal={10}>
          <TouchableRipple
            onPress={isLoadingSelectedAddress ? loadingMessage : onClose}
            style={styles.btnCancel}>
            <CustomView>
              <Text center bold primary style={{ fontSize: 16 }}>
                {t('label.cancel')}
              </Text>
            </CustomView>
          </TouchableRipple>
        </CustomView>
        <CustomView width={'50%'} paddingHorizontal={10}>
          <Button
            onPress={onApplyCartShippingAddress}
            loading={isLoadingSelectedAddress}
            disabled={isLoadingSelectedAddress}
            labelStyle={styles.btnApplyLabel}
            style={
              isLoadingSelectedAddress
                ? styles.btnApplyDisabled
                : styles.btnApply
            }>
            {t('apply')}
          </Button>
        </CustomView>
      </CustomView>
      <AtomModalShippingAddressForm
        isEdit={editAddressData}
        show={showAddAddressModal}
        onClose={onCloseModal}
      />
      <AppSnackBar />
    </>
  );
};

export default ListShippingAddressCheckout;
