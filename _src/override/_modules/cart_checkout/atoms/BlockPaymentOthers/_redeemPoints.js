import React, {useContext} from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text';
import {numberFormat, numberFormatBy} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import {rxSelectedPoint} from '@app/services/cache';
import {Colors} from '@app/styles/index';

const PointRedeemButton = ({
  t,
  pointsRedeemed,
  isLoading,
  currency,
  showCancel,
  onSelectPoint,
  onCancel,
  onApply,
}) => {
  if (showCancel) {
    return (
      <CustomView row horizontalCenter paddingHorizontal={0}>
        <Text style={[styles.btnApply, styles.disabled]}>
          {'-'}
          {numberFormat(currency, pointsRedeemed, ',', 2)}
        </Text>
        <TouchableOpacity disabled={isLoading} onPress={onCancel}>
          <Text style={styles.btnApply}>{t('cart_checkout.btn.cancel')}</Text>
        </TouchableOpacity>
      </CustomView>
    );
  }

  return (
    <CustomView
      row
      horizontalCenter
      disabled={isLoading}
      onPress={onSelectPoint}>
      <Text style={styles.btnApply}>
        {t('cart_checkout.btn.apply')}
      </Text>
      <Icon name={'chevron-right'} size={20} color={Colors.PRIMARY} />
    </CustomView>
  );
};

const RedeemMyPoints = ({onCancelPoints}) => {
  const {t} = useTranslation();
  const ctxCheckout = useContext(CheckoutContext);
  const getRxSelectedPoint = useReactiveVar(rxSelectedPoint);

  const pointsRedeemed =
    getRxSelectedPoint || ctxCheckout?.redeemedPoints?.pointsRedeemed;

  const showCancel = !!ctxCheckout?.redeemedPoints?.pointsRedeemed;

  const onApply = () => {
    navigateTo(modules.point_selection.enable, modules.point_selection.name, {
      balancePoint: ctxCheckout?.redeemedPoints?.totalPoints,
    });
  };

  return (
    <>
    <CustomView row paddingTop={2} horizontalStart>
      <Icon name={'info'} size={14} color={Colors.RED} style={{marginTop: 2}} />
      <Text style={{marginLeft: 4, fontSize: 12, color: Colors.RED, fontWeight: '500'}}>Point Redemption transaction is non-refundable/non-exchangeable.</Text>
    </CustomView>
    <CustomView
      paddingVertical={16}
      style={{opacity: ctxCheckout?.isLoadingCartPrice ? 0.4 : 1}}>
      <CustomView row horizontalCenter>
        <CustomView flexNumber={1}>
          <Text style={{fontSize: 14}}>
            {t('cart_checkout.label.myPoints', {
              points: numberFormatBy(
                '',
                ctxCheckout?.redeemedPoints?.totalPoints,
              ),
            })}
          </Text>
        </CustomView>
        <PointRedeemButton
          t={t}
          pointsRedeemed={pointsRedeemed}
          isLoading={ctxCheckout?.isLoadingCartPrice}
          currency={ctxCheckout?.redeemedPoints?.currency}
          showCancel={showCancel}
          onSelectPoint={onApply}
          onCancel={onCancelPoints}
          onApply={onApply}
        />
      </CustomView>
    </CustomView>
    </>
  );
};

const styles = StyleSheet.create({
  myPointHeader: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    color: '#BDBDBD',
    paddingRight: 16,
  },
  btnApply: {
    marginRight: 2,
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default RedeemMyPoints;
