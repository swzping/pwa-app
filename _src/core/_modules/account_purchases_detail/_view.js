import React from 'react';
import {ScrollView} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import {Colors, Mixins} from '@app/styles';
import {SafeAreaView} from 'react-native-safe-area-context';

import RMAFormModal from '@app/_modules/account/atoms/RMAFormModal';
import ShippingDetail from '@app/_modules/account/atoms/ShippingDetail';
import Button from '@app/components/Button';
import AppBar from '@app/components/AppBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {useReactiveVar} from '@apollo/client';

import styles from '@app/_modules/account_purchases_detail/styles';
import {rxUserTheme} from '../../services/cache';

const OrderStatus = ({label, status, index}) => {
  const scheme = useReactiveVar(rxUserTheme);
  let inactiveBorderDarkThemeColor =
    scheme === 'dark' ? Colors.WHITE : Colors.BLACK;
  return (
    <CustomView>
      <CustomView
        height={50}
        heightScaling={false}
        width={50}
        borderRadius={5}
        borderColor={
          status >= index ? Colors.PRIMARY : inactiveBorderDarkThemeColor
        }
      />
      <CustomView row flex>
        <Text xsmall center alignStart style={styles.orderStatusItemText}>
          {label}
        </Text>
      </CustomView>
    </CustomView>
  );
};

const OrderStatusLine = ({status, index}) => {
  const scheme = useReactiveVar(rxUserTheme);
  let inactiveBorderDarkThemeColor =
    scheme === 'dark' ? Colors.WHITE : Colors.BLACK;
  return (
    <CustomView
      height={2}
      width={Math.ceil((Mixins.MAX_WIDTH * 0.8 - 200) * 0.3)}
      borderColor={
        status >= index ? Colors.PRIMARY : inactiveBorderDarkThemeColor
      }
      flex
      style={styles.orderStatusLine}
    />
  );
};

const AddressInformationBlock = ({address, title}) => {
  const scheme = useReactiveVar(rxUserTheme);
  const {firstname, lastname, city, postcode, region, street, telephone} =
    address;

  return (
    <CustomView
      marginVertical={10}
      horizontalStart
      width="100%"
      backgroundColor={
        scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_LIGHT
      }>
      <Text bold style={styles.blockHeaderText}>
        {title}
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
  );
};

const ProductItemsBlock = ({t, items, global_currency_code}) => {
  return (
    <CustomView
      borderRadius={15}
      marginVertical={10}
      horizontalCenter
      verticalCenter
      paddingHorizontal={10}
      paddingVertical={10}>
      <Text alignStart bold style={styles.productItemsTitle}>
        {t('account_purchases_detail.view.items')}
      </Text>
      {items.map((item, index) => {
        return (
          <CustomView row spaceBetween width={'100%'}>
            <Text center alignCenter style={{width: '10%'}}>
              {index + 1}.
            </Text>
            <Text alignCenter style={{width: '40%'}}>
              {item.name}
            </Text>
            <Text alignCenter style={{width: '15%'}}>
              {item.qty_ordered} {t('account_purchases_detail.view.pcs')}
            </Text>
            <Text alignCenter style={{width: '25%'}}>
              {global_currency_code} {item.price}
            </Text>
          </CustomView>
        );
      })}
    </CustomView>
  );
};

