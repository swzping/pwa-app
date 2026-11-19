import React, {useState, useEffect, useContext} from 'react';
import {StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import {FORM_FIELD, IS_IOS} from '@app/helpers/Constants';
import {useReactiveVar} from '@apollo/client';
import {rxCartId} from '@app/services/cache';
import {TouchableRipple} from 'react-native-paper';
import {Colors, Typography} from '@app/styles/index';
import {getErrorGQL} from '@app/helpers/General';
import {APPLY_MULTIPLE_COUPONS} from '@app/_modules/cart/services/schema';

import Text from '@app/components/Text/index';
import CustomView from '@app/components/CustomView/index';
import Forms from '@app/components/_Forms/index';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import useCustomMutation from '@app/hooks/useCustomMutation';
import RenderIf from '@app/components/RenderIf/index';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';

const styles = StyleSheet.create({
  formContainer: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
});

const CheckoutCouponCode = () => {
  const {t} = useTranslation();
  const ctxCheckout = useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  const [dataCoupon, setDataCoupon] = useState({
    loading: false,
    isApplied: false,
    isError: false,
    errMessage: null,
    code: null,
  });
  const {onRefetchData: onApplyMultipleCoupons} = useCustomMutation({
    schema: APPLY_MULTIPLE_COUPONS,
  });
  const {data: getDataCoupon} = useCarts({
    initialized: true,
    type: TYPES.APPLIED_COUPON,
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
   * @dependency [getDataCoupon]
   * @summary for get latest coupon
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    console.log('getDataCoupon', getDataCoupon);
    if (getDataCoupon !== null) {
      if (getDataCoupon?.length && getDataCoupon?.length > 0) {
        setDataCoupon({
          ...dataCoupon,
          isApplied: true,
          code: getDataCoupon[0]?.code,
        });
      }
    }
  }, [getDataCoupon]);

  /**
   * ---------------------------------------------------- *
   * @function onProcessCoupon
   * @param {couponCode} data
   * @summary for coupon code apply | remove
   * ---------------------------------------------------- *
   */
  const onProcessCoupon = async data => {
    const cart_id = getRxCartId;
    const coupon_code = data?.couponCode;
    if (coupon_code === '') {
      setDataCoupon({
        ...dataCoupon,
        isError: true,
        errMessage: t('cart_checkout.error.requiredCodeCoupon'),
      });
      return;
    }
    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingButtonOrder: true,
    });
    // applied coupon
    if (coupon_code !== '' && !dataCoupon?.isApplied) {
      try {
        setDataCoupon({...dataCoupon, loading: true});
        const res = await onApplyMultipleCoupons({
          paramsOpt: {isReturn: true},
          params: {
            input: {cart_id, couponCodes: [coupon_code]},
          },
        });

        if (res) {
          const getError = getErrorGQL(res);
          if (getError.isError) {
            setDataCoupon({
              ...dataCoupon,
              loading: false,
              isError: getError.isError,
              errMessage: getError.message,
            });
            ctxCheckout?.setIsCart({
              ...ctxCheckout?.isCart,
              loadingButtonOrder: false,
            });
            return;
          }
          if (res?.data?.applyMultipleCoupon[0]?.isApplied === 'true') {
            setDataCoupon({loading: false, isApplied: true, code: coupon_code});
            setDataPrice();
            setAvailablePaymentMethod();
          } else {
            setDataCoupon({
              ...dataCoupon,
              isError: true,
              errMessage: t('cart_checkout.error.invalidCouponCode'),
              loading: false,
            });
          }
        } else {
          setDataCoupon({...dataCoupon, loading: false});
        }

        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
      } catch (err) {
        console.log('[err] applied coupon', err);
        setDataCoupon({...dataCoupon, loading: false});
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
      }
      // remove coupon
    } else {
      try {
        setDataCoupon({...dataCoupon, loading: true});
        const res = await onApplyMultipleCoupons({
          paramsOpt: {isReturn: true},
          params: {
            input: {cart_id, couponCodes: ['']},
          },
        });
        if (res?.data) {
          setDataCoupon({loading: false, isApplied: false, code: null});
          setDataPrice();
          setAvailablePaymentMethod();
        } else {
          setDataCoupon({...dataCoupon, loading: false});
        }
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
      } catch (err) {
        console.log('[err] applied coupon', err);
        setDataCoupon({...dataCoupon, loading: false});
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const {formInputInfo}
   * @summary for data form input info
   * ---------------------------------------------------- *
   */
  const formInputInfo = dataCoupon.isError ? dataCoupon.errMessage : false;

  /**
   * ---------------------------------------------------- *
   * @const {forms}
   * @summary for generate form builder object
   * ---------------------------------------------------- *
   */
  const forms = [
    {
      name: 'couponCode',
      type: FORM_FIELD.INPUT,
      defaultValue: '',
      autoCapitalize: 'none',
      value: '',
      rules: {},
      formInputInfo,
      formInputInfoTextProps: {
        style: dataCoupon.isError
          ? IS_IOS
            ? {
                color: Colors.ALERT_SECONDARY2,
                ...Typography.FONT_BOLD,
                fontWeight: 'bold',
              }
            : {
                color: Colors.ALERT_SECONDARY2,
                ...Typography.FONT_BOLD,
              }
          : {},
      },
      /*
        themeInputCustom: {
          colors: {primary: 'green', underlineColor: 'transparent'},
        },
        */
    },
  ];

  return (
    <CustomView marginTop={15}>
      <RenderIf condition={!dataCoupon?.isApplied}>
        <Text bold>{t('cart_checkout.label.couponCode')}</Text>
        <Forms
          fields={forms}
          buttonTitle={t('apply')}
          onSubmit={onProcessCoupon}
          loading={dataCoupon.loading}
          formContainerStyle={styles.formContainer}
          buttonStyle={{
            marginTop: 20,
            marginBottom: 0,
            paddingVertical: 0,
            borderWidth: 2,
            borderColor: Colors.PRIMARY,
            borderRadius: 30,
          }}
          buttonLabelStyle={
            IS_IOS
              ? {fontWeight: 'bold', ...Typography.FONT_BOLD}
              : {...Typography.FONT_BOLD}
          }
        />
      </RenderIf>
      <RenderIf condition={dataCoupon?.isApplied}>
        <CustomView row>
          <Text>{dataCoupon?.code}</Text>
          <TouchableRipple onPress={() => onProcessCoupon()}>
            <CustomView marginLeft={5}>
              <Text bold underline color={Colors.PRIMARY}>
                {t('remove')}
              </Text>
            </CustomView>
          </TouchableRipple>
        </CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default CheckoutCouponCode;
