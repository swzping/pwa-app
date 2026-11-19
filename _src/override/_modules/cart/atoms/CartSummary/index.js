import React from 'react';

import _ from 'lodash';

import styles from '@app/_modules/cart/atoms/CartSummary/styles';
import CustomView from '@app/components/CustomView/index';
// import Icon from 'react-native-vector-icons/Feather';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text/index';
import {numberFormat, numberFormatBy} from '@app/helpers/General';
import {Colors} from '@app/styles';

const CartSummary = ({t, cartPrices, expand}) => {
  const cartPrice = _.get(cartPrices, 'grand_total.value');
  const cartPriceWithoutDiscount = _.get(
    cartPrices,
    'subtotal_excluding_tax.value',
  );
  const shippingPrice = _.get(cartPrices, 'shippingAmount');
  const currency = _.get(cartPrices, 'grand_total.currency');

  const discounts = _.get(cartPrices, 'discounts') ?? [];
  const promotions = _.get(cartPrices, 'promotions') ?? [];
  const totalDiscount = _.sumBy(discounts, 'amount.value');

  // 将 Student Discount 分离出来，使其显示在其他所有标签/促销的下面
  const isStudentDiscountItem = item => /student/i.test(item?.label || '');
  const otherDiscounts = discounts.filter(item => !isStudentDiscountItem(item));
  const studentDiscounts = discounts.filter(isStudentDiscountItem);

  if (cartPrices) {
    return (
      <CustomView marginTop={-20} marginHorizontal={10} padding={10}>
        <RenderIf condition={expand}>
          <CustomView row spaceBetween style={styles.normalPriceItem}>
            <Text style={{fontSize: 14}}>{t('cart_checkout.subtotal')}</Text>
            <Text style={{fontSize: 14}}>
              {numberFormat(currency, cartPriceWithoutDiscount, ',', 2)}
            </Text>
          </CustomView>

          <CustomView row spaceBetween style={styles.normalPriceItem}>
            <Text style={{fontSize: 14}}>{t('cart_checkout.shipping')}</Text>
            <Text style={{fontSize: 14}}>
              {shippingPrice
                ? numberFormat(currency, shippingPrice, ',', 2)
                : 'Gratis'}
            </Text>
          </CustomView>

          {/* 所有折扣在一起：每个折扣 + 总折扣；一个折扣都没有时整个区块不显示 */}
          <RenderIf
            condition={_.size(discounts) > 0 || _.size(promotions) > 0}>
            <CustomView paddingTop={10} style={styles.discountWrap}>
              {otherDiscounts.map((item, index) => {
                const isProductDiscount = item.label === 'Discount Product';
                const isCartDiscount = item.label === 'Discount Cart';
                const isCouponDiscount = !isProductDiscount && !isCartDiscount;
                if (isCartDiscount) {
                  return null;
                }
                const discValue = _.get(item, 'amount.value');
                return (
                  <CustomView
                    key={`discount-${index}`}
                    row
                    spaceBetween
                    paddingVertical={3}>
                    {isCouponDiscount ? (
                      <>
                        <CustomView
                          style={{
                            backgroundColor: '#FFF0E6',
                            borderRadius: 15,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                          }}>
                          <Text style={{fontSize: 12, color: '#F96D01'}} bold>
                            {item.label}
                          </Text>
                        </CustomView>
                        <Text style={{fontSize: 12, color: '#F96D01'}}>
                          {'-'}
                          {numberFormat(currency, discValue, ',', 2)}
                        </Text>
                      </>
                    ) : (
                      <>
                        <CustomView paddingRight={20}>
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#888',
                            }}>
                            {isProductDiscount
                              ? 'Product Discount'
                              : item.label}
                          </Text>
                        </CustomView>
                        <Text style={{fontSize: 12, color: '#888'}}>
                          {'-'}
                          {numberFormat(currency, discValue, ',', 2)}
                        </Text>
                      </>
                    )}
                  </CustomView>
                );
              })}
              {promotions.map((item, index) => (
                <CustomView
                  key={`promotion-${index}`}
                  row
                  spaceBetween
                  paddingVertical={3}>
                  <CustomView
                    style={{
                      backgroundColor: '#FFF0E6',
                      borderRadius: 15,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}>
                    <Text style={{fontSize: 12, color: '#F96D01'}} bold>
                      {item.label}
                    </Text>
                  </CustomView>
                  <Text style={{fontSize: 12, color: '#F96D01'}}>
                    {'-'}
                    {numberFormat(
                      _.get(item, 'amount.currency') || currency,
                      _.get(item, 'amount.value'),
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
              ))}
              {/* Student Discount：黄色标准样式，显示在其他所有标签/促销的下面 */}
              {studentDiscounts.map((item, index) => {
                const discValue = _.get(item, 'amount.value');
                return (
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
                      }}>
                      <Text style={{fontSize: 12, color: '#F96D01'}} bold>
                        {item.label}
                      </Text>
                    </CustomView>
                    <Text style={{fontSize: 12, color: '#F96D01'}}>
                      {'-'}
                      {numberFormat(currency, discValue, ',', 2)}
                    </Text>
                  </CustomView>
                );
              })}
            <CustomView row spaceBetween paddingVertical={3}>
              <Text style={{fontSize: 14}}>
                {t('cart_checkout.totalDiscount')}
              </Text>
              <Text style={{fontSize: 14}}>
                {'-'}
                {numberFormat(currency, totalDiscount, ',', 2)}
              </Text>
            </CustomView>
          </CustomView>
          </RenderIf>
          <RenderIf condition={cartPrices?.loyalty_points?.point}>
            <CustomView
              row
              spaceBetween
              paddingVertical={12}
              style={styles.normalPriceItem}>
              <CustomView row>
                <Text style={{fontSize: 14}}>
                  {t('cart.redeemPoints', {
                    point: numberFormatBy('', cartPrices?.loyalty_points?.point),
                  })}
                </Text>
              </CustomView>
              <Text style={{fontSize: 14}}>
                {'-'}
                {numberFormat(
                  cartPrices?.loyalty_points?.loyalty_points_total?.currency,
                  cartPrices?.loyalty_points?.loyalty_points_total?.value,
                  ',',
                  2,
                )}
              </Text>
            </CustomView>
          </RenderIf>
        </RenderIf>
        <CustomView row spaceBetween paddingTop={expand ? 12 : 15}>
          <Text bold style={{fontSize: 16}}>
            {t('cart.orderTotal')}
          </Text>
          <Text style={{fontSize: 16}} bold color={Colors.PRIMARY}>
            {numberFormat(currency, cartPrice, ',', 2)}
          </Text>
        </CustomView>
      </CustomView>
    );
  }

  return <></>;
};

export default CartSummary;
