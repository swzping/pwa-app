import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert} from 'react-native';

import {useApolloClient, useMutation, useReactiveVar} from '@apollo/client';
import crashlytics from '@react-native-firebase/crashlytics';
import {apolloConfig} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import i18next from 'i18next';

import AnalyticsHelper from '@app/helpers/Analytics';
// todo
import {
  CART_ID_CART,
  TYPENAME_BUNDLE,
  TYPENAME_CONFIGURABLE,
  TYPENAME_VIRTUAL,
  USER_CUSTOMER,
} from '@app/helpers/Constants';
import {Storage} from '@app/helpers/Storage';
import {updateProductCartItemMap} from '@app/hooks/carts/addToCart';
import cartSchema, {UPDATE_CONFIGURABLE_OPTIONS} from '@app/hooks/carts/schema';
import wishlistHelpers from '@app/hooks/carts/wishlistHelpers';
import {onHandleError} from '@app/hooks/customer/useDataCustomer';
import useSwitchQuery from '@app/hooks/useSwitchQuery';
import clientGQL from '@app/services/api';
import {
  rxAppSnackbar,
  rxCartAppliedCoupon,
  rxCartAppliedRewardPoint,
  rxCartAppliedStoreCredit,
  rxCartAvailablePaymentMethod,
  rxCartBillingAddress,
  rxCartDataAddress,
  rxCartDataBackupItem,
  rxCartDataInformation,
  rxCartDataItem,
  rxCartDataItemBlockSubtotal,
  rxCartDataItemDiscount,
  rxCartDataPrice,
  rxCartExtraFee,
  rxCartGiftCard,
  rxCartId,
  rxCartInfo,
  rxCartIsVirtual,
  rxCartItems,
  rxCartPayment,
  rxCartPaymentMethod,
  rxCartPickupStore,
  rxCartPrices,
  rxCartProcessingAPICount,
  rxCartQty,
  rxCartSelectedPaymentMethod,
  rxCartShipping,
  rxCartShippingAddress,
  rxCartShippingAmount,
  rxCartShippingMethod,
  rxCartSnapUrl,
  rxCartTieringNudge,
  rxProductIdCartItemIdMap,
  rxUserType,
  rxUserWIshlistItems,
} from '@app/services/cache';
import {CREATE_EMPTY_CART} from '@app/services/queries/cart';
import {GET_FREE_GIFT_RULES} from '@app/services/queries/gwp';

export const TYPES = {
  ITEM: 'ITEM',
  ITEM_CUSTOM_PRICE: 'ITEM_CUSTOM_PRICE',
  ITEM_BLOCK_SUBTOTAL: 'ITEM_BLOCK_SUBTOTAL',
  ITEM_DISCOUNT: 'ITEM_DISCOUNT',
  ADDRESS: 'ADDRESS',
  PRICE: 'PRICE',
  PRICE_SIMPLE: 'PRICE_SIMPLE',
  INFO: 'INFO',
  APPLIED_COUPON: 'APPLIED_COUPON',
  APPLIED_GIFTCARD: 'APPLIED_GIFTCARD',
  APPLIED_REWARD_POINT: 'APPLIED_REWARD_POINT',
  APPLIED_STORE_CREDIT: 'APPLIED_STORE_CREDIT',
  AVAILABLE_PAYMENT: 'AVAILABLE_PAYMENT',
  SELECTED_PAYMENT: 'SELECTED_PAYMENT',
};

/**
 * ---------------------------------------------------- *
 * @function getEmptyCart
 * @summary for get new/merge cart id
 * ---------------------------------------------------- *
 */

// 并发去重:多个请求同时因失效 cart id 失败时,只触发一次 createEmptyCart,
// 其余调用复用同一个进行中的 Promise
let getEmptyCartInFlight = null;

export const getEmptyCart = async (retryCounter = 0) => {
  if (getEmptyCartInFlight) {
    return getEmptyCartInFlight;
  }
  getEmptyCartInFlight = doCreateEmptyCart(retryCounter).finally(() => {
    getEmptyCartInFlight = null;
  });
  return getEmptyCartInFlight;
};

const doCreateEmptyCart = async (retryCounter = 0) => {
  const userType = rxUserType();
  try {
    const res = await clientGQL.mutate({mutation: CREATE_EMPTY_CART});
    crashlytics().setAttribute(
      CART_ID_CART,
      _.get(res, 'data.createEmptyCart'),
    );
    if (typeof res?.data?.createEmptyCart !== 'string') {
      throw new Error('Cart ID invalid type');
    }

    await Storage.set(Storage.name.CART_ID, res.data.createEmptyCart);

    if (userType === USER_CUSTOMER) {
      const guestCartId = await Storage.get(Storage.name.CART_ID_GUEST);
      if (guestCartId) {
        await Storage.set(Storage.name.CART_ID_GUEST, null);

        // TODO: remove guest cart merge logic
        // await clientGQL.mutate({
        //   mutation: MERGE_CARTS,
        //   variables: {
        //     source_cart_id: guestCartId,
        //     destination_cart_id: res.data.createEmptyCart,
        //   },
        // });
      }
    } else {
      await Storage.set(Storage.name.CART_ID_GUEST, res.data.createEmptyCart);
    }

    rxCartId(res.data.createEmptyCart);

    return res.data.createEmptyCart;
  } catch (err) {
    console.log('[err] use cart', err);
    Alert.alert(
      i18next.t('cart.updating'),
      i18next.t('cart.productIsUpdating'),
      [
        {
          text: retryCounter < 2 ? 'Retry' : 'OK',
          onPress: () => {
            if (retryCounter < 2) {
              getEmptyCart(retryCounter + 1);
            }
          },
        },
      ],
      {cancelable: false},
    );
  }
};

