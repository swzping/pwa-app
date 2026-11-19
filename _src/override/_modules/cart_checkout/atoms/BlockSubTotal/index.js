import React from 'react';
import {FlatList, ScrollView} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import styles from '@app/_modules/cart_checkout/styles';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text';
import {IS_IOS, TYPE_NUMBER, TYPENAME_BUNDLE} from '@app/helpers/Constants';
import {TYPE_SHIMMER_ITEM_QTY} from '@app/helpers/Constants';
import {numberFormat, numberFormatBy} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles/index';

// ListEmptyComponent 移到外面，避免每次渲染都创建新组件
const ListEmptyComponent = ({isEmptyCart, t}) => {
  if (isEmptyCart) {
    return <ActivityIndicator />;
  }
  return <Text center>{t('noData')}</Text>;
};

const getFinalPrice = item => {
  // 免费礼物价格显示为0 IDGUARD-1071
  const isFreeGift = _.get(item, 'is_free_gift') === true;

  if (isFreeGift) {
    return _.get(item, 'prices.price.value');
  }

  const finalPrice = _.get(item, 'custom_price.row_total.value');

  return finalPrice;
};

const BlockSubTotal = ({
  isEmptyCart = false,
  isCheckout = false,
  expand = false,
  expandDiscount = true,
  cart,
  dataPrices,
  shippingAmount,
  totalDiscount,
  appliedGiftCard,
  appliedRewardPoint,
  dataAppliedStoreCredit,
  onPressExpand,
  onPressExpandDiscount,
  loadingItems,
}) => {
  const {t} = useTranslation();

  const selectedShippingMethodData =
    shippingAmount?.[0]?.selected_shipping_method || null;
  const deliveryFeeDiscount =
    selectedShippingMethodData?.discount_fee?.value || 0;
  const productDiscountsTotal =
    dataPrices?.discounts?.reduce(
      (sum, item) => sum + (item?.amount?.value || 0),
      0,
    ) || 0;
  const calculatedTotalDiscount = productDiscountsTotal + deliveryFeeDiscount;

  // 将 Student Discount 分离出来，使其显示在其他所有标签/促销的下面
  const isStudentDiscountItem = item => /student/i.test(item?.label || '');
  const otherDiscounts = (dataPrices?.discounts || []).filter(
    item => !isStudentDiscountItem(item),
  );
  const studentDiscounts = (dataPrices?.discounts || []).filter(
    isStudentDiscountItem,
  );

  const onRenderSummary = ({item}) => {
    // 如果是免费礼物，不显示
    // 又需要显示了
    // if (item?.is_free_gift) {
    //   return null;
    // }
    const name = _.get(item, 'product.name');
    const quantity = _.get(item, 'quantity');
    const price = getFinalPrice(item);
    return (
      <CustomView
        flex
        row
        width={Mixins.MAX_WIDTH}
        paddingHorizontal={20}
        style={styles.cartItemContainer}>
        <CustomView horizontalStart flexNumber={3}>
          <CustomView width={Mixins.MAX_WIDTH - 40} row spaceBetween>
            <Text style={[styles.cartItemTitle, {width: Mixins.MAX_WIDTH / 2}]}>
              {name}
            </Text>
            <Text style={styles.cartItemDetailText}>
              {'×'} {quantity}
            </Text>
            <RenderIf condition={item.product.__typename !== TYPENAME_BUNDLE}>
              <RenderIf condition={loadingItems}>
                <ShimmerSkeleton type={TYPE_SHIMMER_ITEM_QTY} />
              </RenderIf>
              <RenderIf condition={!loadingItems}>
                <Text style={[styles.cartItemDetailText]}>
                  {numberFormat('IDR', price, ',', 2)}
                </Text>
              </RenderIf>
            </RenderIf>
          </CustomView>
          <RenderIf condition={item.bundle_options?.length > 0}>
            {item.bundle_options?.map((bundle, index) => (
              <CustomView key={`bundle-${index}`}>
                <Text bold style={styles.cartItemDetailText}>
                  {bundle.label}:
                </Text>
                {bundle.values.map((value, idx) => (
                  <CustomView
                    key={`bundle-${index}-value-${idx}`}
                    width={Mixins.MAX_WIDTH - 40}
                    row
                    spaceBetween>
                    <CustomView style={{maxWidth: Mixins.MAX_WIDTH / 2}}>
                      <Text style={styles.cartItemDetailText}>
                        {`${value.label}`}
                      </Text>
                    </CustomView>
                    <CustomView>
                      <Text>{numberFormat('IDR', value.price, ',', 2)}</Text>
                    </CustomView>
                  </CustomView>
                ))}
              </CustomView>
            ))}
          </RenderIf>
        </CustomView>
      </CustomView>
    );
  };

  return (
    <CustomView
      horizontalCenter
      width={Mixins.MAX_WIDTH}
      style={[
        styles.subTotalSubContainer,
        {maxHeight: 550, borderTopWidth: 0},
      ]}>
      <RenderIf condition={!expand}>
        <CustomView style={styles.shadowBox} />
      </RenderIf>
      <CustomView
        onPress={onPressExpand}
        paddingTop={IS_IOS ? 12 : 10}
        paddingBottom={8}>
        <CustomView row horizontalCenter verticalCenter>
          <Text style={{fontSize: 14, height: IS_IOS ? 18 : 20}}>
            <Text style={{fontSize: 14}}>{t('cart_checkout.subtotal')}</Text>
            <Text bold style={{fontSize: 14}}>
              {' '}
              {`${numberFormat(
                dataPrices?.subtotal_excluding_tax?.currency,
                dataPrices?.subtotal_excluding_tax?.value,
                ',',
                2,
              )}`}{' '}
            </Text>
          </Text>
          <CustomView style={styles.chevroIcon}>
            <Icon name={expand ? 'chevron-up' : 'chevron-down'} size={20} />
          </CustomView>
        </CustomView>
      </CustomView>
      <RenderIf condition={expand}>
        <ScrollView overScrollMode="never">
          <CustomView>
            <FlatList
              overScrollMode="never"
              style={styles.listContainer}
              data={cart}
              renderItem={onRenderSummary}
              keyExtractor={item => item.id.toString()}
              ListEmptyComponent={
                <ListEmptyComponent isEmptyCart={isEmptyCart} t={t} />
              }
            />
            <CustomView style={styles.subtotal}>
              <CustomView row spaceBetween style={styles.normalPriceItem}>
                <Text style={{fontSize: 14}}>
                  {t('cart_checkout.subtotal')}
                </Text>
                <Text style={{fontSize: 14}}>
                  {numberFormat(
                    dataPrices?.subtotal_excluding_tax?.currency,
                    dataPrices?.subtotal_excluding_tax?.value,
                    ',',
                    2,
                  )}
                </Text>
              </CustomView>
              <RenderIf condition={isCheckout}>
                <CustomView row spaceBetween style={styles.normalPriceItem}>
                  <Text style={{fontSize: 14}}>
                    {t('cart_checkout.shipping')}
                  </Text>
                  <Text style={{fontSize: 14}}>
                    {numberFormat(
                      shippingAmount?.[0]?.selected_shipping_method
                        ?.amount_before_discount?.currency ||
                        shippingAmount?.[0]?.selected_shipping_method?.amount
                          ?.currency ||
                        'IDR',
                      shippingAmount?.[0]?.selected_shipping_method
                        ?.amount_before_discount?.value ||
                        shippingAmount?.[0]?.selected_shipping_method?.amount
                          ?.value ||
                        0,
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
              </RenderIf>
              <RenderIf
                condition={dataPrices?.discounts || dataPrices?.promotions}>
                <CustomView paddingVertical={5}>
                  {otherDiscounts.map((item, index) => {
                    const isProductDiscount = item.label === 'Discount Product';
                    const isCartDiscount = item.label === 'Discount Cart';
                    const isCouponDiscount =
                      !isProductDiscount && !isCartDiscount;

                    // 购物车级折扣在这里不展示（只展示商品折扣和优惠券）
                    if (isCartDiscount) {
                      return null;
                    }

                    return (
                      <CustomView
                        key={`discount-${index}`}
                        row
                        spaceBetween
                        paddingVertical={3}>
                        {/* 已应用优惠券：使用和 promotions 一样的胶囊样式 & 橙色文字 */}
                        {isCouponDiscount ? (
                          <>
                            <CustomView
                              style={{
                                backgroundColor: '#FFF0E6',
                                borderRadius: 15,
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                              }}>
                              <Text
                                style={{fontSize: 12, color: '#F96D01'}}
                                bold>
                                {item.label}
                              </Text>
                            </CustomView>
                            <Text style={{fontSize: 12, color: '#F96D01'}}>
                              {'- '}
                              {numberFormat(
                                item?.amount?.currency,
                                item?.amount?.value,
                                ',',
                                2,
                              )}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Text style={{fontSize: 12, color: '#888'}}>
                              {isProductDiscount
                                ? 'Product Discount'
                                : item.label}
                            </Text>
                            <Text style={{fontSize: 12, color: '#888'}}>
                              {'- '}
                              {numberFormat(
                                item?.amount?.currency,
                                item?.amount?.value,
                                ',',
                                2,
                              )}
                            </Text>
                          </>
                        )}
                      </CustomView>
                    );
                  })}

                  {dataPrices?.promotions?.map((item, index) => (
                    <CustomView
                      key={`promotion-${index}`}
                      row
                      spaceBetween
                      paddingVertical={3}>
                      <CustomView
                        style={{
                          backgroundColor: '#FFF0E6',
                          borderRadius: 38,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          alignSelf: 'flex-start',
                          maxWidth: '65%',
                        }}>
                        <Text
                          style={{fontSize: 13, color: '#F96D01'}}
                          bold
                          numberOfLines={2}
                          ellipsizeMode="tail">
                          {item.label}
                        </Text>
                      </CustomView>
                      {/* 促销 / 优惠券金额也使用橙色，与标签保持一致 */}
                      <CustomView style={{alignSelf: 'center'}}>
                        <Text style={{fontSize: 12, color: '#F96D01'}}>
                          {'- '}
                          {numberFormat(
                            item?.amount?.currency,
                            item?.amount?.value,
                            ',',
                            2,
                          )}
                        </Text>
                      </CustomView>
                    </CustomView>
                  ))}
                  {/* Student Discount：黄色标准样式，与购物车保持一致，显示在其他所有标签/促销的下面 */}
                  {studentDiscounts.map((item, index) => (
                    <CustomView
                      key={`student-discount-${index}`}
                      row
                      spaceBetween
                      paddingVertical={3}>
                      <CustomView
                        style={{
                          backgroundColor: '#FFD38B',
                          borderRadius: 15,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          alignSelf: 'flex-start',
                        }}>
                        <Text style={{fontSize: 12, color: '#F96D01'}} bold>
                          {item.label}
                        </Text>
                      </CustomView>
                      <CustomView style={{alignSelf: 'center'}}>
                        <Text style={{fontSize: 12, color: '#F96D01'}}>
                          {'- '}
                          {numberFormat(
                            item?.amount?.currency,
                            item?.amount?.value,
                            ',',
                            2,
                          )}
                        </Text>
                      </CustomView>
                    </CustomView>
                  ))}
                  {/* Delivery Fee Discount：固定在所有折扣行之后（Student 之后） */}
                  <RenderIf
                    condition={selectedShippingMethodData?.discount_fee?.value}>
                    <CustomView row spaceBetween paddingVertical={3}>
                      <Text style={{fontSize: 12, color: '#888'}}>
                        Delivery Fee discount
                      </Text>
                      <Text style={{fontSize: 12, color: '#888'}}>
                        {'-'}
                        {numberFormat(
                          selectedShippingMethodData?.discount_fee?.currency ||
                            'IDR',
                          selectedShippingMethodData?.discount_fee?.value || 0,
                          ',',
                          2,
                        )}
                      </Text>
                    </CustomView>
                  </RenderIf>
                  {/* Total Discount：值为 0 时不显示，底部分割线（normalPriceItem 的 borderBottom）一并隐藏 */}
                  <RenderIf condition={calculatedTotalDiscount > 0}>
                    <CustomView row spaceBetween style={styles.normalPriceItem}>
                      <CustomView onPress={onPressExpandDiscount}>
                        <CustomView row>
                          <Text style={{fontSize: 14}}>
                            {t('cart_checkout.totalDiscount')}
                          </Text>
                        </CustomView>
                      </CustomView>
                      <Text style={{fontSize: 14}}>
                        {'-'}
                        {numberFormat(
                          dataPrices?.discounts?.length > 0
                            ? dataPrices?.discounts[0]?.amount?.currency
                            : dataPrices?.promotions?.length > 0
                            ? dataPrices?.promotions[0]?.amount?.currency
                            : selectedShippingMethodData?.discount_fee?.currency
                            ? selectedShippingMethodData?.discount_fee?.currency
                            : 'IDR',
                          calculatedTotalDiscount,
                          ',',
                          2,
                        )}
                      </Text>
                    </CustomView>
                  </RenderIf>
                </CustomView>
              </RenderIf>
              <RenderIf condition={dataPrices?.loyalty_points?.point}>
                <CustomView
                  row
                  spaceBetween
                  paddingVertical={12}
                  style={styles.normalPriceItem}>
                  <CustomView row>
                    <Text style={{fontSize: 14}}>
                      {t('cart_checkout.label.redeemPoints', {
                        point: numberFormatBy(
                          '',
                          dataPrices?.loyalty_points?.point,
                        ),
                      })}
                    </Text>
                  </CustomView>
                  <Text style={{fontSize: 14}}>
                    {'-'}
                    {numberFormat(
                      dataPrices?.loyalty_points?.loyalty_points_total
                        ?.currency,
                      dataPrices?.loyalty_points?.loyalty_points_total?.value,
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
              </RenderIf>
              <RenderIf
                condition={
                  appliedGiftCard && appliedGiftCard?.giftcard_amount > 0
                }>
                <CustomView row spaceBetween paddingVertical={5}>
                  <Text style={{fontSize: 14}}>
                    {t('cart_checkout.giftCardApplied')}
                  </Text>
                  <Text style={{fontSize: 14}}>
                    {'- '}
                    {numberFormat(
                      null,
                      appliedGiftCard?.giftcard_amount,
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
              </RenderIf>
              <RenderIf condition={dataAppliedStoreCredit?.is_use_store_credit}>
                <CustomView row spaceBetween paddingVertical={5}>
                  <Text style={{fontSize: 14}}>
                    {t('cart_checkout.storeCredit')}
                  </Text>
                  <Text style={{fontSize: 14}}>
                    {numberFormat(
                      null,
                      dataAppliedStoreCredit?.store_credit_amount,
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
              </RenderIf>
            </CustomView>
          </CustomView>
        </ScrollView>
      </RenderIf>
      <RenderIf
        condition={
          dataPrices && typeof dataPrices?.grand_total?.value === TYPE_NUMBER
        }>
        <CustomView
          width={Mixins.MAX_WIDTH}
          row
          paddingHorizontal={15}
          paddingTop={10}
          paddingBottom={IS_IOS ? 12 : 6}
          spaceBetween>
          <CustomView>
            <Text bold style={{fontSize: 16}}>
              {t('cart.orderTotal')}
            </Text>
          </CustomView>
          <CustomView>
            <Text style={{fontSize: 16}} bold color={Colors.PRIMARY}>
              {numberFormat(
                dataPrices?.grand_total?.currency,
                dataPrices?.grand_total?.value,
                ',',
                2,
              )}
            </Text>
          </CustomView>
        </CustomView>
      </RenderIf>
      <RenderIf
        condition={
          !dataPrices || typeof dataPrices?.grand_total?.value !== TYPE_NUMBER
        }>
        <Text bold>{t('loading')}</Text>
      </RenderIf>
    </CustomView>
  );
};

export default BlockSubTotal;
