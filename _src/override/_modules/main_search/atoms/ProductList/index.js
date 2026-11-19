import React from 'react';
import {Image} from 'react-native';
import {pushTo} from '@app/helpers/Navigation';
import {numberFormat} from '@app/helpers/General';
import {modules} from '@root/swift.config';
import {useNavigation} from '@react-navigation/native';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';
import {useRoute} from '@react-navigation/native';
import {trackClickSkuComponent} from '@app/track';

const ProductList = ({data}) => {
  const route = useRoute();
  const navigation = useNavigation();
  /**
   * ----------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onNavigateToProductDetail = ({productUrlKey, productSku}) => {
    pushTo(
      navigation,
      modules.product_detail.enable,
      modules.product_detail.name,
      {
        productUrlKey,
        productSku,
      },
    );
  };

  const ProductItem = ({item}) => {
    const getPriceRange = item?.price_range;
    const getMinPrice = getPriceRange?.minimum_price;
    const getPriceCurrency = getMinPrice?.final_price.currency;
    const getPriceRegularValue = getMinPrice?.regular_price.value;
    const getPriceFinalValue = getMinPrice?.final_price.value;
    const getDiscountPercent = getMinPrice?.discount?.percent_off;

    return (
      <CustomView
        marginBottom={10}
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
        }
        }>
        <CustomView row spaceBetween horizontalCenter>
          <CustomView
            borderRadius={6}
            width={60}
            height={60}
            style={{overflow: 'hidden'}}
            marginRight={12}>
            <Image
              source={{uri: item.small_image.url}}
              style={{
                width: 60,
                height: 60,
              }}
            />
          </CustomView>
          <CustomView flexNumber={1}>
            <Text small>{item.name}</Text>
            <CustomView row horizontalCenter>
              <Text color={Colors.PRIMARY} bold>
                {numberFormat(getPriceCurrency, getPriceFinalValue, ',', 2)}
              </Text>
              <RenderIf condition={getDiscountPercent}>
                <CustomView marginLeft={5}>
                  <Text lineThrough small3 color={Colors.GRAY_DARK}>
                    {numberFormat(
                      getPriceCurrency,
                      getPriceRegularValue,
                      ',',
                      2,
                    )}
                  </Text>
                </CustomView>
                <CustomView
                  backgroundColor={'#E41305'}
                  borderRadius={2}
                  paddingVertical={0}
                  paddingHorizontal={3}
                  marginLeft={5}>
                  <Text small3 bold color={Colors.WHITE}>
                    {' -'}
                    {`${getDiscountPercent}%`}
                  </Text>
                </CustomView>
              </RenderIf>
            </CustomView>
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };

  if (data.length < 1) {
    return null;
  }

  return data.map((product, index) => (
    <ProductItem key={index} item={product} />
  ));
};

export default ProductList;
