import React from 'react';
import {Mixins} from '@app/styles';
import {FlatList} from 'react-native';
import {ActivityIndicator, Text} from 'react-native-paper';
import {useTranslation} from 'react-i18next';

import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import ProductItem from '@app/components/_ProductItem';
import styles from '@app/components/AddonProductSlider/styles';

import NoData from '@app/components/NoData';

function ProductSliderViews({
  title,
  products,
  loading,
  onNavigateToProductDetail,
  onNavigateToProductList,
}) {
  const {t} = useTranslation();

  return (
    <CustomView horizontalCenter verticalCenter>
      <CustomView
        width={Mixins.MAX_WIDTH}
        row
        spaceBetween
        paddingHorizontal={10}
        paddingVertical={10}
        style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <CustomView onPress={onNavigateToProductList}>
          <Text style={styles.headerTitleRight}>{t('label.viewMore')}</Text>
        </CustomView>
      </CustomView>
      <RenderIf condition={loading}>
        <ActivityIndicator />
      </RenderIf>
      <RenderIf condition={!loading && products.length < 1}>
        <NoData />
      </RenderIf>
      <RenderIf condition={!loading}>
        <FlatList
          horizontal
          data={products}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => {
            const getFinalPrice = item?.price_range?.maximum_price?.final_price;
            return (
              <ProductItem
                onPress={() => onNavigateToProductDetail(item.url_key)}
                key={item.url_key}
                keyImage={item.url_key}
                name={item?.name}
                image={item?.small_image?.url}
                currency={getFinalPrice.currency}
                price={getFinalPrice.value}
              />
            );
          }}
        />
      </RenderIf>
    </CustomView>
  );
}

export default ProductSliderViews;
