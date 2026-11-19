import React, {useEffect, useState, useRef} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_BANNER_SLIDER} from '@app/services/queries/banner';
import {NAME, setMetricStart, setMetricEnd} from '@app/helpers/Performance';
import {navigateTo} from '@app/helpers/Navigation';
import {
  GET_PRODUCTS_BY_BRAND,
  GET_PRODUCTS_BY_CATEGORIES,
} from '@app/_modules/product_detail/services/schema';
import Views from '@app/_modules/product_list/_view';
import {modules} from '@root/swift.config';
import {BRAND, CATEGORY} from '@app/helpers/Constants';
import {useTranslation} from 'react-i18next';

const ProductList = ({route}) => {
  if (!modules.product_list.enable) {
    return null;
  }

  /**
   * ----------------------------------------- *
   * @constant
   * @summary list of constant local state
   * ----------------------------------------- *
   */
  const {variables, type, id} = route.params;
  const refFirebaseList = useRef();
  const {t} = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);
  const [query, setQuery] = useState(GET_PRODUCTS_BY_CATEGORIES);
  const [queryVariables, setQueryVariables] = useState(null);
  const [bannerSlider, setBannerSlider] = useState([]);

  const {data: bannerSliderData} = useCustomQuery({
    schema: GET_BANNER_SLIDER,
    useInitData: true,
  });

  const {data, loading, onRefetchData} = useCustomQuery({
    schema: query,
  });

  /**
   * ----------------------------------------- *
   * @dependency [route]
   * @summary set initialize data
   * ----------------------------------------- *
   */
  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
    setNoMoreData(false);
  }, [route]);

  /**
   * ----------------------------------------- *
   * @dependency [bannerSliderData]
   * @summary set banner slider from remote
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (bannerSliderData && bannerSliderData?.data) {
      setBannerSlider(bannerSliderData?.data.getHomepageSlider.images);
    }
  }, [bannerSliderData]);

  /**
   * ----------------------------------------- *
   * @dependency [variables]
   * @summary control query and queryVariables
   * based on product list to be displayed
   * (e.g. : by category, by brand, by search keyword)
   * ----------------------------------------- *
   */
  useEffect(() => {
    if (variables) {
      let queryVariablesTmp = {};
      switch (variables?.type) {
        case BRAND:
          setQuery(GET_PRODUCTS_BY_BRAND);
          queryVariablesTmp = {
            attributeId: variables?.attribute_id,
          };
          break;
        case CATEGORY:
          setQuery(GET_PRODUCTS_BY_CATEGORIES);
          queryVariablesTmp = {
            categoryId: variables?.categoryId,
          };
          break;
      }
      queryVariablesTmp = {
        ...queryVariablesTmp,
        currentPage: currentPage,
        pageSize: 6,
        sortBy: {price: 'ASC'},
      };
      setQueryVariables(queryVariablesTmp);
      onRefetchData({params: queryVariablesTmp});
    } else if (route.params) {
      let queryVariablesTmp = {};
      switch (type) {
        case BRAND:
          setQuery(GET_PRODUCTS_BY_BRAND);
          queryVariablesTmp = {
            attributeId: route.params?.id,
          };
          break;
        case CATEGORY:
          setQuery(GET_PRODUCTS_BY_CATEGORIES);
          queryVariablesTmp = {
            categoryId: route.params?.id,
          };
          break;
      }
      queryVariablesTmp = {
        ...queryVariablesTmp,
        currentPage: currentPage,
        pageSize: 6,
        sortBy: {price: 'ASC'},
      };
      setQueryVariables(queryVariablesTmp);
      onRefetchData({params: queryVariablesTmp});
    }
  }, [variables]);

  /**
   * ----------------------------------------- *
   * @dependency [data]
   * @summary set product from remote and
   * set total all product
   * ----------------------------------------- *
   */
  useEffect(() => {
    const getProductListData = async () => {
      if (data === undefined) {
        await setMetricStart({
          name: NAME.PRODUCT_LIST,
          refFirebase: refFirebaseList,
        });
      } else {
        if (data && data?.data && queryVariables) {
          const currentProducts = products;
          const newProducts = [
            ...currentProducts,
            ...data?.data?.products.items,
          ];
          setProducts(newProducts);
          setTotalCount(data?.data?.products.total_count);
          await setMetricEnd({refFirebase: refFirebaseList});
        }
      }
    };
    getProductListData();
  }, [data]);

  /**
   * ----------------------------------------- *
   * @function onLoadMore
   * @summary get more product from remote
   * ----------------------------------------- *
   */
  const onLoadMore = () => {
    if (!loading) {
      if (products.length !== data?.data.products.total_count) {
        const newPage = currentPage + 1;
        setCurrentPage(newPage);

        const queryVariablesTmp = {
          ...queryVariables,
          currentPage: newPage,
        };
        setQueryVariables(queryVariablesTmp);
        onRefetchData({params: queryVariablesTmp});
      } else {
        setNoMoreData(true);
      }
    }
  };

  /**
   * ----------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onNavigateToProductDetail = productUrlKey => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
    });
  };

  return (
    <Views
      t={t}
      products={products}
      totalCount={totalCount}
      onLoadMore={onLoadMore}
      loading={loading}
      noMoreData={noMoreData}
      categoryId={variables?.categoryId || (type === CATEGORY && id)}
      attributeId={variables?.attribute_id || (type === BRAND && id)}
      categoryName={variables?.categoryName}
      onNavigateToProductDetail={onNavigateToProductDetail}
      bannerSlider={bannerSlider}
    />
  );
};

export default ProductList;
