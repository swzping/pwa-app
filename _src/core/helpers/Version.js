import {Linking, Platform} from 'react-native';
import {
  STOREURL_ANDROID,
  STOREID_ANDROID,
  STOREID_IOS,
} from '@app/helpers/Constants';

const isIOS = Platform.OS === 'ios';

export const onGoStore = () => {
  const urlStore = isIOS
    ? `itms-apps://itunes.apple.com/app/id${STOREID_IOS}`
    : `${STOREURL_ANDROID}?id=${STOREID_ANDROID}`;
  Linking.openURL(urlStore).catch(err => {
    console.log('[err] error linking', err);
    // 如果 itms-apps 失败，尝试使用 https URL
    if (isIOS) {
      const httpsUrl = `https://apps.apple.com/app/id${STOREID_IOS}`;
      Linking.openURL(httpsUrl).catch(httpsErr => {
        console.log('[err] error linking https', httpsErr);
      });
    }
  });
};
