import React, {useMemo} from 'react';
import {View} from 'react-native';

import ProductItem from '@app/_modules/product_list/atoms/ProductItem';
import Swiper from '@app/components/Swiper';

import styles from './styles';

const ProductCarousel = ({
  items = [],
  settings = {},
  onNavigateToProductDetail,
  onOpenVariantPopup,
}) => {
  const {dots = false, slidesPerView = 2.4, spaceBetween = 10} = settings;

  const renderItems = useMemo(() => {
    return items.map((item, index) => (
      <ProductItem
        key={`sku-${item.sku}`}
        item={item}
        index={index}
        onNavigateToProductDetail={onNavigateToProductDetail}
        onOpenVariantPopup={() => {
          onOpenVariantPopup(item);
        }}
      />
    ));
  }, [items, onNavigateToProductDetail]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Swiper
        dots={dots}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        flatListConfigs={{
          windowSize: 3,
          maxToRenderPerBatch: 3,
          initialNumToRender: 3,
          removeClippedSubviews: true,
        }}
        flatListContentContainerStyle={styles.flatListContent}>
        {renderItems}
      </Swiper>
    </View>
  );
};

export default ProductCarousel;
