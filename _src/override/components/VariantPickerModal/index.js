import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import FastImage from '@d11/react-native-fast-image';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

import {useTranslation} from 'react-i18next';

import FlashSaleCountdownBar from '@app/_modules/product_detail/atoms/FlashSaleCountdownBar';
import PriceRowBlock from '@app/_modules/product_detail/atoms/PriceRowBlock';
import Alert from '@app/components/Alert';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import {CART_ACTIONS} from '@app/helpers/Constants';
import {thumborSquareImage} from '@app/helpers/Thumbor';
import {Colors} from '@app/styles';

import QtyStepper from './QtyStepper';
import VariantOptions, {HEADER_IMAGE_SIZE} from './VariantOptions';
const placeholderImg = require('@app/assets/images/placeholder.png');

const HeaderImage = React.memo(({uri}) => {
  if (!uri) {
    return (
      <Image
        source={placeholderImg}
        style={styles.productImage}
        fadeDuration={0}
      />
    );
  }

  // Resized webp via Thumbor + native disk/memory cache: preloaded by
  // useVariantPicker when product data arrives, so switching variants
  // renders the header image instantly instead of re-downloading
  return (
    <FastImage
      source={{
        uri: thumborSquareImage(uri, HEADER_IMAGE_SIZE),
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.immutable,
      }}
      resizeMode={FastImage.resizeMode.cover}
      style={styles.productImage}
    />
  );
});

