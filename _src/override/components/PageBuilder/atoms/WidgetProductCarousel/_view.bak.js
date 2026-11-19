import React from 'react';
import TwoSlidesCarousel from '@app/components/TwoSlidesCarousel/index';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import ProductItem from '@app/_modules/product_list/atoms/ProductItem/index';
import {Colors} from '@app/styles';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

const Views = ({t, items, title, onNavigateToPLP}) => {
  const onNavigateToProductDetail = ({productUrlKey, productSku}) => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
    });
  };
  const renderItem = ({item, index}) => {
    return (
      <CustomView paddingHorizontal={5}>
        <ProductItem
          item={item}
          onNavigateToProductDetail={onNavigateToProductDetail}
          index={index}
        />
      </CustomView>
    );
  };
  return (
    <CustomView
      paddingVertical={10}
      style={{top: -3}}
      backgroundColor={
        title === 'Kunci Terus Harga Murah' ? Colors.YELLOW_LIGHT : Colors.WHITE
      }>
      <CustomView
        row
        spaceBetween
        margin={10}
        padding={10}
        backgroundColor={Colors.PRIMARY}>
        <Text bold color={Colors.WHITE}>
          {title}
        </Text>
        <Text color={Colors.WHITE} onPress={onNavigateToPLP}>
          {t('showAll')}
        </Text>
      </CustomView>
      <TwoSlidesCarousel
        data={items}
        navigatorButtonHeight={140}
        renderItem={renderItem}
      />
    </CustomView>
  );
};

export default Views;
