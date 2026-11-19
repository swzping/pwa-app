import React from 'react';
import {StyleSheet} from 'react-native';
import ImageWidget from '../Image';
import PLPHorizontalScroll from '../PLPHorizontalScroll';

/**
 * PLP专用Brands组件：
 * - 最多显示4个
 * - 超出可左右拖动
 * - 有分页点
 * - 不需要自动滚动
 */
const PLPBrands = ({position, items}) => {
  const renderItem = (brand, index, isLast) => (
    <ImageWidget
      position={`${position}-${index}`}
      link={brand.link}
      desktopImage={brand.image || ''}
      mobileImage={brand.image || ''}
      customStyles={{
        container: styles.image,
      }}
    />
  );

  return (
    <PLPHorizontalScroll
      items={items}
      renderItem={renderItem}
      containerStyle={styles.container}
      itemStyle={styles.itemSpacing}
      paginationStyle={styles.paginationContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    backgroundColor: '#F5F5F5',
    marginBottom: 24,
  },
  image: {
    backgroundColor: '#FFF',
    marginBottom: 8,
    borderRadius: 4,
  },
  itemSpacing: {
    marginRight: 12, // 品牌之间的间距
  },
  paginationContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
});

export default PLPBrands;
