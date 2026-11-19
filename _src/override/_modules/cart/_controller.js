import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {useIsFocused, useRoute} from '@react-navigation/native';

import {useApolloClient} from '@apollo/client';
import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import ViewLogin from '@app/_modules/auth_signin/_controller';
import {
  CONFIRM_EMAIL_VERIFICATION,
  VERIFY_EMAIL,
} from '@app/_modules/auth_signup/services/schema';
import Views from '@app/_modules/cart/_view';
import {
  GET_ALLOW_CHECKOUT,
  RESET_AUTO_APPLY_VOUCHER,
} from '@app/_modules/cart/services/schema';
import {UPDATE_POINTS_IN_CART} from '@app/_modules/cart_checkout/services/schema';
import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {USER_GUEST} from '@app/helpers/Constants';
import DateHelper from '@app/helpers/Date';
import {
  getFlashSalePageKey,
  isFlashSaleModalShownFor,
  markFlashSaleModalShown,
  markFlashSaleSilentRefreshed,
  notifyFlashSaleEndedRefreshed,
} from '@app/helpers/FlashSale';
import {toNumber} from '@app/helpers/General';
import {navigatePushTo, navigateTo} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import cartSchema from '@app/hooks/carts/schema';
import useCarts, {
  resetProcessingAPICount,
  TYPES,
} from '@app/hooks/carts/useCarts';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {
  rxAppSnackbar,
  rxCartAvailablePaymentMethod,
  rxCartDataPrice,
  rxCartFromCart,
  rxCartFromCheckout,
  rxCartId,
  rxCartShippingAmount,
  rxCartTieringNudge,
  rxSelectedPoint,
  rxUserType,
} from '@app/services/cache';
import {GET_USER_DATA} from '@app/services/queries/user';

