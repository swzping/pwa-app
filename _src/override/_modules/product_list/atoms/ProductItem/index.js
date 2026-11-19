import React, {memo, useCallback, useEffect, useState} from 'react';
import {Image} from 'react-native';

import {useRoute} from '@react-navigation/native';

import FastImage from '@d11/react-native-fast-image';
import {
  OUT_OF_STOCK,
  TYPENAME_CONFIGURABLE,
} from '@root/_src/override/helpers/Constants';

import {useTranslation} from 'react-i18next';

import styles from '@app/_modules/product_list/atoms/ProductItem/styles';
import DiscountIcon from '@app/assets/svgs/DiscountIcon';
import FlashSaleIcon from '@app/assets/svgs/FlashSaleIcon';
import ButtonAddToCart from '@app/components/ButtonAddToCart/index';
import ButtonNotifyMe from '@app/components/ButtonNotifyMe/index';
import CustomView from '@app/components/CustomView';
import FlashSaleCountdown from '@app/components/FlashSaleCountdown';
import ProductBadges from '@app/components/ProductBadges/index';
import Rating from '@app/components/Rating';
import RenderIf from '@app/components/RenderIf';
import RenderItemList from '@app/components/RenderItem/index';
import Sale from '@app/components/Sale';
import Text from '@app/components/Text/index';
import ToggleWishlist from '@app/components/ToggleWishlist/index';
import DateHelper from '@app/helpers/Date';
import {numberFormat} from '@app/helpers/General';
import {Colors} from '@app/styles/index';
import {normalize} from '@app/styles/mixins';
import {trackClickSkuComponent} from '@app/track';

