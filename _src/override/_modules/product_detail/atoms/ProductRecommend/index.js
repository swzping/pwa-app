import React, {useCallback} from 'react';
import ProductItem from '@app/_modules/product_list/atoms/ProductItem';
import CustomView from '@app/components/CustomView';
import {Colors, Mixins} from '@app/styles';
import {FlatList} from 'react-native';
import Text from '@app/components/Text';
import {useTranslation} from 'react-i18next';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {TYPE_SHIMMER_PLP} from '@app/helpers/Constants';

const productRecommend = ({
  data,
  productCrosssellLoading,
  onNavigateToProductDetail,
}) => {
  const {t} = useTranslation();

  const HeaderElement = useCallback(() => {
    return (
      <CustomView>
        <Text bold style={{fontSize: 16}}>
          {t('product_detail.youMayAlsoLike')}
        </Text>
      </CustomView>
    );
  });

  const RenderItem = ({item, index}) => {
    const oneItemWidth = parseInt((Mixins.MAX_WIDTH - 24 - 10) / 2);
    return (
      <CustomView
        marginBottom={10}
        marginLeft={index % 2 === 1 ? 10 : 0}
        width={oneItemWidth}
        style={{overflow: 'hidden'}}>
        <ProductItem
          item={item}
          onNavigateToProductDetail={onNavigateToProductDetail}
          index={index}
          itemWidth={oneItemWidth}
        />
      </CustomView>
    );
  };

  if (productCrosssellLoading) {
    return <ShimmerSkeleton type={TYPE_SHIMMER_PLP} />;
  } else if (!data || data.length === 0) {
    return null;
  }

  return (
    <>
      <FlatList
        overScrollMode="never"
        renderItem={RenderItem}
        ListHeaderComponent={HeaderElement}
        stickyHeaderIndices={[0]}
        ListHeaderComponentStyle={{
          alignSelf: 'left',
          backgroundColor: Colors.WHITE,
          marginTop: 14,
          marginBottom: 27,
        }}
        scrollEventThrottle={400}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {}}
        numColumns={2}
        data={data}
        keyExtractor={item => item.id.toString()}
        removeClippedSubviews={false}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={21}
        style={{
          width: Mixins.MAX_WIDTH,
          backgroundColor: Colors.WHITE,
          paddingLeft: 12,
          paddingRight: 12,
        }}
      />
    </>
  );
};

export default productRecommend;
