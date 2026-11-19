import AsyncStorage from '@react-native-async-storage/async-storage';
export const Storage = {
  name: {
    TOKEN: 'TOKEN',
    CART_ID: 'CART_ID',
    CART_ID_GUEST: 'CART_ID_GUEST',
    USER_TYPE: 'USER_TYPE',
    USER_LANGUAGE: 'USER_LANGUAGE',
    USER_FONT_SIZE: 'USER_FONT_SIZE',
    USER_THEME: 'USER_THEME',
    FCM_TOKEN: 'FCM_TOKEN',
    DEVICE_TOKEN: 'DEVICE_TOKEN',
    FCM_SUBSCRIBER_MAGENTO: 'FCM_SUBSCRIBER_MAGENTO',
    GUARDIAN_RUN_REDIRECT: 'GUARDIAN_RUN_REDIRECT',
    OFFLINE_EVENT_BOOKING_CATEGORY_SELECTION:
      'OFFLINE_EVENT_BOOKING_CATEGORY_SELECTION',
    WAITING_ROOM_EXPIRE_AT: 'WAITING_ROOM_EXPIRE_AT',
    FLASH_SALE_MODAL_SHOWN: 'FLASH_SALE_MODAL_SHOWN',
    ACCESS_TOKEN: 'ACCESS_TOKEN',
    REFRESH_TOKEN: 'REFRESH_TOKEN',
    ACCESS_TOKEN_EXPIRES_AT: 'ACCESS_TOKEN_EXPIRES_AT',
    MEMBER_ID: 'MEMBER_ID',
  },
  set: (name, data) => {
    console.log('Storage.set', name, data);
    AsyncStorage.setItem(name, JSON.stringify(data));
  },
  get: async name => {
    let getItem = await AsyncStorage.getItem(name);
    if (getItem === null || getItem === undefined) {
      return null;
    } else {
      return JSON.parse(getItem);
    }
  },
  getWithPromise: name => {
    let getItem = AsyncStorage.getItem(name);
    return getItem;
  },
  del: async name => {
    console.log('Storage.del', name);
    await AsyncStorage.removeItem(name);
  },
  clear: async () => {
    console.log('Storage.clear');
    await AsyncStorage.clear();
  },
};
