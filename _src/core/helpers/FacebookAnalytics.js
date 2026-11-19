import Config from 'react-native-config';
import {AppEventsLogger} from 'react-native-fbsdk-next';

const isFacebookConfigured = !!Config.FACEBOOK_APP_ID;

const EVENT_NAME = {
  ADD_TO_CART: 'AddToCart',
  VIEW_CONTENT: 'ViewContent',
  PURCHASE: 'Purchase',
  SEARCH: 'Search',
  ADD_TO_WISHLIST: 'AddToWishlist',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  LEAD: 'Lead',
  VIEW_CATEGORY: 'ViewCategory',
  CUSTOMIZE_PRODUCT: 'CustomizeProduct',
  DONATE: 'Donate',
  FIND_LOCATION: 'FindLocation',
  RATE: 'Rate',
  SCHEDULE: 'Schedule',
  SPENT_CREDITS: 'SpentCredits',
  SUBMIT_APPLICATION: 'SubmitApplication',
  CONTACT: 'Contact',
  START_TRIAL: 'StartTrial',
};

export default {
  /**
   * 初始化後記錄啟動事件
   */
  logActivatedApp: () => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent('fb_mobile_activate_app');
  },

  /**
   * 加入購物車
   */
  logAddToCart: ({itemId, itemName, price, currency, quantity = 1}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(EVENT_NAME.ADD_TO_CART, price * quantity, {
      fb_content_id: itemId,
      fb_content_name: itemName,
      fb_currency: currency || 'IDR',
      _quantity: quantity,
    });
  },

  /**
   * 查看商品內容
   */
  logViewContent: ({itemId, itemName, price, currency, contentType}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(EVENT_NAME.VIEW_CONTENT, price, {
      fb_content_id: itemId,
      fb_content_name: itemName,
      fb_content_type: contentType || 'product',
      fb_currency: currency || 'IDR',
    });
  },

  /**
   * 完成購買
   */
  logPurchase: ({transactionId, value, currency}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logPurchase(value, currency || 'IDR', {
      fb_transaction_id: transactionId,
    });
  },

  /**
   * 搜尋
   */
  logSearch: ({searchTerm, contentId, contentType}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(EVENT_NAME.SEARCH, null, {
      fb_search_string: searchTerm,
      fb_content_id: contentId,
      fb_content_type: contentType,
    });
  },

  /**
   * 加入願望清單
   */
  logAddToWishlist: ({itemId, itemName, price, currency}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(EVENT_NAME.ADD_TO_WISHLIST, price, {
      fb_content_id: itemId,
      fb_content_name: itemName,
      fb_currency: currency || 'IDR',
    });
  },

  /**
   * 開始結帳
   */
  logInitiateCheckout: ({value, currency, itemCount}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(EVENT_NAME.INITIATE_CHECKOUT, value, {
      fb_currency: currency || 'IDR',
      num_items: itemCount,
    });
  },

  /**
   * 完成註冊
   */
  logCompleteRegistration: ({registrationMethod}) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(EVENT_NAME.COMPLETE_REGISTRATION, null, {
      fb_registration_method: registrationMethod || 'email',
    });
  },

  /**
   * 自訂事件
   */
  logEvent: (eventName, valueToSum, parameters) => {
    if (!isFacebookConfigured) {return;}
    AppEventsLogger.logEvent(eventName, valueToSum, parameters);
  },
};
