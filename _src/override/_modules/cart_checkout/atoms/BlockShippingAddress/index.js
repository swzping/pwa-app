/* eslint-disable max-len */
import React, {useState, useMemo, useEffect, useContext, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableRipple} from 'react-native-paper';
import {Colors} from '@app/styles/index';
import {useReactiveVar} from '@apollo/client';
import {
  rxUserAddresses,
  rxUserInformation,
  rxUserType,
} from '@app/services/cache';
import {
  TYPE_MODAL_SHIPPING_ADDRESS_FORM,
  TYPE_MODAL_SHIPPING_ADDRESS_LIST,
  USER_CUSTOMER,
  PICKUP_IN_STORE,
} from '@app/helpers/Constants';
import {CheckoutContext} from '@app/_modules/cart_checkout/_controller';

import RenderIf from '@app/components/RenderIf/index';
import CustomView from '@app/components/CustomView/index';
import Text from '@app/components/Text/index';
import {isIOS} from '@app/styles/mixins.new';
import Divider from '@app/components/Divider/index';
import AppModal from '@app/components/_AppModal/index';
import useCarts, {TYPES} from '@root/_src/override/hooks/carts/useCarts';
import AtomShimmerCheckoutShippingAddress from '@app/components/_ShimmerSkeleton/atoms/ShimmerCheckoutShippingAddress/index';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import _ from 'lodash';
import styles from '@app/_modules/cart_checkout/atoms/BlockShippingAddress/styles';
import CheckBox from '@app/components/CheckBox/index';

