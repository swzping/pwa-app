import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Config from 'react-native-config';

import {useNavigation, useRoute} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account_purchases/_view';
import {
  GET_CUSTOMER_ORDERS,
  GET_OFFLINE_ORDER_LIST,
} from '@app/_modules/account_purchases/services/schema';
import {sortByOffline} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import client from '@app/services/api';
import {rxAppSnackbar} from '@app/services/cache';

const routes = [
  {key: 'online', title: 'Online'},
  {key: 'offline', title: 'Offline'},
];

const SECTION_INDEX = {
  online: 0,
  offline: 1,
};

const INITIAL_PAGE = {
  online: 1,
  offline: 0,
};

const PAGE_SIZE = 10;

const Purchases = () => {
  const {t} = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();

  if (!modules.account_purchases.enable) {
    return null;
  }

  /**
   * -------------------------------------------------------
   * Tab
   * -------------------------------------------------------
   */

  const initialSection = route?.params?.initialSection ?? 'online';

  const [activeSection, setActiveSection] = useState(
    SECTION_INDEX[initialSection] ?? SECTION_INDEX.online,
  );

  const activeSectionKey = routes[activeSection]?.key ?? 'online';

  /**
   * -------------------------------------------------------
   * Orders
   * -------------------------------------------------------
   */

  const [customerOrders, setCustomerOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(
    INITIAL_PAGE[initialSection] ?? INITIAL_PAGE.online,
  );
  const [totalCount, setTotalCount] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * -------------------------------------------------------
   * Offline Sort
   * -------------------------------------------------------
   */

  const [visibleSort, setVisibleSort] = useState(false);
  const [selectedSort, setSelectedSort] = useState(0);

  const currentSelectedSort = useMemo(
    () => sortByOffline?.items?.[selectedSort],
    [selectedSort],
  );

  /**
   * -------------------------------------------------------
   * Query
   * -------------------------------------------------------
   */

  const activeQuery =
    activeSectionKey === 'offline'
      ? GET_OFFLINE_ORDER_LIST
      : GET_CUSTOMER_ORDERS;

  /**
   * -------------------------------------------------------
   * Build API Params
   * -------------------------------------------------------
   */

  const buildQueryParams = useCallback(
    (page = currentPage) => {
      if (activeSectionKey === 'offline') {
        return {
          input: {
            pageSize: PAGE_SIZE,
            page,
            orderType: currentSelectedSort?.value?.position ?? 'NORMAL',
          },
        };
      }

      return {
        pageSize: PAGE_SIZE,
        currentPage: page,
      };
    },
    [activeSectionKey, currentPage, currentSelectedSort],
  );

  /**
   * -------------------------------------------------------
   * API
   * -------------------------------------------------------
   */

  const {
    data: customerOrdersData,
    loading,
    onRefetchData,
  } = useCustomQuery({
    schema: activeQuery,
    useInitData: true,
    variables: buildQueryParams(),
    opts: {
      fetchPolicy: 'network-only',
      context: {
        method: 'GET',
      },
    },
  });

  /**
   * -------------------------------------------------------
   * Merge Orders
   * -------------------------------------------------------
   */

  const mergeOrdersByKey = useCallback((prev, next, key) => {
    const map = new Map();

    prev.forEach(item => {
      map.set(item[key], item);
    });

    next.forEach(item => {
      if (!map.has(item[key])) {
        map.set(item[key], item);
      }
    });

    return Array.from(map.values());
  }, []);

  /**
   * -------------------------------------------------------
   * Reset & Fetch
   * -------------------------------------------------------
   */

  const resetAndFetch = useCallback(
    async page => {
      const nextPage = page ?? INITIAL_PAGE[activeSectionKey];

      const params =
        activeSectionKey === 'offline'
          ? {
              input: {
                pageSize: PAGE_SIZE,
                page: nextPage,
                orderType: currentSelectedSort?.value?.position ?? 'NORMAL',
              },
            }
          : {
              pageSize: PAGE_SIZE,
              currentPage: nextPage,
            };

      setCustomerOrders([]);
      setCurrentPage(nextPage);
      setTotalCount(0);
      setNoMoreData(false);

      await onRefetchData({
        params,
      });
    },
    [activeSectionKey, currentSelectedSort, onRefetchData],
  );

  /**
   * -------------------------------------------------------
   * Tab Change
   * -------------------------------------------------------
   */

  const onChangeSection = useCallback(
    index => {
      if (index === activeSection) {
        return;
      }

      setActiveSection(index);
    },
    [activeSection],
  );

  /**
   * Tab / Sort changed
   */
  useEffect(() => {
    const page = INITIAL_PAGE[activeSectionKey];

    resetAndFetch(page);
  }, [activeSectionKey, currentSelectedSort]);

  /**
   * -------------------------------------------------------
   * API Response
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!customerOrdersData?.data) {
      return;
    }

    let items = [];
    let total = 0;
    let mergeKey = 'order_number';

    if (activeSectionKey === 'offline') {
      const orders = customerOrdersData?.data?.getOfflineOrderList?.data ?? {};

      items = orders.items ?? [];
      total = orders.totalCount ?? 0;
      mergeKey = 'receiptNo';
    } else {
      const orders = customerOrdersData?.data?.customer?.orders ?? {};

      items = orders.items ?? [];
      total = orders.total_count ?? 0;
      mergeKey = 'order_number';
    }

    const firstPage = INITIAL_PAGE[activeSectionKey];

    const nextOrders =
      currentPage === firstPage
        ? items
        : mergeOrdersByKey(customerOrders, items, mergeKey);

    setCustomerOrders(nextOrders);
    setTotalCount(total);
    setNoMoreData(nextOrders.length >= total);
  }, [customerOrdersData, activeSectionKey, currentPage, mergeOrdersByKey]);

  /**
   * -------------------------------------------------------
   * Load More
   * -------------------------------------------------------
   */

  const onLoadMore = useCallback(async () => {
    if (
      loading ||
      noMoreData ||
      customerOrders.length >= totalCount ||
      currentPage >= 2
    ) {
      return;
    }

    const nextPage = currentPage + 1;

    setCurrentPage(nextPage);

    await onRefetchData({
      params: buildQueryParams(nextPage),
    });
  }, [
    loading,
    noMoreData,
    customerOrders.length,
    totalCount,
    currentPage,
    buildQueryParams,
    onRefetchData,
  ]);

  /**
   * -------------------------------------------------------
   * Refresh
   * -------------------------------------------------------
   */

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await resetAndFetch(INITIAL_PAGE[activeSectionKey]);
    } finally {
      setRefreshing(false);
    }
  }, [activeSectionKey, resetAndFetch]);

  /**
   * -------------------------------------------------------
   * Silent Refresh on Focus
   * -------------------------------------------------------
   */

  const hasFocusedRef = useRef(false);

  /**
   * @function onSilentRefresh
   * @summary 聚焦时无感刷新当前激活 tab 的第一页（支付倒计时可能已结束，
   *          订单状态需更新）。不走 useCustomQuery.onRefetchData（会把
   *          loading 置 true 导致视图闪烁），直接 client.query：
   *          不触发 loading、不清空列表、失败静默不打扰用户。
   *          合并方向为"新数据优先"：第一页最新状态覆盖同 key 旧条目，
   *          同时保留已加载的后续分页数据。
   */
  const onSilentRefresh = useCallback(async () => {
    if (loading) {
      return;
    }

    try {
      const res = await client.query({
        query: activeQuery,
        variables: buildQueryParams(INITIAL_PAGE[activeSectionKey]),
        fetchPolicy: 'network-only',
        context: {method: 'GET'},
      });

      let items = [];
      let total = 0;
      let mergeKey = 'order_number';

      if (activeSectionKey === 'offline') {
        const orders = res?.data?.getOfflineOrderList?.data ?? {};

        items = orders.items ?? [];
        total = orders.totalCount ?? 0;
        mergeKey = 'receiptNo';
      } else {
        const orders = res?.data?.customer?.orders ?? {};

        items = orders.items ?? [];
        total = orders.total_count ?? 0;
        mergeKey = 'order_number';
      }

      // mergeOrdersByKey(prev, next) 中 prev 优先，
      // 因此传 (items, customerOrders) 让最新一页覆盖旧条目
      const nextOrders = mergeOrdersByKey(items, customerOrders, mergeKey);

      setCustomerOrders(nextOrders);
      setTotalCount(total);
      setNoMoreData(nextOrders.length >= total);
    } catch (err) {
      // 静默刷新失败不打扰用户
      console.log('[account_purchases] silent refresh failed', err);
    }
  }, [
    loading,
    activeQuery,
    activeSectionKey,
    buildQueryParams,
    mergeOrdersByKey,
    customerOrders,
  ]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // 首次聚焦由 useCustomQuery(useInitData) 负责初始加载，跳过避免重复请求
      if (!hasFocusedRef.current) {
        hasFocusedRef.current = true;
        return;
      }
      onSilentRefresh();
    });
    return unsubscribe;
  }, [navigation, onSilentRefresh]);

  /**
   * -------------------------------------------------------
   * Navigation
   * -------------------------------------------------------
   */

  const onNavigateToPdp = useCallback(orderNumber => {
    navigateTo(
      modules.account_purchases_detail.enable,
      modules.account_purchases_detail.name,
      {
        order_number: orderNumber,
      },
    );
  }, []);

  const onNavigateToPreviewPdf = useCallback(item => {
    const {pdfUrl = ''} = item || {};

    if (!pdfUrl) {
      rxAppSnackbar({
        message: 'Your receipt is on the way. Please wait and click again',
      });
      return;
    }

    navigateTo(
      modules.full_screen_web_view.enable,
      modules.full_screen_web_view.name,
      {
        title: 'Receipt',
        url: `${
          Config.PWA_BASE_URL
        }/preview-invoice-pdf?source=APP&invoiceUrl=${encodeURIComponent(
          pdfUrl,
        )}`,
      },
    );
  }, []);

  /**
   * -------------------------------------------------------
   * Sort
   * -------------------------------------------------------
   */

  const onPressVisibleSort = useCallback(value => {
    setVisibleSort(value);
  }, []);

  const onSelectSort = useCallback(value => {
    setVisibleSort(false);
    setSelectedSort(value);
  }, []);

  /**
   * -------------------------------------------------------
   * Controller Props
   * -------------------------------------------------------
   */

  const controllerProps = {
    t,
    routes,

    activeSection,
    setActiveSection: onChangeSection,

    customerOrders,
    loading,
    noMoreData,
    refreshing,

    onRefresh,
    onLoadMore,

    onNavigateToPdp,
    onNavigateToPreviewPdf,

    currentSelectedSort,
    visibleSort,
    selectedSort,
    onPressVisibleSort,
    onSelectSort,
  };

  return <Views {...controllerProps} />;
};

export default Purchases;
