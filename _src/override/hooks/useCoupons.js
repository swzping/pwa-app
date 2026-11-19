import {useMemo, useCallback} from 'react';
import {useLazyQuery} from '@apollo/client';
import {GET_COUPONS} from '@app/services/queries/coupons';

const useCoupons = () => {
  const [getCoupons, {data, error, loading}] = useLazyQuery(GET_COUPONS, {
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  const coupons = useMemo(() => {
    return data?.coupons?.items || [];
  }, [data]);

  const paginationInfo = useMemo(() => {
    if (!data?.coupons) {
      return null;
    }

    return {
      totalCount: data.coupons.totalCount,
      pageSize: data.coupons.pageSize,
      currentPage: data.coupons.currentPage,
    };
  }, [data]);

  const fetchCoupons = useCallback(
    (variables = {pageSize: 10, currentPage: 1}, options = {}) => {
      getCoupons({
        variables,
        context: {fetchOptions: {method: 'GET'}},
        ...options,
      });
    },
    [getCoupons],
  );

  return {
    coupons,
    paginationInfo,
    loading,
    error,
    fetchCoupons,
  };
};

export default useCoupons;
