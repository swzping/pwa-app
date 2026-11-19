import React, {useEffect, useState, useCallback, useRef} from 'react';
import {modules} from '@root/swift.config';
import {navigateTo, resolveLinkAndNavigate} from '@app/helpers/Navigation';
import {useFocusEffect} from '@react-navigation/native';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {GET_NOTIFICATION_CATEGORY, GET_NOTIFICATIONS, VIEW_NOTIFICATION} from '@app/services/queries/notification';

import Views from './_view';
import {useTranslation} from 'react-i18next';

const NotificationList = () => {
  if (!modules.account_notification.enable) {
    return null;
  }

  const [notifications, setNotifications] = useState([]);
  const [selectedTab, setSelectedTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [noMoreData, setNoMoreData] = useState(false);
  const canLoadMoreRef = useRef(false);
  const isInitialMountRef = useRef(true);
  const fetchNotificationsRef = useRef(null);
  const selectedTabRef = useRef('All');
  const activeRequestRef = useRef(0);
  // Tab数据缓存：存储每个tab的通知列表、分页信息等
  const tabCacheRef = useRef({});
  
  const {t, i18n} = useTranslation();
  const pageSize = 8;
  
  const {
    data: categoriesData,
    loading: categoriesLoading,
    onRefetchData: loadCategories,
  } = useCustomQuery({
    schema: GET_NOTIFICATION_CATEGORY,
    useInitData: true,
  });

  const {
    data: notificationsData,
    loading: notificationsLoading,
    onRefetchData: loadNotifications,
  } = useCustomQuery({
    schema: GET_NOTIFICATIONS,
    useInitData: false,
    opts: {fetchPolicy: 'network-only'},
  });

  const {
    onRefetchData: viewNotification,
  } = useCustomQuery({
    schema: VIEW_NOTIFICATION,
    useInitData: false,
  });

  const getCurrentLanguage = () => {
    return i18n.language || 'en';
  };

  const mapNotificationData = useCallback((apiNotification) => {
    const currentLang = getCurrentLanguage();
    const isZh = currentLang === 'zh' || currentLang === 'zh-CN' || currentLang === 'zh-TW';
    
    return {
      entityId: apiNotification.publish_id,
      subject: isZh ? (apiNotification.title_zh || apiNotification.title) : apiNotification.title,
      content: isZh ? (apiNotification.description_zh || apiNotification.description) : apiNotification.description,
      unread: apiNotification.is_read === false,
      createdAt: apiNotification.created_at,
      categoryCode: apiNotification.category_type,
      redirect_url: apiNotification.redirect_url,
      target_type: apiNotification.target_type,
      icon: apiNotification.icon,
      originalData: apiNotification,
    };
  }, []);

  const buildQueryVariables = useCallback((page, tab) => {
    const variables = {
      pageSize,
      currentPage: page,
      notificationType: tab === 'All' ? null : tab,
      notificationSortCode: 'created_at',
      notificationSortDirection: 'DESC',
    };
    return variables;
  }, [pageSize]);

  const extractParamFromUrl = useCallback((url, paramKeys = []) => {
    if (!url || typeof url !== 'string') {
      return null;
    }
    try {
      const queryString = url.split('?')[1];
      if (!queryString) {
        return null;
      }
      const pairs = queryString.split('&');
      const keys = paramKeys.length ? paramKeys : ['orderNumber', 'order_number'];
      for (let i = pairs.length - 1; i >= 0; i -= 1) {
        const pair = pairs[i];
        const [rawKey, rawValue = ''] = pair.split('=');
        if (!rawKey) {
          continue;
        }
        if (keys.includes(rawKey)) {
          const sanitizedValue = rawValue.replace(/\+/g, ' ');
          try {
            return decodeURIComponent(sanitizedValue);
          } catch (error) {
            if (sanitizedValue) {
              return sanitizedValue;
            }
          }
        }
      }
    } catch (error) {
    }
    return null;
  }, []);

  const extractOrderNumberFromUrl = useCallback(
    url => extractParamFromUrl(url, ['orderNumber', 'order_number']),
    [extractParamFromUrl],
  );

  const extractEmailFromUrl = useCallback(
    url => extractParamFromUrl(url, ['email']),
    [extractParamFromUrl],
  );

  const getOrderNumberFromUrlPath = url => {
    if (!url || typeof url !== 'string') {
      return null;
    }
    try {
      const match = url.match(/\/order\/([^/?#]+)/i);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch (error) {
    }
    return null;
  };

  const getHealthCheckIdFromUrl = url => {
    if (!url || typeof url !== 'string') {
      return null;
    }
    try {
      const queryMatch = url.match(/[?&]id=([^&#]+)/i);
      if (queryMatch && queryMatch[1]) {
        return decodeURIComponent(queryMatch[1]);
      }
      const pathMatch = url.match(/health-detail\/(\d+)(?:[/?#]|$)/i);
      if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
      }
    } catch (error) {
      console.log('[getHealthCheckIdFromUrl] error', {
        error,
        url,
      });
    }
    return null;
  };

  const tryNavigateToOrderDetail = useCallback(
    ({data, fallbackNotification}) => {
      const source = data || fallbackNotification?.originalData || fallbackNotification;
      if (!source) {
        return false;
      }
      const categoryType =
        source.category_type ||
        source.categoryType ||
        fallbackNotification?.categoryCode ||
        fallbackNotification?.originalData?.category_type ||
        fallbackNotification?.category_type;

      const redirectUrl =
        source.redirect_url ||
        fallbackNotification?.redirect_url ||
        fallbackNotification?.originalData?.redirect_url;
      const orderNumberFromField =
        source.order_number ||
        source.orderNumber ||
        fallbackNotification?.order_number ||
        fallbackNotification?.orderNumber ||
        fallbackNotification?.originalData?.order_number ||
        fallbackNotification?.originalData?.orderNumber;
      const orderNumberFromPath = getOrderNumberFromUrlPath(redirectUrl);
      const orderNumberFromQuery = extractOrderNumberFromUrl(redirectUrl);
      const orderNumber =
        orderNumberFromField || orderNumberFromPath || orderNumberFromQuery;

      const normalizedCategory = `${categoryType || ''}`.toLowerCase();
      const looksLikeOrderNotification =
        normalizedCategory.includes('order') || Boolean(orderNumber);

      if (!looksLikeOrderNotification || !orderNumber) {
        console.log('[tryNavigateToOrderDetail] 不是订单通知或缺少订单号', {
          normalizedCategory,
          redirectUrl,
        });
        return false;
      }

      const email =
        source.email ||
        fallbackNotification?.email ||
        fallbackNotification?.originalData?.email ||
        extractEmailFromUrl(redirectUrl) ||
        '';

      navigateTo(
        modules.account_purchases_detail.enable,
        modules.account_purchases_detail.name,
        {
          order_number: orderNumber,
          email,
        },
      );
      return true;
    },
    [extractOrderNumberFromUrl, extractEmailFromUrl],
  );

  const tryNavigateToHealthReportDetail = useCallback(({data, fallbackNotification}) => {
    const source = data || fallbackNotification?.originalData || fallbackNotification;
    if (!source) {
      return false;
    }

    const categoryType =
      source.category_type ||
      source.categoryType ||
      fallbackNotification?.categoryCode ||
      fallbackNotification?.originalData?.category_type ||
      fallbackNotification?.category_type;

    const normalizedCategory = `${categoryType || ''}`.toLowerCase();
    const redirectUrl =
      source.redirect_url ||
      fallbackNotification?.redirect_url ||
      fallbackNotification?.originalData?.redirect_url;

    const hasHealthKeyword =
      normalizedCategory.includes('healthcheck') ||
      normalizedCategory.includes('health_check') ||
      normalizedCategory.includes('health');

    const redirectLooksLikeHealth =
      typeof redirectUrl === 'string' && /health[-_/]?detail/i.test(redirectUrl);

    const reportData =
      source.report ||
      fallbackNotification?.report ||
      fallbackNotification?.originalData?.report ||
      null;

    const healthSpecificEntityId =
      source.healthcheck_id ||
      source.health_check_id ||
      fallbackNotification?.healthcheck_id ||
      fallbackNotification?.health_check_id ||
      fallbackNotification?.originalData?.healthcheck_id ||
      fallbackNotification?.originalData?.health_check_id ||
      getHealthCheckIdFromUrl(redirectUrl);

    const hasHealthSignals =
      hasHealthKeyword || redirectLooksLikeHealth || Boolean(reportData) || Boolean(healthSpecificEntityId);

    if (!hasHealthSignals) {
      return false;
    }

    const genericEntityId =
      source.entity_id ||
      fallbackNotification?.entityId ||
      fallbackNotification?.originalData?.entity_id ||
      fallbackNotification?.originalData?.entityId ||
      null;

    const entityId = healthSpecificEntityId || genericEntityId;

    if (!entityId) {
      return false;
    }


    navigateTo(
      modules.account_health_report_detail.enable,
      modules.account_health_report_detail.name,
      {
        entityId,
        report: reportData,
      },
    );
    return true;
  }, []);

  const tryNavigateToAnnouncementDetail = useCallback(({data, fallbackNotification, entityId}) => {
    const source = data || fallbackNotification?.originalData || fallbackNotification;
    if (!source) {
      return false;
    }

    const categoryType =
      source.category_type ||
      source.categoryType ||
      fallbackNotification?.categoryCode ||
      fallbackNotification?.originalData?.category_type ||
      fallbackNotification?.category_type;

    const normalizedCategory = `${categoryType || ''}`.toLowerCase();
    
    // 检查是否为 announcement 类型
    if (normalizedCategory !== 'announcement') {
      return false;
    }

    const redirectUrl =
      source.redirect_url ||
      fallbackNotification?.redirect_url ||
      fallbackNotification?.originalData?.redirect_url;

    // 检查 redirect_url 是否包含 notification
    const hasNotificationInUrl =
      typeof redirectUrl === 'string' && /notification/i.test(redirectUrl);

    if (!hasNotificationInUrl) {
      return false;
    }

    const notificationEntityId =
      entityId ||
      source.entity_id ||
      source.entityId ||
      fallbackNotification?.entityId ||
      fallbackNotification?.originalData?.entity_id ||
      fallbackNotification?.originalData?.entityId ||
      null;

    if (!notificationEntityId) {
      return false;
    }

    navigateTo(
      modules.account_notification_detail.enable,
      modules.account_notification_detail.name,
      {
        ...(data || fallbackNotification?.originalData || fallbackNotification),
        publish_id: notificationEntityId,
      },
    );
    return true;
  }, []);

  const fetchNotifications = useCallback(async (page, tab, isRefresh = false) => {
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const variables = buildQueryVariables(page, tab);
      const result = await loadNotifications({
        params: variables,
        paramsOpt: {isReturn: true},
      });
      if (result?.data?.getNotifications) {
        const response = result.data.getNotifications;
        const apiNotifications = response.notifications || [];
        const mappedNotifications = apiNotifications.map(mapNotificationData);
        
        const totalPagesCount = response.total_pages || 0;
        const currentPageNum = response.currentPage || page;
        // 更新缓存
        if (!tabCacheRef.current[tab]) {
          tabCacheRef.current[tab] = {
            notifications: [],
            currentPage: 1,
            totalPages: 0,
            noMoreData: false,
          };
        }
        
        if (isRefresh || page === 1) {
          tabCacheRef.current[tab].notifications = mappedNotifications;
          tabCacheRef.current[tab].currentPage = currentPageNum;
        } else {
          tabCacheRef.current[tab].notifications = [
            ...tabCacheRef.current[tab].notifications,
            ...mappedNotifications,
          ];
          tabCacheRef.current[tab].currentPage = currentPageNum;
        }
        
        tabCacheRef.current[tab].totalPages = totalPagesCount;
        const hasMoreData = currentPageNum < totalPagesCount && totalPagesCount > 0;
        tabCacheRef.current[tab].noMoreData = !hasMoreData;
        
        // 只有当前请求有效且是当前选中的tab时，才更新UI状态
        if (requestId === activeRequestRef.current && tab === selectedTabRef.current) {
          if (isRefresh || page === 1) {
            setNotifications(mappedNotifications);
          } else {
            setNotifications(prev => [...prev, ...mappedNotifications]);
          }
          
          setTotalPages(totalPagesCount);
          setCurrentPage(currentPageNum);
          
          if (hasMoreData) {
            setNoMoreData(false);
          } else {
            setNoMoreData(true);
          }
        } 
      } 
    } catch (error) {
      void error;
      // 如果是刷新或第一页加载失败，清空缓存
      if (isRefresh || page === 1) {
        if (tabCacheRef.current[tab]) {
          tabCacheRef.current[tab].notifications = [];
          tabCacheRef.current[tab].currentPage = 1;
          tabCacheRef.current[tab].noMoreData = true;
        }
      }
      if (requestId === activeRequestRef.current && tab === selectedTabRef.current) {
        setNoMoreData(true);
      }
    } finally {
      if (requestId === activeRequestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [buildQueryVariables, mapNotificationData, loadNotifications]);

  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    selectedTabRef.current = selectedTab;
  }, [selectedTab]);

  useEffect(() => {
    const loadInitialData = async () => {
      // 检查缓存中是否有初始tab的数据
      const cachedData = tabCacheRef.current[selectedTab];
      if (cachedData && cachedData.notifications.length > 0) {
        // 从缓存恢复数据
        setNotifications(cachedData.notifications);
        setCurrentPage(cachedData.currentPage);
        setTotalPages(cachedData.totalPages);
        setNoMoreData(cachedData.noMoreData);
        isInitialMountRef.current = false;
      } else {
        // 缓存中没有数据，获取新数据
        await fetchNotifications(1, selectedTab);
        isInitialMountRef.current = false;
      }
    };
    loadInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isInitialMountRef.current) {
        return;
      }
      if (fetchNotificationsRef.current) {
        // 先恢复缓存数据（如果有），提供即时反馈
        const cachedData = tabCacheRef.current[selectedTabRef.current];
        if (cachedData && cachedData.notifications.length > 0) {
          setNotifications(cachedData.notifications);
          setCurrentPage(cachedData.currentPage);
          setTotalPages(cachedData.totalPages);
          setNoMoreData(cachedData.noMoreData);
        }
        // 然后刷新数据
        setCurrentPage(1);
        setNoMoreData(false);
        fetchNotificationsRef.current(1, selectedTabRef.current, true);
      }
    }, []),
  );

  useEffect(() => {
    if (categoriesData?.data?.getNotificationCategory) {
      const apiCategories = categoriesData.data.getNotificationCategory;
      setCategories(apiCategories);
      if (apiCategories.length > 0) {
        const categoryCodes = apiCategories.map(cat => cat.code);
        if (!categoryCodes.includes(selectedTabRef.current)) {
          handleTabChange(apiCategories[0].code);
        }
      }
    }
  }, [categoriesData, handleTabChange]);

  const handleTabChange = useCallback((tab) => {
    selectedTabRef.current = tab;
    setSelectedTab(tab);
    
    // 检查缓存中是否有该tab的数据
    const cachedData = tabCacheRef.current[tab];
    if (cachedData && cachedData.notifications.length > 0) {
      // 从缓存恢复数据
      setNotifications(cachedData.notifications);
      setCurrentPage(cachedData.currentPage);
      setTotalPages(cachedData.totalPages);
      setNoMoreData(cachedData.noMoreData);
    } else {
      // 缓存中没有数据，清空列表并获取新数据
      setNotifications([]);
      setCurrentPage(1);
      setTotalPages(0);
      setNoMoreData(false);
      fetchNotifications(1, tab, false);
    }
  }, [fetchNotifications]);

  const handleRefresh = useCallback(async () => {
    setCurrentPage(1);
    setNoMoreData(false);
    await fetchNotifications(1, selectedTab, true);
  }, [selectedTab, fetchNotifications]);

  const handleLoadMore = useCallback(() => {
    if (loading || refreshing || noMoreData) {
      console.log('[handleLoadMore] 阻止加载:', {loading, refreshing, noMoreData});
      return;
    }
    
    // 检查是否还有更多数据
    if (totalPages > 0 && currentPage < totalPages) {
      const nextPage = currentPage + 1;
      fetchNotifications(nextPage, selectedTab, false);
    } else {
      if (totalPages > 0 && currentPage >= totalPages) {
        setNoMoreData(true);
      }
    }
  }, [currentPage, totalPages, selectedTab, loading, refreshing, noMoreData, fetchNotifications]);


  const readNotification = useCallback(async (entityId) => {
    const notification = notifications.find(
      notif => notif.entityId === entityId,
    );
    
    if (notification) {
      const navigateByKnownCategory = sourceData => {
        const source = sourceData || notification.originalData || notification;
        const categoryType = source?.category_type || '';
        if (
          categoryType === 'profile_completion'
        ) {
          navigateTo(
            modules.account_update_information.enable,
            modules.account_update_information.name,
          );
          return true;
        }

        if (
          categoryType === 'milestone_completion'
        ) {
          navigateTo(
            modules.account_milestone.enable,
            modules.account_milestone.name,
          );
          return true;
        }

        if (
          categoryType === 'abandoned_cart'
        ) {
          navigateTo(modules.cart.enable, modules.cart.name);
          return true;
        }

        if (
          categoryType === 'offline_order'
        ) {
          navigateTo(
            modules.account_purchases.enable,
            modules.account_purchases.name,
            {initialSection: 'offline'},
          );
          return true;
        }

        // 线下券通知:数据里带 voucher_type: 'offline_voucher' + voucher_uid 时
        // 直接进 Offline 券详情页;后端未下发这两个字段时不触发,走 redirect_url 兜底
        if (
          source?.voucher_type === 'offline_voucher' &&
          source?.voucher_uid
        ) {
          navigateTo(
            modules.account_mycoupon_detail.enable,
            modules.account_mycoupon_detail.name,
            {uid: source.voucher_uid},
          );
          return true;
        }

        return false;
      };

      try {
        const params = {
          publishId: entityId,
        };
        
        const result = await viewNotification({
          params,
          paramsOpt: {isReturn: true},
        });
        
        const notificationData = result?.data?.viewNotification;
        if (notificationData) {
          if (navigateByKnownCategory(notificationData)) {
            return;
          }
          const handledHealth = tryNavigateToHealthReportDetail({
            data: notificationData,
            fallbackNotification: notification,
          });
          if (handledHealth) {
            return;
          }
          const alreadyHandled = tryNavigateToOrderDetail({
            data: notificationData,
            fallbackNotification: notification,
          });
  
          if (alreadyHandled) {
            return;
          }
          const handledAnnouncement = tryNavigateToAnnouncementDetail({
            data: notificationData,
            fallbackNotification: notification,
            entityId,
          });
          if (handledAnnouncement) {
            return;
          }
          const redirectUrl = notificationData.redirect_url || notification.redirect_url;
          const targetType = notificationData.target_type || notification.target_type || notification.originalData?.target_type;
          
          // 如果 target_type 为 'notification_detail'，直接跳转到通知详情页
          if (targetType === 'notification_detail') {
            navigateTo(
              modules.account_notification_detail.enable,
              modules.account_notification_detail.name,
              {
                ...notificationData,
                publish_id: entityId,
              },
            );
            return;
          }
          
          // 如果 target_type 为 'url'，使用 WebView 打开
          if (targetType === 'url' && redirectUrl && redirectUrl.trim() !== '') {
            navigateTo(
              modules.hignlight_Web_View.enable,
              modules.hignlight_Web_View.name,
              {url: redirectUrl},
            );
            return;
          }
          
          if (redirectUrl && redirectUrl.trim() !== '') {
            await resolveLinkAndNavigate(redirectUrl, t);
          } else {
            navigateTo(
              modules.account_notification_detail.enable,
              modules.account_notification_detail.name,
              {
                ...notificationData,
                publish_id: entityId,
              },
            );
          }
        } else {
          if (navigateByKnownCategory()) {
            return;
          }
          const handledHealth = tryNavigateToHealthReportDetail({
            fallbackNotification: notification,
          });
          if (handledHealth) {
            return;
          }
          const alreadyHandled = tryNavigateToOrderDetail({
            fallbackNotification: notification,
          });
          if (alreadyHandled) {
            return;
          }
          const handledAnnouncement = tryNavigateToAnnouncementDetail({
            fallbackNotification: notification,
            entityId,
          });
          if (handledAnnouncement) {
            return;
          }
          const redirectUrl = notification.redirect_url;
          const targetType = notification.target_type || notification.originalData?.target_type;
          // 如果 target_type 为 'notification_detail'，直接跳转到通知详情页
          if (targetType === 'notification_detail') {
            navigateTo(
              modules.account_notification_detail.enable,
              modules.account_notification_detail.name,
              notification.originalData || notification,
            );
            return;
          }
          
          // 如果 target_type 为 'url'，使用 WebView 打开
          if (targetType === 'url' && redirectUrl && redirectUrl.trim() !== '') {
            navigateTo(
              modules.hignlight_Web_View.enable,
              modules.hignlight_Web_View.name,
              {url: redirectUrl},
            );
            return;
          }
          
          if (redirectUrl && redirectUrl.trim() !== '') {
            await resolveLinkAndNavigate(redirectUrl, t);
          } else {
            navigateTo(
              modules.account_notification_detail.enable,
              modules.account_notification_detail.name,
              notification.originalData || notification,
            );
          }
        }
      } catch (error) {
        void error;
        const redirectUrl = notification.redirect_url;
        const targetType = notification.target_type || notification.originalData?.target_type;

        if (navigateByKnownCategory()) {
          return;
        }
        const handledHealth = tryNavigateToHealthReportDetail({
          fallbackNotification: notification,
        });
        if (handledHealth) {
          return;
        }
        const alreadyHandled = tryNavigateToOrderDetail({
          fallbackNotification: notification,
        });
        if (alreadyHandled) {
          return;
        }
        const handledAnnouncement = tryNavigateToAnnouncementDetail({
          fallbackNotification: notification,
          entityId,
        });
        if (handledAnnouncement) {
          return;
        }
        
        // 如果 target_type 为 'notification_detail'，直接跳转到通知详情页
        if (targetType === 'notification_detail') {
          navigateTo(
            modules.account_notification_detail.enable,
            modules.account_notification_detail.name,
            notification.originalData || notification,
          );
          return;
        }
        
        // 如果 target_type 为 'url'，使用 WebView 打开
        if (targetType === 'url' && redirectUrl && redirectUrl.trim() !== '') {
          navigateTo(
            modules.hignlight_Web_View.enable,
            modules.hignlight_Web_View.name,
            {url: redirectUrl},
          );
          return;
        }
        
        if (redirectUrl && redirectUrl.trim() !== '') {
          await resolveLinkAndNavigate(redirectUrl, t);
        } else {
          navigateTo(
            modules.account_notification_detail.enable,
            modules.account_notification_detail.name,
            notification.originalData || notification,
          );
        }
      }
    }
  }, [notifications, viewNotification, t, tryNavigateToOrderDetail, tryNavigateToHealthReportDetail, tryNavigateToAnnouncementDetail]);

  return (
    <Views
      t={t}
      notifications={notifications}
      readNotification={readNotification}
      loading={loading}
      refreshing={refreshing}
      onRefresh={handleRefresh}
      selectedTab={selectedTab}
      onTabChange={handleTabChange}
      categories={categories}
      onLoadMore={handleLoadMore}
      noMoreData={noMoreData}
    />
  );
};

export default NotificationList;

