import React, {useState} from 'react';
import {FlatList, Modal, Text} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {useReactiveVar} from '@apollo/client';
import {rxCartIsVirtual} from '@app/services/cache';
import {normalize} from '@app/styles/mixins';
import {navigateTo} from '@app/helpers/Navigation';
import Button from '@app/components/Button';
import RadioButton from '@app/components/RadioButton';
import CustomView from '@app/components/CustomView';
// import Text from '@app/components/Text';
import {useTranslation} from 'react-i18next';
import styles from '@app/_modules/cart/atoms/ShippingAddressBlock/styles';
import {modules} from '@root/swift.config';

const ShippingAddressBlock = ({
  selectedShippingAddress,
  selectedBillingAddress,
  userAddresses,
  onSelectShippingAddress,
  shippingAddressLoading,
}) => {
  const {t} = useTranslation();
  const cartIsVirtual = useReactiveVar(rxCartIsVirtual);
  const [modalVisible, setModalVisible] = useState(false);

  const selectedStatus = item => {
    const address = cartIsVirtual
      ? selectedBillingAddress
      : selectedShippingAddress;
    if (
      address.firstname === item.firstname &&
      address.lastname === item.lastname &&
      address.street === item.street &&
      address.city === item.city &&
      address.region === item.region &&
      address.country_id === item.country_id &&
      address.telephone === item.telephone
    ) {
      return true;
    } else {
      return false;
    }
  };

  const UserAddressesModal = () => {
    return (
      <Modal
        visible={modalVisible}
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <CustomView flex backgroundColor={'rgba(0, 0, 0, 0.6)'} />
        <CustomView style={{width: '100%', display: 'flex'}}>
          <FlatList
            ListHeaderComponent={
              <CustomView row spaceBetween padding={15}>
                <Text>
                  {t('cart.shipping_address_block.view.selectAddress')}
                </Text>
                <CustomView onPress={() => setModalVisible(false)}>
                  <Text xlarge>x</Text>
                </CustomView>
              </CustomView>
            }
            style={styles.listContainer}
            data={userAddresses}
            keyExtractor={item => item.addressId.toString()}
            renderItem={({item}) => {
              return (
                <CustomView
                  onPress={() => {
                    onSelectShippingAddress(item);
                    setModalVisible(false);
                  }}
                  style={styles.itemContainer}>
                  <RadioButton
                    selected={
                      selectedShippingAddress || selectedBillingAddress
                        ? selectedStatus(item)
                        : false
                    }
                  />
                  <CustomView horizontalStart marginHorizontal={15}>
                    <Text>
                      {item.firstname} {item.lastname}
                    </Text>
                    <Text>{item.street}</Text>
                    <Text>{item.city}</Text>
                    <Text>{item.region}</Text>
                    <Text>{item.telephone}</Text>
                  </CustomView>
                </CustomView>
              );
            }}
            ListFooterComponent={
              <CustomView padding={15}>
                <Button
                  label={t(
                    'cart.shipping_address_block.label.addShippingAddress',
                  )}
                  styleProp={{
                    width: '100%',
                  }}
                  onPress={() => {
                    setModalVisible(false);
                    navigateTo(
                      modules.account_address_add.enable,
                      modules.account_address_add.name,
                    );
                  }}
                />
              </CustomView>
            }
          />
        </CustomView>
      </Modal>
    );
  };

  const SelectedAddressView = ({address}) => {
    return (
      <CustomView style={styles.selectedAddressWrapper}>
        <CustomView style={styles.selectedAddressTitle}>
          <Text style={styles.selectedAddressTitleLabel}>
            {cartIsVirtual
              ? t('cart.shipping_address_block.view.billingAddress')
              : t('cart.shipping_address_block.view.shippingAddress')}
          </Text>
        </CustomView>
        <CustomView style={styles.selectedAddressContent}>
          <CustomView
            style={{...styles.addressContainer, alignItems: 'center'}}>
            {/* If there is address selected */}
            {address && (
              <CustomView flex={3} alignStart>
                <Text style={{fontSize: 12, marginBottom: normalize(5)}}>
                  {address.firstname} {address.lastname}
                </Text>
                <Text style={{fontSize: 12}}>{address.street}</Text>
                <Text style={{fontSize: 12}}>{address.city}</Text>
                <Text style={{fontSize: 12}}>{address.region}</Text>
                <Text style={{fontSize: 12}}>{address.telephone}</Text>
              </CustomView>
            )}

            {/* If there is no address selected */}
            {!address && (
              <CustomView flex={3} alignStart>
                <Text style={{fontSize: 12}}>
                  {t('cart.shipping_address_block.view.selectAddress')}
                </Text>
                <Text style={{fontSize: 12}}>
                  {t('cart.shipping_address_block.view.addressNotSelected')}
                </Text>
              </CustomView>
            )}

            {/* If loading */}
            {shippingAddressLoading && <ActivityIndicator />}

            {/* If loading done */}
            {!shippingAddressLoading && (
              <Button
                onPress={() => setModalVisible(true)}
                label={t('cart.shipping_address_block.label.change')}
                width={normalize(80)}
                styleProp={{
                  flex: 1,
                }}
                textStyleProp={{
                  paddingVertical: normalize(3),
                }}
              />
            )}
          </CustomView>
          <UserAddressesModal />
        </CustomView>
      </CustomView>
    );
  };

  return (
    <SelectedAddressView
      address={cartIsVirtual ? selectedBillingAddress : selectedShippingAddress}
    />
  );
};

export default ShippingAddressBlock;
