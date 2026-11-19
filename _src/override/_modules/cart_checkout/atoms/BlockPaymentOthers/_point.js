import React, {useState, useEffect, useContext} from 'react';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import useDataCustomer, {
  TYPES as TYPES_USER,
} from '@app/hooks/customer/useDataCustomer';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {getErrorGQL, numberFormat} from '@app/helpers/General';
import {TouchableRipple} from 'react-native-paper';
import {Colors} from '@app/styles/index';
import {useReactiveVar} from '@apollo/client';
import {
  rxAppSnackbar,
  rxCartId,
  rxCartAppliedRewardPoint,
  rxCartAppliedStoreCredit,
} from '@app/services/cache';
import {
  APPLIED_STORE_CREDIT,
  APPLY_REWARD_POINTS,
  REMOVED_REWARD_POINTS,
  REMOVED_STORE_CREDIT,
} from '@app/_modules/cart/services/schema';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView/index';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {isIOS} from '@app/styles/mixins.new';

import _ from 'lodash';

const styles = StyleSheet.create({
  btnApply: {
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isIOS ? 10 : 8,
    borderRadius: 8,
  },
  btnApplyRemove: {
    backgroundColor: Colors.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: isIOS ? 10 : 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
});

const CheckoutMyPoint = () => {
  const {t} = useTranslation();
  const ctxCheckout = useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  /* REWARD POINT */
  const [getDataPoint, setGetDataPoint] = useState({
    loading: false,
    isError: false,
    isApplied: false,
  });
  const {data: getCartRewardPoints} = useCarts({
    initialized: true,
    type: TYPES.APPLIED_REWARD_POINT,
  });
  const {data: getRewardPoints} = useDataCustomer({
    initialized: true,
    type: TYPES_USER.USER_REWARD_POINT,
  });
  const {onRefetchData: onApplyRewardPoints} = useCustomMutation({
    schema: APPLY_REWARD_POINTS,
  });
  const {onRefetchData: onRemoveRewardPoints} = useCustomMutation({
    schema: REMOVED_REWARD_POINTS,
  });
  const getRxAppliedRewardPoint = useReactiveVar(rxCartAppliedRewardPoint);

  /* STORE CREDIT */
  const getRxDataAppliedStoreCredit = useReactiveVar(rxCartAppliedStoreCredit);
  const [getDataCredit, setGetDataCredit] = useState({
    loading: false,
    isError: false,
    isApplied: false,
  });
  const {data: getCartStoreCredit} = useCarts({
    initialized: true,
    type: TYPES.APPLIED_STORE_CREDIT,
  });

  const {data: getStoreCredit} = useDataCustomer({
    initialized: true,
    type: TYPES_USER.USER_STORE_CREDIT,
  });
  const {onRefetchData: onAppliedStoreCredit} = useCustomMutation({
    schema: APPLIED_STORE_CREDIT,
  });
  const {onRefetchData: onRemoveStoreCredit} = useCustomMutation({
    schema: REMOVED_STORE_CREDIT,
  });
  const {setCart: setDataPrice} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });
  const {setCart: setAvailablePaymentMethod} = useCarts({
    initialized: false,
    type: TYPES.AVAILABLE_PAYMENT,
  });

  /**
   * ---------------------------------------------------- *
   * @dependency [getCartRewardPoints]
   * @summary for set is use store credit
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (getCartRewardPoints?.is_use_reward_points) {
      setGetDataPoint({
        ...getDataPoint,
        isApplied: getCartRewardPoints?.is_use_reward_points,
      });
    }
  }, [getCartRewardPoints]);

  /**
   * ---------------------------------------------------- *
   * @dependency [getCartStoreCredit]
   * @summary for set is use store credit
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (getCartStoreCredit?.is_use_store_credit) {
      setGetDataCredit({
        ...getDataCredit,
        isApplied: getCartStoreCredit?.is_use_store_credit,
      });
    }
  }, [getCartStoreCredit]);

  /**
   * ---------------------------------------------------- *
   * @function onProcessRewardPoint
   * @summary on process for reward point
   * ---------------------------------------------------- *
   */
  const onProcessRewardPoint = async () => {
    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingApplyPoint: true,
      loadingButtonOrder: true,
    });

    const cart_id = getRxCartId;
    if (!getDataPoint.isApplied) {
      try {
        const applied_reward_points = getRewardPoints?.balance;
        const res = await onApplyRewardPoints({
          paramsOpt: {isReturn: true},
          params: {
            input: {cart_id, applied_reward_points},
          },
        });

        const getError = getErrorGQL(res);
        if (getError.isError) {
          ctxCheckout?.setIsCart({
            ...ctxCheckout?.isCart,
            loadingApplyPoint: false,
            loadingButtonOrder: false,
          });
          rxAppSnackbar({message: getError?.message});
          return;
        }
        if (res?.data) {
          rxCartAppliedRewardPoint(
            _.get(
              res,
              'data.applyRewardPointsToCart.cart.applied_reward_points',
            ),
          );
          const resCart = _.get(res, 'data.applyRewardPointsToCart.cart');
          setAvailablePaymentMethod(resCart);
          setDataPrice(resCart);
          setGetDataPoint({
            ...getDataPoint,
            isApplied: true,
          });
        }

        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
      } catch (err) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
        console.log('[err] apply reward point', err);
      }
    } else {
      try {
        const res = await onRemoveRewardPoints({
          paramsOpt: {isReturn: true},
          params: {
            input: {cart_id},
          },
        });
        const getError = getErrorGQL(res);
        if (getError.isError) {
          rxAppSnackbar({message: getError?.message});
          ctxCheckout?.setIsCart({
            ...ctxCheckout?.isCart,
            loadingApplyPoint: false,
            loadingButtonOrder: false,
          });
          return;
        }
        if (res?.data) {
          rxCartAppliedRewardPoint(
            _.get(
              res,
              'data.removeRewardPointsFromCart.cart.applied_reward_points',
            ),
          );
          const resCart = _.get(res, 'data.removeRewardPointsFromCart.cart');
          setAvailablePaymentMethod(resCart);
          setDataPrice(resCart);
          setGetDataPoint({
            ...getDataPoint,
            isApplied: false,
          });
        }
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
      } catch (err) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
        console.log('[err] remove reward point', err);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onProcessStoreCredit
   * @summary on process for store credit
   * ---------------------------------------------------- *
   */
  const onProcessStoreCredit = async () => {
    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingApplyPoint: true,
      loadingButtonOrder: true,
    });
    const cart_id = getRxCartId;
    if (!getDataCredit.isApplied) {
      try {
        const res = await onAppliedStoreCredit({
          paramsOpt: {isReturn: true},
          params: {
            input: {cart_id},
          },
        });
        const getError = getErrorGQL(res);
        if (getError.isError) {
          rxAppSnackbar({message: getError?.message});
          ctxCheckout?.setIsCart({
            ...ctxCheckout?.isCart,
            loadingApplyPoint: false,
            loadingButtonOrder: false,
          });
          return;
        }
        if (res?.data) {
          rxCartAppliedStoreCredit(
            _.get(res, 'data.applyStoreCreditToCart.cart.applied_store_credit'),
          );
          const resCart = _.get(res, 'data.applyStoreCreditToCart.cart');
          setDataPrice(resCart);
          setAvailablePaymentMethod(resCart);
          setGetDataCredit({
            ...getDataCredit,
            isApplied: true,
          });
        }
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
      } catch (err) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
        console.log('[err] apply store credit', err);
      }
    } else {
      try {
        const res = await onRemoveStoreCredit({
          paramsOpt: {isReturn: true},
          params: {
            input: {cart_id},
          },
        });
        const getError = getErrorGQL(res);
        if (getError.isError) {
          rxAppSnackbar({message: getError?.message});
          ctxCheckout?.setIsCart({
            ...ctxCheckout?.isCart,
            loadingApplyPoint: false,
            loadingButtonOrder: false,
          });
          return;
        }
        if (res?.data) {
          rxCartAppliedStoreCredit(
            _.get(
              res,
              'data.removeStoreCreditFromCart.cart.applied_store_credit',
            ),
          );
          const resCart = _.get(res, 'data.removeStoreCreditFromCart.cart');
          setDataPrice(resCart);
          setAvailablePaymentMethod(resCart);
          setGetDataCredit({
            ...getDataCredit,
            isApplied: false,
          });
        }

        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
      } catch (err) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingApplyPoint: false,
          loadingButtonOrder: false,
        });
        console.log('[err] remove store credit', err);
      }
    }
  };

  return (
    <CustomView paddingBottom={20}>
      {/* MY POINT */}
      <CustomView row marginTop={20} horizontalCenter>
        <CustomView flexNumber={1}>
          <Text style={{fontSize: 14}}>
            {t('cart_checkout.label.myPoint')}
            {' ('}
            {getDataPoint.isApplied
              ? `${t('cart_checkout.label.point')} ${
                  getRxAppliedRewardPoint?.reward_points_amount
                }`
              : getRewardPoints?.formatedBalanceCurrency}
            {')'}
          </Text>
        </CustomView>
        <CustomView width={100}>
          <TouchableRipple
            style={
              getDataPoint.isApplied ? styles.btnApplyRemove : styles.btnApply
            }
            onPress={
              ctxCheckout?.isCart?.loadingApplyPoint ||
              ctxCheckout?.isCart?.loadingButtonOrder
                ? false
                : () => onProcessRewardPoint()
            }>
            <Text
              bold
              style={{fontSize: 14}}
              color={getDataPoint.isApplied ? Colors.PRIMARY : Colors.WHITE}>
              {getDataPoint.isApplied ? t('remove') : t('apply')}
            </Text>
          </TouchableRipple>
        </CustomView>
      </CustomView>
      {/* STORE CREDIT */}
      <CustomView row marginTop={20} horizontalCenter>
        <CustomView flexNumber={1}>
          <Text style={{fontSize: 14}}>
            {t('cart_checkout.label.storeCredit')}
            {' ('}
            {getDataCredit?.isApplied
              ? numberFormat(
                  null,
                  getRxDataAppliedStoreCredit?.store_credit_amount,
                  ',',
                  2,
                )
              : numberFormat(
                  null,
                  getStoreCredit?.current_balance?.value,
                  ',',
                  2,
                )}
            {')'}
          </Text>
        </CustomView>
        <CustomView width={100}>
          <TouchableRipple
            style={
              getDataCredit.isApplied ? styles.btnApplyRemove : styles.btnApply
            }
            onPress={
              ctxCheckout?.isCart?.loadingApplyPoint ||
              ctxCheckout?.isCart?.loadingButtonOrder
                ? false
                : () => onProcessStoreCredit()
            }>
            <Text
              bold
              style={{fontSize: 14}}
              color={getDataCredit.isApplied ? Colors.PRIMARY : Colors.WHITE}>
              {getDataCredit.isApplied ? t('remove') : t('apply')}
            </Text>
          </TouchableRipple>
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default CheckoutMyPoint;
