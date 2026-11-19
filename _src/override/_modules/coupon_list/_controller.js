import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useIsFocused} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {navigate} from '@app/helpers/Navigation';
import useCollectCoupon from '@app/hooks/useCollectCoupon';
import useCoupons from '@app/hooks/useCoupons';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxRefreshVoucherSlider, rxUserToken} from '@app/services/cache';
import {GET_VOUCHER_BY_CODE} from '@app/services/queries/coupons';

import Views from './_view';

const CouponListController = props => {
  const {t} = useTranslation();
  const userToken = useReactiveVar(rxUserToken);
  const isFocused = useIsFocused();

  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [allCoupons, setAllCoupons] = useState([]);
  const [claimingCouponCode, setClaimingCouponCode] = useState(null);

  const pageSize = 5;

  const {coupons, paginationInfo, loading, fetchCoupons} = useCoupons();
  const {collectCoupon, loading: collectLoading} = useCollectCoupon();

  const [localCollectedCoupons, setLocalCollectedCoupons] = useState([]);
  const [messageToast, setMessageToast] = useState(null);

  const hasLoadedRef = useRef(false);

  const {onRefetchData: getVoucherByCode, data: voucherData} = useCustomQuery({
    schema: GET_VOUCHER_BY_CODE,
    opts: {fetchPolicy: 'network-only'},
  });

  // 检查优惠券是否已被领取
  const isCouponCollected = useCallback(
    couponCode => {
      if (!couponCode || !userToken) {
        return false;
      }

      // 检查本地已领取的优惠券
      if (localCollectedCoupons.some(coupon => coupon.code === couponCode)) {
        return true;
      }

      // 从 allCoupons 中查找对应的优惠券，使用 is_claimed 字段判断
      const coupon = allCoupons.find(c => c.code === couponCode);
      if (coupon && coupon.is_claimed === true) {
        return true;
      }

      return false;
    },
    [allCoupons, localCollectedCoupons, userToken],
  );

  const fetchFirstPage = useCallback(async () => {
    setCurrentPage(1);
    await fetchCoupons(
      {
        pageSize,
        currentPage: 1,
      },
      {fetchPolicy: 'network-only'},
    );
  }, [fetchCoupons]);

  useEffect(() => {
    if (isFocused && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchFirstPage();
    }
    if (!isFocused) {
      hasLoadedRef.current = false;
    }
  }, [isFocused, fetchFirstPage]);

  // Update local list when new data arrives
  useEffect(() => {
    if (coupons) {
      if (currentPage === 1) {
        setAllCoupons(coupons);
      } else {
        setAllCoupons(prev => {
          const existingCodes = new Set(prev.map(item => item.code));
          const newItems = coupons.filter(
            item => !existingCodes.has(item.code),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [coupons, currentPage]);

  useEffect(() => {
    const voucherCode = props.route?.params?.voucherCode;
    if (voucherCode) {
      getVoucherByCode({
        params: {
          code: voucherCode,
        },
      });
    }
  }, [props.route?.params?.voucherCode]);

  const hasMore = useMemo(() => {
    if (!paginationInfo) {
      return false;
    }
    return allCoupons.length < paginationInfo.totalCount;
  }, [paginationInfo, allCoupons.length]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchFirstPage();
    } finally {
      setRefreshing(false);
    }
  }, [fetchFirstPage]);

  const loadMore = useCallback(() => {
    if (loading) {
      return;
    }
    if (paginationInfo) {
      const totalPages = Math.ceil(
        paginationInfo.totalCount / paginationInfo.pageSize,
      );
      if (currentPage < totalPages) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        fetchCoupons({
          pageSize,
          currentPage: nextPage,
        });
      }
    }
  }, [loading, paginationInfo, currentPage, fetchCoupons]);

  // 领取优惠券
  const handleClaimCoupon = useCallback(
    async coupon => {
      if (!userToken) {
        navigate(modules.auth_signin.name);
        return;
      }

      if (isCouponCollected(coupon.code)) {
        setMessageToast({
          visible: true,
          type: 'success',
          message: 'The voucher has already been claimed!',
          onDismiss: () => setMessageToast(null),
        });
        return;
      }

      setClaimingCouponCode(coupon.code);
      try {
        const result = await collectCoupon(coupon.code);

        if (result?.data?.collectCoupon) {
          setLocalCollectedCoupons(prev => [...prev, coupon]);
          setAllCoupons(prev =>
            prev.map(c =>
              c.code === coupon.code ? {...c, is_claimed: true} : c,
            ),
          );
          // 触发首页 VoucherSlider 刷新
          const currentValue = rxRefreshVoucherSlider();
          const newValue = currentValue + 1;
          rxRefreshVoucherSlider(newValue);
        }

        setMessageToast({
          visible: true,
          type: 'success',
          message: 'The voucher has already been claimed!',
          onDismiss: () => setMessageToast(null),
        });
      } catch (error) {
        console.error('Failed to collect coupon:', error);
        setMessageToast({
          visible: true,
          type: 'error',
          message:
            error.message || 'Sorry, the operation failed, please try again!',
          onDismiss: () => setMessageToast(null),
        });
      } finally {
        setClaimingCouponCode(null);
      }
    },
    [userToken, isCouponCollected, collectCoupon],
  );

  const handleGoToMyCoupons = useCallback(() => {
    if (!userToken) {
      navigate(modules.auth_signin.name);
    } else {
      navigate(modules.account_mycoupon.name);
    }
  }, [userToken]);

  const controllerProps = {
    t,
    coupons: allCoupons,
    loading,
    refreshing,
    hasMore,
    collectLoading,
    isCouponCollected,
    onRefresh,
    loadMore,
    handleClaimCoupon,
    handleGoToMyCoupons,
    messageToast,
    claimingCouponCode,
    voucherData,
  };

  return <Views {...props} {...controllerProps} />;
};

export default CouponListController;
