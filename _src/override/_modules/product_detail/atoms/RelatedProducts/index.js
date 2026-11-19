import React from 'react';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import ProductCarousel from '@app/_modules/product_list/atoms/ProductCarousel';

const RelatedProducts = ({data, onNavigateToProductDetail}) => {
  return (
    <RenderIf condition={data?.length}>
      <CustomView horizontalCenter paddingVertical={30}>
        <Text xlarge bold style={{marginBottom: 20}}>
          You May Also Like
        </Text>
        <CustomView row horizontalStart style={{flexWrap: 'wrap'}}>
          <ProductCarousel
            items={data}
            onNavigateToProductDetail={onNavigateToProductDetail}
          />
        </CustomView>
      </CustomView>
    </RenderIf>
  );
};

export default RelatedProducts;
