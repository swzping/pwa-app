import React, {useContext, useEffect, useRef, useState} from 'react';
import {StyleSheet} from 'react-native';

import {TouchableRipple} from 'react-native-paper';

import {useReactiveVar} from '@apollo/client';
import crashlytics from '@react-native-firebase/crashlytics';
import RenderIf from '@root/_src/core/components/RenderIf/index';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import {SET_SHIPPING_METHOD} from '@app/_modules/cart/services/schema';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import AtomShimmerCheckoutShippingMethod from '@app/components/_ShimmerSkeleton/atoms/ShimmerCheckoutShippingMethod/index';
import CustomView from '@app/components/CustomView/index';
import RadioButton from '@app/components/RadioButton/index';
import Text from '@app/components/Text/index';
import Analytics from '@app/helpers/Analytics';
import {
  HOME_DELIVERY,
  PICKUP_IN_STORE,
  SHIPPING_METHOD_CODE,
} from '@app/helpers/Constants';
import {numberFormat} from '@app/helpers/General';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useRefetchShipping} from '@app/hooks/useRefetchShipping';
import {rxCartDataAddress, rxCartId} from '@app/services/cache';
import {Colors} from '@app/styles/index';

const styles = StyleSheet.create({
  shippingItem: {
    flexDirection: 'row',
  },
});

