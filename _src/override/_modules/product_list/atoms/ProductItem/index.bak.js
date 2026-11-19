import React, {memo,useState} from 'react';
import {Image} from 'react-native';

import FastImage from '@d11/react-native-fast-image';

import styles from '@app/_modules/product_list/atoms/ProductItem/styles';
import ButtonAddToCart from '@app/components/ButtonAddToCart/index';
import ButtonNotifyMe from '@app/components/ButtonNotifyMe/index';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import RenderItemList from '@app/components/RenderItem/index';
import Sale from '@app/components/Sale';
import Text from '@app/components/Text';
import ToggleWishlist from '@app/components/ToggleWishlist';
import {numberFormat} from '@app/helpers/General';
import {thumborProductList} from '@app/helpers/Thumbor';
import {Colors, Mixins} from '@app/styles';

const ProductItem = ({
  item,
  onNavigateToProductDetail,
  isProductDetail = false,
  index,
}) => {
  const [imageErrors, setImageErrors] = useState({});

  const price_range = item?.price_range;
  const price_max = price_range?.maximum_price;
  const price_final = price_max?.final_price || price_max?.regular_price;

  let imageSourceCondition =
    item.small_image !== null &&
    item.small_image.url !== '' &&
    item.small_image !== undefined;
  if (imageErrors[item.url_key]) {
    imageSourceCondition = false;
  }

  return (
    <RenderItemList itemKey={index}>
      <CustomView style={{marginBottom: 20}}>
        <CustomView
          onPress={() =>
            onNavigateToProductDetail({
              productUrlKey: item.url_key,
              productSku: item.sku,
            })
          }
          style={
            isProductDetail ? styles.itemContainer : styles.itemContainerPDP
          }>
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
            <CustomView>
              <CustomView
                style={{position: 'absolute', top: 5, right: 10, zIndex: 1}}>
                <ToggleWishlist
                  item={item}
                  productId={item.id}
                  wishlistItemId={item.wishlistId}
                  productName={item.name}
                  productSku={item.sku}
                  productCurrency={
                    Object.keys(item).length > 0 ? price_final.currency : ''
                  }
                  productPrice={
                    Object.keys(item).length > 0 ? price_final.value : 0
                  }
                />
              </CustomView>
              <RenderIf condition={item.promo}>
                <CustomView
                  backgroundColor={Colors.RED}
                  width={Mixins.MAX_WIDTH / 2 - 30}
                  horizontalCenter
                  verticalCenter
                  padding={5}
                  style={{position: 'absolute', bottom: 0, zIndex: 1}}>
                  <Text
                    color={Colors.WHITE}
                    style={{textTransform: 'uppercase'}}>
                    {item.promo}
                  </Text>
                </CustomView>
              </RenderIf>
              <FastImage
                key={item.url_key}
                style={styles.itemImage}
                source={{
                  uri: thumborProductList(item.small_image.url.toString()),
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.immutable,
                }}
                resizeMode={FastImage.resizeMode.contain}
                onError={() => {
                  const newImageErrors = {
                    ...imageErrors,
                    [item.url_key]: true,
                  };
                  setImageErrors(newImageErrors);
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
            <CustomView marginVertical={10} height={40}>
              <Text left numberOfLines={2}>
                {item.name}
              </Text>
            </CustomView>
            <CustomView row height={20} marginBottom={5}>
              <RenderIf condition={item.special_price}>
                <Text lineThrough small color={Colors.GRAY_DARK}>
                  {numberFormat(
                    price_final.currency,
                    price_final.value,
                    ',',
                    2,
                  )}
                </Text>
                <Text small color={Colors.RED}>
                  {' '}
                  {price_max.discount.percent_off} %
                </Text>
              </RenderIf>
            </CustomView>
            <Text large bold color={Colors.PRIMARY}>
              {numberFormat(
                price_final.currency,
                item.special_price || price_final.value,
                ',',
                2,
              )}
            </Text>
          </CustomView>
        </CustomView>
        <RenderIf condition={item?.stock_status === 'OUT_OF_STOCK'}>
          <ButtonNotifyMe item={item} />
        </RenderIf>
        <RenderIf condition={item?.stock_status !== 'OUT_OF_STOCK'}>
          <ButtonAddToCart item={item} type={item.__typename} />
        </RenderIf>
      </CustomView>
    </RenderItemList>
  );
};

export default memo(ProductItem, (prev, next) => {
  return prev.item === next.item;
});
