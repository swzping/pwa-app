import React from 'react';
import {Platform, ScrollView, Text, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import _ from 'lodash';

import AtomBlockApotek from '@app/_modules/cart_checkout/atoms/BlockApotek/index';
import AtomBlockDeliveryMethod from '@app/_modules/cart_checkout/atoms/BlockDeliveryMethod/index';
import AtomBlockPaymentMethod from '@app/_modules/cart_checkout/atoms/BlockPaymentMethod/index';
import AtomBlockPaymentOthers from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/index';
import AtomBlockShippingAddress from '@app/_modules/cart_checkout/atoms/BlockShippingAddress/index';
import AtomBlockShippingMethod from '@app/_modules/cart_checkout/atoms/BlockShippingMethod/index';
import AtomBlockSubTotal from '@app/_modules/cart_checkout/atoms/BlockSubTotal/index';
import EventPreview from '@app/_modules/cart_checkout/atoms/EventPreview';
import styles from '@app/_modules/cart_checkout/styles';
import ListCart from '@app/_modules/cart_edit/atoms/ListCart/index';
import AppModal from '@app/components/_AppModal/index';
import Button from '@app/components/Button/index';
import CustomView from '@app/components/CustomView';
import Divider from '@app/components/Divider/index';
import FlashSaleEndedModal from '@app/components/FlashSaleEndedModal';
import GwpOffer from '@app/components/GwpOffer';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf/index';
import {
  IS_FREE,
  IS_IOS,
  SPECIAL_PRICE,
  TYPE_MODAL_PAYMENT_SNAP,
} from '@app/helpers/Constants';
import {Colors, Mixins} from '@app/styles/index';

function ShippingScreen({
  t,
  cart,
  isCart,
  isLoadingSnap,
  snapPaymentUrl,
  isProcessingOrder,
  onProcessPlaceOrder,
  shippingAddressLoading,
  shippingMethodLoading,
  isEmptyCart,
  dataPrices,
  expand,
  isLoadingPlaceOrder,
  onPressExpand,
  onProcessBillingAddress,
  useFormExternal,
  _onSnapModalLoad,
  _onSnapModalClose,
  _onSnapModalError,
  _onSnapNavigationStateChange,
  dataAppliedStoreCredit,
  appliedGiftCard,
  appliedRewardPoint,
  shippingAmount,
  onPressExpandDiscount,
  expandDiscount,
  totalDiscount,
  loadingItems,
  getRxCartSelectedPaymentMethod,
  getRxCartAvailablePaymentMethod,
  apotekList,
  isLoadingCartPrice,
  isResettingVoucher,
  showFlashSaleEndedModal,
  onFlashSaleModalClose,
  onFlashSaleModalRefresh,
  onRefreshCheckout,
  onCancelPoints,
  isFree,
  eventListLoading,
}) {
  const insets = useSafeAreaInsets();
  const isLoadingButtonCheckout =
    shippingAddressLoading ||
    shippingMethodLoading ||
    isCart?.loadingButtonOrder ||
    isLoadingCartPrice ||
    isResettingVoucher ||
    isProcessingOrder;

  // start - add loading button when set free payment
  let loadingSetFree = false;

  if (isFree && getRxCartSelectedPaymentMethod?.code !== IS_FREE) {
    loadingSetFree = true;
  }
  // end - add loading button when set free payment

  // loading & disabled button placeorder
  const isLoadingDisabled =
    isLoadingPlaceOrder ||
    isLoadingButtonCheckout ||
    loadingSetFree ||
    eventListLoading;

  // mimic cart page data source and renderer
  // build items array robustly from shopping cart
  const cartItemsCheckout = (
    Array.isArray(isCart?.items)
      ? isCart.items
      : Array.isArray(cart?.items)
      ? cart.items
      : Array.isArray(cart)
      ? cart
      : []
  ).filter(item => !item?.hide); // IDGUARD-1051 移除 free_gift 过滤，现在全部展示包括赠品

  return (
    <View style={{flex: 1}}>
      <NavBar
        useBack
        useWhite
        center
        useShadow={false}
        titleBold
        title={t('cart_checkout.title.checkout')}
        childrenRight={<CustomView width={'12%'} />}
      />
      <ScrollView
        overScrollMode="never"
        style={styles.mainContainer}
        contentContainerStyle={styles.containerStyle}>
        <CustomView backgroundColor={'white'}>
          {/** Purchased items (cart mimic) */}
          <CustomView
            style={{
              borderBottomWidth: 1,
              borderColor: Colors.GRAY_LIGHT,
              paddingVertical: 20,
              paddingHorizontal: 5,
            }}>
            <Text
              color={Colors.GRAY_DARK2}
              style={{fontSize: 14, paddingLeft: 10}}>
              {cartItemsCheckout.length} item ordered
            </Text>
            {cartItemsCheckout.map((item, index) => {
              const findItem = item;
              let itemDiscount = 0;
              let customFinalPrice =
                _.get(findItem, 'custom_price.row_total.value') ?? 0;

              const arrAllDiscount =
                _.get(findItem, 'custom_cart_discount') ?? [];
              const arrSpecialPrice = arrAllDiscount.filter(
                itm => itm.promo_id === SPECIAL_PRICE,
              );
              itemDiscount = _.sumBy(arrSpecialPrice, 'discount_amount') ?? 0;

              return (
                <CustomView key={'list-product-detail-item-' + index}>
                  <ListCart
                    item={item}
                    customFinalPrice={customFinalPrice}
                    itemDiscount={itemDiscount}
                    isViewOnly
                    showQtyLine={true}
                    loading={isLoadingDisabled}
                  />
                </CustomView>
              );
            })}
          </CustomView>

          {/** APOTEK */}
          <GwpOffer
            initialVisible={2}
            showStatus={false}
            showGiftCount={true}
            onlyWhenEligible={true}
            showEligibleBadge={false}
            showLimitedStockText={false}
          />
          <AtomBlockApotek apotekList={apotekList} />
          <Divider borderWidth={IS_IOS ? 4 : 6} />
          {/** DELIVERY METHOD */}
          <AtomBlockDeliveryMethod />
          {/* SHIPPING ADDRESS */}
          <AtomBlockShippingAddress />
          {/* SHIPPING METHOD */}
          <AtomBlockShippingMethod />
          <Divider borderWidth={IS_IOS ? 4 : 6} />
          {/* PAYMENT METHOD */}
          <AtomBlockPaymentMethod isFree={isFree} />
          <Divider borderWidth={IS_IOS ? 4 : 6} />
          {/* PAYMENT OTHERS */}
          <AtomBlockPaymentOthers onCancelPoints={onCancelPoints} />
          <Divider borderWidth={40} />
        </CustomView>
      </ScrollView>
      {/** offline 结算悬浮 */}
      <EventPreview
        isPageReady={!loadingItems && !isResettingVoucher && !isLoadingDisabled}
        isShow={expand}
      />
      <RenderIf condition={expand}>
        <CustomView style={styles.maskStyle} />
      </RenderIf>
      <CustomView
        horizontalCenter
        backgroundColor={Colors.WHITE}
        style={{
          flexDirection: 'column',
          opacity: isLoadingButtonCheckout ? 0.4 : 1,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          zIndex: 1,
        }}
        width={Mixins.MAX_WIDTH}>
        <AtomBlockSubTotal
          isEmptyCart={isEmptyCart}
          isCheckout={true}
          expand={expand}
          expandDiscount={expandDiscount}
          cart={cart}
          dataPrices={dataPrices}
          shippingAmount={shippingAmount}
          totalDiscount={totalDiscount}
          appliedGiftCard={appliedGiftCard}
          appliedRewardPoint={appliedRewardPoint}
          dataAppliedStoreCredit={dataAppliedStoreCredit}
          onPressExpand={onPressExpand}
          onPressExpandDiscount={onPressExpandDiscount}
          loadingItems={loadingItems}
        />
        <Button
          loading={isLoadingDisabled}
          loadingColor={Colors.WHITE}
          disabled={isLoadingDisabled}
          onPress={
            isLoadingDisabled
              ? false
              : isCart?.isBillingSameShipping || isCart?.getReviewOrder
              ? onProcessPlaceOrder
              : useFormExternal?.handleSubmit(onProcessBillingAddress)
          }
          textStyleProp={styles.paymentButtonText}
          label={
            isCart?.getReviewOrder
              ? t('cart_checkout.label.placeOrder')
              : t('cart_checkout.label.reviewOrder')
          }
          width={Mixins.MAX_WIDTH - 30}
          borderRadius={8}
          styleProp={[
            styles.paymentButtonContainer,
            {
              backgroundColor: Colors.PRIMARY,
              marginBottom: Platform.OS === 'android' ? insets.bottom : 20,
            },
          ]}
        />
      </CustomView>
      <FlashSaleEndedModal
        visible={showFlashSaleEndedModal}
        onClose={onFlashSaleModalClose}
        onRefresh={onFlashSaleModalRefresh}
      />
      <AppModal
        type={TYPE_MODAL_PAYMENT_SNAP}
        show={isCart.showSnap}
        snapPaymentUrl={snapPaymentUrl} // 🔒 传递本地 Snap URL
        showWebviewLoader={isLoadingSnap}
        onWebviewLoad={_onSnapModalLoad}
        onWebviewClose={_onSnapModalClose}
        onWebviewNavigationStateChange={_onSnapNavigationStateChange}
        onWebviewError={_onSnapModalError}
      />
    </View>
  );
}

export default ShippingScreen;
