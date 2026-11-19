import React from 'react';
import { Capitalize, numberFormat } from '@app/helpers/General';
import { Colors, Mixins } from '@app/styles';
import { normalize } from '@app/styles/mixins';
import { ScrollView } from 'react-native';
import { useReactiveVar } from '@apollo/client';
import { modules } from '@root/swift.config';
import {
  Text,
  ActivityIndicator,
  MD2Colors as ColorsPaper,
} from 'react-native-paper';
import {
  IN_STOCK,
  TYPENAME_BUNDLE,
  TYPENAME_CONFIGURABLE,
  USER_GUEST,
} from '@app/helpers/Constants';
import { rxUserTheme } from '@app/services/cache';

import Config from 'react-native-config';
import FastImage from '@d11/react-native-fast-image';
import ImageView from 'react-native-image-viewing';
import RenderIf from '@app/components/RenderIf/index';
import Loader from '@app/components/Loader/index';
import CustomView from '@app/components/CustomView/index';
import SocialShareBlock from '@app/components/SocialShareBlock/index';
import BundleProduct from '@app/_modules/product_detail/atoms/BundleProduct';
import ConfigurableOptions from '@app/_modules/product_detail/atoms/ConfigurableOptions';
import ProductDetailBlock from '@app/_modules/product_detail/atoms/ProductDetailBlock/index';
import ToggleWishlist from '@app/components/ToggleWishlist';
import NavBar from '@app/components/NavBar/index';
import ButtonAddItemToCart from '@app/_modules/cart/atoms/ButtonAddItemToCart/index';
import styles from '@app/_modules/product_detail/styles';

export const WishListButton = props => {
  return <ToggleWishlist {...props} />;
};

