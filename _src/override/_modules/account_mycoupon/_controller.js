import React, {useCallback, useEffect, useMemo,useRef, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import ViewLogin from '@app/_modules/auth_signin/_controller';
import {sortByVoucherStatus, USER_GUEST} from '@app/helpers/Constants';
import useCouponWallet from '@app/hooks/useCouponWallet';
import {rxUserToken, rxUserType} from '@app/services/cache';
import {GET_OFFLINE_VOUCHERS} from '@app/services/queries/couponWallet';

import {consumeOfflineListRefresh} from './_offlineListRefresh';
import Views from './_view';

const PAGE_SIZE = 5;

const MyCoupon = () => {
  if (!modules.account_mycoupon.enable) {
    return null;
  }

  const {t} = useTranslation();
  const userType = useReactiveVar(rxUserType);
  const userToken = useReactiveVar(rxUserToken);
  const [activeTab, setActiveTab] = useState('Online');
  const [visibleSort, setVisibleSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);

  // Online tab 用 customerCoupons,Offline tab 用 offlineVouchers
  const onlineWallet = useCouponWallet();
  const offlineWallet = useCouponWallet(GET_OFFLINE_VOUCHERS);
  const {loading, fetchCouponWallet, paginationInfo} =
    activeTab === 'Offline' ? offlineWallet : onlineWallet;
  const [refreshing, setRefreshing] = useState(false);

  // Local state for pagination
  const [allCoupons, setAllCoupons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // 用于丢弃切 tab 后才返回的过期响应
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  const currentSelectedSort = useMemo(() => {
    return sortByVoucherStatus?.items?.[selectedSort];
  }, [sortByVoucherStatus, selectedSort]);

  // 不再依赖 hook 的 data 引用变化来回填:
  // Apollo 会对内容相同的新响应去重(data 引用不变),下拉刷新/切 tab 时
  // 发出的请求与上次完全相同,靠 useEffect 监听 couponWallet 会永远等不到更新
  const loadPage = useCallback(
    async (page, replace, status) => {
      const tab = activeTabRef.current;
      const res = await fetchCouponWallet({
        pageSize: PAGE_SIZE,
        currentPage: page,
        status: status,
      });
      // 请求期间切走了 tab,丢弃过期响应
      if (tab !== activeTabRef.current) {
        return;
      }
      const payload = res?.data?.customerCoupons || res?.data?.offlineVouchers;
      if (!payload) {
        return;
      }
      setCurrentPage(page);
      if (replace) {
        setAllCoupons(payload.items || []);
      } else {
        setAllCoupons(prev => {
          // Filter duplicates based on code
          const existingCodes = new Set(prev.map(item => item.code));
          const newItems = (payload.items || []).filter(
            item => !existingCodes.has(item.code),
          );
          return [...prev, ...newItems];
        });
      }
    },
    [fetchCouponWallet],
  );

  useEffect(() => {
    if (userToken) {
      // Reset state when tab / sort filter changes
      setAllCoupons([]);
      setNoMoreData(false);
      setCurrentPage(1);
      loadPage(1, true, currentSelectedSort?.value?.position);
    }
  }, [userToken, activeTab, loadPage, currentSelectedSort]);

  // 从线下券详情页返回时按需刷新:离开详情页时已打标记,核销状态可能已变化。
  // 首次挂载的 focus 跳过,初次加载仍由上方 effect 负责
  const isFirstFocusRef = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocusRef.current) {
        isFirstFocusRef.current = false;
        return;
      }
      if (consumeOfflineListRefresh() && userToken) {
        loadPage(1, true, currentSelectedSort?.value?.position);
      }
    }, [loadPage, currentSelectedSort, userToken]),
  );

  const onPressVisibleSort = e => {
    setVisibleSort(e);
  };

  const onSelectSort = value => {
    setVisibleSort(false);
    setSelectedSort(value);
    // 重载由下方 effect 监听 currentSelectedSort 变化统一触发,这里不再手动刷新
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPage(1, true, currentSelectedSort?.value?.position);
    } catch (error) {
      console.log('Failed to refresh voucher list');
    } finally {
      setRefreshing(false);
    }
  };

  const onLoadMore = () => {
    if (loading || refreshing) {
      return;
    }

    if (paginationInfo) {
      const totalPages = Math.ceil(
        paginationInfo.totalCount / paginationInfo.pageSize,
      );
      if (currentPage < totalPages) {
        loadPage(currentPage + 1, false, currentSelectedSort?.value?.position);
      } else {
        setNoMoreData(true);
      }
    }
  };

  const handleTabChange = tab => {
    if (tab !== activeTab) {
      setSelectedSort(0);
      setActiveTab(tab);
    }
  };

  if (userType === USER_GUEST || !userToken) {
    return <ViewLogin />;
  }

  return (
    <Views
      t={t}
      couponWallet={allCoupons} // Pass the accumulated list
      currentSelectedSort={currentSelectedSort}
      visibleSort={visibleSort}
      selectedSort={selectedSort}
      onPressVisibleSort={onPressVisibleSort}
      onSelectSort={onSelectSort}
      noMoreData={noMoreData}
      loading={loading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      onLoadMore={onLoadMore} // Pass load more handler
      activeTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
};

export default MyCoupon;
