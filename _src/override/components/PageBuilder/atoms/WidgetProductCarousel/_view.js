import React, {useCallback} from 'react';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
// import ButtonSliderNavigator from '@app/components/ButtonSliderNavigator/index';
import ProductCarousel from '@app/_modules/product_list/atoms/ProductCarousel';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {isNil} from 'lodash';
import {Colors} from '@app/styles/index';
import {navigateTo} from '@app/helpers/Navigation';
import RenderIf from '@app/components/RenderIf';
import {modules} from '@root/swift.config';
import {TYPE_SHIMMER_PRODUCTS} from '@app/helpers/Constants';

const Views = ({
  t,
  items,
  loading,
  itemsPageSize,
  title,
  titleBgColor,
  bodyBgColor,
  onNavigateToPLP,
  titleColor,
}) => {
  // const flatListRef = useRef();
  // const [, setIndexScroll] = useState(0);
  const backgroundColorFrame = isNil(bodyBgColor)
    ? Colors.WHITE
    : bodyBgColor.includes('#')
    ? bodyBgColor
    : `#${bodyBgColor}`;

  // const backgroundTitle = isNil(titleBgColor)
  //   ? Colors.PRIMARY
  //   : `#${titleBgColor}`;
  const titleTextColor = isNil(titleColor) ? Colors.BLACK : titleColor;

  const onNavigateToProductDetail = useCallback(({productUrlKey}) => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
    });
  }, []);

  const flatListContentContainerStyle = {
    paddingLeft: 12,
    paddingRight: 12,
  };

  return (
    <CustomView
      style={{top: -3}}
      backgroundColor={backgroundColorFrame}
      paddingTop={10}>
      <CustomView
        row
        spaceBetween
        horizontalCenter
        paddingHorizontal={12}
        paddingVertical={16}>
        <Text large bold color={titleTextColor}>
          {title}
        </Text>
        <Text
          style={{fontSize: 12}}
          color={Colors.PRIMARY}
          onPress={onNavigateToPLP}>
          {t('showAll')}
        </Text>
      </CustomView>
      {/* <FlatList
        overScrollMode="never"
        ref={flatListRef}
        horizontal
        keyExtractor={(item, index) => `${index}-${item?.id?.toString()}`}
        data={items}
        renderItem={renderItem}
        windowSize={5}
        contentContainerStyle={{
          paddingLeft: 6,
          paddingRight: 6,
          paddingBottom: 10,
        }}
      /> */}

      <RenderIf condition={loading}>
        <ShimmerSkeleton
          type={TYPE_SHIMMER_PRODUCTS}
          flatListContentContainerStyle={flatListContentContainerStyle}
        />
      </RenderIf>
      <RenderIf condition={!loading}>
        <ProductCarousel
          items={items}
          flatListContentContainerStyle={flatListContentContainerStyle}
          onNavigateToProductDetail={onNavigateToProductDetail}
        />
      </RenderIf>
      {/* <ButtonSliderNavigator
        navigatorButtonHeight={220}
        onPress={() => onScrollFlatList({isReduce: true})}
      />
      <ButtonSliderNavigator
        navigatorButtonHeight={220}
        isRight
        onPress={() => onScrollFlatList({isReduce: false})}
      /> */}
    </CustomView>
  );
};

export default Views;
