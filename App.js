import {initialize} from '@onlinesales-ai/osmos-react-native-sdk';
import React, {useEffect} from 'react';

import {Adjust, AdjustConfig} from 'react-native-adjust';
import Config from 'react-native-config';
import {Settings} from 'react-native-fbsdk-next';

import {loadDevMessages, loadErrorMessages} from '@apollo/client/dev';
import {getApp} from '@react-native-firebase/app';
import {initializePerformance} from '@react-native-firebase/perf';

import 'react-native-devsettings';

import {initAppSdks} from '@app/bootstrap/initAppSdks';
import FacebookAnalytics from '@app/helpers/FacebookAnalytics';
import {getAdjustEnvironment} from '@app/helpers/General';
import {Storage} from '@app/helpers/Storage';
import TikTokHelper, {TikTokEventName} from '@app/helpers/TikTok';
import useDeepLinkWithAdjust from '@app/hooks/useDynamicLink';
import usePushNotification from '@app/hooks/usePushNotification';
import Core from '@app/index';

if (__DEV__) {
  import('@app/configs/reactotron');

  // 因为升级了Apollo，打开错误日志观测api相关使用问题
  loadErrorMessages();
  loadDevMessages();
}

// startTime 和 appLaunch trace 已在 index.js 中初始化

const adjustConfig = new AdjustConfig(
  Config.ADJUST_APP_TOKEN,
  getAdjustEnvironment(),
);
adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);

Adjust.initSdk(adjustConfig);

// ===== Facebook SDK 初始化（僅廣告事件追蹤） =====
if (Config.FACEBOOK_APP_ID) {
  Settings.initializeSDK();
  console.log('[facebook] ✅ facebook SDK initialized');
} else {
  console.log('[facebook] ⚠️ facebook SDK not configured (placeholder App ID)');
}

// 初始化 Performance SDK
// 注意：开发环境默认关闭，如需测试可临时改为 true
const enablePerfInDev = true; // 已启用用于测试 Firebase
if (!__DEV__ || enablePerfInDev) {
  const app = getApp();
  initializePerformance(app, {
    dataCollectionEnabled: true,
  })
    .then(() => {
      console.log('[perf] ✅ Performance SDK initialized');
    })
    .catch(error => {
      console.log('[perf] ❌ Performance SDK init error', error);
    });
} else {
  console.log('[perf] ⚠️ Performance SDK disabled in dev mode');
}

const App = () => {
  useDeepLinkWithAdjust();
  usePushNotification();

  useEffect(() => {
    try {
      const isProd = Config.MODE_ACTIVE === 'production';
      const adsHost = isProd ? 'ads-id.dfgd-os.com' : 'dev-ads-id.dfgd-os.com';
      initialize({
        clientId: isProd ? 10119342 : 10119341,
        productAdsHost: adsHost,
        displayAdsHost: adsHost,
        eventTrackingHost: adsHost,
      });
      console.log('[App] OSMOS SDK initialized successfully');
    } catch (error) {
      console.error('[App] Failed to initialize OSMOS SDK:', error);
    }
  }, []);

  useEffect(() => {
    Storage.del(Storage.name.FLASH_SALE_MODAL_SHOWN);

    initAppSdks();

    if (global.__APP_LAUNCH_LOGGED__) {
      return;
    }

    const startedAt =
      typeof global.startTime === 'number' ? global.startTime : Date.now();
    const duration = Date.now() - startedAt;
    global.__APP_LAUNCH_LOGGED__ = true;

    // 停止在 index.js 中开始的 appLaunch trace
    // 如果 trace 还没创建，等待一小段时间再试
    const tryStopTrace = () => {
      const appLaunchTrace = global.__APP_LAUNCH_TRACE__;
      if (appLaunchTrace) {
        try {
          appLaunchTrace.putAttribute(
            'environment',
            Config?.MODE_ACTIVE || 'production',
          );
          appLaunchTrace.putMetric('duration_ms', duration);
          appLaunchTrace.stop();
          global.__APP_LAUNCH_TRACE__ = null;
          console.log(
            `[perf] ✅ appLaunch trace stopped: duration=${duration}ms`,
          );
        } catch (error) {
          console.log('[perf] ❌ appLaunch trace stop error', error);
        }
      } else {
        // 如果 trace 还没创建，等待 100ms 再试一次（最多等 500ms）
        if (!global.__APP_LAUNCH_RETRY_COUNT__) {
          global.__APP_LAUNCH_RETRY_COUNT__ = 0;
        }
        if (global.__APP_LAUNCH_RETRY_COUNT__ < 5) {
          global.__APP_LAUNCH_RETRY_COUNT__++;
          setTimeout(tryStopTrace, 100);
        } else {
          console.log(
            '[perf] ⚠️ appLaunch trace not found after retries (SDK may be disabled in dev mode)',
          );
        }
      }
    };

    tryStopTrace();

    // Facebook 啟動事件記錄
    FacebookAnalytics.logActivatedApp();

    // TikTok 启动验证
    TikTokHelper.trackEvent(TikTokEventName.LAUNCH, {
      source: 'app_launch_verify',
    });
  }, []);

  return <Core />;
};

export default App;