const BlockShippingAddress = () => {
  const {t} = useTranslation();
  const [showShippingAddressForm, setShowShippingAddressForm] = useState(false);
  const [showShippingAddressList, setShowShippingAddressList] = useState(false);
  const getRxUserType = useReactiveVar(rxUserType);
  const getRxUserInformation = useReactiveVar(rxUserInformation);
  const getRxUserAddresses = useReactiveVar(rxUserAddresses);
  const ctxCheckout = useContext(CheckoutContext);
  //   const {data: getDataCartInfo, loading: loadingDataCart} = useCarts({
  //     initialized: false,
  //     type: TYPES.INFO,
  //   });
  const {data: getDataAddress, loading: loadingDataAddress} = useCarts({
    initialized: true,
    type: TYPES.ADDRESS,
  });
  const {refetch: refetchAddress} = useRefetchAddress();
  const isFillShippingAddress = getDataAddress?.shipping_addresses?.length > 0;
  const isCustomerHasAddress =
    getRxUserAddresses && getRxUserAddresses.length > 0;

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
   * @dependency [getDataAddress]
   * @summary set cart value
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const fetchData = async () => {
      if (mount.current && !loadingDataAddress) {
        const shippingAddresses = _.get(getDataAddress, 'shipping_addresses');
        const billingAddress = _.get(getDataAddress, 'billing_address');
        const shippingAddressesLength = _.size(shippingAddresses);
        if (shippingAddresses) {
          // if shipping & billing have been selected
          if (shippingAddressesLength > 0 && billingAddress) {
            ctxCheckout.setIsCart({
              ...ctxCheckout.isCart,
              selectedShippingAddress: true,
            });
          }
          // for default shipping & billing address
          else {
            // loading button - start
            ctxCheckout.setIsCart({
              ...ctxCheckout.isCart,
              loadingButtonOrder: true,
            });

            // if billing haven't been selected
            if (shippingAddressesLength > 0 && !billingAddress) {
              if (getRxUserType === USER_CUSTOMER) {
                await refetchAddress();
              }
            }
            // loading button - end
            if (mount.current) {
              ctxCheckout.setIsCart({
                ...ctxCheckout.isCart,
                loadingButtonOrder: false,
              });
            }
          }
        }
      }
    };
    fetchData();
  }, [getDataAddress]);

  useEffect(() => {
    refetchAddress();
  }, []);

  /**
   * ---------------------------------------------------- *
   * @const {getDataCart}
   * @summary useMemo for merge data cart
   * ---------------------------------------------------- *
   */
  const getDataCart = useMemo(() => {
    return {
      ...getDataAddress?.shipping_addresses[0],
    };
  }, [getDataAddress]);

  /**
   * ---------------------------------------------------- *
   * @function onShowShippingAddressModalForm
   * @summary for open shipping address modal add | edit
   * ---------------------------------------------------- *
   */
  const onShowShippingAddressModalForm = () => {
    if (!isFillShippingAddress && !isCustomerHasAddress) {
      setShowShippingAddressForm(true);
    } else {
      ctxCheckout?.setIsCart({...ctxCheckout?.isCart, getEditAddress: true});
      setShowShippingAddressList(true);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onCloseShippingAddressModalForm
   * @summary for close shipping address modal
   * ---------------------------------------------------- *
   */
  const onCloseShippingAddressModalForm = () =>
    setShowShippingAddressForm(false);

  /**
   * ---------------------------------------------------- *
   * @function setShowShippingAddressList
   * @summary for close shipping address list modal
   * ---------------------------------------------------- *
   */
  const onCloseShippingAddressModalList = () =>
    setShowShippingAddressList(false);

  /**
   * ---------------------------------------------------- *
   * @function onCallbackComponentAddressList
   * @summary for callback component address list
   * ---------------------------------------------------- *
   */
  const onCallbackComponentAddressList = () => {};
  const isShowDataInfo = !loadingDataAddress;
  //   const isShowDataInfo = !loadingDataCart && !loadingDataAddress;
  const isShowDataInfoEmpty =
    getDataAddress?.shipping_addresses && !isFillShippingAddress;

  // If haven't select delivery method
  // if (
  //   !ctxCheckout?.isCart?.selectedDeliveryMethod &&
  //   ctxCheckout?.isCart?.selectedShippingAddress
  // ) {
  //   return <></>;
  // }

  // if Pickup in Store
  if (ctxCheckout?.isCart?.selectedDeliveryMethod === PICKUP_IN_STORE) {
    return (
      <CustomView paddingHorizontal={15} paddingVertical={15}>
        <CustomView>
          <Text bold style={{fontSize: 16}}>
            {t('cart_checkout.shippingInformation')}
          </Text>
        </CustomView>
        <CustomView
          marginTop={10}
          column
          border={1}
          borderColor={Colors.BLACK}
          borderRadius={10}
          padding={15}>
          <CustomView row>
            <CustomView width={80}>
              <Text style={{fontSize: 14}}>{t('cart_checkout.address')}</Text>
            </CustomView>
            <CustomView width={10}>
              <Text>:</Text>
            </CustomView>
            <CustomView paddingRight={80}>
              <Text style={{fontSize: 14}}>
                {ctxCheckout?.selectedApotek?.loc_street ?? '-'}
              </Text>
            </CustomView>
          </CustomView>
          <CustomView row>
            <CustomView width={80}>
              <Text style={{fontSize: 14}}>{t('cart_checkout.city')}</Text>
            </CustomView>
            <CustomView width={10}>
              <Text>:</Text>
            </CustomView>
            <CustomView paddingRight={80}>
              <Text style={{fontSize: 14}}>
                {ctxCheckout?.selectedApotek?.loc_city ?? '-'}
              </Text>
            </CustomView>
          </CustomView>
          <CustomView row>
            <CustomView width={80}>
              <Text style={{fontSize: 14}}>{t('cart_checkout.telephone')}</Text>
            </CustomView>
            <CustomView width={10}>
              <Text>:</Text>
            </CustomView>
            <CustomView paddingRight={80}>
              <Text style={{fontSize: 14}}>
                {ctxCheckout?.selectedApotek?.loc_telephone ?? '-'}
              </Text>
            </CustomView>
          </CustomView>
        </CustomView>
        <CustomView marginTop={15}>
          <Divider borderWidth={isIOS ? 0.5 : 3} />
        </CustomView>
      </CustomView>
    );
  }

  // If Home Delivery || Belum ada alamat sama sekali
  return (
    <CustomView>
      <CustomView
        row
        paddingHorizontal={15}
        paddingTop={15}
        paddingBottom={10}
        spaceBetween
        horizontalCenter>
        <CustomView flexNumber={1}>
          <Text bold style={{fontSize: 16}}>
            {t('cart_checkout.shippingInformation')}
          </Text>
        </CustomView>
        {/* ADDRESS BUTTON */}
        <CustomView>
          <RenderIf
            condition={
              isShowDataInfo && !ctxCheckout?.isCart?.loadingButtonOrder
            }>
            <TouchableRipple
              style={styles.btnOutline}
              onPress={onShowShippingAddressModalForm}>
              <CustomView
                horizontalCenter
                paddingHorizontal={isFillShippingAddress ? 20 : 10}
                paddingVertical={isIOS ? 4 : 0}>
                <Text bold style={{fontSize: 13, color: Colors.PRIMARY}}>
                  {isFillShippingAddress
                    ? t('edit')
                    : isCustomerHasAddress
                    ? t('cart_checkout.chooseAddress')
                    : t('cart_checkout.addAddress')}
                </Text>
              </CustomView>
            </TouchableRipple>
          </RenderIf>
        </CustomView>
        {/* ADDRESS BUTTON */}
      </CustomView>
      <CustomView paddingHorizontal={15} marginTop={10} marginBottom={20}>
        {/* ADDRESS INFO SHIMMER */}
        <RenderIf condition={!isShowDataInfo}>
          <AtomShimmerCheckoutShippingAddress />
        </RenderIf>
        {/* ADDRESS INFO */}
        <RenderIf condition={isShowDataInfo && isFillShippingAddress}>
          <CustomView flex row paddingVertical={4}>
            <CustomView width={100}>
              <Text style={{fontSize: 14}}>{t('label.email')}</Text>
            </CustomView>
            <CustomView flexNumber={1}>
              <Text style={{fontSize: 14}}>
                {getDataCart?.email ?? getRxUserInformation?.email}
              </Text>
            </CustomView>
          </CustomView>
          <CustomView flex row paddingVertical={4}>
            <CustomView width={100}>
              <Text style={{fontSize: 14}}>{'Name'}</Text>
            </CustomView>
            <CustomView flexNumber={1}>
              <Text style={{fontSize: 14}}>
                {getDataCart?.firstname} {getDataCart?.lastname}
              </Text>
            </CustomView>
          </CustomView>
          <CustomView flex row paddingVertical={4}>
            <CustomView width={100}>
              <Text style={{fontSize: 14}}>{'Phone'}</Text>
            </CustomView>
            <CustomView flexNumber={1}>
              <Text style={{fontSize: 14}}>
                {getDataCart?.telephone ?? getRxUserInformation?.telephone}
              </Text>
            </CustomView>
          </CustomView>
          <CustomView flex row paddingVertical={4}>
            <CustomView width={100}>
              <Text style={{fontSize: 14}}>{'Address'}</Text>
            </CustomView>
            <CustomView flexNumber={1}>
              {Object.keys(getDataCart)?.length > 0 &&
              getDataCart?.hasOwnProperty('street')
                ? getDataCart?.street.map((street, index) => {
                    return (
                      <Text key={index} style={{fontSize: 14}}>
                        {street}
                      </Text>
                    );
                  })
                : '-'}
              <Text style={{fontSize: 14}}>
                {getDataCart?.region?.label} {getDataCart?.city}
              </Text>
            </CustomView>
          </CustomView>

          <CustomView marginTop={15} row horizontalCenter>
            <CheckBox checkedColor={'#ccc'} selected size={22} />
            <CustomView marginLeft={10}>
              <Text style={{fontSize: 14}}>
                {t('cart_checkout.billingAddressSameShipping')}
              </Text>
            </CustomView>
          </CustomView>
        </RenderIf>
        {/* ADDRESS INFO */}
        {/* ADDRESS SUB INFO */}
        <RenderIf
          condition={
            isShowDataInfo && isShowDataInfoEmpty && !isCustomerHasAddress
          }>
          <Text color={Colors.GRAY_DARK} style={{fontSize: 14}}>
            {t('cart_checkout.shippingInformationPleaseAdd')}
          </Text>
        </RenderIf>
        <RenderIf condition={isShowDataInfoEmpty && isCustomerHasAddress}>
          <Text color={Colors.GRAY_DARK} style={{fontSize: 14}}>
            {t('cart_checkout.shippingInformationPleaseChoose')}
          </Text>
        </RenderIf>
        {/* ADDRESS SUB INFO */}
      </CustomView>
      <CustomView paddingHorizontal={10} marginBottom={10}>
        <Divider borderWidth={isIOS ? 0.5 : 3} />
      </CustomView>
      <AppModal
        key={'modal-block-shipping-address-1'}
        isEdit={isFillShippingAddress ? getDataCart : null}
        type={TYPE_MODAL_SHIPPING_ADDRESS_FORM}
        show={showShippingAddressForm}
        onClose={onCloseShippingAddressModalForm}
        onRefetchDataAddress={true}
      />
      <AppModal
        key={'modal-block-shipping-address-2'}
        type={TYPE_MODAL_SHIPPING_ADDRESS_LIST}
        show={showShippingAddressList}
        onClose={onCloseShippingAddressModalList}
        onCallbackComponent={onCallbackComponentAddressList}
      />
    </CustomView>
  );
};

export default BlockShippingAddress;
