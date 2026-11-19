import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {Linking} from 'react-native';

import {useFocusEffect, useIsFocused} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules, tabsApp} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {useForm} from 'react-hook-form';

import {GET_COUNTRY_LIST} from '@app/_modules/account/services/schema';
import {getOfflineEventQueue} from '@app/_modules/account_eventbooking/services/fetchAPI';
import {
  GET_SNAP_STATUS,
  GET_SNAP_TOKEN,
  PLACE_ORDER,
  RESET_AUTO_APPLY_VOUCHER,
  SET_BILLING_ADDRESS,
} from '@app/_modules/cart/services/schema';
import Views from '@app/_modules/cart_checkout/_view';
import {
  GET_APOTEK_LOCATION,
  UPDATE_POINTS_IN_CART,
} from '@app/_modules/cart_checkout/services/schema';
import {useFormConfig} from '@app/components/_Forms/index';
import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {
  CONTAIN_SNAP,
  HOME_DELIVERY,
  IS_FREE,
  PREFIX_AIRPAY,
  PREFIX_GOJEK,
  PREFIX_GOJEK_LINK,
  PREFIX_GOPAY,
  PREFIX_SHOPEE,
  PREFIX_SHOPEEID,
  PREFIX_SHOPEEPAY,
  USER_GUEST,
} from '@app/helpers/Constants';
import DateHelper from '@app/helpers/Date';
import {
  getFlashSalePageKey,
  isFlashSaleModalShownFor,
  markFlashSaleModalShown,
  markFlashSaleSilentRefreshed,
  notifyFlashSaleEndedRefreshed,
  shouldSilentRefreshFlashSale,
} from '@app/helpers/FlashSale';
import {getErrorGQL} from '@app/helpers/General';
import {navigateTo} from '@app/helpers/Navigation';
import {navReset} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import useCarts, {onResetNewCart, TYPES} from '@app/hooks/carts/useCarts';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {
  rxAppLoading,
  rxAppSnackbar,
  rxCartAppliedCoupon,
  rxCartAppliedRewardPoint,
  rxCartAppliedStoreCredit,
  rxCartAvailablePaymentMethod,
  rxCartExtraFee,
  rxCartFromCart,
  rxCartFromCheckout,
  rxCartGiftCard,
  rxCartId,
  rxCartOrderId,
  rxCartSelectedPaymentMethod,
  rxCartShipping,
  rxCartShippingAmount,
  rxCartShippingMethod,
  rxCartSnapUrl,
  rxSelectedPoint,
  rxUserAddresses,
  rxUserType,
} from '@app/services/cache';
import {GET_BALANCE_POINT} from '@app/services/queries/points';
import {trackSubmitOrder} from '@app/track';

export const CheckoutContext = createContext();

