import React, {memo} from 'react';
import {Image} from 'react-native';
import {numberFormat} from '@app/helpers/General';
import {Colors} from '@app/styles/index';
import FastImage from '@d11/react-native-fast-image';
import styles from '@app/_modules/product_list/atoms/ProductItem/styles';

import ToggleWishlist from '@app/components/ToggleWishlist/index';
import RenderIf from '@app/components/RenderIf';
import RenderItemList from '@app/components/RenderItem/index';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text/index';
import ButtonAddToCart from '@app/components/ButtonAddToCart/index';
import ButtonNotifyMe from '@app/components/ButtonNotifyMe/index';
import Sale from '@app/components/Sale';
import {useTranslation} from 'react-i18next';
import Rating from '@app/components/Rating';
import {useRoute} from '@react-navigation/native';
import {trackClickSkuComponent} from '@app/track';

const ProductItem = ({
  item,
  onNavigateToProductDetail,
  index,
  itemWidth,
  modeSmall = false,
  style,
}) => {
  const route = useRoute();
  const {t} = useTranslation();
  const starRatingProduct = item?.rating_summary || 0;

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

  return (
    <RenderItemList itemKey={index} style={style}>
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
          });

          trackClickSkuComponent({
            location_name: route.name,
            sku_name: item.name,
            sku_id: item.sku,
          });
        }}
        style={styles.itemContainer}>
        <RenderIf condition={item.sale}>
          <CustomView
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1,
            }}>
            <Sale isPDP={false} sale={item.sale} />
          </CustomView>
        </RenderIf>
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
            <RenderIf condition={item?.stock_status === 'OUT_OF_STOCK'}>
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
        <CustomView width={'100%'} paddingHorizontal={10} horizontalStart>
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

export default memo(ProductItem, (prev, next) => {
  return prev.item === next.item;
});
