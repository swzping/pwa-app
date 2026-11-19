import React from 'react';
import AppBarComponent from '@app/components/AppBar';
import Text from '@app/components/Text/index';
import {ScrollView} from 'react-native';
import {Button, Card, Chip, Caption, useTheme} from 'react-native-paper';
import CustomView from '@app/components/CustomView';

import styles from '@app/_modules/account_myaccount/styles';

function MyAccountScreen({
  t,
  addresses,
  onNavigateToAddAddress,
  onNavigateToUpdateAddress,
  onDeleteAddress,
}) {
  const {colors} = useTheme();

  const ItemAddress = ({data}) => {
    return (
      <CustomView
        style={{
          paddingVertical: 10,
          width: '90%',
          marginVertical: 10,
          alignSelf: 'center',
        }}>
        {data &&
          data.map((address, index) => {
            const isHighlighted =
              address.default_billing || address.default_shipping;
            return (
              <Card
                key={'address-' + index}
                style={{
                  marginTop: 10,
                  width: '100%',
                  alignSelf: 'center',
                  borderBottomWidth: 2,
                  borderBottomColor: isHighlighted && 'green',
                }}>
                <Card.Content>
                  <Text xlarge bold>
                    {address.firstname} {address.lastname}
                  </Text>
                  <Caption>{address.telephone}</Caption>
                  <Text small style={{marginBottom: 10}}>
                    {address.street} {address.city} {address.region},{' '}
                    {address.postcode}
                  </Text>
                  <CustomView style={{flexDirection: 'row'}}>
                    {address.default_billing && (
                      <Chip style={{marginRight: 5}} icon="currency-usd-circle">
                        {t('account_myaccount.view.defaultBilling')}
                      </Chip>
                    )}
                    {address.default_shipping && (
                      <Chip icon="truck">
                        {t('account_myaccount.view.defaultShipping')}
                      </Chip>
                    )}
                  </CustomView>
                </Card.Content>
                <Card.Actions style={{justifyContent: 'space-between'}}>
                  <Button
                    color={colors.placeholder}
                    onPress={() => onDeleteAddress(address.addressId)}>
                    {t('account_myaccount.btn.delete')}
                  </Button>
                  <Button onPress={() => onNavigateToUpdateAddress(address)}>
                    {t('account_myaccount.btn.edit')}
                  </Button>
                </Card.Actions>
              </Card>
            );
          })}
      </CustomView>
    );
  };

  const isEmptyData = addresses?.length < 1;
  return (
    <>
      <AppBarComponent
        title={t('account_myaccount.title.savedAddress')}
        useBack
      />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={styles.mainContainer}>
        {!isEmptyData && <ItemAddress data={addresses} />}
        {isEmptyData && (
          <CustomView style={{marginTop: 20}}>
            <Text center>{t('account_myaccount.view.addressNotFound')}</Text>
          </CustomView>
        )}
      </ScrollView>
      <Button
        style={{width: '90%', alignSelf: 'center', marginVertical: 20}}
        mode={'contained'}
        onPress={() => onNavigateToAddAddress()}>
        {t('account_myaccount.btn.addAddress')}
      </Button>
    </>
  );
}

export default MyAccountScreen;
