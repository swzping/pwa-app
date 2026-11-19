import React, {useCallback, useEffect, useRef, useState} from 'react';

import {useNavigation} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import Clipboard from '@react-native-clipboard/clipboard';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account_purchases_detail/_view';
import {
  CANCEL_ORDER,
  GET_CUSTOMER_ORDERS_DETAIL,
  GET_INVOICE_URL,
  GET_ORDER_CANCEL_CONFIG,
  GET_PRODUCT_THUMBNAIL,
  GET_REORDER_ITEMS_DATA_CART,
} from '@app/_modules/account_purchases_detail/services/schema';
import {navigateTo} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import client from '@app/services/api';
import {
  rxAppSnackbar,
  rxCartDataBackupItem,
  rxCartDataItem,
  rxCartId,
  rxRefreshOrderDetail,
  rxUserInformation,
} from '@app/services/cache';

const PurchaseDetail = ({route}) => {
  if (!modules.account_purchases_detail.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @var hooks
   * ---------------------------------------------------- *
   */
  const {email, order_number} = route.params;
  // prettier-ignore
  let filterInput = email === undefined ? {ids: {eq: order_number}} : {email, ids: {eq: order_number}};
  const [urlKeyProduct] = useState([]);
  const [detailOrder, setDetailOrder] = useState({});
  const [products, setProducts] = useState([]);
  const [itemQty, setItemQty] = useState(0);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [reasonList, setReasonList] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [copyAlert, setCopyAlert] = useState(false);

  const {t} = useTranslation();
  const navigation = useNavigation();

  const getRxRefreshOrderDetail = useReactiveVar(rxRefreshOrderDetail);

  const getShipments = _.get(detailOrder, 'shipments');

  /**
   * ---------------------------------------------------- *
   * @effect 加载取消订单原因列表（storeConfig，§7）
   * @summary 原因由后台配置，发送时将 description 原样作为
   *          reason；"Others" 固定排最后（弹窗按最后一项
   *          显示备注输入框）
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    let mounted = true;
    const loadCancelReasons = async () => {
      try {
        const res = await client.query({
          query: GET_ORDER_CANCEL_CONFIG,
          fetchPolicy: 'no-cache',
        });
        const reasons =
          _.get(res, 'data.storeConfig.order_cancellation_reasons') || [];
        const descriptions = reasons
          .map(item => item?.description)
          .filter(Boolean);
        descriptions.sort((a, b) => {
          if (a === 'Others') {
            return 1;
          }
          if (b === 'Others') {
            return -1;
          }
          return 0;
        });
        if (mounted) {
          setReasonList(
            descriptions.map((value, index) => ({key: index + 1, value})),
          );
        }
      } catch (err) {
        console.log('[order detail] load cancel reasons failed', err);
      }
    };
    loadCancelReasons();
    return () => {
      mounted = false;
    };
  }, []);

  /**
   * ---------------------------------------------------- *
   * @constant isVaOrPendingPayment
   * @summary 标识：付款方式为 BCA/Mandiri VA（name/type 含 bca 或 mandiri 并且 订单状态为待付款（pending_payment）时为 true
   * ---------------------------------------------------- *
   */
  const paymentMethod = _.get(detailOrder, 'payment_methods[0]', {}) || {};
  const isVaOrPendingPayment =
    /bca|mandiri/i.test(
      `${paymentMethod.name || ''} ${paymentMethod.type || ''}`,
    ) && detailOrder?.status === 'pending_payment';

  const {
    data,
    loading,
    error,
    onRefetchData: refreshOrderDetail,
  } = useCustomQuery({
    schema: GET_CUSTOMER_ORDERS_DETAIL,
    useInitData: true,
    opts: {fetchPolicy: 'cache-first', context: {method: 'GET'}},
    variables: {
      filters: filterInput,
      filter: {number: {eq: order_number}},
    },
  });

  const {data: thumbnailProduct, onRefetchData} = useCustomQuery({
    schema: GET_PRODUCT_THUMBNAIL,
    useInitData: false,
    variables: {
      urlKeys: urlKeyProduct,
    },
  });

  const {onRefetchData: reorderCartHook} = useCustomMutation({
    schema: GET_REORDER_ITEMS_DATA_CART,
  });

  const {onRefetchData: getInvoiceUrl} = useCustomQuery({
    schema: GET_INVOICE_URL,
    configErr: {isBypass: true},
  });

  const accountInformation = useReactiveVar(rxUserInformation);
  useEffect(() => {
    if (data && data?.data) {
      const {items} = data?.data.customer.orders;
      const newData = items[0];
      if (urlKeyProduct?.length === 0) {
        for (let i = 0; i < newData?.items?.length; i++) {
          urlKeyProduct.push(newData.items[i].product_url_key);
        }
      }
      onRefetchData({
        params: {
          urlKeys: urlKeyProduct,
        },
      });
      setDetailOrder(newData);
    }
  }, [data]);

  useEffect(() => {
    if (thumbnailProduct && thumbnailProduct?.data) {
      if (detailOrder?.items.length > 0) {
        let totalQty = 0;
        // 每次都重建新数组再 setProducts，禁止直接 push 旧 state 数组，
        // 否则刷新后 thumbnailProduct 引用变化重复触发本 effect，item 会成倍重复
        const newProducts = [];
        for (let i = 0; i < detailOrder?.items.length; i++) {
          if (detailOrder.items[i]?.is_gwp) {
            continue;
          }

          let tmpData = [];
          // fix mapping new image  with filter product_url_key
          let tmpThumbnail = thumbnailProduct.data.products.items.find(
            item =>
              item?.thumbnail?.label?.includes(
                detailOrder?.items[i]?.product_name,
              ) ||
              detailOrder?.items[i]?.product_name.includes(
                item?.thumbnail?.label,
              ) ||
              item?.url_key?.includes(detailOrder?.items[i]?.product_url_key) ||
              detailOrder?.items[i]?.product_url_key.includes(
                item?.thumbnail?.url_key,
              ),
          );
          totalQty = totalQty + detailOrder.items[i].quantity_ordered;

          /**
           * kode untuk produk dengan tipe configurable
           * ambil thumbnail dari variant
           */
          let variantThumbnail;
          // 闪购兜底：后台结算未对 configurable 变体应用闪购时，订单快照
          // is_flash_sale_item=false（成交价=原价），订单页因此不显示闪购角标。
          // 这里改用商品“当前”闪购状态做兜底——变体项取匹配子变体的
          // is_flash_sale，simple 项取父级自身的 is_flash_sale。
          let currentFlashSaleFlag;
          // 匹配到的子变体 uid：跳 PDP 时按 uid 精确预选变体（sku 会被父级 sku 污染，不可靠）
          let matchedVariantUid;
          if (tmpThumbnail?.variants?.length) {
            const findThumbnail = tmpThumbnail.variants.find(
              variant =>
                variant.product.sku === detailOrder.items[i].product_sku,
            );
            if (findThumbnail) {
              variantThumbnail = {
                thumbnail: findThumbnail?.product?.thumbnail,
              };
              currentFlashSaleFlag = findThumbnail?.product?.is_flash_sale;
              matchedVariantUid = findThumbnail?.product?.uid;
            }
          }
          if (currentFlashSaleFlag === undefined) {
            currentFlashSaleFlag = tmpThumbnail?.is_flash_sale;
          }
          // end tipe configurable

          const isFlashSaleTruthy = v => v === 1 || v === true || v === '1';
          const snapshotIsFlashSale = isFlashSaleTruthy(
            detailOrder.items[i]?.is_flash_sale_item,
          );

          tmpData = {
            ...tmpThumbnail,
            ...detailOrder.items[i],
            ...variantThumbnail,
            // tmpThumbnail 的父级 sku（如 grace-config-prod1）会盖住变体 sku，
            // 使 ListCart 取到父 sku、PDP 按 sku 预选匹配不到而回落到默认第一个变体。
            // 这里显式回填订单项的 product_sku（变体级），并带上匹配到的变体 uid，
            // ListCart 跳 PDP 时会透传 uid，让 PDP 按 uid 精确预选对应变体与闪购上下文。
            sku: detailOrder.items[i]?.product_sku || tmpThumbnail?.sku,
            uid: matchedVariantUid,
            // 快照或当前任一为闪购即展示角标（ListCart 在 view-only 下读 is_flash_sale_item）
            is_flash_sale_item:
              snapshotIsFlashSale || isFlashSaleTruthy(currentFlashSaleFlag),
          };
          newProducts.push(tmpData);
        }
        setProducts(newProducts);
        setItemQty(totalQty);
      }
    }
  }, [thumbnailProduct]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCopyAlert(null);
    }, 1500);
    return () => clearTimeout(timer);
  }, [copyAlert]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (getRxRefreshOrderDetail) {
        rxRefreshOrderDetail(false);
        refreshOrderDetail({
          params: {
            filters: filterInput,
            filter: {number: {eq: order_number}},
          },
        });
      }
    });
    return unsubscribe;
  }, [navigation, getRxRefreshOrderDetail, rxRefreshOrderDetail]);

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail product
   * ---------------------------------------------------- *
   */
  const onNavigateToProductDetail = ({productUrlKey, productSku, uid}) => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
      productSku,
      // 变体商品带上匹配到的子变体 uid，PDP 据此精确预选规格并带出闪购上下文
      uid,
    });
  };

  const onCopy = async value => {
    await Clipboard.setString(String(value));
    setCopyAlert(true);
  };

  const onCancelOrder = () => {
    setModalVisible(true);
  };

  const onContinuePayment = () => {}; // §3: 跳转到支付页面

  const onReturnedProduct = () => {
    // §2 §11: 携带 returnable_quantity / refundable_unit_price 等真实数据
    const orderItems = (products || []).map(item => ({
      id: item.id,
      name: item.product_name,
      sku: item.product_sku,
      image_url: _.get(item, 'thumbnail.url', '') || item.image_url || '',
      quantity_ordered: item.quantity_ordered,
      returnable_quantity: item.returnable_quantity ?? 0,
      refundable_unit_price: item.refundable_unit_price || null,
      is_gwp: item.is_gwp,
      product_url_key: item.product_url_key,
    }));

    navigateTo(modules.returned_product.enable, modules.returned_product.name, {
      orderNumber: order_number,
      orderUid: _.get(detailOrder, 'id'),
      orderItems,
      eligibility: _.get(detailOrder, 'return_eligibility') || null,
      paymentMethod: _.get(detailOrder, 'payment_methods[0].name', ''),
    });
  };

  const onRefundDetail = () => {
    // §5: CustomerOrder.returns 取最新一条退货单。
    // 该环境 Returns 类型的主键是 id；customer.return(uid:) 期望 base64
    // 格式的 uid（同文档 §4 示例 MjE2 = base64("216")），纯数字时兜底转换。
    const rawReturnId = _.get(detailOrder, 'returns.items[0].uid');
    const returnUid =
      rawReturnId != null && /^\d+$/.test(String(rawReturnId))
        ? global.btoa(String(rawReturnId))
        : rawReturnId;
    navigateTo(modules.refund_detail.enable, modules.refund_detail.name, {
      orderNumber: order_number,
      returnUid,
    });
  };

  const onPayNow = () => {
    // 跳转到支付页面
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressReorder
   * @summary to reorder product and navigate to cart
   * ---------------------------------------------------- *
   */
  const onPressReorder = useCallback(async () => {
    const res = await reorderCartHook({
      params: {
        orderNumber: order_number,
      },
      paramsOpt: {isReturn: true},
    });

    const newCartId = _.get(res, 'data.reorderItems.cart.id');
    if (newCartId) {
      // 更新内存中的 cart ID
      // 注意：需要先更新 rxCartId，让购物车页面用新 cart ID 去查询
      rxCartId(newCartId);

      // 保存到本地存储，确保重启后也能读取到新 cart
      await Storage.set(Storage.name.CART_ID, newCartId);
      await Storage.set(Storage.name.CART_ID_GUEST, null);

      // 清除 Apollo Cache 中 Cart 相关的缓存，
      // 否则 Apollo 会尝试合并新旧 cart 的数据，导致 items 变成空数组
      client.cache.evict({id: 'ROOT_QUERY', fieldName: 'cart'});
      client.cache.gc();

      // 获取当前购物车商品数量
      const currentCartItems = rxCartDataItem();
      const isCartEmpty = !currentCartItems || currentCartItems.length === 0;

      if (isCartEmpty) {
        // 购物车为空，主动清空并重新获取
        rxCartDataItem([]);
        rxCartDataBackupItem([]);
      }

      // 购物车不为空时不处理，后端会把 reorder 商品合并到当前购物车
    }

    navigateTo(modules.cart.enable, modules.cart.name);
  }, [order_number, reorderCartHook]);

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToDeliveryDetails
   * @summary navigate to track order detail page
   * ---------------------------------------------------- *
   */
  const onNavigateToDeliveryDetails = deliveryData => {
    const params = {
      email: accountInformation.email || '',
      orderId: order_number || '',
      deliverAddress: deliveryData.shippingAddress || '',
    };
    navigateTo(
      modules.account_trackorder.enable,
      modules.account_trackorder.name,
      params,
    );
  };

  const onDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const res = await getInvoiceUrl({
        params: {orderIncrementId: order_number},
        paramsOpt: {isReturn: true},
      });
      const invoiceUrl = res?.data?.invoiceUrl;
      return invoiceUrl;
    } catch (err) {
      throw err;
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const onConfirmReason = async reason => {
    if (cancelling) {
      return;
    }
    setModalVisible(false);
    try {
      setCancelling(true);
      // §7: reason = 所选 description 原样；Others 时备注作为 reason_note
      const isOther = reason?.value === 'Others';
      const res = await client.mutate({
        mutation: CANCEL_ORDER,
        variables: {
          id: String(_.get(detailOrder, 'id', '')),
          reason: reason?.value,
          note: isOther ? reason?.other || null : null,
        },
      });
      // 成功 = errorV2 为 null；失败信息在 errorV2.message
      const errorV2 = _.get(res, 'data.cancelOrder.errorV2');
      if (errorV2) {
        rxAppSnackbar({message: errorV2.message || 'Failed to cancel order'});
        return;
      }
      rxAppSnackbar({
        message: 'Order canceled successfully',
        type: 'success',
      });
      refreshOrderDetail({
        params: {
          filters: filterInput,
          filter: {number: {eq: order_number}},
        },
      });
    } catch (err) {
      rxAppSnackbar({
        message: err?.message || 'Failed to cancel order, please try again',
      });
    } finally {
      setCancelling(false);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @constant expire refresh
   * @summary 支付倒计时（非 BCA 的 CountdownTimer 与 BCA 的
   *          BcaVaCard 共用 onExpire）到期后的页面刷新：
   *          到期瞬间后端的自动取消可能尚未生效，单次刷新
   *          很可能仍返回 pending_payment；此时 useCountdown
   *          已停表且不会再触发 onExpire（expiredRef 已置位），
   *          页面会永远停在"待付款 + 00:00:00"。
   *          因此到期后先立即刷新一次，若订单仍是
   *          pending_payment，则按固定间隔继续刷新，直到
   *          状态变化（已取消/已支付）或达到重试上限。
   * ---------------------------------------------------- *
   */
  const EXPIRE_REFRESH_DELAY_MS = 5000;
  const EXPIRE_REFRESH_MAX_RETRY = 6;
  const expireRefreshTimerRef = useRef(null);
  const expireRetryCountRef = useRef(0);
  const awaitingCancelAfterExpireRef = useRef(false);

  const refreshOrderDetailData = () => {
    refreshOrderDetail({
      params: {
        filters: filterInput,
        filter: {number: {eq: order_number}},
      },
    });
  };

  const clearExpireRefreshTimer = () => {
    if (expireRefreshTimerRef.current) {
      clearTimeout(expireRefreshTimerRef.current);
      expireRefreshTimerRef.current = null;
    }
  };

  const scheduleExpireRefresh = () => {
    clearExpireRefreshTimer();
    expireRefreshTimerRef.current = setTimeout(() => {
      expireRefreshTimerRef.current = null;
      if (!awaitingCancelAfterExpireRef.current) {
        return;
      }
      refreshOrderDetailData();
      if (expireRetryCountRef.current < EXPIRE_REFRESH_MAX_RETRY) {
        expireRetryCountRef.current += 1;
        scheduleExpireRefresh();
      } else {
        // 超过重试上限仍未变化（后端取消延迟异常），停止轮询
        awaitingCancelAfterExpireRef.current = false;
      }
    }, EXPIRE_REFRESH_DELAY_MS);
  };

  const onExpire = () => {
    awaitingCancelAfterExpireRef.current = true;
    expireRetryCountRef.current = 0;
    // 到期立即刷新一次（同取消订单成功后的刷新，页面显示 loading 骨架）
    refreshOrderDetailData();
    // 延迟复查；若状态仍未变化会继续按间隔刷新（见上方 @summary）
    scheduleExpireRefresh();
  };

  // 刷新返回后检查最新状态：不再是待付款（后端已自动取消/用户已支付/
  // 用户手动取消）就停止轮询
  useEffect(() => {
    if (
      awaitingCancelAfterExpireRef.current &&
      detailOrder?.status &&
      detailOrder.status !== 'pending_payment'
    ) {
      awaitingCancelAfterExpireRef.current = false;
      clearExpireRefreshTimer();
    }
  }, [detailOrder]);

  // 卸载时清理轮询定时器
  useEffect(() => clearExpireRefreshTimer, []);

  const controllerProps = {
    t,
    error,
    loading,
    itemQty,
    detailOrder,
    isVaOrPendingPayment,
    getShipments,
    products,
    reasonList,
    copyAlert,
    modalVisible,
    cancelling,
    setCopyAlert,
    setModalVisible,
    onCopy,
    onCancelOrder,
    onReturnedProduct,
    onRefundDetail,
    onPayNow,
    onPressReorder,
    onNavigateToProductDetail,
    onNavigateToDeliveryDetails,
    onDownloadInvoice,
    downloadingInvoice,
    onConfirmReason,
    onExpire,
    onContinuePayment,
  };

  return <Views {...controllerProps} />;
};

export default PurchaseDetail;