/**
 * ---------------------------------------------------- *
 * @function onClearAllDataCart
 * @summary for clearing all data cart
 * ---------------------------------------------------- *
 */
export const onClearAllDataCart = () => {
  rxCartPayment([]);
  rxCartGiftCard(null);
  rxCartAppliedCoupon(null);
  rxCartAppliedStoreCredit(null);
  rxCartAppliedRewardPoint(null);
  rxCartSelectedPaymentMethod(null);
  rxCartAvailablePaymentMethod(null);
  rxCartBillingAddress(null);
  rxCartItems(null);
  rxCartId(null);
  rxCartIsVirtual(false);
  rxCartQty(0);
  rxCartPrices(null);
  rxCartExtraFee(null);
  rxCartPaymentMethod(null);
  rxCartPickupStore(null);
  rxCartShipping([]);
  rxCartShippingAmount(null);
  rxCartShippingAddress(null);
  rxCartShippingMethod(null);
  rxCartInfo(null);
  rxProductIdCartItemIdMap({});
  rxCartSnapUrl(null);
  rxCartDataInformation(null);
  rxCartDataItem([]);
  rxCartDataAddress(null);
  rxCartDataPrice(null);
  rxCartDataItemBlockSubtotal([]);
  rxCartDataItemDiscount([]);
};

/**
 * use for clear all local cart & get new empty cart
 */
export const onResetNewCart = () => {
  onClearAllDataCart();
  getEmptyCart();
};

export const incrementProcessingAPICount = () => {
  rxCartProcessingAPICount(rxCartProcessingAPICount() + 1);
};

export const decrementProcessingAPICount = () => {
  if (rxCartProcessingAPICount() > 0) {
    rxCartProcessingAPICount(rxCartProcessingAPICount() - 1);
  }
};

export const resetProcessingAPICount = () => {
  rxCartProcessingAPICount(0);
};

/**
 * ---------------------------------------------------- *
 * @function warmProductCartItemMap
 * @summary 轻量预热 rxProductIdCartItemIdMap（仅跑 getCartInformation，
 * 取 items 的 id/quantity/sku）。列表卡片与 PDP 底部加购按钮靠这张表判断
 * "商品是否已在购物车"，命中才渲染数量步进器（− qty +），否则显示 "Add to cart"。
 * 此前只有首页 useCarts({initialized:true,type:TYPES.INFO}) 会填充它，冷启动
 * 直接从搜索页/深链等入口进 PDP 时表仍为空，已在购物车的商品会错误显示按钮。
 * ---------------------------------------------------- *
 */
export const warmProductCartItemMap = async () => {
  try {
    const cartID = rxCartId() || (await Storage.get(Storage.name.CART_ID));
    if (typeof cartID !== 'string' || !cartID) {
      return;
    }
    const res = await clientGQL.query({
      query: cartSchema().getCartInformation,
      variables: {cartID},
      fetchPolicy: 'network-only',
    });
    const cart = _.get(res, 'data.cart');
    if (!cart) {
      return;
    }
    if (typeof cart.total_quantity === 'number') {
      rxCartQty(cart.total_quantity);
    }
    updateProductCartItemMap(cart.items);
  } catch (err) {
    console.log('[warmProductCartItemMap] error', err);
  }
};

const mapFreeGiftDataToCartItem = (gift, parentItem, index) => {
  const price = _.get(gift, 'price') || {};
  const sku = _.get(gift, 'sku');
  const name = _.get(gift, 'name');
  const imageUrl = _.get(gift, 'image_url');
  const quantity = _.get(gift, 'qty') || 1;
  const parentId =
    _.get(parentItem, 'id') ||
    _.get(parentItem, 'uid') ||
    _.get(parentItem, 'product.sku');
  const parentSku =
    _.get(parentItem, 'product.sku') || _.get(parentItem, 'sku');
  const giftItemId = `${parentId}-free-gift-${parentSku || 'parent'}-${index}-${
    sku || 'gift'
  }`;

  return {
    id: giftItemId,
    is_free_gift: true,
    quantity,
    prices: {
      price: {
        currency: _.get(price, 'currency'),
        value: _.get(price, 'value'),
      },
    },
    custom_price: {
      row_total: {
        currency: _.get(price, 'currency'),
        value: _.get(price, 'value'),
      },
    },
    product: {
      id: sku,
      name: name || _.get(parentItem, 'product.name'),
      sku: sku || _.get(parentItem, 'product.sku'),
      url_key: _.get(gift, 'url_key') || _.get(parentItem, 'product.url_key'),
      stock_status: _.get(parentItem, 'product.stock_status'),
      small_image: {
        url: imageUrl,
      },
      thumbnail: {
        url: imageUrl,
      },
    },
    validOffers: [{promotion_type: 'Free Gift', name: 'Free Gift'}],
    __typename: 'SimpleCartItem',
  };
};

