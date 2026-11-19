import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {StyleSheet, View} from 'react-native';

import {modules} from '@root/swift.config';

import isEqual from 'lodash/isEqual';

import ProductCarousel from '@app/_modules/product_list/atoms/ProductCarousel';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {useCmsContext} from '@app/components/Cms/CmsContext';
import {useParentData} from '@app/components/Cms/hooks/useParentData';
import Gallery from '@app/components/Products/gallery';
import {TYPE_SHIMMER_PRODUCTS} from '@app/helpers/Constants';
import {NavigatorContext} from '@app/helpers/Context';
import {navigateTo} from '@app/helpers/Navigation';
import {trackHomepageModuleClick} from '@app/track';

import useProduct from '../../hooks/useProduct';

const ProductsWidget = ({
  appearance = 'carousel',
  pathNames,
  settings = {},
  position,
  contentType,
}) => {
  const {routeName} = useContext(NavigatorContext);
  const {onOpenVariantPopup} = useCmsContext();

  const parentDataFromContext = useParentData();
  const {productList, loading} = useProduct(pathNames);
  const [renderedProducts, setRenderedProducts] = useState([]);
  const isFirstRender = useRef(true);

  const containerStyle = [
    styles.container,
    appearance === 'grid' && styles.paddingRegularHorizontal,
  ];

  if (appearance) {
  }
  const flatListContentContainerStyle = {
    paddingLeft: 12,
    paddingRight: 12,
  };

  const onNavigateToProductDetail = useCallback(
    ({productUrlKey, index, name, variant_parent_url_key, uid}) => {
      navigateTo(modules.product_detail.enable, modules.product_detail.name, {
        productUrlKey: variant_parent_url_key || productUrlKey,
        uid,
      });

      trackHomepageModuleClick({
        routeName,
        module_rank: position + '-' + index,
        module_content: parentDataFromContext.rawData.cssClasses,
        location_name: name,
        resource_type: contentType,
      });
    },
    [],
  );

  useEffect(() => {
    if (!isEqual(renderedProducts, productList)) {
      setRenderedProducts(productList);
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [productList]);

  if (isFirstRender.current && loading && productList.length === 0) {
    return (
      <View style={containerStyle}>
        {appearance === 'carousel' ? (
          <ShimmerSkeleton
            type={TYPE_SHIMMER_PRODUCTS}
            flatListContentContainerStyle={flatListContentContainerStyle}
          />
        ) : (
          <View />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {appearance === 'carousel' ? (
        <ProductCarousel
          items={renderedProducts}
          flatListContentContainerStyle={flatListContentContainerStyle}
          onNavigateToProductDetail={onNavigateToProductDetail}
          onOpenVariantPopup={onOpenVariantPopup}
        />
      ) : (
        <Gallery items={renderedProducts} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  paddingRegularHorizontal: {
    paddingLeft: 12,
    paddingRight: 12,
  },
});

export default ProductsWidget;
