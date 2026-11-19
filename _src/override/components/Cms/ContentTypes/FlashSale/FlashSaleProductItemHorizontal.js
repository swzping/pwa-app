import React from 'react';
import {Image, StyleSheet} from 'react-native';

import {useRoute} from '@react-navigation/native';

import FastImage from '@d11/react-native-fast-image';

import {useTranslation} from 'react-i18next';

import FlashSaleIcon from '@app/assets/svgs/FlashSaleIcon';
import ButtonAddToCart from '@app/components/ButtonAddToCart/index';
import ButtonNotifyMe from '@app/components/ButtonNotifyMe/index';
import CustomView from '@app/components/CustomView';
import FlashSaleCountdown from '@app/components/FlashSaleCountdown';
import ProductBadges from '@app/components/ProductBadges/index';
import Rating from '@app/components/Rating';
import RenderIf from '@app/components/RenderIf';
import RenderItemList from '@app/components/RenderItem/index';
import Text from '@app/components/Text/index';
import ToggleWishlist from '@app/components/ToggleWishlist/index';
import {numberFormat} from '@app/helpers/General';
import {Colors} from '@app/styles/index';
import {trackClickSkuComponent} from '@app/track';
const FlashSaleProductItemHorizontal = ({
  item,
  onNavigateToProductDetail,
  index,
  itemWidth,
  modeSmall = false,
  endTime, // 闪购结束时间
  onOpenVariantPopup, // 多变体商品点击 ATC 时打开变体抽屉
}) => {
  const route = useRoute();
  const {t} = useTranslation();
  const starRatingProduct = item?.rating_summary || 0;
  const isOutOfStock = item?.stock_status === 'OUT_OF_STOCK';

  const getPriceRange = item?.price_range;
  const getMinPrice = getPriceRange?.minimum_price;
  const getPriceCurrency = getMinPrice?.final_price.currency;
  const getPriceRegularValue = getMinPrice?.regular_price.value;
  const getPriceFinalValue = getMinPrice?.final_price.value;
  const getDiscountPercent = getMinPrice?.discount?.percent_off;

  let imageSourceCondition =
    item.small_image !== null &&
    item.small_image.url !== '' &&
    item.small_image !== undefined;

  // 确保 itemWidth 有值，如果没有则使用默认值
  const containerWidth = itemWidth || 150;

  // FlashSaleCountdown will handle timezone conversion internally
  const countdownStartDate = item?.special_from_date;
  const countdownEndDate = item?.special_to_date ?? endTime;
  const isFlashSaleActive = Boolean(countdownEndDate);

  const itemKey = item?.sku ?? `${index}`;

  return (
    <RenderItemList itemKey={itemKey}>
      <CustomView
        borderRadius={8}
        border={0.5}
        borderColor={Colors.GRAY_SMOOTH3}
        paddingTop={0}
        backgroundColor={Colors.WHITE}
        onPress={() => {
          onNavigateToProductDetail({
            productUrlKey: item.url_key,
            productSku: item.sku,
            // 闪购子变体（simple）商品：跳转父级 PDP 并带上子变体 uid 以默认选中该 sku
            variant_parent_url_key: item.variant_parent_url_key,
            uid: item.uid,
          });

          trackClickSkuComponent({
            location_name: route.name,
            sku_name: item.name,
            sku_id: item.sku,
          });
        }}
        style={[
          styles.itemContainer,
          {
            width: containerWidth,
            flexShrink: 0, // 防止收缩
            flexGrow: 0, // 防止增长
          },
        ]}>
        {/* FLASH SALE 标签 - 左上角 */}
        <CustomView
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            zIndex: 2,
          }}>
          <FlashSaleIcon width={42} height={42} />
        </CustomView>

        <RenderIf condition={imageSourceCondition}>
          <CustomView horizontalCenter style={{position: 'relative'}}>
            <CustomView
              style={{position: 'absolute', top: 5, right: 10, zIndex: 1}}>
              <ToggleWishlist
                item={item}
                productId={item.id}
                wishlistItemId={item.wishlistId}
                productName={item.name}
                productSku={item.sku}
                iconSize={modeSmall ? 26 : 28}
                productCurrency={getPriceCurrency ?? ''}
                productPrice={getPriceFinalValue ?? 0}
              />
            </CustomView>
            <FastImage
              key={item.url_key}
              style={{
                width: containerWidth,
                height: containerWidth,
                flexShrink: 0,
              }}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: item.small_image.url.toString(),
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
            />
            <RenderIf condition={isOutOfStock}>
              <CustomView style={styles.outOfStockOverlay}>
                <CustomView
                  backgroundColor={'rgba(0,0,0,0.5)'}
                  paddingHorizontal={12}
                  borderRadius={12}
                  style={styles.outOfStockContainer}>
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                </CustomView>
              </CustomView>
            </RenderIf>
          </CustomView>
        </RenderIf>
        <RenderIf condition={!imageSourceCondition}>
          <CustomView horizontalCenter style={{position: 'relative'}}>
            <Image
              source={require('@app/assets/images/placeholder.png')}
              style={[
                styles.itemImage,
                {
                  width: containerWidth,
                  height: containerWidth,
                  flexShrink: 0,
                },
              ]}
            />
            <RenderIf condition={isOutOfStock}>
              <CustomView style={styles.outOfStockOverlay}>
                <CustomView
                  backgroundColor={'rgba(0,0,0,0.5)'}
                  paddingHorizontal={12}
                  borderRadius={20}
                  style={styles.outOfStockContainer}>
                  <Text style={styles.outOfStockText}>Out of Stock</Text>
                </CustomView>
              </CustomView>
            </RenderIf>
          </CustomView>
        </RenderIf>
        <FlashSaleCountdown
          isActive={isFlashSaleActive}
          startDate={countdownStartDate}
          endDate={countdownEndDate}
          containerStyle={{
            width: containerWidth,
          }}
          contentStyle={{
            paddingHorizontal: 0,
          }}
        />
        <CustomView
          style={{
            width: containerWidth,
            paddingHorizontal: 10,
          }}
          horizontalStart>
          <CustomView marginTop={5} style={{minHeight: 26}}>
            <Text left numberOfLines={2} style={{fontSize: 12, lineHeight: 16}}>
              {item.name}
            </Text>
          </CustomView>
          <CustomView marginTop={3}>
            <Text bold color={Colors.PRIMARY} style={{fontSize: 12}}>
              {numberFormat(getPriceCurrency, getPriceFinalValue, ',', 2)}
            </Text>
          </CustomView>
          <CustomView row height={16}>
            <RenderIf condition={getDiscountPercent}>
              <CustomView paddingTop={2}>
                <Text
                  lineThrough
                  color={Colors.GRAY_DARK}
                  style={{fontSize: 10}}>
                  {numberFormat(getPriceCurrency, getPriceRegularValue, ',', 2)}
                </Text>
              </CustomView>
            </RenderIf>
            <RenderIf condition={getDiscountPercent}>
              <CustomView marginLeft={5} horizontalCenter verticalCenter>
                <CustomView
                  backgroundColor={'#E41305'}
                  borderRadius={2}
                  paddingVertical={0}
                  paddingHorizontal={3}>
                  <Text bold color={Colors.WHITE} style={{fontSize: 8}}>
                    {' -'}
                    {`${getDiscountPercent}%`}
                  </Text>
                </CustomView>
              </CustomView>
            </RenderIf>
          </CustomView>
          <CustomView row marginTop={1}>
            <CustomView marginRight={5}>
              <Rating sizeIcon={12} count={starRatingProduct} />
            </CustomView>
            <CustomView paddingTop={3}>
              <RenderIf conditioin={starRatingProduct > 0}>
                <Text color={Colors.BLACK} style={{fontSize: 12}}>
                  {starRatingProduct}
                </Text>
              </RenderIf>
            </CustomView>
          </CustomView>
          <ProductBadges item={item?.offers} />
          <RenderIf condition={item?.stock_status === 'OUT_OF_STOCK'}>
            <ButtonNotifyMe
              item={item}
              textStyleProp={{
                paddingTop: modeSmall ? 8 : 9,
                paddingBottom: modeSmall ? 8 : 9,
                fontSize: 12,
              }}
            />
          </RenderIf>
          <RenderIf condition={item?.stock_status !== 'OUT_OF_STOCK'}>
            <ButtonAddToCart
              item={item}
              type={item.__typename}
              itemPrice={getPriceFinalValue}
              currency={getPriceCurrency}
              label={t('label.addToCart')}
              onOpenVariantPopup={() => onOpenVariantPopup?.(item)}
              textStyleProp={{
                paddingTop: modeSmall ? 8 : 9,
                paddingBottom: modeSmall ? 8 : 9,
                fontSize: 12,
              }}
              qtyButtonHeight={modeSmall ? 33 : 35}
            />
          </RenderIf>
        </CustomView>
      </CustomView>
    </RenderItemList>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    overflow: 'hidden',
    // 不使用 width: '100%'，而是使用固定的 itemWidth
    flexShrink: 0,
    flexGrow: 0,
  },
  itemImage: {
    // 宽度和高度由 style prop 动态设置
    flexShrink: 0,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockContainer: {
    paddingVertical: 6,
  },
  outOfStockText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '400',
  },
});

// 暂时移除 memo，确保倒计时能够正常更新
// 如果倒计时正常工作，再考虑添加 memo 优化性能
export default FlashSaleProductItemHorizontal;
