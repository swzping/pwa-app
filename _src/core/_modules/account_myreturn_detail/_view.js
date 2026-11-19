import React from 'react';
import {ScrollView} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {normalize} from '@app/styles/mixins';
import {Colors, Mixins} from '@app/styles';
import {useTranslation} from 'react-i18next';

import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import Button from '@app/components/Button';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import RMAFormModal from '@app/_modules/account/atoms/RMAFormModal';

import styles from '@app/_modules/account_myreturn_detail/styles';

const OrderStatus = ({label, status, index}) => {
  return (
    <CustomView>
      <CustomView
        style={[
          {
            borderColor: status >= index ? Colors.PRIMARY : Colors.BLACK,
          },
          styles.orderStatusItemContainer,
        ]}
      />
      <CustomView
        style={{
          flex: 1,
          flexDirection: 'row',
        }}>
        <Text center small style={styles.orderStatusItemText}>
          {label}
        </Text>
      </CustomView>
    </CustomView>
  );
};

const OrderStatusLine = ({status, index}) => {
  return (
    <CustomView
      style={[
        {borderColor: status >= index ? Colors.PRIMARY : Colors.BLACK},
        styles.orderStatusLine,
      ]}
    />
  );
};

const OrderItemDetail = ({t, item}) => {
  const {detail, status} = item;
  const {
    shipping_address,
    shipping_methods,
    payment,
    subtotal,
    grand_total,
    global_currency_code,
  } = detail[0];
  const {firstname, lastname, city, postcode, region, street, telephone} =
    shipping_address;
  const {shipping_description} = shipping_methods;
  const {shipping_amount, payment_additional_info} = payment;
  const {method_title: payment_method_title, virtual_account} =
    payment_additional_info;

  let orderStatus = 0;

  switch (status) {
    case 'pending_payment':
      orderStatus = -1;
      break;
    case 'canceled':
      orderStatus = -2;
      break;
    case 'new':
      orderStatus = 0;
      break;
    case 'processing':
      orderStatus = 1;
      break;
    case 'shipped':
      orderStatus = 2;
      break;
    case 'complete':
      orderStatus = 3;
      // orderStatus = 2;
      break;
    default:
      orderStatus = 0;
      break;
  }

  return (
    <CustomView style={styles.detailsMainContainer}>
      <CustomView style={styles.priceBlockContainer}>
        {/* price block */}
        <CustomView
          style={{
            marginBottom: normalize(10),
          }}>
          <CustomView style={styles.rowContainer}>
            <Text>{t('account_myreturn_detail.view.subtotal')}</Text>
            <Text>
              {global_currency_code} {subtotal}
            </Text>
          </CustomView>
          <CustomView style={styles.rowContainer}>
            <Text>{t('account_myreturn_detail.view.shipping')}</Text>
            <Text>
              {global_currency_code} {shipping_amount}
            </Text>
          </CustomView>
          <CustomView style={styles.rowContainer}>
            <Text bold>{t('account_myreturn_detail.view.total')}</Text>
            <Text bold>
              {global_currency_code} {grand_total}
            </Text>
          </CustomView>
        </CustomView>
        {/* end of price block */}

        {/* Order status block */}
        <CustomView style={styles.orderStatusContainer}>
          <OrderStatus
            label={
              orderStatus < 0
                ? t('account_myreturn_detail.label.waitingConfirmation')
                : t('account_myreturn_detail.label.purchased')
            }
            index={0}
            status={orderStatus}
          />
          <OrderStatusLine index={1} status={orderStatus} />
          <OrderStatus label="Processing" index={1} status={orderStatus} />
          <OrderStatusLine index={2} status={orderStatus} />
          <OrderStatus label="Shipped" index={2} status={orderStatus} />
          <OrderStatusLine index={3} status={orderStatus} />
          <OrderStatus label="Complete" index={3} status={orderStatus} />
        </CustomView>
        {/* end of status block */}

        {/* Address Information block */}
        <CustomView
          style={[styles.spacingMargin, {maxWidth: Mixins.MAX_WIDTH * 0.6}]}>
          <Text bold>
            {t('account_myreturn_detail.view.addressInformation')}
          </Text>
          <Text small>
            {firstname} {lastname}
          </Text>
          <Text small>{street}</Text>
          <Text small>
            {city}, {region}, {postcode}
          </Text>
          <Text small>{telephone}</Text>
        </CustomView>
        {/* end of address information block */}

        {/* Shipping Method block */}
        <CustomView style={styles.spacingMargin}>
          <Text bold>{t('account_myreturn_detail.view.shippingMethod')}</Text>
          <Text small>{shipping_description}</Text>
        </CustomView>
        {/* end of shipping method block */}

        {/* Payment Method block */}
        <CustomView style={styles.spacingMargin}>
          <Text bold>{t('account_myreturn_detail.view.paymentMethod')}</Text>
          <Text small>{payment_method_title}</Text>
          {virtual_account ? <Text small>{virtual_account}</Text> : null}
        </CustomView>
        {/* end of Payment method block */}
      </CustomView>
    </CustomView>
  );
};

function PurchaseDetailScreen({
  item,
  onRequestReturn,
  rmaFormData,
  formDataLoading,
  rmaFormVisibility,
  setRmaFormVisibility,
}) {
  let itemFinal = item.ordersFilter.data;
  let isEmptyData = itemFinal.length < 1;
  const {t} = useTranslation();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      <NavBar title={t('account_myreturn_detail.title.orderDetail')} />
      {isEmptyData && (
        <Text>{t('account_myreturn_detail.view.noDataFound')}</Text>
      )}
      {!isEmptyData && (
        <ScrollView>
          <OrderItemDetail item={itemFinal[0]} t={t} />
          <RenderIf condition={itemFinal[0].detail[0].aw_rma.status}>
            <CustomView style={{alignItems: 'center'}}>
              <RenderIf condition={formDataLoading}>
                <ActivityIndicator color="red" />
              </RenderIf>
              <RenderIf condition={!formDataLoading}>
                <Button
                  label={t('account_myreturn_detail.btn.requestReturn')}
                  styleProp={styles.returnRequestButton}
                  textStyleProp={styles.returnRequestButtonText}
                  onPress={() => onRequestReturn()}
                />
              </RenderIf>
            </CustomView>
          </RenderIf>
        </ScrollView>
      )}
      <RenderIf condition={rmaFormData}>
        <RMAFormModal
          orderNumber={itemFinal[0].order_number}
          rmaFormData={rmaFormData}
          visible={rmaFormVisibility}
          setVisible={setRmaFormVisibility}
        />
      </RenderIf>
    </SafeAreaView>
  );
}

export default PurchaseDetailScreen;