const ProductDetailScreen = ({
  t,
  loading,
  product,
  userType,
  productReviews,
  totalReview,
  refetchProductReviews,
  refetchWishlist,

  getPriceRange,
  getPriceCurrency,
  getPriceRegularValue,
  getPriceFinalValue,
  getDiscountPercent,
  isSamePrice,

  isProductReady,
  imageUrl,
  skuProduct,
  visibleImageView,
  selectedColor,
  selectedSize,
  stockStatus,
  selectedOptions,
  bundleItemsCount,
  setSkuProduct,
  onItemClickPreviewImage,
  setSelectedColor,
  setSelectedSize,
  setSelectedOptions,
  setBundleItemsCount,
}) => {
  const scheme = useReactiveVar(rxUserTheme);
  /**
   * ----------------------------------------- *
   * @component PriceRow
   * @param {Object} product attributes
   * @profiler {Sentry}
   * @summary Section price on PDP
   * @returns Components
   * ----------------------------------------- *
   */
  const PriceRow = () => {
    return (
      <CustomView row marginVertical={10}>
        <RenderIf condition={getDiscountPercent > 0}>
          <CustomView
            width={40}
            height={40}
            border={1}
            borderColor={scheme === 'dark' ? Colors.WHITE : Colors.BLACK}
            borderRadius={5}
            marginHorizontal={10}
            horizontalCenter
            verticalCenter>
            <Text small>{getDiscountPercent}</Text>
            <Text small>Off</Text>
          </CustomView>
        </RenderIf>

        <RenderIf condition={getPriceRange}>
          <CustomView horizontalStart>
            <RenderIf condition={!isSamePrice}>
              <Text lineThrough small>
                {numberFormat(
                  getPriceCurrency,
                  getPriceRegularValue?.toFixed(2),
                )}
              </Text>
            </RenderIf>
            <Text large bold>
              {numberFormat(getPriceCurrency, getPriceRegularValue?.toFixed(2))}
            </Text>
          </CustomView>
        </RenderIf>
      </CustomView>
    );
  };

  return (
    <>
      <NavBar useBack />
      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Loader loading={loading} />
        <RenderIf condition={!loading}>
          <CustomView flex horizontalStart>
            <CustomView
              horizontalCenter
              verticalCenter
              onPress={() => onItemClickPreviewImage(true)}>
              <RenderIf condition={product.image}>
                <FastImage
                  key={skuProduct}
                  style={styles.productImage}
                  resizeMode={FastImage.resizeMode.contain}
                  source={{
                    uri: imageUrl,
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                />
              </RenderIf>
              <RenderIf condition={!product.image}>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  width={Mixins.MAX_WIDTH}>
                  <ActivityIndicator />
                </CustomView>
              </RenderIf>
            </CustomView>

            <Text style={styles.productName}>{Capitalize(product.name)}</Text>
            <CustomView marginVertical={10}>
              <CustomView
                row
                spaceBetween
                paddingHorizontal={20}
                width={Mixins.MAX_WIDTH}>
                <PriceRow />
                <CustomView row>
                  <RenderIf
                    condition={
                      modules.product_detail.atoms.social_share.enable
                    }>
                    <SocialShareBlock
                      url={`${Config.PWA_BASE_URL}/${product.url_key}`}
                      title={product.name}
                      message={t('product_detail.kindlyCheck')}
                    />
                  </RenderIf>
                  <RenderIf condition={userType !== USER_GUEST}>
                    <WishListButton
                      productId={product.id}
                      wishlistItemId={product.wishlistId}
                      productName={product.name}
                      productSku={product.sku}
                      productCurrency={isProductReady ? getPriceCurrency : ''}
                      productPrice={isProductReady ? getPriceFinalValue : 0}
                    />
                  </RenderIf>
                </CustomView>
              </CustomView>
            </CustomView>

            <ProductDetailBlock
              product={product}
              productReviews={productReviews}
              totalReview={totalReview}
              refetchProductReviews={refetchProductReviews}
            />

            <RenderIf condition={product.__typename === TYPENAME_CONFIGURABLE}>
              <ConfigurableOptions
                product={product}
                setSku={setSkuProduct}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                setSelectedColor={setSelectedColor}
                setSelectedSize={setSelectedSize}
              />
            </RenderIf>

            <RenderIf condition={product.__typename === TYPENAME_BUNDLE}>
              <BundleProduct
                product={product}
                selectedOptions={selectedOptions}
                setSelectedOptions={setSelectedOptions}
                setBundleItemsCount={setBundleItemsCount}
              />
            </RenderIf>

            <CustomView
              horizontalCenter
              verticalCenter
              width={Mixins.MAX_WIDTH}
              marginVertical={20}>
              <ButtonAddItemToCart
                item={product}
                type={product.__typename}
                id={isProductReady ? product.id : null}
                name={product.name}
                productPrice={isProductReady ? getPriceFinalValue : 0}
                productCurrency={isProductReady ? getPriceCurrency : ''}
                propStyle={styles.addToCartButtonContainer}
                selectedOptions={selectedOptions}
                bundleItemsCount={bundleItemsCount}
                disabled={stockStatus !== IN_STOCK}
                sku={
                  product.__typename === TYPENAME_CONFIGURABLE
                    ? skuProduct
                    : product.sku
                }>
                <Text style={{ color: ColorsPaper.white, margin: normalize(10) }}>
                  {stockStatus !== IN_STOCK
                    ? t('product_detail.oos')
                    : t('product_detail.addToCart')}
                </Text>
              </ButtonAddItemToCart>
            </CustomView>
          </CustomView>
        </RenderIf>

        <ImageView
          images={[{ uri: imageUrl }]}
          imageIndex={0}
          visible={visibleImageView}
          onRequestClose={() => onItemClickPreviewImage(false)}
          FooterComponent={() => (
            <RenderIf condition={userType !== USER_GUEST}>
              <WishListButton
                styleProp={{
                  backgroundColor: Colors.BLACK,
                }}
                productId={product.id}
                wishlistItemId={product.wishlistId}
                productName={product.name}
                productSku={product.sku}
                productPrice={isProductReady ? getPriceFinalValue : 0}
                productCurrency={isProductReady ? getPriceFinalValue : ''}
                callback={refetchWishlist}>
                <CustomView
                  horizontalCenter
                  verticalCenter
                  padding={10}
                  width={Mixins.MAX_WIDTH}
                  backgroundColor={Colors.BLACK}>
                  <CustomView
                    horizontalCenter
                    verticalCenter
                    paddingVertical={10}
                    paddingHorizontal={20}
                    marginVertical={20}
                    backgroundColor={Colors.PRIMARY}
                    width={200}
                    BorderRadius={5}>
                    <Text white bold>
                      {product.wishlistId
                        ? t('product_detail.removeWishlist')
                        : t('product_detail.addWishlist')}
                    </Text>
                  </CustomView>
                </CustomView>
              </WishListButton>
            </RenderIf>
          )}
        />
      </ScrollView>
    </>
  );
};

export default ProductDetailScreen;
