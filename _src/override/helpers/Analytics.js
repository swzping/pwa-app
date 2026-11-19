import {Adjust, AdjustEvent} from 'react-native-adjust';
import Config from 'react-native-config';

import analytics from '@react-native-firebase/analytics';

import _ from 'lodash';

import TikTokHelper, {TikTokEventName} from '@app/helpers/TikTok';

const EVENT_NAME = {
  REGISTER_SUCCESS: Config.MODE_ACTIVE + '_register_success',
  ADD_TO_CART: Config.MODE_ACTIVE + '_add_to_cart',
  REMOVE_FROM_CART: Config.MODE_ACTIVE + '_remove_from_cart',
  ADD_TO_WISHLIST: Config.MODE_ACTIVE + '_add_to_wishlist',
  REMOVE_TO_WISHLIST: Config.MODE_ACTIVE + '_remove_to_wishlist',
  VIEW_ITEM: Config.MODE_ACTIVE + '_view_item',
  VIEW_CART: Config.MODE_ACTIVE + '_view_cart',
  COUPON: Config.MODE_ACTIVE + '_coupon',
  STORE_CREDIT: Config.MODE_ACTIVE + '_store_credit',
  BECON_CLICK: Config.MODE_ACTIVE + '_becon_click',
  HEALTH_CHECK_CLICK: Config.MODE_ACTIVE + '_health_check_click',
  BECON_IMPRESSION: Config.MODE_ACTIVE + '_becon_impression',
  HEALTH_CHECK_IMPRESSION: Config.MODE_ACTIVE + '_health_check_impression',
};

export const EVENT_TOKEN = {
  REGISTER: 'axwwf5',
  LOGIN: 'sao4ax',
  SCROLL_BANNER_HOMEPAGE: 'jitx3c',
  SEARCH_BAR: 'ic2ayh',
  ADD_TO_CART: 'y6j7u5',
  CART_PAGE: '16q544',
  CHECKOUT_BUTTON: 'plnh82',
  THANK_YOU_PAGE: 'g0oitg',
  CREATE_AN_ORDER: 'v6zmfu',
  CATEGORY: 'qrwgat',
  REVENUE_TRACKING: 'kpqkep',
  GUARDIAN_RUN_PAGE: 'xbq6mr',
};

const defaultCurrency = 'IDR';

