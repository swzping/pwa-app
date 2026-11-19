import React, {useCallback} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {TYPE_SHIMMER_PRODUCT} from '@app/helpers/Constants';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import ProductItem from '@app/_modules/product_list/atoms/ProductItem';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

const Gallery = ({items, customStyles}) => {
  const numColumns = 2;
  const gap = 8;

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onNavigateToProductDetail = ({productUrlKey, productSku}) => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
      productSku,
    });
  };

  const renderItem = useCallback(
    ({item, index}) => {
      const isLastColumn = index % numColumns === numColumns - 1;
      const itemContainerStyle = [
        styles.item,
        {marginRight: isLastColumn ? 0 : gap, marginBottom: gap},
      ];

      return (
        <View style={itemContainerStyle}>
          {item === null ? (
            <ShimmerSkeleton type={TYPE_SHIMMER_PRODUCT} />
          ) : (
            <ProductItem item={item} index={index} onNavigateToProductDetail={onNavigateToProductDetail}/>
          )}
        </View>
      );
    },
    [numColumns, gap],
  );

  return (
    <View style={[styles.container, customStyles?.container]}>
      <FlatList
        data={items}
        keyExtractor={(item, idx) => item?.id?.toString() || idx.toString()}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
  },
});

export default Gallery;
