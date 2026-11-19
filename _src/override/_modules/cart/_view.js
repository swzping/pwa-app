import React, {useCallback, useMemo, useRef} from 'react';
import {FlatList, Platform, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';

import {useNavigation} from '@react-navigation/native';

import VariantPickerModal from '@root/_src/override/components/VariantPickerModal';
import {modules} from '@root/swift.config';

import _ from 'lodash';

import CartSummary from '@app/_modules/cart/atoms/CartSummary/index';
import EmailVerificationRequiredModal from '@app/_modules/cart/atoms/EmailVerificationRequiredModal';
import FreeshipBar from '@app/_modules/cart/atoms/FreeshipBar';
import styles from '@app/_modules/cart/styles';
import ListCart from '@app/_modules/cart_edit/atoms/ListCart/index';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import Button from '@app/components/Button/index';
import CustomView from '@app/components/CustomView/index';
import FlashSaleEndedModal from '@app/components/FlashSaleEndedModal';
import GwpOffer from '@app/components/GwpOffer';
import NavBar from '@app/components/NavBar/index';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text/index';
import ToggleWishlist from '@app/components/ToggleWishlist';
import useVariantPicker from '@app/components/VariantPickerModal/useVariantPicker';
import {
  CART_ACTIONS,
  IN_STOCK,
  IS_IOS,
  OUT_OF_STOCK,
  SPECIAL_PRICE,
  TYPE_NUMBER,
} from '@app/helpers/Constants';
import {TYPE_SHIMMER_CART_LIST} from '@app/helpers/Constants';
import {numberFormat} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import {Colors, Mixins} from '@app/styles';

import GiftSelectionModal from './atoms/GiftSelectionModal';

export const WishListButton = props => {
  return <ToggleWishlist {...props} />;
};

function CartScreen({
  t,
  loading,
  loadingPrice,
  loadingCartRefreshPromo,
  isEmptyCart,
  cartId,
  cartItems,
  cartPrices,
  getTieringNudge,
  onNavigateToProductDetail,
  onNavigateToCheckout,
  onRefreshCart,
  getPrice,
  getPriceByResetPoints,
  expand,
  setExpand,
  freeshipThreshoud,
  shippingAmount,
  showFlashSaleEndedModal = false,
  showGiftSelectionModal,
  setShowGiftSelectionModal,
  onFlashSaleModalClose = () => {},
  onFlashSaleModalRefresh = () => {},
  showEmailVerificationRequiredModal = false,
  onSendVerificationCode,
  onConfirmVerification,
  emailVerificationLoading = false,
  onCloseEmailVerificationModal,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  // 内嵌导航栏以保持checkout按钮完全可见
  const isInsideTabBar = navigation.getState()?.type === 'tab';
  const checkoutSectionPaddingBottom =
    Platform.OS === 'android' && !isInsideTabBar ? 15 + insets.bottom : 15;

  const skuModalRef = useRef(null);

  const cartPricesWithShipping = useMemo(() => {
    return {
      ...cartPrices,
      ...(shippingAmount && {
        shippingAmount:
          shippingAmount[0]?.selected_shipping_method?.amount?.value,
      }),
    };
  }, [cartPrices, shippingAmount]);

  const cartPrice = _.get(cartPrices, 'grand_total.value');
  const cartPriceWithoutDiscount = _.get(
    cartPrices,
    'subtotal_excluding_tax.value',
  );
  const subtotalAfterDiscounts = _.get(
    cartPrices,
    'subtotal_after_discounts.value',
  );
  const currency = _.get(cartPrices, 'grand_total.currency');

  const itemInCartNoHide = cartItems?.filter(item => !item.hide);
  const isHasItemInCartNoHide = itemInCartNoHide.length > 0;

  const loadingChange =
    cartItems?.filter(item => item.hide).length > 0 ||
    cartItems?.filter(item => item.edit).length > 0 ||
    loading;

  const isLoadingButton = loadingChange || loadingCartRefreshPromo;

  const outOfStock = _.map(cartItems, 'product.stock_status').filter(
    val => val === OUT_OF_STOCK,
  );
  const hasOutOfStock = _.size(outOfStock) > 0;

  const lessStock = cartItems?.filter(item => {
    const productStatus = _.get(item, 'product.stock_status');
    const qty = _.get(item, 'quantity');
    const availStock = _.get(item, 'product.stock_item.salable_qty');
    const IS_BUNDLE_PRODUCT = _.get(item, '__typename') === 'BundleCartItem';

    return productStatus === IN_STOCK && availStock < qty && !IS_BUNDLE_PRODUCT;
  });
  const hasLessStock = _.size(lessStock) > 0;

  const renderGwpHeader = useCallback(
    () => (
      <CustomView>
        <Text style={styles.itemsHeaderTitle}>
          {cartItems.length} {t('cart.itemsInCart')}
        </Text>
        <GwpOffer
          onRefreshCart={onRefreshCart}
          onPressChevron={() =>
            navigateTo(modules.gwp_list.enable, modules.gwp_list.name, {})
          }
        />
      </CustomView>
    ),
    [cartItems.length],
  );

  const picker = useVariantPicker({
    modalRef: skuModalRef,
    onSuccess: () => {
      onRefreshCart();
    },
    onClose: () => {
      skuModalRef.current?.dismiss();
    },
  });

  const showVariantPopup = item => {
    picker.open({
      cacheKey: item.configured_variant?.uid,
      urlKey: item.product?.url_key,
      action: CART_ACTIONS.CHANGE,
      qty: item.quantity,
      uid: item.configured_variant?.uid,
      parentUid: item.uid,
    });
  };

  /**
   * ----------------------------------------- *
   * @function onRenderItem
   * @summary render cart item list
   * @return Component cart item
   * ----------------------------------------- *
   */
  const onRenderItem = ({item, index}) => {
    const findItem = item;
    let itemDiscount = 0;
    let customFinalPrice = _.get(findItem, 'custom_price.row_total.value') ?? 0;

    const arrAllDiscount = _.get(findItem, 'custom_cart_discount') ?? [];
    const arrSpecialPrice = arrAllDiscount.filter(
      itm => itm.promo_id === SPECIAL_PRICE,
    );

    itemDiscount = _.sumBy(arrSpecialPrice, 'discount_amount') ?? 0;
    // customFinalPrice = customFinalPrice - itemDiscount;

    return (
      <CustomView>
        {index === 0 && !_.isNil(freeshipThreshoud) && (
          <FreeshipBar
            freeshipThreshoud={freeshipThreshoud}
            cartPrice={subtotalAfterDiscounts}
            currency={currency}
            loadingPrice={loadingPrice || isLoadingButton}
          />
        )}
        <ListCart
          t={t}
          item={item}
          customFinalPrice={customFinalPrice}
          itemDiscount={itemDiscount}
          onNavigateToProductDetail={onNavigateToProductDetail}
          useDelete={!item.is_free_gift}
          useGiftChange
          loading={loading}
          loadingChange={loadingChange}
          getPrice={getPriceByResetPoints}
          onChange={() =>
            setShowGiftSelectionModal(prev => ({
              ...prev,
              visible: true,
              data: {itemId: Number(item.id.split('-')[0]), cartId},
            }))
          }
          onChangeVariant={() => {
            showVariantPopup(item);
          }}
        />
        <View
          style={{
            width: Mixins.MAX_WIDTH,
            backgroundColor: Colors.GRAY_LIGHT,
            height: 1,
          }}
        />
      </CustomView>
    );
  };

  /**
   * ----------------------------------------- *
   * @component SubTotal
   * @summary Text Component for display price
   * @returns Components
   * ----------------------------------------- *
   */
  const SubTotal = useCallback(() => {
    return (
      <CustomView
        horizontalCenter
        verticalCenter
        width={Mixins.MAX_WIDTH}
        paddingTop={IS_IOS ? 15 : 10}
        paddingBottom={15}
        onPress={() => {
          if (loadingPrice || isLoadingButton) {
            return;
          }
          setExpand(!expand);
        }}
        style={styles.subTotalSubContainer}>
        <RenderIf
          condition={
            !loadingPrice && !isLoadingButton && typeof cartPrice === 'number'
          }>
          <CustomView row horizontalCenter verticalCenter>
            <Text style={{fontSize: 14, height: IS_IOS ? 18 : 20}}>
              <Text style={{fontSize: 14}}>{t('cart_checkout.subtotal')}</Text>
              <Text bold style={{fontSize: 14}}>
                {' '}
                {`${numberFormat(
                  currency,
                  cartPriceWithoutDiscount,
                  ',',
                  2,
                )}`}{' '}
              </Text>
            </Text>
            <CustomView style={styles.chevroIcon}>
              <Icon name={expand ? 'chevron-up' : 'chevron-down'} size={20} />
            </CustomView>
          </CustomView>
        </RenderIf>
        <RenderIf condition={loadingPrice || isLoadingButton}>
          <Text bold>{t('loading')}</Text>
        </RenderIf>
      </CustomView>
    );
  }, [
    loadingPrice,
    isLoadingButton,
    cartPrice,
    currency,
    cartPriceWithoutDiscount,
    expand,
    t,
  ]);

  /**
   * ---------------------------------------------------- *
   * @function ListEmptyComponent
   * @summary for list empty component
   * @returns {view}
   * ---------------------------------------------------- *
   */
  const ListEmptyComponent = useCallback(() => {
    if (loading) {
      return <ShimmerSkeleton type={TYPE_SHIMMER_CART_LIST} />;
    }
    return (
      <CustomView horizontalCenter verticalCenter flex marginTop={30}>
        <Text bold center>
          {t('cart.noItemInCart')}
        </Text>
      </CustomView>
    );
  }, [loading, t]);

  const isLoadingTotal =
    (!cartPrice && typeof cartPrice !== TYPE_NUMBER) ||
    isEmptyCart ||
    loading ||
    loadingCartRefreshPromo;

  const isDisableButton = isLoadingButton || hasOutOfStock || hasLessStock;

  return (
    <CustomView flex width={Mixins.MAX_WIDTH} backgroundColor={Colors.WHITE}>
      <NavBar
        center={true}
        // useClose
        useBack
        useWhite
        useShadow={false}
        title={t('cart.shoppingCart')}
      />
      <RenderIf condition={isEmptyCart}>
        <Text style={styles.itemsHeaderTitle}>
          {cartItems.length} {t('cart.itemsInCart')}
        </Text>
      </RenderIf>
      <RenderIf condition={hasOutOfStock || hasLessStock}>
        <CustomView style={styles.oosHeaderWrapper}>
          <Text style={styles.oosHeaderTitle}>{t('cart.oosWarning')}</Text>
        </CustomView>
      </RenderIf>
      <RenderIf condition={!isEmptyCart}>
        <FlatList
          style={styles.listContainer}
          data={cartItems}
          renderItem={onRenderItem}
          keyExtractor={item => item.id?.toString()}
          ListEmptyComponent={ListEmptyComponent}
          ListHeaderComponent={renderGwpHeader}
          removeClippedSubviews={false}
          onRefresh={() => onRefreshCart()}
          refreshing={loading}
          overScrollMode="never"
        />
      </RenderIf>
      <RenderIf condition={isHasItemInCartNoHide}>
        <CustomView
          backgroundColor={Colors.WHITE}
          paddingBottom={checkoutSectionPaddingBottom}
          style={styles.priceInfoWrap}
          width={Mixins.MAX_WIDTH}>
          <RenderIf condition={getTieringNudge?.message}>
            <CustomView column>
              <CustomView row style={styles.tipContent}>
                <Svg
                  width="26"
                  height="19"
                  viewBox="0 0 26 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <Path
                    d="M14.2 1V3.42857M14.2 15.5714V18M14.2 8.28571V10.7143M1 5.85714C1.95478 5.85714 2.87045 6.24094 3.54558 6.92411C4.22072 7.60728 4.6 8.53385 4.6 9.5C4.6 10.4661 4.22072 11.3927 3.54558 12.0759C2.87045 12.7591 1.95478 13.1429 1 13.1429V15.5714C1 16.2155 1.25286 16.8332 1.70294 17.2887C2.15303 17.7441 2.76348 18 3.4 18H22.6C23.2365 18 23.847 17.7441 24.2971 17.2887C24.7471 16.8332 25 16.2155 25 15.5714V13.1429C24.0452 13.1429 23.1295 12.7591 22.4544 12.0759C21.7793 11.3927 21.4 10.4661 21.4 9.5C21.4 8.53385 21.7793 7.60728 22.4544 6.92411C23.1295 6.24094 24.0452 5.85714 25 5.85714V3.42857C25 2.78447 24.7471 2.16676 24.2971 1.71131C23.847 1.25587 23.2365 1 22.6 1H3.4C2.76348 1 2.15303 1.25587 1.70294 1.71131C1.25286 2.16676 1 2.78447 1 3.42857V5.85714Z"
                    stroke="#CC2B1E"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </Svg>
                <Text style={styles.tipText}>{getTieringNudge?.message}</Text>
              </CustomView>
              <CustomView style={styles.tipPadding} />
            </CustomView>
          </RenderIf>
          <SubTotal loading={isLoadingTotal} />
          <RenderIf condition={!loadingPrice && !isLoadingButton && cartPrices}>
            <CartSummary
              t={t}
              cartPrices={cartPricesWithShipping}
              expand={expand}
            />
          </RenderIf>
          <CustomView horizontalCenter>
            <Button
              disabled={isDisableButton}
              onPress={isDisableButton ? false : onNavigateToCheckout}
              label={isLoadingButton ? t('loading') : t('cart.checkout')}
              borderRadius={6}
              width={Mixins.MAX_WIDTH * 0.9}
              textStyleProp={styles.checkOutButtonText}
              loading={isLoadingButton}
              loadingColor={isLoadingButton ? Colors.WHITE : false}
              styleProp={[
                styles.checkOutButtonContainer,
                isDisableButton ? {backgroundColor: Colors.GRAY_DARK} : {},
              ]}
            />
          </CustomView>
        </CustomView>
      </RenderIf>
      <FlashSaleEndedModal
        visible={showFlashSaleEndedModal}
        onClose={onFlashSaleModalClose}
        onRefresh={onFlashSaleModalRefresh}
      />
      <EmailVerificationRequiredModal
        visible={showEmailVerificationRequiredModal}
        onClose={onCloseEmailVerificationModal}
        onSendVerificationCode={onSendVerificationCode}
        onConfirmVerification={onConfirmVerification}
        loading={emailVerificationLoading}
      />
      <GiftSelectionModal
        visible={showGiftSelectionModal.visible}
        data={showGiftSelectionModal.data}
        onClose={() =>
          setShowGiftSelectionModal(prev => ({...prev, visible: false}))
        }
        onSuccess={onRefreshCart}
      />
      <VariantPickerModal ref={skuModalRef} {...picker} />
    </CustomView>
  );
}

export default CartScreen;