const AnalyticsHelper = {
  eventRegisterSuccess: params => {
    analytics().logEvent(EVENT_NAME.REGISTER_SUCCESS, {
      event: 'register_success', // custom event name for GTM trigger
      sign_up_method: params.sign_up_method || '', // 'email' | 'phone'
      loyalty_id: params.loyalty_id || '', // hashed/internal ID, never PII like email/phone directly
      user_status: params.user_status || '', // 'new' | 'existing' (guard against double tracking)
      registration_source: params.registration_source, // 'Android' | 'IOS'
      registration_page: params.registration_page || '', // page path where form was submitted
      timestamp: new Date().toISOString(),
    });

    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.REGISTER);
  },
  eventAddItemCart: ({item, quantity}) => {
    const currency = _.get(item, 'currency') ?? defaultCurrency;
    const value = _.get(item, 'itemPrice') ?? 0;
    const item_id = _.get(item, 'id') ?? '';
    const item_name = _.get(item, 'name') ?? '';
    const item_sku = _.get(item, 'sku') ?? '';

    const params = {
      currency,
      value,
      quantity,
      item_id,
      item_name,
      item_sku,
    };
    analytics().logEvent(EVENT_NAME.ADD_TO_CART, params);

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.ADD_TO_CART, {
      content_type: 'product',
      content_id: item_id,
      content_name: item_name,
      quantity,
      price: value,
      currency,
    });
  },
  eventAddItemCartGA: paramItem => {
    analytics().logAddToCart(paramItem);
  },
  eventRemoveItemCart: ({item}) => {
    const currency = _.get(item, 'prices.price.currency') ?? defaultCurrency;
    const value = _.get(item, 'prices.price.value') ?? 0;
    const item_id = _.get(item, 'product.id') ?? '';
    const item_name = _.get(item, 'product.name') ?? '';
    const item_sku = _.get(item, 'product.sku') ?? '';

    const params = {
      currency,
      value,
      item_id,
      item_name,
      item_sku,
    };
    analytics().logEvent(EVENT_NAME.REMOVE_FROM_CART, params);

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.REMOVE_FROM_CART, {
      content_type: 'product',
      content_id: item_id,
      content_name: item_name,
      currency,
    });
  },
  eventRemoveItemCartGA: paramItem => {
    analytics().logRemoveFromCart(paramItem);
  },
  eventAddItemWishlist: ({item}) => {
    analytics().logEvent(EVENT_NAME.ADD_TO_WISHLIST, {
      currency: item?.currency,
      value: item?.value,
      item_name: item?.item_name,
      item_sku: item?.item_sku,
    });

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.ADD_TO_WISHLIST, {
      content_type: 'product',
      content_id: item?.item_sku || item?.item_name,
      content_name: item?.item_name,
      currency: item?.currency,
      value: item?.value,
    });
  },
  eventAddItemWishlistGA: paramItem => {
    analytics().logAddToWishlist(paramItem);
  },
  eventRemoveItemWishlist: ({item}) => {
    analytics().logEvent(EVENT_NAME.REMOVE_TO_WISHLIST, {
      currency: item?.currency,
      value: item?.value,
      item_name: item?.item_name,
      item_sku: item?.item_sku,
    });
  },
  eventViewCart: () => {
    analytics().logEvent(EVENT_NAME.VIEW_CART, {
      currency: defaultCurrency,
      value: 10000,
      cart_id: '12345',
      type: '', //guest or customer
      email: '',
    });

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.VIEW_CART, {
      currency: defaultCurrency,
    });
  },
  eventViewCartGA: ({cartItems}) => {
    const dataItems = [];
    for (const cart_index in cartItems) {
      const cart_item = cartItems[cart_index];
      dataItems.push({
        item_id: cart_item?.product?.id?.toString(),
        item_name: cart_item?.product?.name,
        quantity: cart_item?.quantity,
      });
    }
    analytics().logViewCart({items: dataItems});
  },
  eventViewItem: ({item}) => {
    let currency = item?.price?.currency;
    let price = item?.price?.finalAmount;

    analytics().logEvent(EVENT_NAME.REMOVE_FROM_CART, {
      currency: currency,
      value: price,
      item_id: item?.id,
      item_name: item?.name,
      item_sku: item?.sku,
    });

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.VIEW_CONTENT, {
      content_type: 'product',
      content_id: item?.id,
      content_name: item?.name,
      currency: currency,
      value: price,
    });
  },
  eventViewItemGA: paramItem => {
    analytics().logViewItem(paramItem);
  },
  eventBeconClick: params => {
    analytics().logEvent(EVENT_NAME.BECON_CLICK, {
      event: 'becon_click',
      entry_point: params.entry_point,
      loyalty_id: params.loyalty_id,
      is_logged_in: params.is_logged_in,
      timestamp: new Date().toISOString(),
    });
  },
  eventHealthCheckClick: params => {
    analytics().logEvent(EVENT_NAME.HEALTH_CHECK_CLICK, {
      event: 'health_check_click',
      entry_point: params.entry_point,
      loyalty_id: params.loyalty_id,
      is_logged_in: params.is_logged_in,
      timestamp: new Date().toISOString(),
    });
  },
  eventBeconImpression: params => {
    analytics().logEvent(EVENT_NAME.BECON_IMPRESSION, {
      event: 'becon_impression',
    });
  },
  eventHealthCheckImpression: params => {
    analytics().logEvent(EVENT_NAME.HEALTH_CHECK_IMPRESSION, {
      event: 'health_check_impression',
    });
  },
  eventUseCuopon: paramCoupons => {
    analytics().logEvent(EVENT_NAME.COUPON, paramCoupons);
  },
  eventSelectItem: paramItem => {
    analytics().logSelectItem(paramItem);
  },
  eventViewItemList: paramItemList => {
    analytics().logViewItemList(paramItemList);
  },
  eventAddPaymentInfo: ({payment_type}) => {
    analytics().logAddPaymentInfo({payment_type});

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.ADD_PAYMENT_INFO, {
      payment_type,
    });
  },
  eventAddShippingInfo: ({shipping_tier}) => {
    analytics().logAddShippingInfo({shipping_tier});
  },
  eventLogPurchase: ({transaction_id, currency, value}) => {
    analytics().logPurchase({
      transaction_id,
      currency,
      value,
    });

    // TikTok
    TikTokHelper.trackPurchase(value, currency, {
      transaction_id,
      content_type: 'product',
    });
  },
  eventLogScreen: async ({previousRouteName, currentRouteName}) => {
    if (previousRouteName !== currentRouteName) {
      await analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }
  },
  eventSearch: searchText => {
    if (searchText) {
      analytics().logSearch({search_term: searchText});

      // TikTok
      TikTokHelper.trackEvent(TikTokEventName.SEARCH, {
        search_string: searchText,
      });
    }
  },
  eventBeginCheckout: ({cartItems}) => {
    const dataItems = [];
    for (const cart_index in cartItems) {
      const cart_item = cartItems[cart_index];
      dataItems.push({
        item_id: cart_item?.product?.id?.toString(),
        item_name: cart_item?.product?.name,
        quantity: cart_item?.quantity,
      });
    }
    analytics().logBeginCheckout({items: dataItems});

    // TikTok
    TikTokHelper.trackEvent(TikTokEventName.INITIATE_CHECKOUT, {
      content_type: 'product',
      num_items: dataItems?.length,
    });
  },
  // end of file

  /**
   * Track Adjust event with given token
   * @param {string} eventToken
   */
  trackAdjustEvent: (eventToken = '') => {
    try {
      const adjustEvent = new AdjustEvent(eventToken);
      Adjust.trackEvent(adjustEvent);
    } catch (error) {
      console.error('Error tracking Adjust event:', error);
    }
  },

  /**
   * Track Adjust revenue event
   * @param {Object} params - Revenue tracking parameters
   * @param {number} params.revenue - Revenue amount
   * @param {string} params.currency - Currency code (e.g., 'IDR')
   * @param {string} params.orderId - Order ID for deduplication
   */
  trackAdjustRevenue: (params = {}) => {
    try {
      const {revenue, currency = defaultCurrency, orderId} = params;

      if (!revenue) {
        return;
      }

      const adjustEvent = new AdjustEvent(EVENT_TOKEN.REVENUE_TRACKING);
      adjustEvent.setRevenue(revenue, currency);

      if (orderId) {
        adjustEvent.setTransactionId(orderId);
      }

      Adjust.trackEvent(adjustEvent);

      // TikTok
      TikTokHelper.trackPurchase(revenue, currency, {
        transaction_id: orderId,
        content_type: 'product',
      });
    } catch (error) {
      console.error('Error tracking Adjust revenue:', error);
    }
  },
};

export default AnalyticsHelper;