const OrderItemDetail = ({t, item}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const {detail, status} = item;
  const {
    billing_address,
    shipping_address,
    shipping_methods,
    items,
    payment,
    subtotal,
    grand_total,
    global_currency_code,
    discount_amount,
  } = detail[0];

  const {shipping_description, shipping_detail} = shipping_methods;
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
    case 'ready_to_ship':
      orderStatus = 2;
      break;
    case 'complete':
      orderStatus = 3;
      break;
    default:
      orderStatus = 0;
      break;
  }

  let backgroundColor =
    scheme === 'dark' ? Colors.GRAY_DARK : Colors.GRAY_LIGHT;

  return (
    <CustomView flex horizontalCenter verticalCenter marginVertical={20}>
      <CustomView
        paddingHorizontal={20}
        paddingVertical={10}
        backgroundColor={backgroundColor}
        borderRadius={15}
        width={Mixins.MAX_WIDTH * 0.9}
        horizontalCenter
        verticalCenter>
        {/* price block */}
        <CustomView width={'100%'} marginVertical={10}>
          <CustomView
            width={'100%'}
            row
            spaceBetween
            backgroundColor={backgroundColor}>
            <Text>{t('account_purchases_detail.view.subtotal')}</Text>
            <Text>
              {global_currency_code} {subtotal}
            </Text>
          </CustomView>
          <CustomView
            width={'100%'}
            row
            spaceBetween
            backgroundColor={backgroundColor}>
            <Text>{t('account_purchases_detail.view.shipping')}</Text>
            <Text>
              {global_currency_code} {shipping_amount}
            </Text>
          </CustomView>
          <CustomView
            width={'100%'}
            row
            spaceBetween
            backgroundColor={backgroundColor}>
            <Text>{t('account_purchases_detail.view.discount')}</Text>
            <Text>
              {global_currency_code} {discount_amount}
            </Text>
          </CustomView>
          <CustomView
            width={'100%'}
            row
            spaceBetween
            backgroundColor={backgroundColor}>
            <Text bold>{t('account_purchases_detail.view.total')}</Text>
            <Text bold>
              {global_currency_code} {grand_total}
            </Text>
          </CustomView>
        </CustomView>
        {/* end of price block */}

        {/* Product Items block */}
        <ProductItemsBlock
          t={t}
          items={items}
          global_currency_code={global_currency_code}
        />
        {/* end of product items block */}

        {/* Billing Address Information block */}
        <RenderIf condition={!shipping_address}>
          <AddressInformationBlock
            address={billing_address}
            title="Billing Address"
          />
        </RenderIf>
        {/* end of billing address information block */}
        <RenderIf condition={shipping_address}>
          {/* Shipping Address Information block */}
          <AddressInformationBlock
            address={shipping_address}
            title="Shipping Address &amp; Billing Address"
          />
          {/* end of shipping address information block */}

          {/* Shipping Method block */}
          <CustomView
            width={'100%'}
            horizontalStart
            marginVertical={10}
            backgroundColor={backgroundColor}>
            <Text bold style={styles.blockHeaderText}>
              {t('account_purchases_detail.view.shippingMethod')}
            </Text>
            <Text small>{shipping_description}</Text>
            <ShippingDetail
              shipping_description={shipping_description}
              shipping_detail={shipping_detail}
            />
          </CustomView>
          {/* end of shipping method block */}
        </RenderIf>

        {/* Order status block */}
        <RenderIf condition={shipping_address}>
          <CustomView
            flex
            borderRadius={15}
            marginVertical={10}
            horizontalCenter
            verticalCenter
            paddingHorizontal={20}
            paddingVertical={20}
            row>
            <OrderStatus
              label={
                orderStatus < 0
                  ? t('account_purchases_detail.label.waitingConfirmation')
                  : t('account_purchases_detail.label.purchased')
              }
              index={0}
              status={orderStatus}
            />
            <OrderStatusLine index={1} status={orderStatus} />
            <OrderStatus
              label={t('account_purchases_detail.label.processing')}
              index={1}
              status={orderStatus}
            />
            <OrderStatusLine index={2} status={orderStatus} />
            <OrderStatus
              label={t('account_purchases_detail.lalbel.readyToShip')}
              index={2}
              status={orderStatus}
            />
            <OrderStatusLine index={3} status={orderStatus} />
            <OrderStatus
              label={t('account_purchases_detail.label.shipped')}
              index={3}
              status={orderStatus}
            />
          </CustomView>
        </RenderIf>
        {/* end of status block */}

        {/* Payment Method block */}
        <CustomView
          width={'100%'}
          horizontalStart
          marginVertical={10}
          backgroundColor={backgroundColor}>
          <Text bold style={styles.blockHeaderText}>
            {t('account_purchases_detail.view.paymentMethod')}
          </Text>
          <Text small>{payment_method_title}</Text>
          {virtual_account ? <Text small>{virtual_account}</Text> : null}
        </CustomView>
        {/* end of Payment method block */}
      </CustomView>
    </CustomView>
  );
};

const PurchaseDetailScreen = ({
  t,
  item,
  onRequestReturn,
  rmaFormData,
  formDataLoading,
  rmaFormVisibility,
  setRmaFormVisibility,
}) => {
  let itemFinal = item.ordersFilter.data;
  let isEmptyData = itemFinal.length < 1;

  return (
    <SafeAreaView style={{flex: 1}}>
      <AppBar useBack title={t('account_purchases_detail.title.orderDetail')} />
      <CustomView safe horizontalCenter verticalCenter flex>
        {isEmptyData && (
          <Text>{t('account_purchases_detail.view.noDataFound')}</Text>
        )}
        {!isEmptyData && (
          <ScrollView>
            <OrderItemDetail item={itemFinal[0]} t={t} />
            <RenderIf condition={itemFinal[0]?.detail[0]?.aw_rma.status}>
              <CustomView horizontalCenter verticalCenter>
                <RenderIf condition={formDataLoading}>
                  <ActivityIndicator color="red" />
                </RenderIf>
                <RenderIf condition={!formDataLoading}>
                  <Button
                    label={t('account_purchases_detail.btn.requestReturn')}
                    styleProp={styles.requestReturnButton}
                    textStyleProp={styles.requestReturnButtonText}
                    onPress={() => onRequestReturn()}
                  />
                </RenderIf>
              </CustomView>
            </RenderIf>
          </ScrollView>
        )}
        <RenderIf condition={rmaFormData}>
          <RMAFormModal
            orderNumber={itemFinal[0]?.order_number}
            rmaFormData={rmaFormData}
            visible={rmaFormVisibility}
            setVisible={setRmaFormVisibility}
          />
        </RenderIf>
      </CustomView>
    </SafeAreaView>
  );
};

export default PurchaseDetailScreen;
