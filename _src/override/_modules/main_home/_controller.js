import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useIsFocused} from '@react-navigation/native';

import {useApolloClient, useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {clearExpiredOfflineQueueCookies} from '@app/_modules/account_eventbooking/services/util';
import Views from '@app/_modules/main_home/_view';
import {GET_SEARCH_PLACEHOLDER} from '@app/_modules/main_home/services/schema';
import {GET_FLASH_SALE_PRODUCTS} from '@app/_modules/product_list/services/schema';
import {prefetchOsmosHomeSliderAds} from '@app/components/Cms/ContentTypes/Slider/useOsmosSliderAds';
import {BYPASS_ERROR_MAIN_HOME_CART_ITEM} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import {Storage} from '@app/helpers/Storage';
import useCarts, {
  TYPES,
  warmProductCartItemMap,
} from '@app/hooks/carts/useCarts';
import useCms from '@app/hooks/useCms';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {onPostFcmSubscribers} from '@app/hooks/usePushNotification';
import {
  rxCartId,
  rxCartQty,
  rxRefreshVoucherSlider,
  rxUserToken,
} from '@app/services/cache';

const scanGuiderCacheKey = 'SCANNER_GUIDER_READ';

const MainHomeController = props => {
  if (!modules.main_home.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * @return {object}
   * ---------------------------------------------------- *
   */

  const identifier = 'home';
  const client = useApolloClient();
  const [refreshing, setRefreshing] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [searchPlaceholder, setSearchPlaceholder] = useState(null);
  const {t} = useTranslation();
  const getRxUserToken = useReactiveVar(rxUserToken);
  const getRxCartId = useReactiveVar(rxCartId);
  const getRxCartQty = useReactiveVar(rxCartQty);
  const mount = useRef();
  const isFocused = useIsFocused();
  const [showScanGuider, setShowScanGuider] = useState(false);
  const {content, loading, error, fetchCmsData} = useCms(true);
  const voucherSliderRef = useRef(null);
  const homeTraceRef = useRef(null);

  const {data: placeholderData} = useCustomQuery({
    schema: GET_SEARCH_PLACEHOLDER,
    useInitData: true,
    opts: {fetchPolicy: 'no-cache'},
  });

  const {setCart: refetchCartItems} = useCarts({
    initialized: true,
    type: TYPES.INFO,
    configErr: {
      logSource: BYPASS_ERROR_MAIN_HOME_CART_ITEM,
      isBypass: true,
    },
  });

  useEffect(() => {
    if (identifier) {
      fetchCmsData(identifier);
      startHomeInitTrace();
    }
  }, [identifier, fetchCmsData]);

  useEffect(() => {
    prefetchOsmosHomeSliderAds();
  }, [getRxUserToken]);

  useEffect(() => {
    if (isFocused) {
      // 回到首页时，过期后清除 offline Waiting Room 队列 Cookie
      clearExpiredOfflineQueueCookies();
      // 回到首页时刷新购物车数量映射表，使闪购/商品卡片上的步进器
      // 无痕同步 web 端（或其它端）加购后的最新数量。
      warmProductCartItemMap();
    }
  }, [isFocused]);

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for react lifecycle and cleanup
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;
    return () => {
      mount.current = false;
      // 离开首页时确保关闭 loading 和清理状态
      setShowScanGuider(false);
    };
  }, []);

  useEffect(() => {
    const checkReadStatus = async () => {
      const cacheRes = await Storage.get(scanGuiderCacheKey);
      if (cacheRes !== '1') {
        setShowScanGuider(true);
      }
    };

    // 只在首页 focused 时才检查和显示
    if (isFocused) {
      checkReadStatus();
    } else {
      // 离开首页时立即隐藏
      setShowScanGuider(false);
    }
    // Storage.set(scanGuiderCacheKey, '0');
  }, [isFocused]);

  const onScanGuideClose = () => {
    Storage.set(scanGuiderCacheKey, '1');
    setShowScanGuider(false);
  };

  /**
   * ---------------------------------------------------- *
   * @dependency [getRxUserToken]
   * @summary for checking user logged in or not
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const getToken = async () => {
      if (mount.current) {
        setIsLogged(getRxUserToken !== null);

        if (getRxUserToken !== null) {
          const guardianRunRedirect = await Storage.get(
            Storage.name.GUARDIAN_RUN_REDIRECT,
          );
          if (guardianRunRedirect === 'true') {
            await Storage.set(Storage.name.GUARDIAN_RUN_REDIRECT, 'false');

            setTimeout(() => {
              navigateTo(
                modules.guardian_run.enable,
                modules.guardian_run.name,
              );
            }, 500);
          }
        }
      }
    };

    getToken();

    // register fcm to magento
    if (mount.current && !!getRxUserToken && isFocused) {
      onPostFcmSubscribers({isReturn: false});
    }
  }, [getRxUserToken, isFocused]);

  useEffect(() => {
    if (getRxUserToken && getRxCartId) {
      refetchCartItems();
    }
  }, [getRxUserToken, getRxCartId]);

  useEffect(() => {
    if (mount.current && placeholderData?.data) {
      setSearchPlaceholder(
        placeholderData?.data?.getProductSearchPlaceholder?.text,
      );
    }
  }, [placeholderData]);

  // 监听优惠券领取事件的逻辑已移动到 VoucherSlider 组件内部，
  // 这里不再通过 ref 主动调用刷新，避免 ref 未准备好导致的问题。

  /**
   * ---------------------------------------------------- *
   * @function {onNavigateWishlist}
   * @summary for navigate to Wishlist page
   * ---------------------------------------------------- *
   */
  const onNavigateWishlist = () => {
    if (isLogged) {
      navigateTo(
        modules.account_wishlist.enable,
        modules.account_wishlist.name,
      );
    } else {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function {onRefreshCmsPage}
   * @summary for refresh home cms page
   * ---------------------------------------------------- *
   */
  const onRefreshCmsPage = useCallback(async () => {
    try {
      setRefreshing(true);
      // 刷新CMS数据
      await fetchCmsData(identifier);
      // 通过全局变量触发 VoucherSlider 刷新
      const currentValue = rxRefreshVoucherSlider();
      rxRefreshVoucherSlider(currentValue + 1);
      // Flash Sale 商品由独立查询加载，刷新 CMS 不会更新商品列表。
      await client.refetchQueries({include: [GET_FLASH_SALE_PRODUCTS]});
    } finally {
      setRefreshing(false);
    }
  }, [client, fetchCmsData, identifier]);

  useEffect(() => {
    if (content) {
      stopHomeInitTrace();
    }
    return () => {
      if (homeTraceRef.current) {
        homeTraceRef.current.stop();
        homeTraceRef.current = null;
      }
    };
  }, [content]);

  // 开始 homeInit trace
  const startHomeInitTrace = async () => {
    homeTraceRef.current = await startPerfTrace('homePageInit');
    homeTraceRef.current.startTime = Date.now();
  };
  // 结束 homeInit trace
  const stopHomeInitTrace = async () => {
    if (homeTraceRef.current) {
      const duration = Date.now() - homeTraceRef.current.startTime;
      homeTraceRef.current.putMetric('duration_ms', duration);
      homeTraceRef.current.putAttribute('status', 'success');
      homeTraceRef.current.stop();
      homeTraceRef.current = null;
    }
  };
  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    t,
    loading,
    refreshing,
    cmsPage: content,
    cmsPageError: error,
    cartCount: getRxCartQty,
    searchPlaceholder,
    onNavigateWishlist,
    onRefreshCmsPage,
    showScanGuider,
    onScanGuideClose,
    voucherSliderRef,
  };

  return <Views {...props} {...controllerProps} />;
};

export default MainHomeController;
