import {useMemo} from 'react';
import {useQuery} from '@apollo/client';
import {LogUtils} from '@app/helpers/LoggerUtils';
import {GET_PRODUCTS_BY_URL_KEY} from '@app/_modules/product_list/services/schema';

const useProduct = urlKeys => {
  const safeUrlKeys = useMemo(
    () => (Array.isArray(urlKeys) ? urlKeys.filter(Boolean) : []),
    [urlKeys],
  );

  const shouldSkip = safeUrlKeys.length === 0;

  const {loading, error, data} = useQuery(GET_PRODUCTS_BY_URL_KEY, {
    variables: {
      url_keys: safeUrlKeys,
      pageSize: safeUrlKeys.length || 1,
      sortBy: {
        stock_status: 'DESC',
      },
    },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    skip: shouldSkip,
    onError: err => {
      LogUtils.error('[useProduct] Product query error: ', err);
    },
  });

  const productList = useMemo(() => {
    if (shouldSkip) {
      return [];
    }

    const items = data?.products.items || [];
    if (items.length === 0) {
      return [];
    }

    // 创建 URL key 到索引的映射，保持 CMS JSON 中的原始顺序
    const urlKeyIndexMap = new Map();
    safeUrlKeys.forEach((urlKey, index) => {
      urlKeyIndexMap.set(urlKey, index);
    });

    // 按照原始 URL keys 的顺序排序商品
    const sortedItems = [...items].sort((a, b) => {
      const indexA = urlKeyIndexMap.get(a.url_key) ?? Infinity;
      const indexB = urlKeyIndexMap.get(b.url_key) ?? Infinity;
      return indexA - indexB;
    });

    return sortedItems;
  }, [data, shouldSkip, safeUrlKeys]);

  const isEmpty = useMemo(
    () => !loading && !shouldSkip && productList.length === 0,
    [loading, productList, shouldSkip],
  );

  return {
    productList,
    isEmpty,
    error,
    loading: shouldSkip ? false : loading,
  };
};

export default useProduct;
