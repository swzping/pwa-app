import React, {useContext, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text/index';
import CustomView from '@app/components/CustomView/index';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';
import {
  HOME_DELIVERY,
  PICKUP_IN_STORE,
  SHIPPING_METHOD_CODE,
} from '@app/helpers/Constants';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {rxCartId, rxAppSnackbar, rxCartDataAddress} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';
import {Colors} from '@app/styles/index';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import {SET_SHIPPING_METHOD} from '@app/_modules/cart/services/schema';
import Analytics from '@app/helpers/Analytics';
// import {useRefetchShipping} from '@app/hooks/useRefetchShipping';
import crashlytics from '@react-native-firebase/crashlytics';
// import Shimmer from '@app/components/_Shimmer/index';
import Divider from '@app/components/Divider/index';
import {isIOS} from '@app/styles/mixins.new';

const BlockDeliveryMethod = () => {
  const {t} = useTranslation();
  const ctxCheckout = useContext(CheckoutContext);
  const getRxCartId = useReactiveVar(rxCartId);
  const getRxCartDataAddress = useReactiveVar(rxCartDataAddress);
  const getAvailableShippingMethod =
    getRxCartDataAddress?.shipping_addresses[0]?.available_shipping_methods ??
    [];
  // const {refetch: refetchShipping} = useRefetchShipping();
  const {setCart: setDataCartAddress} = useCarts({
    initialized: false,
    type: TYPES.ADDRESS,
  });

  const {
    setCart: setDataAvailablePaymentMethod,
    // loading: isLoadingGetDataAvailablePaymentMethod,
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

  // const isLoadingShipping = !getRxCartDataAddress?.shipping_addresses[0];
  const selectedDeliveryMethod = ctxCheckout?.isCart?.selectedDeliveryMethod;
  const selectedShippingMethod =
    getRxCartDataAddress?.shipping_addresses[0]?.selected_shipping_method;

  useEffect(() => {
    const methodCode = selectedShippingMethod?.method_code;
    if (methodCode) {
      let deliveryMethod = null;
      if (methodCode === 'pickup') {
        deliveryMethod = PICKUP_IN_STORE;
      } else {
        deliveryMethod = HOME_DELIVERY;
      }

      if (deliveryMethod !== selectedDeliveryMethod) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          selectedDeliveryMethod: deliveryMethod,
        });
      }
    }
  }, [selectedShippingMethod]);

  const onSelectDelivery = async method => {
    if (
      ctxCheckout?.isCart?.loadingButtonOrder ||
      isLoadingSelectedShippingMethod
    ) {
      rxAppSnackbar({message: t('cart_checkout.error.loadingMessage')});
      return;
    }
    const selectedDeliveryMethodBackup =
      ctxCheckout?.isCart?.selectedDeliveryMethod;

    ctxCheckout?.setIsCart({
      ...ctxCheckout?.isCart,
      selectedDeliveryMethod: method,
      loadingButtonOrder: true,
    });

    try {
      let item = null;
      if (method === HOME_DELIVERY) {
        const arrHomeDelivery = getAvailableShippingMethod.filter(
          shipping => shipping.method_code !== 'pickup',
        );
        item = arrHomeDelivery[0] ?? null;
      } else if (method === PICKUP_IN_STORE) {
        const arrPickupInStore = getAvailableShippingMethod.filter(
          shipping => shipping.method_code === 'pickup',
        );
        item = arrPickupInStore[0] ?? null;
      }

      // return nothing if no shipping item
      if (!item) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          selectedDeliveryMethod: selectedDeliveryMethodBackup,
          loadingButtonOrder: false,
        });
        return;
      }

      const carrier_code = item?.carrier_code;
      const method_code = item?.method_code;
      const cart_id = getRxCartId;
      const shipping_methods = [{carrier_code, method_code}];
      const res = await onPostSelectShippingMethodHook({
        paramsOpt: {isReturn: true},
        params: {
          input: {cart_id, shipping_methods},
        },
      });

      if (res?.data) {
        ctxCheckout?.setIsCart({
          ...ctxCheckout?.isCart,
          selectedDeliveryMethod: method,
          selectedShippingMethod: true,
          loadingButtonOrder: false,
        });
        setPrices();
        setDataAvailablePaymentMethod(
          res?.data?.setShippingMethodsOnCart?.cart,
        );
        setDataCartAddress(res?.data?.setShippingMethodsOnCart?.cart);
        // refetchShipping(res?.data?.setShippingMethodsOnCart);
        // setSelectedShippingMethod(index);
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
          selectedDeliveryMethod: selectedDeliveryMethodBackup,
          loadingButtonOrder: false,
        });
      }
    } catch (err) {
      ctxCheckout?.setIsCart({
        ...ctxCheckout?.isCart,
        selectedDeliveryMethod: selectedDeliveryMethodBackup,
        loadingButtonOrder: false,
      });
      console.log('[err] selected shipping method', err);
    }
  };

  // const isShowPickup = getAvailableShippingMethod.filter(
  //   shipping => shipping.method_code === 'pickup',
  // ).length;

  const isShowHomeDelivery = getAvailableShippingMethod.filter(
    shipping => shipping.method_code !== 'pickup',
  ).length;

  const isLoading =
    (!getAvailableShippingMethod.length &&
      ctxCheckout?.isCart?.selectedShippingAddress) ||
    (ctxCheckout?.isCart?.selectedDeliveryMethod === null &&
      !!selectedShippingMethod?.method_code);

  // belum ada alamat sama sekali
  // if (!isLoading && !ctxCheckout?.isCart?.selectedShippingAddress) {
  //   return <></>;
  // }

  return (
    <CustomView paddingHorizontal={15} paddingTop={15}>
      <Text bold style={{fontSize: 16}}>
        {t('cart_checkout.deliveryMethod')}
      </Text>
      <RenderIf condition={isLoading}>
        <CustomView marginVertical={15}>
          {/* <Shimmer
            wrapperStyle={{borderRadius: 5, height: 100, width: '100%'}}
          /> */}
          <Text small_12 color={Colors.GRAY_DARK}>
            {t('cart_checkout.error.noDeliveryMethod')}
          </Text>
        </CustomView>
      </RenderIf>
      <RenderIf condition={!isLoading}>
        <CustomView row spaceBetween marginVertical={15}>
          <RenderIf condition={true}>
            <CustomView
              column
              padding={10}
              border={1}
              borderRadius={10}
              borderColor={
                selectedDeliveryMethod === HOME_DELIVERY
                  ? Colors.PRIMARY
                  : Colors.GRAY_DARK
              }
              flexNumber={1}
              marginRight={5}
              onPress={() => {
                if (!isShowHomeDelivery) {
                  return;
                }
                onSelectDelivery(HOME_DELIVERY);
              }}>
              <CustomView>
                <Text
                  bold
                  style={{fontSize: 14}}
                  color={
                    selectedDeliveryMethod === HOME_DELIVERY
                      ? Colors.PRIMARY
                      : Colors.GRAY_DARK
                  }>
                  {t('cart_checkout.homeDeliveryTitle')}
                </Text>
              </CustomView>
              <CustomView>
                <Text
                  style={{fontSize: 14}}
                  color={
                    selectedDeliveryMethod === HOME_DELIVERY
                      ? Colors.PRIMARY
                      : Colors.GRAY_DARK
                  }>
                  We deliver your order to your home
                </Text>
              </CustomView>
            </CustomView>
          </RenderIf>
          <CustomView flexNumber={1} />
          {/* <RenderIf condition={true}>
            <CustomView
              column
              padding={10}
              border={1}
              borderRadius={10}
              borderColor={
                selectedDeliveryMethod === PICKUP_IN_STORE
                  ? Colors.PRIMARY
                  : Colors.GRAY_DARK
              }
              flexNumber={1}
              marginLeft={5}
              onPress={() => {
                if (!isShowPickup) {
                  return;
                }
                onSelectDelivery(PICKUP_IN_STORE);
              }}>
              <CustomView>
                <Text
                  style={{fontSize: 14}}
                  bold
                  color={
                    selectedDeliveryMethod === PICKUP_IN_STORE
                      ? Colors.PRIMARY
                      : Colors.GRAY_DARK
                  }>
                  Pickup
                </Text>
              </CustomView>
              <CustomView>
                <Text
                  style={{fontSize: 14}}
                  color={
                    selectedDeliveryMethod === PICKUP_IN_STORE
                      ? Colors.PRIMARY
                      : Colors.GRAY_DARK
                  }>
                  Pickup your order at the store
                </Text>
              </CustomView>
            </CustomView>
          </RenderIf> */}
        </CustomView>
      </RenderIf>
      <Divider borderWidth={isIOS ? 0.5 : 3} />
    </CustomView>
  );
};

export default BlockDeliveryMethod;
