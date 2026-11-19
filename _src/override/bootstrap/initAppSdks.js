/**
 * App launch SDK init
 */

import Config from 'react-native-config';

import cdpAnalytics, {
  AutoTrackEventType,
  EncryptType,
  NetworkType,
} from 'qidian_cdp_sdk_rn';

import {IS_IOS} from '@app/helpers/Constants';
import {initCdpUser} from '@app/track/cdpUser';

let initialized = false;

// const cdpLogger = (tag, message) => {
//   console.log(`[CDP_REPORT] ${tag}:`, message);
// };

export const initAppSdks = async () => {
  if (initialized) {
    console.log('[initAppSdks] already initialized, skip');
    return;
  }

  try {
    console.log('[initAppSdks] initializing...');
    initialized = true;

    // CDP
    cdpAnalytics.init(
      IS_IOS
        ? Config.QIDIAN_CDP_APP_KEY_IOS
        : Config.QIDIAN_CDP_APP_KEY_ANDROID,
      {
        requestBaseUrl: Config.QIDIAN_CDP_REQUEST_BASE_URL,
        autoTrackEventType:
          AutoTrackEventType.AppStart +
          AutoTrackEventType.AppExit +
          AutoTrackEventType.AppPageOpen +
          AutoTrackEventType.AppPageClose,
        encryptType: EncryptType.BASE64_AES,
        flushNetworkPolicy: NetworkType.TYPE_ALL,
        reportInterval: 15000,
        reportMaxSize: Number(Config.QIDIAN_REPORT_MAX_SIZE),
        logEnabled: Config.MODE_ACTIVE !== 'production',
        // need sdk 6.27.1
        // logger: cdpLogger,
        userInfos: {
          guid_member_id: '',
          Device_token: '',
        },
      },
    );

    // CDP User
    await initCdpUser();
  } catch (e) {
    console.warn('[initAppSdks] error', e);
  }
};