const normalizeDateValue = value => {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'string') {
    const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
    const parsed = new Date(normalized);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const ProductItem = ({
  item,
  onNavigateToProductDetail,
  index,
  itemWidth,
  modeSmall = false,
  onOpenVariantPopup,
}) => {
  const route = useRoute();
  const {t} = useTranslation();
  const starRatingProduct = item?.rating_summary || 0;

  const isVariantOOS =
    item?.__typename === TYPENAME_CONFIGURABLE &&
    item?.product?.stock_status === OUT_OF_STOCK;
  const getPriceRange = item?.price_range;
  const getMinPrice = getPriceRange?.minimum_price;
  const getPriceCurrency = getMinPrice?.final_price.currency;
  const getPriceRegularValue = getMinPrice?.regular_price.value;
  const getPriceFinalValue = getMinPrice?.final_price.value;
  const getDiscountPercent = getMinPrice?.discount?.percent_off
    ? Math.round(getMinPrice.discount.percent_off)
    : undefined;
  const showDiscountRibbon = Number(item?.discount_percentage) > 0;

  const isFlashSale = item?.is_flash_sale === 1;
  const flashSaleEndDate = item?.special_to_date ?? null;

  const endTimestamp = useCallback(() => {
    if (!flashSaleEndDate) {
      return null;
    }
    const normalized = normalizeDateValue(flashSaleEndDate);
    if (!normalized) {
      return null;
    }
    const converted = DateHelper.convertUTCToIndonesia(normalized);
    const endDate = converted ? new Date(converted) : null;
    return endDate && !isNaN(endDate.getTime()) ? endDate.getTime() : null;
  }, [flashSaleEndDate])();

  const calculateRemaining = useCallback(() => {
    if (!isFlashSale || !endTimestamp) {
      return null;
    }
    const remaining = endTimestamp - DateHelper.getIndonesiaTimeNow().getTime();
    return remaining > 0 ? remaining : null;
  }, [isFlashSale, endTimestamp]);

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);

  useEffect(() => {
    if (!isFlashSale || !endTimestamp) {
      setTimeLeft(null);
      return;
    }

    const updateTimeLeft = () => {
      const remaining =
        endTimestamp - DateHelper.getIndonesiaTimeNow().getTime();
      if (remaining <= 0) {
        setTimeLeft(null);
        return false;
      }
      setTimeLeft(remaining);
      return true;
    };

    if (!updateTimeLeft()) {
      return;
    }

    const timer = setInterval(() => {
      if (!updateTimeLeft()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isFlashSale, endTimestamp]);

  const isFlashSaleActive = timeLeft !== null && timeLeft > 0;
  const displayPrice = getPriceFinalValue;
  const showDiscountInfo = getDiscountPercent;

  let imageSourceCondition =
    item.small_image !== null &&
    item.small_image.url !== '' &&
    item.small_image !== undefined;

  return (
    <RenderItemList itemKey={`${index}-${isFlashSaleActive}`}>
      <CustomView
        borderRadius={8}
        border={0.5}
        borderColor={Colors.GRAY_SMOOTH3}
        paddingTop={0}
        backgroundColor={Colors.WHITE}
        onPress={() => {
          onNavigateToProductDetail({
            ...item,
            productUrlKey: item.url_key,
            productSku: item.sku,
            index,
            name: item.name,
          });

          trackClickSkuComponent({
            location_name: route.name,
            sku_name: item.name,
            sku_id: item.sku,
          });
        }}
        style={styles.itemContainer}>
        {/* corner badges (flash sale / sale / discount) share
            one row so coexisting badges never overlap */}
        {(isFlashSaleActive || item.sale || showDiscountRibbon) ? (
          <CustomView
            style={{
              position: 'absolute',
              top: 0,
              left: 8,
              zIndex: 2,
              gap: 12,
            }}>
            {isFlashSaleActive ? <FlashSaleIcon width={32} height={32} /> : null}
            {item.sale ? <Sale isPDP={false} sale={item.sale} /> : null}
            {showDiscountRibbon ? (
              <CustomView>
                <Text style={styles.discountText}>
                  {Math.floor(item?.discount_percentage)}
                  <Text style={{fontSize: normalize(6), color: Colors.RED}}>
                    %
                  </Text>
                </Text>
                <DiscountIcon width={32} height={32} />
              </CustomView>
            ) : null}
          </CustomView>
        ) : null}
        <RenderIf condition={imageSourceCondition}>
          <CustomView horizontalCenter>
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
            <RenderIf condition={item.promo}>
              <CustomView
                backgroundColor={'#E41305'}
                verticalCenter
                paddingVertical={3}
                paddingHorizontal={15}
                borderRadius={16}
                style={{
                  position: 'absolute',
                  left: -10,
                  bottom: 0,
                  zIndex: 1,
                }}>
                <Text
                  color={Colors.WHITE}
                  style={{textTransform: 'uppercase', fontSize: 10}}>
                  {item.promo}
                </Text>
              </CustomView>
            </RenderIf>
            <RenderIf
              condition={item?.stock_status === OUT_OF_STOCK || isVariantOOS}>
              <CustomView
                backgroundColor={'rgba(0,0,0,0.5)'}
                paddingHorizontal={10}
                borderRadius={16}
                style={{
                  position: 'absolute',
                  zIndex: 1,
                  top: '40%',
                }}>
                <Text color={Colors.WHITE} small={modeSmall ? true : false}>
                  {t('product_detail.oos')}
                </Text>
              </CustomView>
            </RenderIf>
            <FastImage
              key={item.url_key}
              style={[
                itemWidth
                  ? {
                      width: itemWidth,
                      height: itemWidth,
                    }
                  : {
                      width: '100%',
                      aspectRatio: 1,
                    },
                {backgroundColor: Colors.GRAY_SMOOTH},
              ]}
              resizeMode={FastImage.resizeMode.contain}
              source={{
                uri: item.small_image.url.toString(),
                priority: FastImage.priority.normal,
                cache: FastImage.cacheControl.immutable,
              }}
            />
          </CustomView>
        </RenderIf>
        <RenderIf condition={!imageSourceCondition}>
          <Image
            source={require('@app/assets/images/placeholder.png')}
            style={styles.itemImage}
          />
        </RenderIf>
        <RenderIf condition={isFlashSaleActive}>
          <FlashSaleCountdown
            isActive={isFlashSaleActive}
            startDate={item?.special_from_date}
            endDate={item?.special_to_date}
            containerStyle={{
              marginTop: -normalize(4),
            }}
          />
        </RenderIf>
        <CustomView width={'100%'} paddingHorizontal={10} horizontalStart>
          <CustomView marginTop={5} style={{minHeight: 26}}>
            <Text left numberOfLines={2} style={{fontSize: 12, lineHeight: 16}}>
              {item.name}
            </Text>
          </CustomView>
          <CustomView marginTop={3}>
            <Text bold color={Colors.PRIMARY} style={{fontSize: 12}}>
              {numberFormat(getPriceCurrency, displayPrice, ',', 2)}
            </Text>
          </CustomView>
          <CustomView row height={16}>
            <RenderIf condition={showDiscountInfo}>
              <CustomView paddingTop={2}>
                <Text
                  lineThrough
                  color={Colors.GRAY_DARK}
                  style={{fontSize: 10}}>
                  {numberFormat(getPriceCurrency, getPriceRegularValue, ',', 2)}
                </Text>
              </CustomView>
            </RenderIf>
            <RenderIf condition={showDiscountInfo}>
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
          <ProductBadges
            item={item?.offers}
            handlePressMore={() => {
              onNavigateToProductDetail({
                ...item,
                productUrlKey: item.url_key,
                productSku: item.sku,
              });
            }}
          />
          <RenderIf
            condition={item?.stock_status === OUT_OF_STOCK || isVariantOOS}>
            <ButtonNotifyMe
              item={item}
              textStyleProp={{
                paddingTop: modeSmall ? 8 : 9,
                paddingBottom: modeSmall ? 8 : 9,
                fontSize: 12,
              }}
            />
          </RenderIf>
          <RenderIf
            condition={item?.stock_status !== OUT_OF_STOCK && !isVariantOOS}>
            <ButtonAddToCart
              item={item}
              type={item.__typename}
              itemPrice={getPriceFinalValue}
              currency={getPriceCurrency}
              textStyleProp={{
                paddingTop: modeSmall ? 8 : 9,
                paddingBottom: modeSmall ? 8 : 9,
                fontSize: 12,
              }}
              qtyButtonHeight={modeSmall ? 33 : 35}
              onOpenVariantPopup={onOpenVariantPopup}
            />
          </RenderIf>
        </CustomView>
      </CustomView>
    </RenderItemList>
  );
};

export default memo(ProductItem, (prev, next) => {
  //避免不必要的重渲染
  return (
    prev.item?.id === next.item?.id &&
    prev.item?.wishlistId === next.item?.wishlistId &&
    prev.item?.sku === next.item?.sku &&
    prev.item?.url_key === next.item?.url_key &&
    prev.item?.price_range === next.item?.price_range &&
    prev.item?.discount_percentage === next.item?.discount_percentage &&
    prev.item?.stock_status === next.item?.stock_status &&
    prev.item?.is_flash_sale === next.item?.is_flash_sale &&
    prev.item?.special_to_date === next.item?.special_to_date &&
    prev.item?.rating_summary === next.item?.rating_summary &&
    prev.onNavigateToProductDetail === next.onNavigateToProductDetail &&
    prev.index === next.index &&
    prev.itemWidth === next.itemWidth
  );
});