const Cart = () => {
  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @summary collections constant for
   * this contorller
   * ---------------------------------------------------- *
   */
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  const route = useRoute();
  const getRxUserType = useReactiveVar(rxUserType);
  const getRxCartId = useReactiveVar(rxCartId);
  const getRxSelectedPoint = useReactiveVar(rxSelectedPoint);
  const getRxCartPrice = useReactiveVar(rxCartDataPrice);
  const [loadingCartRefreshPromo, setLoadingCartRefreshPromo] = useState(false);
  const getRxCartTieringNudge = useReactiveVar(rxCartTieringNudge);
  const client = useApolloClient();
  const mount = useRef();
  const [expand, setExpand] = useState(false);
  const getRxCartShippingAmount = useReactiveVar(rxCartShippingAmount);
  const {storeConfig} = useStoreConfig({useInitData: true});
  const cartTraceRef = useRef(null);
  const freeshipThreshoud = useMemo(() => {
    return storeConfig?.free_shipping_threshold
      ? Number(storeConfig?.free_shipping_threshold)
      : undefined;
  }, [storeConfig]);

  const [showFlashSaleEndedModal, setShowFlashSaleEndedModal] = useState(false);
  const [
    showEmailVerificationRequiredModal,
    setShowEmailVerificationRequiredModal,
  ] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');
  const [emailVerified, setEmailVerified] = useState(false); // 标记邮箱已验证
  const [showGiftSelectionModal, setShowGiftSelectionModal] = useState({
    visible: false,
    data: {},
  });
  const [resetPointsLoading, setResetPointsLoading] = useState(false);
  const firstFlashSaleProductRef = useRef(null);
  const flashSaleCountdownIntervalRef = useRef(null);
  const hasShownModalRef = useRef(false);
  // 本页面实例在「闪购结束刷新广播」中的唯一 key
  const flashSalePageKeyRef = useRef(getFlashSalePageKey('cart'));

  // 获取用户信息，检查邮箱验证状态
  // 仅登录后调用：未登录调用 customer 接口会返回授权错误
  // 注意：hook 返回的字段是 onRefetchData（不是 refetch）
  const {
    data: userData,
    onRefetchData: refetchUserData,
  } = useCustomQuery({
    schema: GET_USER_DATA,
    useInitData: false,
    opts: {
      // 每次进入购物车页都从服务端拉取：
      // cache-first 命中内存缓存时不发网络请求，会导致「已登录进入页面看不到调用」
      fetchPolicy: 'network-only',
    },
  });

  // 每次进入购物车页（tab focus）且已登录时才调用；未登录不调用
  // 购物车为 tab 页，切走再切回不会重新挂载，因此必须监听 isFocused 而不是只靠挂载
  // deps 不含 refetchUserData：它是每次渲染都变化的新引用，加入会导致循环请求
  useEffect(() => {
    if (isFocused && getRxUserType && getRxUserType !== USER_GUEST) {
      // 必须显式传对象：onRefetchData 的参数为解构模式且无默认值，
      // 无参调用会在入口抛 TypeError（rejected promise），请求不会发出
      refetchUserData({params: null});
    }
  }, [isFocused, getRxUserType]);

  const customer = userData?.data?.customer;
  const customerEmail = customer?.customer_email;
  // 检查是否有邮箱（如果没有邮箱，需要验证）
  // 添加对 customer 的检查，避免退出登录时 customer 为 null 导致的问题
  const hasEmail = useMemo(() => {
    if (!customer || !customerEmail) {
      return false;
    }
    return !!(
      customerEmail &&
      typeof customerEmail === 'string' &&
      customerEmail.trim().length > 0
    );
  }, [customer, customerEmail]);

  // 发送邮箱验证码的 mutation
  const {onRefetchData: sendEmailVerification} = useCustomMutation({
    schema: VERIFY_EMAIL,
  });

  // 确认邮箱验证的 mutation
  const {onRefetchData: confirmEmailVerification} = useCustomMutation({
    schema: CONFIRM_EMAIL_VERIFICATION,
  });
  /**
   * hooks cart items
   */
  const {
    data: items,
    setCart: getItems,
    loading,
    isEmptyCart,
  } = useCarts({
    initialized: false,
    type: TYPES.ITEM_CUSTOM_PRICE,
  });

  const {onRefetchData: updatePointsInCart} = useCustomMutation({
    schema: UPDATE_POINTS_IN_CART,
  });

  // 前置调用：在获取购物车数据前先调用 resetAutoApplyVoucher
  const {onRefetchData: onResetAutoApplyVoucher} = useCustomMutation({
    schema: RESET_AUTO_APPLY_VOUCHER,
  });

  /**
   * hooks cart prices
   */
  const {
    data: price,
    setCart: getPrice,
    loading: loadingPrice,
  } = useCarts({
    initialized: false,
    type: TYPES.PRICE_SIMPLE,
  });

  const {onRefetchData: onGetAllowCheckout} = useCustomQuery({
    schema: GET_ALLOW_CHECKOUT,
    initialized: false,
    opts: {fetchPolicy: 'no-cache'},
  });

  const resetPoints = useCallback(async () => {
    const shouldReset =
      getRxCartId &&
      getRxSelectedPoint &&
      toNumber(getRxCartPrice?.grand_total?.value) < getRxSelectedPoint;

    if (!shouldReset) {
      setResetPointsLoading(false);
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
      rxCartAvailablePaymentMethod(null);

      getPrice();
    } catch (err) {
    } finally {
      setResetPointsLoading(false);
    }
  }, [
    getRxCartId,
    getRxSelectedPoint,
    getRxCartPrice?.grand_total?.value,
    updatePointsInCart,
    getPrice,
  ]);

  const getPriceByResetPoints = useCallback(() => {
    setResetPointsLoading(true);
    getPrice().finally(() => {
      resetPoints();
    });
  }, [getPrice]);

  /**
   * ----------------------------------------- *
   * @function getFirstFlashSaleProduct
   * @summary 获取购物车中第一个flash sale商品
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
    if (typeof value === 'string') {
      const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
      const parsed = new Date(normalized);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  }, []);

  /**
   * ----------------------------------------- *
   * @dependency []
   * @summary component did mount
   * request cart data
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.CART_PAGE);
    mount.current = true;

    // 开始 cartInit trace
    const startCartTrace = async () => {
      cartTraceRef.current = await startPerfTrace('cartPageInit');
      cartTraceRef.current.startTime = Date.now();
    };
    startCartTrace();

    if (mount.current) {
      resetProcessingAPICount();
      // 注意：这里不能删除 FLASH_SALE_MODAL_SHOWN 全局标记。
      // 购物车页可能在本会话中途才首次挂载，如果此时把其他页面
      // （PLP/PDP/Checkout）已经弹过并刷新过的标记清掉，返回那些页面
      // 时会重复弹框（定时器串扰）。标记按闪购结束时间戳识别同一轮
      // 闪购，同一商品配置新一轮闪购（新结束时间）后会重新弹框。
      hasShownModalRef.current = false;
    }
    return () => {
      mount.current = false;
      if (cartTraceRef.current) {
        cartTraceRef.current.stop();
        cartTraceRef.current = null;
      }
    };
  }, []);

  /**
   * ----------------------------------------- *
   * @dependency [isFocused]
   * @summary for isFocused screen
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (isFocused && mount.current && getRxCartId) {
      setLoadingCartRefreshPromo(true);

      // 仅在「其他页面进入购物车页」且「已登录」时才调用 resetAutoApplyVoucher：
      // - 未登录不调用
      // - 从 checkout 返回购物车页不调用（checkout 挂载时已置 rxCartFromCheckout=true）
      const refreshCartData = async () => {
        const fromCheckout = rxCartFromCheckout();
        if (fromCheckout) {
          rxCartFromCheckout(false);
        }

        if (!fromCheckout && getRxUserType !== USER_GUEST) {
          try {
            await onResetAutoApplyVoucher({
              params: {cartId: getRxCartId},
              paramsOpt: {isReturn: true},
            });
          } catch (err) {}
        }

        getItems();

        // trigger for apply promo
        try {
          await client.query({
            query: cartSchema().getPriceSimple,
            fetchPolicy: 'cache-first',
            variables: {cartID: getRxCartId},
          });
          // trigger get price & discount
          setLoadingCartRefreshPromo(false);
          // getDiscount();
          getPrice();
        } catch (err) {
          setLoadingCartRefreshPromo(false);
        }
      };
      refreshCartData();
    }
  }, [isFocused, getRxCartId, route?.params?.refreshCartAt]);

  /**
   * 停止 cartInit trace（当购物车数据加载完成时）
   */
  useEffect(() => {
    if (cartTraceRef.current && !loading && !loadingPrice && items && price) {
      const duration =
        Date.now() - (cartTraceRef.current.startTime || Date.now());
      cartTraceRef.current.putAttribute(
        'item_count',
        items?.length?.toString() || '0',
      );
      cartTraceRef.current.putMetric('duration_ms', duration);
      cartTraceRef.current.putAttribute('status', 'success');
      cartTraceRef.current.stop();
      cartTraceRef.current = null;
    }
  }, [loading, loadingPrice, items, price]);

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToCartDetail
   * @summary navigate to Cart detail
   * ---------------------------------------------------- *
   */
  const onNavigateToCartDetail = cartId => {
    navigateTo(modules.cart_edit.enable, modules.cart_edit.name, {
      cartId,
    });
  };
  /**
   * ---------------------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail product
   * ---------------------------------------------------- *
   */
  const onNavigateToProductDetail = ({
    productUrlKey,
    productSku,
    product,
    uid,
  }) => {
    navigatePushTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey: product?.url_key || productUrlKey,
      productSku,
      uid,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToCheckout
   * @summary navigate to checkout page
   * ---------------------------------------------------- *
   */
  const onNavigateToCheckout = async () => {
    setLoadingCartRefreshPromo(true);
    if (getRxUserType === USER_GUEST) {
      setLoadingCartRefreshPromo(false);
      navigateTo(modules.account.enable, modules.account.name);
      return;
    }

    // 检查是否有邮箱（如果没有邮箱，显示验证提示弹框）
    // 如果邮箱已验证，跳过检查
    if (!emailVerified && !hasEmail) {
      setShowEmailVerificationRequiredModal(true);
      setLoadingCartRefreshPromo(false);
      return;
    }

    try {
      if (items?.length) {
        const res = await onGetAllowCheckout({
          paramsOpt: {isReturn: true},
        });

        const resData = res?.data?.storeConfig;
        if (resData) {
          if (resData?.temporary_customer_group_allow_checkout && false) {
            // ke Home
            navigateTo(modules.main_home.enable, modules.main_home.name);
          } else {
            // ke checkout
            AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.CHECKOUT_BUTTON);
            AnalyticsHelper.eventBeginCheckout({cartItems: items});
            // 打标：购物车主动去结算，checkout 据此跳过 resetAutoApplyVoucher（进店时已调用）
            rxCartFromCart(true);
            navigateTo(
              modules.cart_checkout.enable,
              modules.cart_checkout.name,
            );
          }
        }
      }
    } finally {
      setLoadingCartRefreshPromo(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onNavigateToAccount = () => {
    setShowEmailVerificationRequiredModal(false);
    navigateTo(modules.account.enable, modules.account.name);
  };

  // eslint-disable-next-line no-unused-vars
  const onCloseEmailVerificationModal = () => {
    setShowEmailVerificationRequiredModal(false);
  };

  const onRefreshCart = () => {
    getItems();
    getPrice();
  };

  /**
   * ----------------------------------------- *
   * @dependency [items, loading]
   * @summary 监听购物车中第一个flash sale商品的倒计时结束
   * ----------------------------------------- *
   */
  useEffect(() => {
    // 清理之前的定时器
    if (flashSaleCountdownIntervalRef.current) {
      clearInterval(flashSaleCountdownIntervalRef.current);
      flashSaleCountdownIntervalRef.current = null;
    }

    // 定时器防串扰：仅在购物车页获得焦点时运行倒计时。
    // 购物车页压在路由栈底（失焦）时若继续跑定时器，倒计时到点会先把
    // 弹框 state 置 true，等用户返回时再次弹窗（PLP/PDP/Checkout 同理）。
    // 失焦期间闪购结束的话，回到前台时本 effect 会重新执行并立即检查兜底。
    if (!isFocused) {
      return;
    }

    // 异步竞态守卫：effect 被 cleanup（失焦/数据变化/卸载）之后，
    // 异步回调里不允许再创建定时器或弹窗，避免产生清不掉的僵尸定时器
    let isActive = true;

    // 如果还在加载或没有商品，不处理
    if (loading || !items || items.length === 0) {
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
      hasShownModalRef.current = false;
    }

    firstFlashSaleProductRef.current = firstFlashSaleProduct;

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

        // 如果剩余时间计算失败，不处理
        if (remaining === null) {
          return;
        }

        // 倒计时已结束（剩余时间 <= 0）
        if (remaining <= 0) {
          hasShownModalRef.current = true;
          // 保存本轮闪购的结束时间戳到 AsyncStorage（同一轮只弹一次，
          // 新一轮闪购的结束时间不同，可重新弹框）
          markFlashSaleModalShown(normalizedEndDate.getTime());
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
        flashSaleCountdownIntervalRef.current = setInterval(() => {
          checkCountdown();
        }, 1000);
      }
    };

    // 开始检查
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
    loading,
    isFocused,
    getFirstFlashSaleProduct,
    normalizeDateValue,
  ]);

  // 当用户数据刷新后，如果已有邮箱，自动设置验证标记
  // 必须在所有早期返回之前，确保 hooks 调用顺序一致
  useEffect(() => {
    // 检查组件是否还在挂载，并且用户类型不是 GUEST（避免退出登录时的状态更新）
    // 同时检查 customer 是否存在，避免退出登录时 customer 为 null 导致的问题
    if (mount.current && hasEmail && getRxUserType !== USER_GUEST && customer) {
      setEmailVerified(true);
    } else if (getRxUserType === USER_GUEST || !customer) {
      // 退出登录或 customer 不存在时，重置验证标记
      setEmailVerified(false);
    }
  }, [hasEmail, getRxUserType, customer]);

  /**
   * ----------------------------------------- *
   * @function handleFlashSaleModalClose
   * @summary 关闭Flash Sale弹窗
   * ----------------------------------------- *
   */
  const handleFlashSaleModalClose = useCallback(() => {
    setShowFlashSaleEndedModal(false);
  }, []);

  /**
   * ----------------------------------------- *
   * @function handleFlashSaleModalRefresh
   * @summary Flash Sale弹窗点击「刷新」：刷新当前购物车数据，
   * 并广播通知其他页面（PLP/PDP/Checkout）回到前台时静默刷新
   * ----------------------------------------- *
   */
  const handleFlashSaleModalRefresh = useCallback(() => {
    // 广播：其他 3 个页面重新获得焦点时各自静默刷新一次
    notifyFlashSaleEndedRefreshed();
    // 本页立即刷新，并标记本页已消费本次广播（返回本页时不重复刷新）
    markFlashSaleSilentRefreshed(flashSalePageKeyRef.current);
    onRefreshCart();
    // 弹框组件会在 onRefresh 完成后自行调用 onClose 关闭
  }, [onRefreshCart]);

  /**
   * ----------------------------------------- *
   * @function handleEmailVerificationModalClose
   * @summary 关闭邮箱验证弹窗
   * ----------------------------------------- *
   */
  const handleEmailVerificationModalClose = useCallback(() => {
    setShowEmailVerificationRequiredModal(false);
  }, []);

  /**
   * ----------------------------------------- *
   * @function handleSendVerificationCode
   * @summary 发送邮箱验证码
   * ----------------------------------------- *
   */
  const handleSendVerificationCode = useCallback(
    async email => {
      // 验证邮箱格式
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!email || !email.trim()) {
        throw new Error('Please enter your email address');
      }
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      try {
        setEmailVerificationLoading(true);

        // 发送验证码（在 checkout 场景中，可能不需要 accessToken）
        const res = await sendEmailVerification({
          params: {
            email: email.trim(),
            accessToken: '', // checkout 场景中用户已登录，可能不需要
          },
          paramsOpt: {isReturn: true},
        });

        const resData = res?.data?.verifyEmail;
        const isSuccess =
          resData?.status === 'SUCCESS' ||
          resData?.status === 'success' ||
          resData?.status === true ||
          resData?.status === 'SENT_VERIFIED_EMAIL';

        if (isSuccess) {
          // 保存邮箱，用于后续验证
          setEmailToVerify(email);

          // 刷新用户数据，获取更新后的邮箱信息
          if (refetchUserData && mount.current) {
            await refetchUserData({
              paramsOpt: {opts: {fetchPolicy: 'network-only'}}, // 强制从服务器获取最新数据
            });
          }
        } else {
          // 发送失败，抛出错误
          throw new Error(
            resData?.message || 'Failed to send verification code',
          );
        }
      } catch (err) {
        console.error('Failed to send verification code:', err);
        const errorMessage =
          err?.message || err?.toString() || 'Failed to send verification code';
        throw new Error(errorMessage);
      } finally {
        setEmailVerificationLoading(false);
      }
    },
    [sendEmailVerification, refetchUserData],
  );

  /**
   * ----------------------------------------- *
   * @function handleConfirmVerification
   * @summary 处理邮箱验证码确认
   * ----------------------------------------- *
   */
  const handleConfirmVerification = useCallback(
    async otp => {
      if (!emailToVerify) {
        throw new Error('Email is required');
      }

      try {
        setEmailVerificationLoading(true);

        // 确认邮箱验证
        const res = await confirmEmailVerification({
          params: {
            otp: otp,
            email: emailToVerify,
            isCheckoutVerify: true,
          },
          paramsOpt: {isReturn: true},
        });

        const resData = res?.data?.confirmEmailVerification;
        const isSuccess =
          resData?.status === 'SUCCESS' ||
          resData?.status === 'success' ||
          resData?.status === true;

        if (isSuccess) {
          // 检查组件是否还在挂载状态，避免在退出登录时执行
          if (!mount.current) {
            return;
          }

          // 标记邮箱已验证
          setEmailVerified(true);

          // 关闭弹窗
          setShowEmailVerificationRequiredModal(false);
          setEmailToVerify('');
          rxAppSnackbar({
            message: resData?.message || 'Email verified successfully',
            type: 'success',
          });

          // 刷新用户数据，强制从服务器获取最新数据
          if (refetchUserData && mount.current) {
            await refetchUserData({
              paramsOpt: {opts: {fetchPolicy: 'network-only'}}, // 强制从服务器获取最新数据
            });
          }

          // 再次检查组件是否还在挂载状态，避免在退出登录时执行导航
          if (!mount.current) {
            return;
          }

          // 验证成功后，直接继续 checkout 流程（跳过邮箱检查，因为已经验证成功）
          if (items?.length && modules?.cart_checkout) {
            const checkoutRes = await onGetAllowCheckout({
              paramsOpt: {isReturn: true},
            });

            // 再次检查组件是否还在挂载状态
            if (!mount.current) {
              return;
            }

            const checkoutResData = checkoutRes?.data?.storeConfig;
            if (checkoutResData) {
              if (
                checkoutResData?.temporary_customer_group_allow_checkout &&
                false
              ) {
                if (modules?.main_home) {
                  navigateTo(modules.main_home.enable, modules.main_home.name);
                }
              } else {
                AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.CHECKOUT_BUTTON);
                AnalyticsHelper.eventBeginCheckout({cartItems: items});
                // 打标：购物车主动去结算，checkout 据此跳过 resetAutoApplyVoucher
                rxCartFromCart(true);
                navigateTo(
                  modules.cart_checkout.enable,
                  modules.cart_checkout.name,
                );
              }
            }
          }
        } else {
          // 验证失败，抛出错误
          throw new Error(resData?.message || 'Email verification failed');
        }
      } catch (err) {
        console.error('Failed to verify email:', err);
        const errorMessage =
          err?.message || err?.toString() || 'Failed to verify email';
        throw new Error(errorMessage);
      } finally {
        setEmailVerificationLoading(false);
      }
    },
    [
      emailToVerify,
      confirmEmailVerification,
      refetchUserData,
      items,
      onGetAllowCheckout,
    ],
  );

  // 所有 hooks 必须在条件性返回之前调用
  if (!modules.guest_add_to_cart.enable && getRxUserType === USER_GUEST) {
    // stayAfterSignin：登录成功后不执行 navigateAfterSignin 的导航重置，
    // 购物车 tab 保持挂载，rxUserType 变为 customer 后此处自动显示购物车内容
    return <ViewLogin route={{params: {stayAfterSignin: true}}} />;
  }

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  // 在所有 hooks 调用之后检查条件
  if (!modules.cart.enable) {
    return null;
  }

  if (!modules.guest_add_to_cart.enable && getRxUserType === USER_GUEST) {
    // stayAfterSignin：登录成功后不执行 navigateAfterSignin 的导航重置，
    // 购物车 tab 保持挂载，rxUserType 变为 customer 后此处自动显示购物车内容
    return <ViewLogin route={{params: {stayAfterSignin: true}}} />;
  }

  const controllerProps = {
    t,
    loading: loading || resetPointsLoading,
    // loadingDiscount,
    loadingCartRefreshPromo,
    isEmptyCart,
    // cmsBlock,
    // showModal,
    // setShowModal,
    onNavigateToCheckout,
    onNavigateToProductDetail,
    onNavigateToCartDetail,
    cartId: getRxCartId,
    cartItems: items,
    cartPrices: price,
    // cartItemsDiscount: discount,
    userType: getRxUserType,
    onRefreshCart,
    getPrice,
    getPriceByResetPoints,
    getTieringNudge: getRxCartTieringNudge,
    // getDiscount,
    loadingPrice: loadingPrice || resetPointsLoading,
    expand,
    setExpand,
    freeshipThreshoud,
    shippingAmount: getRxCartShippingAmount,
    showFlashSaleEndedModal,
    showGiftSelectionModal,
    setShowGiftSelectionModal,
    onFlashSaleModalClose: handleFlashSaleModalClose,
    onFlashSaleModalRefresh: handleFlashSaleModalRefresh,
    showEmailVerificationRequiredModal,
    onSendVerificationCode: handleSendVerificationCode,
    onConfirmVerification: handleConfirmVerification,
    emailVerificationLoading,
    onCloseEmailVerificationModal: handleEmailVerificationModalClose,
  };

  return <Views {...controllerProps} />;
};

export default Cart;
