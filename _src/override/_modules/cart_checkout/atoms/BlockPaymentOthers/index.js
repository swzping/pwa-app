import React, {useContext, useMemo} from 'react';

import i18next from 'i18next';

import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import CheckoutCouponCode from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/_coupon';
// import CheckoutGiftCard from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/_gift';
// import CheckoutMyPoint from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/_point';
import RedeemMyPoints from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/_redeemPoints';
import CustomView from '@app/components/CustomView/index';
import Divider from '@app/components/Divider/index';
import Text from '@app/components/Text/index';
import {IS_IOS} from '@app/helpers/Constants';

const dataOthers = [
  // hide Kode Kupon
  {
    label: i18next.t('cart_checkout.label.voucherCode'),
    // label: i18next.t('cart_checkout.enterCouponCode'),
    component: CheckoutCouponCode,
  },
  // {
  //   label: i18next.t('cart_checkout.applyGiftCard'),
  //   component: CheckoutGiftCard,
  // },
  // {
  //   label: i18next.t('cart_checkout.spendYourPoints'),
  //   component: CheckoutMyPoint,
  // },
  {
    label: i18next.t('cart_checkout.label.myPointHeader'),
    component: RedeemMyPoints,
  },
];

const withCancelPoints = (WrappedComponent, onCancelPoints) => {
  return props => (
    <WrappedComponent onCancelPoints={onCancelPoints} {...props} />
  );
};

const BlockPaymentOthers = ({onCancelPoints}) => {
  const ctxCheckout = useContext(CheckoutContext);
  const loadingApplyPoint = ctxCheckout?.isCart?.loadingApplyPoint;
  const loadingButtonOrder = ctxCheckout?.isCart?.loadingButtonOrder;

  const components = useMemo(() => {
    const baseComponents = [...dataOthers];

    return baseComponents.map(item => {
      if (item.component === RedeemMyPoints) {
        return {
          ...item,
          component: withCancelPoints(RedeemMyPoints, onCancelPoints),
        };
      }
      return item;
    });
  }, [onCancelPoints]);

  if (
    !ctxCheckout?.isCart?.selectedShippingMethod ||
    ctxCheckout?.isCart?.getReviewOrder
  ) {
    return null;
  }
  return (
    <CustomView>
      <CustomView
        style={{opacity: loadingApplyPoint || loadingButtonOrder ? 0.4 : 1}}>
        {components.map((item, index) => {
          const PaymentOthersComponent = item?.component;
          return (
            <CustomView key={index}>
              <CustomView paddingHorizontal={15} paddingTop={15} paddingBottom={item.component === CheckoutCouponCode ? 15 : 0} horizontalCenter={item.component === CheckoutCouponCode} row={item.component === CheckoutCouponCode}  spaceBetween={item.component === CheckoutCouponCode}>
                <Text bold style={{fontSize: 16}}>
                  {item.label}
                </Text>
                <PaymentOthersComponent />
              </CustomView>
              <Divider borderWidth={IS_IOS ? 4 : 6} />
            </CustomView>
          );
        })}
      </CustomView>
    </CustomView>
  );
};

export default BlockPaymentOthers;
