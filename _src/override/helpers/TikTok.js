import { NativeModules } from 'react-native';

const { TikTokModule } = NativeModules;

/**
 * TikTok 标准事件名称
 */
export const TikTokEventName = {
  ACHIEVE_LEVEL: 'AchieveLevel',
  ADD_TO_CART: 'AddToCart',
  ADD_TO_WISHLIST: 'AddToWishlist',
  ADD_PAYMENT_INFO: 'AddPaymentInfo',
  CHECK_OUT: 'CheckOut',
  COMPLETE_TUTORIAL: 'CompleteTutorial',
  CREATE_GROUP: 'CreateGroup',
  CREATE_ROLE: 'CreateRole',
  GENERATE_LEAD: 'GenerateLead',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  INSTALL: 'Install',
  LAUNCH: 'Launch',
  LOGIN: 'Login',
  PURCHASE: 'Purchase',
  RATE: 'Rate',
  REGISTRATION: 'Registration',
  REMOVE_FROM_CART: 'RemoveFromCart',
  SEARCH: 'Search',
  SESSION_DURATION: 'SessionDuration',
  SHARE: 'Share',
  SPEND_CREDITS: 'SpendCredits',
  START_TRAIL: 'StartTrial',
  SUBSCRIBE: 'Subscribe',
  UNLOCK_ACHIEVEMENT: 'UnlockAchievement',
  VIEW_CONTENT: 'ViewContent',
  VIEW_CART: 'ViewCart',
};

/**
 * TikTok 事件追踪工具
 */
const TikTokHelper = {
  trackEvent: (eventName, properties = {}) => {
    if (!TikTokModule) {
      console.warn('[TikTok] Native module not available');
      return;
    }
    TikTokModule.trackEvent(eventName, properties);
  },

  trackPurchase: (price, currency = 'IDR', itemInfo = {}) => {
    if (!TikTokModule) {
      console.warn('[TikTok] Native module not available');
      return;
    }
    TikTokModule.trackPurchase(price, currency, TikTokEventName.PURCHASE, itemInfo);
  },
};

export default TikTokHelper;
