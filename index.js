/**
 * @format
 */

import 'fast-text-encoding';

// TextEncoder Polyfill for libraries like qrcode
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('fast-text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { getPerformance } from '@react-native-firebase/perf';

// firebase 版本是22.4.0 V2版本，会有很多过期警告，不升级之前可以关闭不看
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

// 在 App 启动时记录 startTime，并开始 Performance Trace
if (typeof global.startTime !== 'number') {
  global.startTime = Date.now();

  // 开始 appLaunch trace（异步，避免阻塞）
  const performance = getPerformance();
  performance
    .startTrace('appLaunch')
    .then(trace => {
      if (trace) {
        global.__APP_LAUNCH_TRACE__ = trace;
        console.log('[perf] ✅ appLaunch trace started in index.js');
      } else {
        console.log('[perf] ⚠️ appLaunch trace returned null (SDK may be disabled)');
      }
    })
    .catch(error => {
      console.log('[perf] ❌ appLaunch trace start error in index.js', error);
    });
}

// 添加这个 polyfill
if (typeof global.queueMicrotask !== 'function') {
  global.queueMicrotask = function (callback) {
    Promise.resolve()
      .then(callback)
      .catch(e =>
        setTimeout(() => {
          throw e;
        }),
      );
  };
}

AppRegistry.registerComponent(appName, () => App);