const CartCheckout = () => {
  if (!modules.cart_checkout.enable) {
    return null;
  }
  const useFormExternal = useForm(useFormConfig);
  const {data: countryData} = useCustomQuery({
    schema: GET_COUNTRY_LIST,
    useInitData: true,
  });
  const {data: apotekData} = useCustomQuery({
    schema: GET_APOTEK_LOCATION,
    useInitData: true,
    opts: {fetchPolicy: 'no-cache'},
  });
  const {setCart: onRefetchSelectedPaymentMethod} = useCarts({
    initialized: false,
    type: TYPES.SELECTED_PAYMENT,
  });
  const {onRefetchData: onPlaceOrderHook, loading: isLoadingPlaceOrder} =
    useCustomMutation({
      schema: PLACE_ORDER,
    });
  const {onRefetchData: setBillingAddressHook} = useCustomMutation({
    schema: SET_BILLING_ADDRESS,
  });
  const {onRefetchData: updatePointsInCart} = useCustomMutation({
    schema: UPDATE_POINTS_IN_CART,
  });
  // 前置调用：在获取购物车数据前先调用 resetAutoApplyVoucher（与购物车页一致）
  const {onRefetchData: onResetAutoApplyVoucher} = useCustomMutation({
    schema: RESET_AUTO_APPLY_VOUCHER,
  });
  const {onRefetchData: onRefetchSnapToken} = useCustomQuery({
    schema: GET_SNAP_TOKEN,
    initialized: false,
  });
  const {onRefetchData: onRefetchSnapStatus} = useCustomQuery({
    schema: GET_SNAP_STATUS,
    useInitData: false,
  });
  const {data: pointData} = useCustomQuery({
    schema: GET_BALANCE_POINT,
    useInitData: true,
    opts: {fetchPolicy: 'network-only'},
    variables: {includeBalance: true, includeExpiring: false},
  });
  const {
    data: items,
    isEmptyCart,
    loading: loadingItems,
    setCart: onRefreshCartItems,
  } = useCarts({
    initialized: false,
    type: TYPES.ITEM_BLOCK_SUBTOTAL,
  });
  const {
    data: prices,
    loading: isLoadingCartPrice,
    setCart: onRefreshCartPrices,
  } = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });
  const {setCart: setAvailablePaymentMethod} = useCarts({
    initialized: false,
    type: TYPES.AVAILABLE_PAYMENT,
  });

  /**
   * ----------------------------------------- *
   * @const {reactive variable}
   * @summary reactive variable collection
   * ----------------------------------------- *
   */
  const {t} = useTranslation();
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [expand, setExpand] = useState(false);
  const [expandDiscount, setExpandDiscount] = useState(false);
  const [isLoadingSnap, setIsLoadingSnap] = useState(true);
  const [snapPaymentUrl, setSnapPaymentUrl] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [isCart, setIsCart] = useState({
    // init home delivery
    selectedDeliveryMethod: HOME_DELIVERY,
    selectedShippingAddress: false,
    selectedShippingMethod: false,
    selectedPaymentMethod: false,
    getEditAddress: false,
    getReviewOrder: false,
    getCouponCode: null,
    getGiftCard: null,
    showSnap: false,
    loadingButtonOrder: false,
    isBillingSameShipping: true,
    loadingApplyPoint: false,
  });
  const [selectedApotek, setSelectedApotek] = useState(null);
  const [isFreePayment, setIsFreePayment] = useState(false);

  // resetAutoApplyVoucher 前置调用进行中：完成后才拉取购物车数据，期间页面保持非就绪
  const [isResettingVoucher, setIsResettingVoucher] = useState(true);

  const [showFlashSaleEndedModal, setShowFlashSaleEndedModal] = useState(false);
  const [eventListLoading, setEventListLoading] = useState(false);

  const firstFlashSaleProductRef = useRef(null);
  const flashSaleCountdownIntervalRef = useRef(null);
  const hasShownModalRef = useRef(false);

  const getRxCartId = useReactiveVar(rxCartId);
  const getRxUserType = useReactiveVar(rxUserType);
  const getRxDataExtraFee = useReactiveVar(rxCartExtraFee);
  const getRxDataAppliedStoreCredit = useReactiveVar(rxCartAppliedStoreCredit);
  const getRxAppliedGiftCard = useReactiveVar(rxCartGiftCard);
  const getRxAppliedCoupon = useReactiveVar(rxCartAppliedCoupon);
  const getRxAppliedRewardPoint = useReactiveVar(rxCartAppliedRewardPoint);
  const getRxUserAddresses = useReactiveVar(rxUserAddresses);
  const getRxActiveSections = useReactiveVar(rxCartShipping);
  const getRxCartOrderId = useReactiveVar(rxCartOrderId);
  const getRxCartShippingAmount = useReactiveVar(rxCartShippingAmount);
  const getRxCartSelectedPaymentMethod = useReactiveVar(
    rxCartSelectedPaymentMethod,
  );
  const getRxCartAvailablePaymentMethod = useReactiveVar(
    rxCartAvailablePaymentMethod,
  );
  const getRxSelectedPoint = useReactiveVar(rxSelectedPoint);
  const getRxCartShippingMethod = useReactiveVar(rxCartShippingMethod);

  const isGuest = getRxUserType === USER_GUEST;
  const mount = useRef();
  const isFocused = useIsFocused();
  const checkoutTraceRef = useRef(null);
  // 本页面实例在「闪购结束刷新广播」中的唯一 key
  const flashSalePageKeyRef = useRef(getFlashSalePageKey('checkout'));

  const updatePointsInCartRef = useRef(updatePointsInCart);
  const onRefreshCartPricesRef = useRef(onRefreshCartPrices);
  const lastAppliedPointRef = useRef(null);

  const redeemedPoints = useMemo(
    () => ({
      totalPoints: pointData?.data?.getBalancePoint?.data?.point,
      pointsRedeemed: prices?.loyalty_points?.loyalty_points_total?.value,
      currency: prices?.loyalty_points?.loyalty_points_total?.currency,
    }),
    [pointData, prices],
  );

  const onWaitingRoom = () => {
    navigateTo(modules.event_config.enable, modules.event_config.name, {
      modalName: 'WaitingRoom',
    });
  };

  const fetchQueueStatusInfo = async () => {
    try {
      setEventListLoading(true);
      const {data: resQueue} = await getOfflineEventQueue();
      if (resQueue?.admitted === false && resQueue?.ahead >= 1) {
        onWaitingRoom();
      }
    } catch (error) {
      console.error('查询失败:', error.message);
    } finally {
      setEventListLoading(false);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for clear timeout ref for place order
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    mount.current = true;

    fetchQueueStatusInfo();

    // 开始 checkOutInit trace
    const startCheckoutTrace = async () => {
      checkoutTraceRef.current = await startPerfTrace('checkOutInit');
      checkoutTraceRef.current.putAttribute(
        'cart_id',
        getRxCartId?.toString() || '',
      );
      checkoutTraceRef.current.startTime = Date.now();
    };
    startCheckoutTrace();

    // 消费"从购物车主动进入"标记，且仅此路径才埋 rxCartFromCheckout：
    // 购物车→结算→返回购物车时，购物车页跳过 reset（保留结算中的 voucher 状态）。
    // Buy Now 等其他来源直进 checkout 不埋——用户中途放弃结算后再进购物车，
    // reset 应正常调用（否则残留标记会导致购物车首次进入被误跳过）
    const fromCart = rxCartFromCart();
    if (fromCart) {
      rxCartFromCart(false);
      rxCartFromCheckout(true);
    }

    // 初始加载时获取接口返回的已选支付方式，默认选中
    onRefetchSelectedPaymentMethod();

    // 前置调用：resetAutoApplyVoucher 完成后再拉取购物车数据，保证总价不含自动套用的 voucher
    const preFetch = async () => {
      if (!fromCart && !isGuest && getRxCartId) {
        try {
          await onResetAutoApplyVoucher({
            params: {cartId: getRxCartId},
            paramsOpt: {isReturn: true},
          });
        } catch (err) {}
      }
      onRefreshCartItems();
      onRefreshCartPrices();
      setIsResettingVoucher(false);
    };
    preFetch();

    return () => {
      mount.current = false;
      lastAppliedPointRef.current = null;
    };
  }, []);

  useEffect(() => {}, [getRxCartOrderId]);

  useEffect(() => {
    if (prices && prices?.discounts) {
      let tmpTotal = 0;
      for (let i = 0; i < prices.discounts.length; i++) {
        tmpTotal += prices.discounts[i].amount.value;
      }
      setTotalDiscount(tmpTotal);
    }

    // 停止 checkOutInit trace（当结账页面数据加载完成时）
    if (mount.current && checkoutTraceRef.current && !loadingItems && items) {
      const duration =
        Date.now() - (checkoutTraceRef.current.startTime || Date.now());
      checkoutTraceRef.current.putAttribute(
        'item_count',
        items?.length?.toString() || '0',
      );
      checkoutTraceRef.current.putMetric('duration_ms', duration);
      checkoutTraceRef.current.putAttribute('status', 'success');
      checkoutTraceRef.current.stop();
      checkoutTraceRef.current = null;
    }
  }, [prices, loadingItems, items]);

  useEffect(() => {
    if (!getRxCartAvailablePaymentMethod) {
      return;
    }
    const hasFreeMethod = getRxCartAvailablePaymentMethod?.some(
      item => item.code === IS_FREE,
    );
    setIsFreePayment(hasFreeMethod);
  }, [getRxCartAvailablePaymentMethod]);

  /**
   * ----------------------------------------- *
   * @function getFirstFlashSaleProduct
   * @summary 获取购物车中第一个 flash sale 商品
   * ----------------------------------------- *
   */
  const getFirstFlashSaleProduct = useCallback(() => {
    if (!items || items.length === 0) {
      return null;
    }
    const flashSaleItem = items.find(
      item =>
        _.get(item, 'product.is_flash_sale') === 1 &&
        _.get(item, 'product.special_to_date'),
    );
    return flashSaleItem ? flashSaleItem.product : null;
  }, [items]);

  /**
   * ----------------------------------------- *
   * @function normalizeDateValue
   * @summary 规范化日期值
   * ----------------------------------------- *
   */
  const normalizeDateValue = useCallback(value => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, []);
  /**
   * ---------------------------------------------------- *
   * @function onPressExpand
   * @summary for expand price
   * ---------------------------------------------------- *
   */
  const onPressExpand = () => setExpand(!expand);

  /**
   * ---------------------------------------------------- *
   * @function onRefreshCheckout
   * @summary 重新加载整个 checkout 页面
   * ---------------------------------------------------- *
   */
  const onRefreshCheckout = useCallback(async () => {
    try {
      await Promise.all(
        [
          onRefreshCartItems,
          onRefreshCartPrices,
          onRefetchSelectedPaymentMethod,
        ]
          .filter(Boolean)
          .map(fn => fn()),
      );
    } catch (err) {}
  }, [onRefreshCartItems, onRefreshCartPrices, onRefetchSelectedPaymentMethod]);

  /**
   * ----------------------------------------- *
   * @dependency [items, loadingItems]
   * @summary 监听 checkout 中第一个 flash sale 商品的倒计时结束
   * ----------------------------------------- *
   */
  useEffect(() => {
    // 清理之前的定时器
    if (flashSaleCountdownIntervalRef.current) {
      clearInterval(flashSaleCountdownIntervalRef.current);
      flashSaleCountdownIntervalRef.current = null;
    }

    // 定时器防串扰：仅在结算页获得焦点时运行倒计时。
    // 结算页压在路由栈底（失焦）时若继续跑定时器，倒计时到点会先把
    // 弹框 state 置 true，等用户返回时再次弹窗（PLP/PDP/Cart 同理）。
    // 失焦期间闪购结束的话，回到前台时本 effect 会重新执行并立即检查兜底。
    if (!isFocused) {
      return;
    }

    // 异步竞态守卫：effect 被 cleanup（失焦/数据变化/卸载）之后，
    // 异步回调里不允许再创建定时器或弹窗，避免产生清不掉的僵尸定时器
    let isActive = true;

    // 如果还在加载或没有商品，不处理
    if (loadingItems || !items || items.length === 0) {
      firstFlashSaleProductRef.current = null;
      return;
    }

    const firstFlashSaleProduct = getFirstFlashSaleProduct();

    if (!firstFlashSaleProduct) {
      firstFlashSaleProductRef.current = null;
      return;
    }

    const endDate = firstFlashSaleProduct?.special_to_date;
    if (!endDate) {
      firstFlashSaleProductRef.current = null;
      return;
    }

    const prevProductId = firstFlashSaleProductRef.current?.id;
    const currentProductId = firstFlashSaleProduct.id;
    if (prevProductId !== currentProductId) {
      // 全局标记按「闪购结束时间戳」识别同一轮闪购，无需在此删除；
      // 删除反而会破坏其他页面对同一轮闪购的去重（同一商品第二次配置
      // 闪购时商品 ID 不变，靠结束时间戳变化识别新一轮闪购）
      hasShownModalRef.current = false;
    }

    firstFlashSaleProductRef.current = firstFlashSaleProduct;

    // 规范化结束日期
    const normalizedEndDateValue = normalizeDateValue(endDate);
    if (!normalizedEndDateValue) {
      return;
    }

    // 转换为印尼时区
    const converted = DateHelper.convertUTCToIndonesia(normalizedEndDateValue);
    const normalizedEndDate = converted ? new Date(converted) : null;

    if (!normalizedEndDate || isNaN(normalizedEndDate.getTime())) {
      return;
    }

    // 计算剩余时间（毫秒）
    const getRemainingMs = () => {
      if (!mount.current) {
        return null;
      }
      try {
        const now = DateHelper.getIndonesiaTimeNow();
        const remaining = normalizedEndDate.getTime() - now.getTime();
        return Math.max(remaining, 0);
      } catch (error) {
        return null;
      }
    };

    // 检查 AsyncStorage 中是否已弹过（异步检查）
    const checkStorageAndStartCountdown = async () => {
      if (!isActive || !mount.current) {
        return;
      }

      // 全局弹框去重：仅当「已弹过的那轮闪购」的结束时间戳与当前一致
      // 时才跳过（其他页面已弹过则本页不再弹；新一轮闪购会重新弹）
      const alreadyShown = await isFlashSaleModalShownFor(
        normalizedEndDate.getTime(),
      );
      if (!isActive || !mount.current) {
        return;
      }
      if (alreadyShown) {
        hasShownModalRef.current = true;
        return;
      }

      // 检查是否已经结束
      const checkCountdown = () => {
        if (!isActive || !mount.current) {
          return;
        }

        // 如果已经显示过弹窗，不再检查
        if (hasShownModalRef.current) {
          if (flashSaleCountdownIntervalRef.current) {
            clearInterval(flashSaleCountdownIntervalRef.current);
            flashSaleCountdownIntervalRef.current = null;
          }
          return;
        }

        const remaining = getRemainingMs();

        if (remaining === null) {
          return;
        }

        if (remaining <= 0) {
          hasShownModalRef.current = true;
          // 保存本轮闪购的结束时间戳到 AsyncStorage（同一轮只弹一次，
          // 新一轮闪购的结束时间不同，可重新弹框）
          markFlashSaleModalShown(normalizedEndDate.getTime());
          // 结算页倒计时结束时真正弹出弹框（之前只置标记从不弹窗）
          setShowFlashSaleEndedModal(true);
          if (flashSaleCountdownIntervalRef.current) {
            clearInterval(flashSaleCountdownIntervalRef.current);
            flashSaleCountdownIntervalRef.current = null;
          }
        }
      };

      // 立即检查一次
      const initialRemaining = getRemainingMs();
      checkCountdown();

      // 如果还没结束且未显示过弹窗，设置定时器每秒检查
      if (
        isActive &&
        initialRemaining !== null &&
        initialRemaining > 0 &&
        !hasShownModalRef.current
      ) {
        flashSaleCountdownIntervalRef.current = setInterval(
          checkCountdown,
          1000,
        );
      }
    };

    checkStorageAndStartCountdown();

    return () => {
      isActive = false;
      if (flashSaleCountdownIntervalRef.current) {
        clearInterval(flashSaleCountdownIntervalRef.current);
        flashSaleCountdownIntervalRef.current = null;
      }
    };
  }, [
    items,
    loadingItems,
    isFocused,
    getFirstFlashSaleProduct,
    normalizeDateValue,
    mount,
  ]);

  /**
   * ---------------------------------------------------- *
   * @function onPressExpandDiscount
   * @summary for expand Discount
   * ---------------------------------------------------- *
   */
  const onPressExpandDiscount = () => setExpandDiscount(!expandDiscount);

  const handleFlashSaleModalClose = useCallback(() => {
    setShowFlashSaleEndedModal(false);
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function handleFlashSaleModalRefresh
   * @summary Flash Sale弹窗点击「刷新」：刷新当前结算页数据，
   * 并广播通知其他页面（PLP/PDP/Cart）回到前台时静默刷新
   * ---------------------------------------------------- *
   */
  const handleFlashSaleModalRefresh = useCallback(() => {
    // 广播：其他 3 个页面重新获得焦点时各自静默刷新一次
    notifyFlashSaleEndedRefreshed();
    // 本页立即刷新，并标记本页已消费本次广播（返回本页时不重复刷新）
    markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
    onRefreshCheckout();
    // 弹框组件会在 onRefresh 完成后自行调用 onClose 关闭
  }, [onRefreshCheckout]);

  /**
   * ---------------------------------------------------- *
   * @dependency [onRefreshCheckout]
   * @summary 回到结算页时，若其他页面的闪购结束弹框点击过「刷新」，
   * 则静默刷新一次结算页数据（闪购价已恢复原价）
   * ---------------------------------------------------- *
   */
  useFocusEffect(
    useCallback(() => {
      if (shouldSilentRefreshFlashSale(flashSalePageKeyRef.current)) {
        markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
        onRefreshCheckout();
      }
    }, [onRefreshCheckout]),
  );

  /**
   * ---------------------------------------------------- *
   * @function _onSnapCheckMidtransStatus
   * @summary for checking midtrans status
   * ---------------------------------------------------- *
   */
  const _onSnapCheckMidtransStatus = async () => {
    setIsCart({...isCart, showSnap: false});
    try {
      rxAppLoading(true);
      const res = await onRefetchSnapStatus({
        paramsOpt: {isReturn: true},
        params: {
          orderId: getRxCartOrderId,
        },
      });
      if (res) {
        const isSuccess =
          _.get(res, 'data.getSnapOrderStatusByOrderId.success') === 'true';
        const message = _.get(
          res,
          'data.getSnapOrderStatusByOrderId.status_message',
        );

        const getError = getErrorGQL(res);
        if (getError.isError) {
          rxAppSnackbar({message: getError.message});
          onResetNewCart();
          rxAppLoading(false);
          navReset(tabsApp.name);
          return;
        }

        if (isSuccess) {
          AnalyticsHelper.eventLogPurchase({
            transaction_id: getRxCartOrderId,
            currency: prices?.grand_total?.currency,
            value: prices?.grand_total?.value,
            is_complete: true,
          });

          AnalyticsHelper.trackAdjustRevenue({
            revenue: prices?.grand_total?.value,
            currency: prices?.grand_total?.currency,
            orderId: getRxCartOrderId,
          });

          onResetNewCart();
          rxAppLoading(false);
          navReset(modules.cart_thankyou.name);
        } else {
          rxAppSnackbar({message});
          onResetNewCart();
          rxAppLoading(false);
          navReset(tabsApp.name);
        }
      }
    } catch (err) {
      rxAppSnackbar({message: err.toString()});
      onResetNewCart();
      rxAppLoading(false);
      navReset(modules.cart_thankyou.name);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function _onSnapNavigationStateChange especially for webview
   * @summary for checking url for redirect
   * ---------------------------------------------------- *
   */
  const _onSnapNavigationStateChange = async webViewState => {
    const url = webViewState.url;
    const isBlank = url.startsWith('about:blank');
    const isSnapUrl =
      url.startsWith('https://app.midtrans.com/snap/') ||
      url.startsWith('https://app.sandbox.midtrans.com/snap/');
    const isEWalletDeeplink =
      url.startsWith(PREFIX_GOJEK) ||
      url.startsWith(PREFIX_GOJEK_LINK) ||
      url.startsWith(PREFIX_SHOPEE) ||
      url.includes(PREFIX_SHOPEEID) ||
      url.includes(PREFIX_GOPAY) ||
      url.includes(PREFIX_SHOPEEPAY) ||
      url.includes(PREFIX_AIRPAY);

    if (isEWalletDeeplink) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        setIsCart({...isCart, showSnap: false});
        navReset(modules.cart_thankyou.name);
        onResetNewCart();
      } else {
        rxAppSnackbar({message: t('cart_checkout.error.appNotInstalled')});
        setIsCart({...isCart, showSnap: false});
      }
      return;
    }

    if (!isBlank && !isSnapUrl) {
      _onSnapCheckMidtransStatus();
      return;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function _onSnapModalClose
   * @summary on snap modal close event
   * ---------------------------------------------------- *
   */
  const _onSnapModalClose = () => {
    setIsCart({...isCart, showSnap: false});
    setSnapPaymentUrl(null);
    _onSnapCheckMidtransStatus();
  };

  /**
   * ---------------------------------------------------- *
   * @function _onSnapModalLoad
   * @summary on snap modal load for page finish
   * loader stop
   * ---------------------------------------------------- *
   */
  const _onSnapModalLoad = () => {
    setIsLoadingSnap(false);
  };

  /**
   * ---------------------------------------------------- *
   * @function _onSnapModalError
   * @summary for snap modal error handling
   * ---------------------------------------------------- *
   */
  const _onSnapModalError = () => syntheticEvent => {
    const code = _.get(syntheticEvent, 'nativeEvent.code');
    const message = _.get(syntheticEvent, 'nativeEvent.description');
    rxAppSnackbar({message});
    if (code === -2) {
      setIsCart({...isCart, showSnap: false});
      navReset(modules.cart_thankyou.name);
      // placeOrder 已成功,quote 已转为订单,重建 cart
      onResetNewCart();
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function _onGetSnapMidtransRedirectUrl
   * @summary on get snap midtrans redirect url
   * ---------------------------------------------------- *
   */
  const _onGetSnapMidtransRedirectUrl = async (orderId, isFree) => {
    try {
      if (!isFree) {
        const res = await onRefetchSnapToken({
          paramsOpt: {isReturn: true},
          params: {orderId},
        });

        if (res) {
          const getSnapRedirectUrl = _.get(
            res,
            'data.getSnapTokenByOrderId.redirect_url',
          );

          if (getSnapRedirectUrl) {
            rxCartSnapUrl(getSnapRedirectUrl);
            setSnapPaymentUrl(getSnapRedirectUrl);
          } else {
            throw new Error('No redirect URL received from snap token API');
          }
        } else {
          throw new Error('Empty response from snap token API');
        }
      }

      rxCartOrderId(orderId);
    } catch (err) {
      throw err;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onProcessBillingAddress
   * @param {firstName, lastName, streetAddress} data
   * @param {distric, subdistrict, urbanVillage} data
   * @param {postalCode, region, phoneNumber} data
   * @summary on process billing address
   * ---------------------------------------------------- *
   */
  const onProcessBillingAddress = async data => {
    const city = `${data?.district}, ${data?.subdistrict}, ${data?.urbanVillage}`;
    const address = {
      city: city,
      country_code: countryData?.data?.country?.id,
      firstname: data?.firstName,
      lastname: data?.lastName,
      street: [data?.streetAddress],
      postcode: data?.postalCode,
      region: data?.region,
      telephone: data?.phoneNumber,
    };
    try {
      setIsCart({...isCart, getReviewOrder: true, loadingButtonOrder: true});
      const res = await setBillingAddressHook({
        paramsOpt: {isReturn: true},
        params: {
          input: {
            cart_id: getRxCartId,
            billing_address: {address},
          },
        },
      });

      if (res) {
        setIsCart({...isCart, getReviewOrder: true, loadingButtonOrder: false});
        onRefetchSelectedPaymentMethod();
        useFormExternal?.reset();
      }
    } catch (err) {
      setIsCart({...isCart, getReviewOrder: false, loadingButtonOrder: false});
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onProcessPlaceOrder
   * @summary for process place order review order
   * or open midtrans for place order
   * ---------------------------------------------------- *
   */
  const onProcessPlaceOrder = async () => {
    // 开始 checkoutClickCheckout trace
    const checkoutTrace = await startPerfTrace('checkoutClickCheckout');
    const checkoutStartTime = Date.now();

    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.CREATE_AN_ORDER);
    const isFree = _.countBy(
      getRxCartAvailablePaymentMethod,
      item => item.code === IS_FREE,
    ).true;

    if (!selectedApotek) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'no_apotek');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.pleaseSelectApotek'),
      });
      return;
    }

    if (!isCart?.selectedDeliveryMethod) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'no_delivery_method');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.pleaseSelectDeliveryMethod'),
      });
      return;
    }

    if (!isCart?.selectedShippingAddress) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'no_shipping_address');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.selectShippingAddress'),
      });
      return;
    }

    if (!isCart?.selectedShippingMethod) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'no_shipping_method');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.selectShippingMethod'),
      });
      return;
    }
    if (!isCart?.selectedPaymentMethod && !isFree) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'no_payment_method');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.error.selectPaymentMethod'),
      });
      return;
    }
    // if avail payment no free & selected free
    if (!isFree && getRxCartSelectedPaymentMethod?.code === IS_FREE) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'invalid_payment_method');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.error.selectPaymentMethod'),
      });
      return;
    }
    /* review order first */
    if (!isCart?.getReviewOrder) {
      // 先停止 trace（进入 review 状态）
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'review');
      checkoutTrace.stop();
      setIsCart({...isCart, getReviewOrder: true});
      onRefetchSelectedPaymentMethod();
      return;
    }

    /* can't process place order */
    if (
      !isCart.selectedPaymentMethod &&
      getRxCartSelectedPaymentMethod === null &&
      !isFree
    ) {
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'validation_error');
      checkoutTrace.putAttribute('error_reason', 'payment_method_not_set');
      checkoutTrace.stop();
      rxAppSnackbar({
        message: t('cart_checkout.error.selectPaymentMethod'),
      });
      return;
    }

    /* process place order */
    setIsProcessingOrder(true);
    try {
      const cart_id = getRxCartId;
      const res = await onPlaceOrderHook({
        paramsOpt: {isReturn: true},
        params: {
          input: {cart_id},
        },
      });
      if (res) {
        const order_number = _.get(res, 'data.placeOrder.order.order_number');
        if (!order_number) {
          const duration = Date.now() - checkoutStartTime;
          checkoutTrace.putMetric('duration_ms', duration);
          checkoutTrace.putAttribute('status', 'error');
          checkoutTrace.putAttribute('error_reason', 'no_order_number');
          checkoutTrace.stop();
          rxAppSnackbar({message: res.toString()});
          setIsProcessingOrder(false);
          return;
        }
        try {
          await _onGetSnapMidtransRedirectUrl(order_number, isFree);
        } catch (snapError) {
          const duration = Date.now() - checkoutStartTime;
          checkoutTrace.putMetric('duration_ms', duration);
          checkoutTrace.putAttribute('status', 'error');
          checkoutTrace.putAttribute('error_reason', 'payment_url_failed');
          checkoutTrace.stop();
          rxAppSnackbar({
            message:
              t('cart_checkout.error.paymentUrlFailed') ||
              'Failed to initialize payment',
          });
          setIsProcessingOrder(false);
          return;
        }

        const isCanSnapShow =
          getRxCartSelectedPaymentMethod?.code?.indexOf(CONTAIN_SNAP) !== -1;

        // 结账成功
        const duration = Date.now() - checkoutStartTime;
        checkoutTrace.putAttribute('order_number', order_number || '');
        checkoutTrace.putAttribute(
          'payment_method',
          getRxCartSelectedPaymentMethod?.code || '',
        );
        checkoutTrace.putMetric('duration_ms', duration);
        checkoutTrace.putAttribute('status', 'success');
        checkoutTrace.stop();
        trackSubmitOrder({
          order_id: order_number,
          pharmacy_name: selectedApotek?.loc_name || '',
          delivery_method: isCart.selectedDeliveryMethod,
          payment_method: getRxCartSelectedPaymentMethod?.code || '',
          shipping_method: `${getRxCartShippingMethod?.method_title || ''}-${
            getRxCartShippingMethod?.carrier_title || ''
          }`,
          order_total: prices?.grand_total?.value || 0,
        });

        if (isCanSnapShow) {
          setIsCart({...isCart, showSnap: true});
          setIsProcessingOrder(false);
        } else {
          setIsProcessingOrder(false);
          onResetNewCart();
          navReset(modules.cart_thankyou.name);
        }
      } else {
        const duration = Date.now() - checkoutStartTime;
        checkoutTrace.putMetric('duration_ms', duration);
        checkoutTrace.putAttribute('status', 'error');
        checkoutTrace.putAttribute('error_reason', 'place_order_failed');
        checkoutTrace.stop();
        setIsProcessingOrder(false);
      }
    } catch (err) {
      console.log('[err] place order', err);
      const duration = Date.now() - checkoutStartTime;
      checkoutTrace.putMetric('duration_ms', duration);
      checkoutTrace.putAttribute('status', 'error');
      checkoutTrace.putAttribute(
        'error_reason',
        err?.message || 'unknown_error',
      );
      checkoutTrace.stop();
      setIsProcessingOrder(false);
    }
  };

  const onCancelPoints = useCallback(async () => {
    if (isLoadingCartPrice) {
      return;
    }

    try {
      setIsCart(prev => ({...prev, loadingButtonOrder: true}));

      await updatePointsInCart({
        params: {
          cartId: getRxCartId?.toString(),
          points: 0,
        },
      });

      rxSelectedPoint(null);
      lastAppliedPointRef.current = null;

      await onRefreshCartPrices();
      await setAvailablePaymentMethod();

      setIsCart(prev => ({
        ...prev,
        loadingButtonOrder: false,
      }));
    } catch (err) {
      console.error('Cancel points failed:', err);
      setIsCart(prev => ({
        ...prev,
        loadingButtonOrder: false,
      }));
    }
  }, [
    isLoadingCartPrice,
    getRxCartId,
    updatePointsInCart,
    onRefreshCartPrices,
  ]);

  const resetPoints = useCallback(async () => {
    if (!getRxCartId) {
      return;
    }

    try {
      await updatePointsInCart({
        params: {
          cartId: String(getRxCartId),
          points: 0,
        },
      });
      rxSelectedPoint(null);
    } catch (err) {}
  }, [getRxCartId, updatePointsInCart]);

  useEffect(() => {
    updatePointsInCartRef.current = updatePointsInCart;
    onRefreshCartPricesRef.current = onRefreshCartPrices;
  }, [updatePointsInCart, onRefreshCartPrices]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const refresh = async () => {
        if (!getRxSelectedPoint || !getRxCartId) {
          return;
        }
        if (lastAppliedPointRef.current === getRxSelectedPoint) {
          return;
        }

        setIsCart(prev => ({
          ...prev,
          loadingButtonOrder: true,
        }));

        try {
          await updatePointsInCartRef.current({
            params: {
              cartId: getRxCartId.toString(),
              points: getRxSelectedPoint,
            },
          });

          await onRefreshCartPricesRef.current();
          await setAvailablePaymentMethod();

          if (!isActive) {
            return;
          }

          lastAppliedPointRef.current = getRxSelectedPoint;

          setIsCart(prev => ({
            ...prev,
            loadingButtonOrder: false,
          }));
        } catch {
          if (!isActive) {
            return;
          }

          setIsCart(prev => ({
            ...prev,
            loadingButtonOrder: false,
          }));
        }
      };

      refresh();

      return () => {
        isActive = false;
      };
    }, [getRxSelectedPoint, getRxCartId]),
  );

  /**
   * ---------------------------------------------------- *
   * @const {ctxProps}
   * @summary for context passing data to children
   * ---------------------------------------------------- *
   */
  const ctxProps = {
    isCart,
    setIsCart,
    useFormExternal,
    selectedApotek,
    setSelectedApotek,
    isLoadingCartPrice,
    redeemedPoints,
    resetPoints,
    onRefreshCartItems,
  };

  /**
   * ---------------------------------------------------- *
   * @const {controllerProps}
   * @summary for controller passing data to view
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    ...ctxProps,
    t,
    expand,
    isGuest,
    isEmptyCart,
    isLoadingSnap,
    snapPaymentUrl,
    isProcessingOrder,
    userAddresses: getRxUserAddresses,
    activeSections: getRxActiveSections,
    dataExtraFee: getRxDataExtraFee,
    dataAppliedStoreCredit: getRxDataAppliedStoreCredit,
    appliedGiftCard: getRxAppliedGiftCard,
    appliedCoupon: getRxAppliedCoupon,
    appliedRewardPoint: getRxAppliedRewardPoint,
    shippingAmount: getRxCartShippingAmount,
    totalDiscount,
    cart: items,
    dataPrices: prices,
    userType: getRxUserType,
    isLoadingCartPrice,
    isLoadingPlaceOrder,
    isResettingVoucher,
    onProcessBillingAddress,
    onPressExpand,
    onProcessPlaceOrder,
    _onSnapModalLoad,
    _onSnapModalClose,
    _onSnapModalError,
    _onSnapNavigationStateChange,
    expandDiscount,
    onPressExpandDiscount,
    loadingItems,
    getRxCartSelectedPaymentMethod,
    getRxCartAvailablePaymentMethod,
    apotekList: apotekData?.data?.CustomLocationStore ?? [],
    showFlashSaleEndedModal,
    onFlashSaleModalClose: handleFlashSaleModalClose,
    onFlashSaleModalRefresh: handleFlashSaleModalRefresh,
    onRefreshCheckout,
    onCancelPoints,
    isFree: isFreePayment,
    eventListLoading,
  };

  return (
    <CheckoutContext.Provider value={ctxProps}>
      <Views {...controllerProps} />
    </CheckoutContext.Provider>
  );
};

export default CartCheckout;