const BlockShippingMethod = () => {
  const {t} = useTranslation();
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const ctxCheckout = useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  const getRxCartDataAddress = useReactiveVar(rxCartDataAddress);
  let getAvailableShippingMethod =
    getRxCartDataAddress?.shipping_addresses[0]?.available_shipping_methods ??
    [];

  // filtering
  if (ctxCheckout?.isCart?.selectedDeliveryMethod === HOME_DELIVERY) {
    getAvailableShippingMethod = getAvailableShippingMethod.filter(
      shipping => shipping.method_code !== 'pickup',
    );
  } else if (ctxCheckout?.isCart?.selectedDeliveryMethod === PICKUP_IN_STORE) {
    getAvailableShippingMethod = getAvailableShippingMethod.filter(
      shipping => shipping.method_code === 'pickup',
    );
  } else {
    getAvailableShippingMethod = [];
  }

  const isShowShippingMethod = getAvailableShippingMethod?.length > 0 ?? 0;
  const {refetch: refetchShipping} = useRefetchShipping();
  const {
    setCart: setDataAvailablePaymentMethod,
    loading: isLoadingGetDataAvailablePaymentMethod,
  } = useCarts({
    initialized: false,
    type: TYPES.AVAILABLE_PAYMENT,
  });
  const {setCart: setPrices} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });
  const {
    onRefetchData: onPostSelectShippingMethodHook,
    loading: isLoadingSelectedShippingMethod,
  } = useCustomMutation({
    schema: SET_SHIPPING_METHOD,
  });

  let mount = useRef();

  // ComponentDidMount
  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
    };
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function useEffect
   * @summary for set Selected Shipping Method
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount.current) {
      const shippingAddressFirst = _.get(
        getRxCartDataAddress,
        'shipping_addresses[0]',
      );
      if (shippingAddressFirst && isShowShippingMethod) {
        const selectedShippingMethodCart = _.get(
          shippingAddressFirst,
          'selected_shipping_method',
        );

        if (selectedShippingMethodCart) {
          const getIndex = getAvailableShippingMethod.findIndex(
            item =>
              item.carrier_code === selectedShippingMethodCart.carrier_code &&
              item.method_code === selectedShippingMethodCart.method_code,
          );

          setPrices();
          setDataAvailablePaymentMethod();
          setSelectedShippingMethod(getIndex);
          ctxCheckout.setIsCart({
            ...ctxCheckout.isCart,
            selectedShippingAddress: true,
            selectedShippingMethod: true,
          });
        } else {
          setPrices();
          //   setDataAvailablePaymentMethod();
          setSelectedShippingMethod(null);
          ctxCheckout.setIsCart({
            ...ctxCheckout.isCart,
            selectedShippingAddress: true,
            selectedShippingMethod: false,
          });
        }
      }
    }
  }, [getRxCartDataAddress, isShowShippingMethod]);

  /**
   * ---------------------------------------------------- *
   * @function onSelectShippingMethod
   * @summary for process selected shipping method
   * ---------------------------------------------------- *
   */
  const onSelectShippingMethod = async ({index, item}) => {
    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      loadingButtonOrder: true,
    });

    try {
      const carrier_code = item?.carrier_code;
      const method_code = item?.method_code;
      const cart_id = getRxCartId;
      const shipping_methods = [{carrier_code, method_code}];
      await ctxCheckout?.resetPoints();
      const res = await onPostSelectShippingMethodHook({
        paramsOpt: {isReturn: true},
        params: {
          input: {cart_id, shipping_methods},
        },
      });

      if (res?.data) {
        await setPrices();
        await setDataAvailablePaymentMethod(
          res?.data?.setShippingMethodsOnCart?.cart,
        );
        refetchShipping(res?.data?.setShippingMethodsOnCart);
        setSelectedShippingMethod(index);

        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          getReviewOrder: false,
          selectedShippingMethod: true,
          loadingButtonOrder: false,
        });

        Analytics.eventAddShippingInfo({
          shipping_tier: `${carrier_code}-${method_code}`,
        });
        crashlytics().setAttribute(
          SHIPPING_METHOD_CODE,
          carrier_code.toString(),
        );
      } else {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          loadingButtonOrder: false,
        });
      }
    } catch (err) {
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        loadingButtonOrder: false,
      });
      console.log('[err] selected shipping method', err);
    }
  };
  return (
    <CustomView paddingBottom={12}>
      <CustomView row paddingHorizontal={15} paddingTop={10}>
        <CustomView width={'100%'} marginBottom={10}>
          <Text bold style={{fontSize: 16}}>
            {t('cart_checkout.shippingMethod')}
          </Text>
        </CustomView>
      </CustomView>
      {/* <RenderIf
        condition={
          !isLoadingGetDataAvailablePaymentMethod &&
          ctxCheckout?.isCart?.selectedShippingAddress &&
          getAvailableShippingMethod?.length < 1
        }>
        <CustomView paddingHorizontal={10} marginBottom={10}>
          <Text color={Colors.GRAY_DARK}>{t('noData')}</Text>
        </CustomView>
      </RenderIf> */}
      <RenderIf
        condition={
          !isLoadingGetDataAvailablePaymentMethod &&
          !isShowShippingMethod &&
          _.size(getAvailableShippingMethod) === 0
        }>
        <CustomView paddingHorizontal={15} marginBottom={10}>
          <Text color={Colors.GRAY_DARK} style={{fontSize: 14}}>
            {t('cart_checkout.chooseShippingMethod')}
          </Text>
        </CustomView>
      </RenderIf>
      <RenderIf
        condition={
          isLoadingGetDataAvailablePaymentMethod && !isShowShippingMethod
        }>
        <AtomShimmerCheckoutShippingMethod />
      </RenderIf>
      <RenderIf condition={ctxCheckout?.isCart?.selectedShippingAddress}>
        <CustomView paddingHorizontal={15}>
          {isShowShippingMethod &&
            getAvailableShippingMethod?.map((item, index) => {
              const isSelected = index === selectedShippingMethod;
              const isAvailable = item?.available;
              const getMethodTitle = item?.method_title;
              const getCarrierCode = item?.carrier_code;
              const getCarrierTitle = item?.carrier_title;
              const getPrice = numberFormat(
                item?.amount?.currency,
                item?.amount?.value,
                ',',
                2,
              );
              const getOriginalPrice =
                item?.amount_before_discount &&
                item?.amount_before_discount?.value !== item?.amount?.value
                  ? numberFormat(
                      item?.amount_before_discount?.currency,
                      item?.amount_before_discount?.value,
                      ',',
                      2,
                    )
                  : null;
              if (!isAvailable) {
                return null;
              }
              return (
                <TouchableRipple
                  key={`shipping-method-${index}-${getCarrierCode}`}
                  style={[
                    styles.shippingItem,
                    {
                      opacity:
                        isLoadingSelectedShippingMethod ||
                        ctxCheckout?.isCart?.loadingButtonOrder
                          ? 0.4
                          : 1,
                    },
                  ]}
                  onPress={
                    isLoadingSelectedShippingMethod
                      ? false
                      : () => onSelectShippingMethod({index, item})
                  }>
                  <CustomView flex paddingVertical={5}>
                    <CustomView flex row horizontalCenter spaceBetween>
                      <CustomView flex row horizontalCenter>
                        <RadioButton
                          selected={isSelected}
                          color={Colors.PRIMARY}
                          activeColor={Colors.PRIMARY}
                          size={20}
                        />
                        <Text style={{fontSize: 14, paddingLeft: 6}}>
                          {`${getMethodTitle} - ${getCarrierTitle}`}
                        </Text>
                      </CustomView>
                    </CustomView>
                    <CustomView style={{marginTop: 5, paddingLeft: 26}}>
                      {getOriginalPrice && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: Colors.GRAY_MEDIUM,
                            textDecorationLine: 'line-through',
                          }}>
                          {getOriginalPrice}
                        </Text>
                      )}
                      <Text bold style={{fontSize: 14, color: Colors.PRIMARY}}>
                        {getPrice}
                      </Text>
                    </CustomView>
                  </CustomView>
                </TouchableRipple>
              );
            })}
        </CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default BlockShippingMethod;