const normalizeFreeGiftItems = items => {
  if (!Array.isArray(items)) {
    return items;
  }

  return items.reduce((result, item) => {
    // is_free_gift 的普通赠品会被过滤；但 is_gamification_free_gift 的游戏化赠品
    // 即使 is_free_gift 为 true 也需要保留显示
    if (
      _.get(item, 'is_free_gift') &&
      !_.get(item, 'is_gamification_free_gift')
    ) {
      return result;
    }

    result.push(item);

    const freeGiftData = _.get(item, 'free_gift_data');
    const freeGiftItems = Array.isArray(freeGiftData)
      ? freeGiftData
      : freeGiftData
      ? [freeGiftData]
      : [];

    if (freeGiftItems.length > 0) {
      freeGiftItems.forEach((gift, index) => {
        result.push(mapFreeGiftDataToCartItem(gift, item, index));
      });
    }

    return result;
  }, []);
};

const useCarts = ({initialized = false, type, configErr = null, opts = {}}) => {
  const {
    data: fromNetwork,
    error,
    loading,
    queryVariables,
    onRefetchData: fetchItems,
    setSchemas,
    setQueryVariables,
  } = useSwitchQuery({
    initialized,
    withVariables: true,
    opts: {
      fetchPolicy: 'network-only',
      context: {
        method: [TYPES.ITEM_CUSTOM_PRICE, TYPES.PRICE_SIMPLE].includes(type)
          ? 'POST'
          : 'GET',
      },
      ...opts,
    },
    configErr,
  });

  /**
   * ---------------------------------------------------- *
   * @const {cartSchema}
   * @summary all schema for cart
   * ---------------------------------------------------- *
   */
  const {
    getItems,
    getItemsBlockSubtotal,
    getItemsDiscount,
    getPrice,
    getPriceSimple,
    getAddress,
    getAppliedCoupon,
    getAppliedGiftCard,
    getAppliedRewardPoint,
    getAppliedStoreCredit,
    getCartInformation,
    getSelectedPaymentMethod,
    getAvailablePaymentMethod,
    addSimpleItemToCart,
    addConfigurableItemToCart,
    addBundleItemToCart,
    addVirtualItemToCart,
    removeItemOnCart,
    updateItemOnCart,
  } = cartSchema();

  const [addSimple] = useMutation(addSimpleItemToCart);
  const [addVirtual] = useMutation(addVirtualItemToCart);
  const [addConfigurable] = useMutation(addConfigurableItemToCart);
  const [addBundle] = useMutation(addBundleItemToCart);
  const [removeItem] = useMutation(removeItemOnCart);
  const [updateConfigurableOptions] = useMutation(UPDATE_CONFIGURABLE_OPTIONS);
  const [updateQty, {loading: updateCartLoading}] =
    useMutation(updateItemOnCart);
  const [loadingCompareLocal, setLoadingCompareLocal] = useState(false);
  const [loadingPriceRefetch, setLoadingPriceRefetch] = useState(false);

  const client = useApolloClient();
  const mount = useRef();
  const cartID = useReactiveVar(rxCartId);
  const wishlists = useReactiveVar(rxUserWIshlistItems);
  const userType = useReactiveVar(rxUserType);
  const getRxCartItems = useReactiveVar(rxCartDataItem);
  const getRxCartItemsBlockSubtotal = useReactiveVar(
    rxCartDataItemBlockSubtotal,
  );
  const getRxCartAddress = useReactiveVar(rxCartDataAddress);
  const getRxCartPrice = useReactiveVar(rxCartDataPrice);
  const getRxCartInfo = useReactiveVar(rxCartInfo);
  const getRxCartSelectedPayment = useReactiveVar(rxCartSelectedPaymentMethod);
  const getRxCartAppliedCoupon = useReactiveVar(rxCartAppliedCoupon);
  const getRxCartAppliedStoreCredit = useReactiveVar(rxCartAppliedStoreCredit);
  const getRxCartAppliedRewardPoint = useReactiveVar(rxCartAppliedRewardPoint);
  const getRxCartGiftCard = useReactiveVar(rxCartGiftCard);
  const getRxCartAvailablePayment = useReactiveVar(
    rxCartAvailablePaymentMethod,
  );
  const getRxCartItemDiscount = useReactiveVar(rxCartDataItemDiscount);

  const {t} = useTranslation();

  const getSchemaByType = useCallback(() => {
    switch (type) {
      case TYPES.ITEM:
        return getItems;
      case TYPES.ITEM_BLOCK_SUBTOTAL:
        return getItemsBlockSubtotal;
      case TYPES.ITEM_DISCOUNT:
        return getItemsDiscount;
      case TYPES.ADDRESS:
        return getAddress;
      case TYPES.PRICE:
        return getPrice;
      case TYPES.ITEM_CUSTOM_PRICE:
      case TYPES.PRICE_SIMPLE:
        return getPriceSimple;
      case TYPES.SELECTED_PAYMENT:
        return getSelectedPaymentMethod;
      case TYPES.AVAILABLE_PAYMENT:
        return getAvailablePaymentMethod;
      case TYPES.INFO:
        return getCartInformation;
      case TYPES.APPLIED_COUPON:
        return getAppliedCoupon;
      case TYPES.APPLIED_GIFTCARD:
        return getAppliedGiftCard;
      case TYPES.APPLIED_REWARD_POINT:
        return getAppliedRewardPoint;
      case TYPES.APPLIED_STORE_CREDIT:
        return getAppliedStoreCredit;
      default:
        return null;
    }
  }, []);

  const schemaType = getSchemaByType();

  /**
   * ---------------------------------------------------- *
   * @dependency []
   * @summary for intialize query
   * @summary for initialize schema
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (mount) {
      mount.current = true;
      if (mount.current) {
        if (cartID) {
          setQueryVariables({cartID});
        }
        if (apolloConfig.console) {
          console.log('cartID', cartID);
        }
        setSchemas(schemaType);

        if (initialized) {
          setCart();
        }
      }
    }

    return () => (mount.current = false);
  }, []);

  /**
   * ---------------------------------------------------- *
   * @const {data}
   * @summary useMemo to filter spesific data
   * ---------------------------------------------------- *
   */
  const data = useMemo(() => {
    switch (type) {
      case TYPES.ADDRESS:
        return getRxCartAddress;
      case TYPES.ITEM_DISCOUNT:
        return getRxCartItemDiscount;
      case TYPES.PRICE:
        return getRxCartPrice;
      case TYPES.PRICE_SIMPLE:
        return getRxCartPrice;
      case TYPES.INFO:
        return getRxCartInfo;
      case TYPES.SELECTED_PAYMENT:
        return getRxCartSelectedPayment;
      case TYPES.AVAILABLE_PAYMENT:
        return getRxCartAvailablePayment;
      case TYPES.APPLIED_COUPON:
        return getRxCartAppliedCoupon;
      case TYPES.APPLIED_GIFTCARD:
        return getRxCartGiftCard;
      case TYPES.APPLIED_REWARD_POINT:
        return getRxCartAppliedRewardPoint;
      case TYPES.APPLIED_STORE_CREDIT:
        return getRxCartAppliedStoreCredit;
      case TYPES.ITEM_CUSTOM_PRICE:
        const appendWishlist_ = wishlistHelpers({
          carts: getRxCartItems,
          userType,
          wishlists,
        });
        return appendWishlist_;
      case TYPES.ITEM:
        const appendWishlist = wishlistHelpers({
          carts: getRxCartItems,
          userType,
          wishlists,
        });
        return appendWishlist;
      case TYPES.ITEM_BLOCK_SUBTOTAL:
        return getRxCartItemsBlockSubtotal;
      default:
        return getRxCartItems;
    }
  }, [
    type,
    fromNetwork,
    getRxCartPrice,
    getRxCartItems,
    getRxCartItemDiscount,
    getRxCartItemsBlockSubtotal,
    getRxCartAddress,
    getRxCartSelectedPayment,
    getRxCartAvailablePayment,
    getRxCartAppliedCoupon,
    getRxCartAppliedRewardPoint,
    getRxCartAppliedStoreCredit,
    getRxCartGiftCard,
    wishlists,
  ]);

  /**
   * ---------------------------------------------------- *
   * @const isEmptyCart
   * @summary for detect cart items were empty
   * ---------------------------------------------------- *
   */
  const isEmptyCart =
    type === TYPES.ITEM ? data === undefined || data === null : null;

  /**
   * ---------------------------------------------------- *
   * @function setCart
   * @param {params} object
   * @summary for set spesific data cart
   * ---------------------------------------------------- *
   */
  const setCart = async params => {
    // 无参调用时：若为价格类型则重新请求价格/运费，避免 UI 使用旧总额
    if (
      params == null &&
      (type === TYPES.PRICE_SIMPLE || type === TYPES.PRICE)
    ) {
      const cartId = cartID || queryVariables?.cartID;
      if (cartId) {
        setLoadingPriceRefetch(true);
        try {
          const schema =
            type === TYPES.PRICE_SIMPLE ? getPriceSimple : getPrice;
          const res = await client.query({
            query: schema,
            variables: {cartID: cartId},
            fetchPolicy: 'no-cache',
            context: {method: type === TYPES.PRICE_SIMPLE ? 'POST' : 'GET'},
          });
          const cartData = _.get(res, 'data.cart');
          if (cartData) {
            const dataPrice_ = _.get(cartData, 'prices');
            const tiering_nudge = _.get(cartData, 'tiering_nudge');
            const shippingAddresses = _.get(cartData, 'shipping_addresses');
            const cartItems_ = _.get(cartData, 'items');
            if (dataPrice_) {
              rxCartDataPrice(dataPrice_);
            }
            if (tiering_nudge) {
              rxCartTieringNudge(tiering_nudge);
            }
            if (shippingAddresses) {
              rxCartShippingAmount(shippingAddresses);
            }
            if (cartItems_) {
              const normalizedCartItems = normalizeFreeGiftItems(cartItems_);
              rxCartDataItem(normalizedCartItems);
              rxCartDataBackupItem(normalizedCartItems);
            }
          }
        } catch (err) {
          onHandleError(err);
        } finally {
          setLoadingPriceRefetch(false);
        }
      }
      return;
    }
    if (params) {
      switch (type) {
        case TYPES.ITEM:
          const rawCartItems = _.get(params, 'items');
          const cartItems = normalizeFreeGiftItems(rawCartItems);
          const cartCount = _.get(params, 'total_quantity');
          if (typeof cartCount === 'number') {
            rxCartQty(cartCount);
          }
          updateProductCartItemMap(rawCartItems);
          if (cartItems) {
            rxCartDataItem(cartItems);
            rxCartDataBackupItem(cartItems);
            resetProcessingAPICount();
          }
          break;
        case TYPES.ITEM_CUSTOM_PRICE:
          const cartItems_ = normalizeFreeGiftItems(_.get(params, 'items'));
          const cartCount_ = _.get(params, 'total_quantity');
          if (typeof cartCount_ === 'number') {
            rxCartQty(cartCount_);
          }
          if (cartItems_) {
            rxCartDataItem(cartItems_);
            rxCartDataBackupItem(cartItems_);
            resetProcessingAPICount();
          }
          AnalyticsHelper.eventViewCartGA({cartItems: cartItems_});
          break;
        case TYPES.ITEM_BLOCK_SUBTOTAL:
          const cartItemsBlockSubtotal = normalizeFreeGiftItems(
            _.get(params, 'items'),
          );
          if (cartItemsBlockSubtotal) {
            rxCartDataItemBlockSubtotal(cartItemsBlockSubtotal);
          }
          break;
        case TYPES.ITEM_DISCOUNT:
          const itemDiscount = _.get(params, 'items');
          if (itemDiscount) {
            rxCartDataItemDiscount(itemDiscount);
          }
          break;
        case TYPES.ADDRESS:
          let dataAddress = {shipping_addresses: null, billing_address: null};
          const shippingAddress = _.get(params, 'shipping_addresses');
          const billingAddress = _.get(params, 'billing_address');
          if (shippingAddress) {
            dataAddress.shipping_addresses = shippingAddress;
          }
          if (billingAddress) {
            dataAddress.billing_address = billingAddress;
          }
          rxCartDataAddress(dataAddress);
          break;
        case TYPES.PRICE:
          const dataPrice = _.get(params, 'prices');
          const shippmentPrice = _.get(params, 'shipping_addresses');
          const appliedCouponOnPrice = _.get(params, 'applied_reward_points');
          const appliedStoreCreditOnPrice = _.get(
            params,
            'applied_store_credit',
          );
          const appliedGiftCardOnPrice = _.get(params, 'applied_giftcard');
          if (dataPrice) {
            rxCartDataPrice(dataPrice);
          }
          if (shippmentPrice) {
            rxCartShippingAmount(shippmentPrice);
          }
          rxCartAppliedRewardPoint(appliedCouponOnPrice);
          rxCartAppliedStoreCredit(appliedStoreCreditOnPrice);
          rxCartGiftCard(appliedGiftCardOnPrice);

          break;
        case TYPES.PRICE_SIMPLE:
          const dataPrice_ = _.get(params, 'prices');
          const shippmentPriceShipping = _.get(params, 'shipping_addresses');
          if (dataPrice_) {
            rxCartDataPrice(dataPrice_);
          }
          if (shippmentPriceShipping) {
            rxCartShippingAmount(shippmentPriceShipping);
          }
          break;
        case TYPES.INFO:
          rxCartInfo(params);
          const cartCountInfo = _.get(params, 'total_quantity');
          if (typeof cartCountInfo === 'number') {
            rxCartQty(cartCountInfo);
          }
          updateProductCartItemMap(_.get(params, 'items'));
          break;
        case TYPES.SELECTED_PAYMENT:
          const selectedPayment = _.get(params, 'selected_payment_method');
          rxCartSelectedPaymentMethod(selectedPayment);
          break;
        case TYPES.AVAILABLE_PAYMENT:
          const availablePayment = _.get(params, 'available_payment_methods');
          rxCartAvailablePaymentMethod(availablePayment);
          break;
        case TYPES.APPLIED_COUPON:
          const appliedCoupon = params;
          rxCartAppliedCoupon(appliedCoupon);
          break;
        case TYPES.APPLIED_GIFTCARD:
          const appliedGiftCard = _.get(params, 'applied_giftcard');
          rxCartGiftCard(appliedGiftCard);
          break;
        case TYPES.APPLIED_REWARD_POINT:
          const appliedRewardPoint = _.get(params, 'applied_reward_points');
          rxCartAppliedRewardPoint(appliedRewardPoint);
          break;
        case TYPES.APPLIED_STORE_CREDIT:
          const appliedStoreCredit = _.get(params, 'applied_store_credit');
          rxCartAppliedStoreCredit(appliedStoreCredit);
          break;
        default:
          const cartItem = _.get(params, 'items');
          const cartPrice = _.get(params, 'prices');
          const cartCountServer = _.get(params, 'total_quantity');

          if (typeof cartCountServer === 'number') {
            rxCartQty(cartCountServer);
          }
          updateProductCartItemMap(_.get(params, 'items'));
          if (cartItem) {
            rxCartDataItem(normalizeFreeGiftItems(cartItem));
          }
          if (cartPrice) {
            rxCartDataPrice(cartPrice);
          }
          break;
      }
    } else {
      if (cartID) {
        await fetchItems({params: {cartID}, schemaParam: schemaType});
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const isExistInCart
   * @summary check item is exist or not in cart
   * ---------------------------------------------------- *
   */
  const isExistInCart = (
    itemInCart,
    newItem,
    skuProduct,
    selectedOptions,
    isAdd = true,
  ) => {
    const newItemTypename = isAdd
      ? newItem.__typename
      : newItem.product.__typename;

    if (
      itemInCart.product.sku === skuProduct &&
      itemInCart.product.__typename === TYPENAME_BUNDLE &&
      newItemTypename === TYPENAME_BUNDLE
    ) {
      let itemInCartValue = [];
      let newItemValue = [];

      // from cart
      itemInCart.bundle_options.map(opt => {
        const optParentId = opt.id * 100000;
        itemInCartValue.push(optParentId);
        opt.values.map(value => {
          itemInCartValue.push(optParentId + value.id);
        });
      });

      // when add to cart
      if (isAdd === true) {
        selectedOptions.map(opt => {
          const optParentId = opt.id * 100000;
          newItemValue.push(optParentId);
          opt.value.map(val => {
            newItemValue.push(optParentId + val);
          });
        });
      }
      // when remove
      else {
        newItem.bundle_options.map(opt => {
          const optParentId = opt.id * 100000;
          newItemValue.push(optParentId);
          opt.values.map(value => {
            newItemValue.push(optParentId + value.id);
          });
        });
      }

      itemInCartValue = itemInCartValue.sort().toString();
      newItemValue = newItemValue.sort().toString();

      if (itemInCartValue === newItemValue) {
        return true;
      }
      return false;
    } else if (newItem.__typename === 'ConfigurableCartItem') {
      return (
        itemInCart.__typename === 'ConfigurableCartItem' &&
        newItem.configured_variant.uid === itemInCart.configured_variant.uid
      );
    } else {
      return itemInCart.product.sku === skuProduct;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const getCartDataIsNotExistItem
   * @summary get cart items with new data that doesnt exist in cart before
   * ---------------------------------------------------- *
   */

  const getCartDataIsNotExistItem = (
    carts,
    item,
    quantity,
    skuProduct,
    selectedOptions,
  ) => {
    if (item.__typename === TYPENAME_BUNDLE) {
      let bundle_options = [];
      let newId = [];
      selectedOptions.map(opt => {
        let option = {id: opt.id, __typename: 'SelectedBundleOption'};
        let values = [];

        let findOption = item.items.find(op => op.option_id === opt.id);
        let optParentId = opt.id * 100000;
        newId.push(optParentId);

        opt.value.map(val => {
          let findValue = findOption.options.find(value => value.id === val);

          values.push({
            id: findValue.id,
            label: findValue.label,
            quantity: findValue.quantity,
            price: findValue.price,
            product: findValue.product,
            __typename: 'SelectedBundleOptionValue',
          });
          newId.push(optParentId + val);
        });
        newId = skuProduct + '-' + newId.sort().toString() + '-local';
        bundle_options.push({...option, values});
      });

      return [
        ...carts,
        {
          product: item,
          quantity,
          id: newId,
          bundle_options,
        },
      ];
    }
    return [
      ...carts,
      {
        product: item,
        quantity,
        id: `${skuProduct}-local`,
      },
    ];
  };

  /**
   * ---------------------------------------------------- *
   * @const setCartByResponse
   * @summary set cart by response for simple & configurable product
   * ---------------------------------------------------- *
   */
  const setCartByResponse = ({response, productType}) => {
    // decrement processing after API Response
    decrementProcessingAPICount();
    if (productType === TYPENAME_BUNDLE || productType === TYPENAME_VIRTUAL) {
      let dataParams = null;
      if (productType === TYPENAME_BUNDLE) {
        dataParams = _.get(response, 'data.addBundleProductsToCart.cart');
      } else {
        dataParams = _.get(response, 'data.addVirtualProductsToCart.cart');
      }

      if (rxCartProcessingAPICount() === 0) {
        if (dataParams) {
          setCart(dataParams);
          rxAppSnackbar({
            message: t('message.successProductAdded'),
          });
        } else {
          setCart({items: rxCartDataBackupItem()});
        }
      } else {
        if (dataParams) {
          rxCartDataBackupItem(dataParams.items);
        }
      }
    } else {
      const dataParams = _.get(response, 'data.addProductsToCart.cart');
      const isSuccess = _.get(
        response,
        'data.addProductsToCart.toastr_message.status',
      );
      if (rxCartProcessingAPICount() === 0) {
        if (dataParams && isSuccess) {
          setCart(dataParams);
          rxAppSnackbar({
            message: t('message.successProductAdded'),
          });
        } else {
          const errors = _.get(response, 'data.addProductsToCart.user_errors');
          setCart({items: rxCartDataBackupItem()});
          onHandleError(errors[0]);
        }
      } else {
        if (dataParams && isSuccess) {
          rxCartDataBackupItem(dataParams.items);
        }
      }
    }
  };

  /**
   * Add to cart function
   * @param {object, string, number} product product to be added, its type and quantity
   * @param {function} callback function to be called from view
   */
  const addToCart = async (
    {item, types, quantity, parentSku, selectedOptions},
    callback,
  ) => {
    if (cartID) {
      //get the sku of the product
      const skuProduct = _.get(item, 'sku');
      // get the cart items from reactive variable
      let carts = [];
      if (getRxCartItems && getRxCartItems.length > 0) {
        carts = getRxCartItems;
      }
      // add the quantity if selected product already in cart
      const existedItem = _.map(carts, function (cart) {
        return isExistInCart(cart, item, skuProduct, selectedOptions)
          ? {...cart, quantity: cart.quantity + quantity}
          : cart;
      });

      //check if product is in cart
      const isExist = _.find(carts, function (obj) {
        return isExistInCart(obj, item, skuProduct, selectedOptions);
      });

      // if existed
      const tempItem = isExist
        ? existedItem
        : getCartDataIsNotExistItem(
            carts,
            item,
            quantity,
            skuProduct,
            selectedOptions,
          );

      // set to reactive var before mutation
      setCart({items: tempItem});
      rxAppSnackbar({
        message: t('message.productAdded'),
      });

      // run the callback if exist
      if (callback) {
        await callback();
      }

      try {
        let response = null;
        incrementProcessingAPICount();
        if (types === TYPENAME_CONFIGURABLE) {
          response = await addConfigurable({
            variables: {
              cartId: cartID,
              cartItems: [
                {
                  quantity,
                  sku: skuProduct,
                },
              ],
            },
          });
        } else if (types === TYPENAME_BUNDLE) {
          response = await addBundle({
            variables: {
              input: {
                cart_id: cartID,
                cart_items: [
                  {
                    bundle_options: selectedOptions,
                    data: {
                      quantity,
                      sku: skuProduct,
                    },
                  },
                ],
              },
            },
          });
        } else if (types === TYPENAME_VIRTUAL) {
          response = await addVirtual({
            variables: {
              input: {
                cart_id: cartID,
                cart_items: [
                  {
                    customizable_options: [],
                    data: {
                      quantity,
                      sku: skuProduct,
                    },
                  },
                ],
              },
            },
          });
        } else {
          //simple product
          response = await addSimple({
            variables: {
              cartId: cartID,
              cartItems: [
                {
                  quantity,
                  sku: skuProduct,
                },
              ],
            },
          });
        }

        // start - analytics
        const resItems =
          _.get(response, 'data.addProductsToCart.cart.items') ?? [];
        const findResItem = resItems.find(
          itm => _.get(itm, 'product.id') === item?.id,
        );

        if (findResItem) {
          AnalyticsHelper.eventAddItemCart({item: findResItem, quantity});
        }
        // end - analytics

        setCartByResponse({
          response,
          productType: types,
        });
      } catch (err) {
        decrementProcessingAPICount();
        if (rxCartProcessingAPICount() === 0) {
          setCart({items: rxCartDataBackupItem()});
          onHandleError(err);
        }
      }
    }
  };

  const removeFromCart = async ({item}) => {
    if (cartID) {
      let carts = [];
      let backupCartItems = [];
      if (getRxCartItems && getRxCartItems.length > 0) {
        carts = getRxCartItems;
        backupCartItems = _.map(carts, function (obj) {
          return {...obj, edit: false, hide: false};
        });
      }

      let itemToBeRemoved = [];
      carts.map(obj => {
        if (isExistInCart(obj, item, item.product.sku, [], false)) {
          itemToBeRemoved.push({...obj, hide: true});
        } else {
          itemToBeRemoved.push({...obj});
        }
      });
      setCart({items: itemToBeRemoved});
      rxAppSnackbar({
        message: t('message.productRemoved'),
      });

      try {
        // 安全判断：当 id 为数字或 undefined 时，includes 会报错
        const idStr = item?.id != null ? String(item.id) : '';
        const isLocal = idStr.includes('local');
        if (!isLocal) {
          const input = {cart_id: cartID};
          if (item.__typename === 'ConfigurableCartItem') {
            input.cart_item_uid = item.uid;
          } else {
            input.cart_item_id = item.id;
          }
          const response = await removeItem({
            variables: {
              input,
            },
          });

          const dataParams = _.get(response, 'data.removeItemFromCart.cart');
          if (dataParams) {
            // analytics remove
            AnalyticsHelper.eventRemoveItemCartGA({
              currency: item?.custom_price?.row_total?.currency,
              value: parseInt(item?.custom_price?.row_total?.value),
              items: [
                {
                  item_id: item?.id?.toString(),
                  quantity: item?.quantity,
                  price: parseInt(item?.custom_price?.row_total?.value),
                },
              ],
            });
            setCart(dataParams);
            rxAppSnackbar({
              message: t('message.successProductRemoved'),
            });
            return true;
          } else {
            setCart({items: backupCartItems});
            return false;
          }
        }
      } catch (err) {
        setCart({items: backupCartItems});
        console.log('delete error', err);
        onHandleError(err);
        return false;
      }
    }
  };

  const updateQuantity = async ({item, qty}) => {
    if (cartID) {
      let carts = [];
      let backupCartItems = [];
      if (getRxCartItems && getRxCartItems.length > 0) {
        carts = getRxCartItems;
        backupCartItems = _.map(carts, function (obj) {
          return {...obj, edit: false, hide: false};
        });
      }

      const tempCart = _.map(carts, function (obj) {
        if (obj.id === item.id) {
          return {...obj, quantity: qty, edit: true};
        } else {
          return obj;
        }
      });

      //reactive var
      if (type !== TYPES.INFO) {
        setCart({items: tempCart});
      }
      rxAppSnackbar({
        message: t('message.qtyUpdated'),
      });

      try {
        const cart_item = {
          quantity: qty,
        };
        if (item.__typename === 'ConfigurableCartItem') {
          cart_item.cart_item_uid = item.uid;
        } else {
          cart_item.cart_item_id = item.id;
        }
        const response = await updateQty({
          variables: {
            input: {
              cart_id: cartID,
              cart_items: [cart_item],
            },
          },
        });
        const dataParams = _.get(response, 'data.updateCartItems.cart');
        if (dataParams) {
          if (type === TYPES.INFO) {
            setCart(dataParams);
            rxAppSnackbar({
              message: t('message.successQtyUpdated'),
            });

            if (response.data.updateCartItems?.user_errors?.length) {
              const message =
                response.data.updateCartItems.user_errors[0].message;
              rxAppSnackbar({
                message: message,
              });
            }
            return {ok: true, message: t('message.successQtyUpdated')};
          }
          const resItems = _.get(dataParams, 'items');

          const updatedItems = _.map(resItems, function (obj) {
            const findItem = carts.find(itm => itm.id === obj.id);

            if (!findItem) {
              return {
                id: obj.id,
                quantity: obj.quantity,
                product: {
                  id: obj.product.id,
                  sku: obj.product.sku,
                  name: obj.product.name || `Product ${obj.product.sku}`,
                  stock_status: obj.product.stock_status,
                  stock_item: obj.product.stock_item,
                  small_image: {url: ''},
                  thumbnail: {url: ''},
                  url_key: obj.product.url_key || '',
                },
                custom_price: {
                  row_total: {
                    currency: 'IDR',
                    value: 0,
                  },
                },
                custom_cart_discount: [],
                customizable_options: [],
                edit: false,
                hide: false,
                __typename: 'SimpleCartItem',
              };
            }

            const updatedQty = obj.quantity ?? findItem?.quantity;
            const updatedProduct = {
              ...findItem.product,
              stock_status: _.get(obj, 'product.stock_status'),
              stock_item: _.get(obj, 'product.stock_item'),
            };
            return {
              ...findItem,
              quantity: updatedQty,
              product: updatedProduct,
              edit: false,
              hide: false,
            };
          });
          setCart({...dataParams, items: updatedItems});

          setTimeout(async () => {
            try {
              const respCustomPrice = await client.query({
                query: cartSchema().getItemsCustomPrice,
                variables: {cartID: cartID},
                fetchPolicy: 'no-cache',
              });
              const dataParamsCustomPrice = _.get(respCustomPrice, 'data.cart');
              if (dataParamsCustomPrice) {
                const cartItems_ = _.get(dataParamsCustomPrice, 'items');
                const cartCount_ = _.get(
                  dataParamsCustomPrice,
                  'total_quantity',
                );
                if (typeof cartCount_ === 'number') {
                  rxCartQty(cartCount_);
                }
                if (cartItems_) {
                  const normalizedCartItems =
                    normalizeFreeGiftItems(cartItems_);
                  rxCartDataItem(normalizedCartItems);
                  rxCartDataBackupItem(normalizedCartItems);
                  resetProcessingAPICount();
                }
              }
            } catch (e) {}
          }, 100);

          rxAppSnackbar({
            message: t('message.successQtyUpdated'),
          });

          if (response.data.updateCartItems?.user_errors?.length) {
            const message =
              response.data.updateCartItems.user_errors[0].message;
            rxAppSnackbar({
              message: message,
            });
          }
          return {ok: true, message: t('message.successQtyUpdated')};
        } else {
          if (type !== TYPES.INFO) {
            setCart({items: backupCartItems});
          }
          return {ok: false, message: t('message.errorQtyUpdated')};
        }
      } catch (err) {
        if (type !== TYPES.INFO) {
          setCart({items: backupCartItems});
        }

        // Extract error message for max/min quantity validation
        let errorMessage = t('message.errorQtyUpdated');
        if (err.message) {
          if (
            err.message.includes('exceeds the maximum qty allowed') ||
            err.message.includes('minimum qty allowed')
          ) {
            errorMessage = err.message;
          }
        }

        // Still call onHandleError for other error handling
        onHandleError(err);
        return {ok: false, message: errorMessage};
      }
    }
    return {ok: false, message: t('message.errorQtyUpdated')};
  };

  const compareLocal = async () => {
    setLoadingCompareLocal(true);
    const res = await client.query({
      variables: queryVariables,
      query: getPrice,
      fetchPolicy: 'no-cache',
      context: {method: 'POST'},
    });
    const priceRemote = _.get(
      res,
      'data.cart.prices.subtotal_excluding_tax.value',
    );
    const priceLocal = _.get(getRxCartPrice, 'subtotal_excluding_tax.value');
    if (priceLocal === priceRemote) {
      setLoadingCompareLocal(false);
      return true;
    } else {
      rxAppSnackbar({
        message: t('message.itemNotProcessed'),
      });
      setCart();
      setLoadingCompareLocal(false);
      return false;
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function getFreeGiftRules
   * @summary fetch free gift rules by cart id
   * ---------------------------------------------------- *
   */
  const getFreeGiftRules = async () => {
    if (!cartID) {
      return null;
    }
    try {
      const res = await client.query({
        query: GET_FREE_GIFT_RULES,
        variables: {cartId: cartID},
        // 必须每次都拿最新 is_eligible，不能吃 Apollo 缓存
        fetchPolicy: 'no-cache',
        context: {method: 'GET'},
      });
      return _.get(res, 'data.freeGiftRules') ?? null;
    } catch (err) {
      onHandleError(err);
      return null;
    }
  };

  const updateVariant = async ({
    cartItemId,
    parentSku,
    quantity,
    variantSku,
  }) => {
    await updateConfigurableOptions({
      variables: {
        cartId: cartID,
        cartItemId,
        parentSku,
        variantSku,
        quantity: quantity,
      },
    });
  };

  useEffect(() => {
    const response = _.get(fromNetwork, 'data.cart');
    if (type && response) {
      setCart(response);
    }
  }, [fromNetwork, type]);

  return {
    data,
    error,
    loading:
      type === TYPES.PRICE_SIMPLE || type === TYPES.PRICE
        ? loading || loadingPriceRefetch
        : loading,
    isEmptyCart,
    loadingCompareLocal,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateCartLoading,
    compareLocal,
    getFreeGiftRules,
    updateVariant,
  };
};

export default useCarts;
