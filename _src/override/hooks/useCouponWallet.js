import {useCallback,useMemo} from 'react';

import {useLazyQuery} from '@apollo/client';

import {GET_COUPON_WALLET} from '@app/services/queries/couponWallet';

const useCouponWallet = (query = GET_COUPON_WALLET) => {
  const [fetchCouponWallet, {data, loading, error}] = useLazyQuery(query, {
    fetchPolicy: 'network-only', // 确保每次都从网络获取最新数据
  });

  const couponWallet = useMemo(() => {
    const payload = data?.customerCoupons || data?.offlineVouchers;
    return payload?.items || [];
  }, [data]);

  const paginationInfo = useMemo(() => {
    const payload = data?.customerCoupons || data?.offlineVouchers;
    if (!payload) {
      return null;
    }

    return {
      totalCount: payload.totalCount,
      pageSize: payload.pageSize,
      currentPage: payload.currentPage,
    };
  }, [data]);

  const fetchCouponWalletData = useCallback(
    (options = {}) => {
      const {pageSize = 5, currentPage = 1, status: statusParam, couponCode} = options;

      const variables = {
        pageSize,
        currentPage,
      };
      // 只有当 status 有值（不为 null 和 undefined）时才添加到 variables 中
      if (
        statusParam !== null &&
        statusParam !== undefined &&
        statusParam !== ''
      ) {
        variables.status = statusParam;
      }
      // 当 couponCode 有值时，添加到 variables 中
      if (couponCode) {
        variables.code = couponCode;
      }

      // 返回 promise,调用方可直接消费响应数据
      // (Apollo 会对内容相同的响应去重、不更新 hook 的 data,靠监听 data 回填会丢数据)
      return fetchCouponWallet({
        variables,
      });
    },
    [fetchCouponWallet],
  );

  return {
    couponWallet,
    paginationInfo,
    loading,
    error,
    fetchCouponWallet: fetchCouponWalletData,
  };
};

export default useCouponWallet;
