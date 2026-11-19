import React from 'react';
import {GET_PRODUCTS_BY_CATEGORIES} from '@app/components/AddonProductSlider/services/schema';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

import Views from '@app/components/AddonProductSlider/views';

const ProductSlider = ({categoryId, title}) => {
  /**
   * ----------------------------------------- *
   * @constant
   * @summary collections constant
   * ----------------------------------------- *
   */
  const {data, loading} = useCustomQuery({
    schema: GET_PRODUCTS_BY_CATEGORIES,
    useInitData: true,
    variables: {
      categoryId: categoryId,
      currentPage: 1,
      pageSize: 6,
      sortBy: {price: 'ASC'},
    },
  });

  const products = data?.data?.products?.items || [];

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductDetail
   * @param {object} item
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onNavigateToProductDetail = productUrlKey => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
    });
  };

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductList
   * @param {object} item
   * @summary navigate to product list
   * ----------------------------------------- *
   */
  const onNavigateToProductList = () => {
    navigateTo(modules.product_list.enable, modules.product_list.name, {
      variables: {
        type: 'category',
        categoryId,
      },
    });
  };

  return (
    <Views
      title={title}
      products={products}
      loading={loading}
      onNavigateToProductDetail={onNavigateToProductDetail}
      onNavigateToProductList={onNavigateToProductList}
    />
  );
};

export default ProductSlider;