const VariantPickerModal = forwardRef(
  (
    {
      // State
      loading,
      product,
      selectedVariant,
      selectedVariantOpt,
      quantity,
      cartAction,
      alert,
      defaultHeaderImageUri,
      headerImageUri,
      stockProps,
      isButtonDisabled,
      confirmLoading,
      priceProps,
      canIncrease,
      canDecrease,
      missingOptions,
      // Setters
      setSelectedVariant,
      setSelectedVariantOpt,
      setQuantity,
      // Actions
      handleOk,
      onIncreaseQuantity,
      onDecreaseQuantity,
      onChangeText,
      onEndEditing,
      // Config
      labels = {},
      promoProduct,
      configurableFinalPrice,
      bundlePriceCustomization,
      onSelectVariant,
    },
    ref,
  ) => {
    const {t} = useTranslation();
    const modalRef = useRef(null);
    const insets = useSafeAreaInsets();

    const snapPoints = useMemo(() => ['85%'], []);

    // 变体商品的闪购信息挂在被选中的具体 variant 上，驱动抽屉顶部倒计时条。
    const isVariantFlashSale = selectedVariant?.product?.is_flash_sale === 1;
    const flashSaleStartDate =
      selectedVariant?.product?.special_from_date ?? null;
    const flashSaleEndDate = selectedVariant?.product?.special_to_date ?? null;
    const showFlashSaleCountdown =
      isVariantFlashSale && Boolean(flashSaleEndDate);

    const finalLabels = useMemo(
      () => ({
        [CART_ACTIONS.CHANGE]: t('label.update'),
        [CART_ACTIONS.ADD_TO_CART]: t('label.addToCart'),
        // 闪购变体必须用闪购专属文案，与 PDP 底部按钮（product_detail/atoms/
        // ButtonAddToCart 的 isFlashSale ? 'Flash Buy Now' : 'Buy now'）保持一致。
        // 闪购标记只挂在被选中的具体 variant 上（父商品没有），所以复用上面
        // 驱动倒计时条的 isVariantFlashSale：抽屉内切换色号时文案会跟着变。
        [CART_ACTIONS.BUY_NOW]: isVariantFlashSale
          ? t('label.flashBuyNow')
          : t('label.buyNow'),
        outOfStock: t('label.outOfStock'),
        lowStock: t('label.lowStock'),
        ...labels,
      }),
      [labels, t, isVariantFlashSale],
    );

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    const renderBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          pressBehavior="close"
        />
      ),
      [],
    );

    return (
      <>
        <RenderIf condition={loading}>
          <CustomView
            flex={1}
            verticalCenter
            horizontalCenter
            backgroundColor="rgba(255,255,255,0.5)"
            pointerEvents="auto"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 998,
            }}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </CustomView>
        </RenderIf>
        <BottomSheetModal
          ref={modalRef}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose={false}
          enableContentPanningGesture={false}
          handleComponent={() => null}
          backdropComponent={renderBackdrop}
          backgroundStyle={styles.sheetBackground}>
          <View style={[styles.content, {paddingBottom: insets.bottom + 12}]}>
            {/* Flash sale countdown bar - full-bleed at the top */}
            <RenderIf condition={showFlashSaleCountdown}>
              <View style={styles.flashSaleBarWrapper}>
                <FlashSaleCountdownBar
                  startDate={flashSaleStartDate}
                  endDate={flashSaleEndDate}
                  isActive={isVariantFlashSale}
                />
              </View>
            </RenderIf>

            {/* Close - 闪购倒计时条占据顶部时不展示 X（与设计稿一致，点遮罩即可关闭） */}
            <RenderIf condition={!showFlashSaleCountdown}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => modalRef.current?.dismiss()}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </RenderIf>

            {/* Top */}
            <View style={styles.topSection}>
              <View style={styles.imageSection}>
                <HeaderImage
                  uri={
                    !isButtonDisabled ? headerImageUri : defaultHeaderImageUri
                  }
                />
                <RenderIf
                  condition={stockProps.isOutOfStock || stockProps.isLowStock}>
                  <CustomView
                    verticalCenter
                    width="fit-content"
                    height={24}
                    paddingHorizontal={8}
                    style={styles.stockTag}>
                    <Text style={styles.stockTagText}>
                      {stockProps.isLowStock
                        ? finalLabels.lowStock
                        : finalLabels.outOfStock}
                    </Text>
                  </CustomView>
                </RenderIf>
              </View>

              <View style={{flex: 1}}>
                <PriceRowBlock
                  key={priceProps?.product?.uid}
                  row={false}
                  {...priceProps}
                  promoProduct={promoProduct}
                  configurableFinalPrice={configurableFinalPrice}
                  bundlePriceCustomization={bundlePriceCustomization}
                  priceRegularStyle={{
                    marginLeft: 0,
                    paddingLeft: 0,
                  }}
                  fontSize={20}
                  fontWeight="700"
                />
                <QtyStepper
                  quantity={quantity}
                  canIncrease={canIncrease}
                  canDecrease={canDecrease}
                  onIncreaseQuantity={onIncreaseQuantity}
                  onDecreaseQuantity={onDecreaseQuantity}
                  onChangeText={onChangeText}
                  onEndEditing={onEndEditing}
                />
              </View>
            </View>

            {/* Options */}
            <BottomSheetScrollView
              style={styles.scrollView}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}>
              <VariantOptions
                options={product?.configurable_options}
                variants={product?.variants}
                selectedVariantOpt={selectedVariantOpt}
                setSelectedVariant={setSelectedVariant}
                setSelectedVariantOpt={setSelectedVariantOpt}
                setQuantity={setQuantity}
                labels={finalLabels}
                onSelectVariant={onSelectVariant}
              />
            </BottomSheetScrollView>

            {/* Button */}
            <TouchableOpacity
              style={[
                styles.cartBtn,
                (isButtonDisabled || confirmLoading) && styles.cartBtnDisabled,
              ]}
              disabled={confirmLoading}
              onPress={handleOk}>
              {confirmLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.cartText}>
                  {stockProps.isOutOfStock
                    ? t('notifyMe')
                    : finalLabels[cartAction]}
                </Text>
              )}
            </TouchableOpacity>

            <RenderIf condition={alert}>
              <View style={styles.alertOverlay} pointerEvents="box-none">
                <Alert type={alert?.type} message={alert?.message} />
              </View>
            </RenderIf>
          </View>
        </BottomSheetModal>
      </>
    );
  },
);

export default VariantPickerModal;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 20,
  },
  flashSaleBarWrapper: {
    marginHorizontal: -20,
    marginTop: -24,
    marginBottom: 20,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
  },
  closeText: {
    fontSize: 22,
    fontWeight: '700',
  },
  topSection: {
    flexDirection: 'row',
    marginBottom: 28,
  },
  imageSection: {
    position: 'relative',
    width: 140,
    height: 140,
    borderRadius: 16,
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  stockTag: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    borderRadius: 26,
    backgroundColor: '#808080',
    zIndex: 2,
  },
  stockTagText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cartBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ff8800',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  cartBtnDisabled: {
    opacity: 0.6,
  },
  cartText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  alertOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: '5%',
  },
});
