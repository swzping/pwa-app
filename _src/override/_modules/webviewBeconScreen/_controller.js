import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Linking} from 'react-native';

import Views from '@app/_modules/webviewBeconScreen/_view';
import ErrorHandler from '@app/helpers/ErrorHandler';

import {createBridgeHandlers} from './bridgeHandlers.js';
import useBeconBridge from './useBeconBridge';

const WebViewBeconController = props => {
  const {route} = props || {};
  const {
    url: webViewUrl,
    title,
    isNavBar = true,
    enableBridge = true,
    pureWebView = false,
    stripSmartHome = false,
  } = route?.params || {};

  const [isLoading, setIsLoading] = useState(false); // 是否加载中
  const [loadProgress, setLoadProgress] = useState(0); // 加载进度
  const [loginModalVisible, setLoginModalVisible] = useState(false); // 登录弹窗是否可见

  const [showDialog, setShowDialog] = useState({
    visible: false,
    title: '',
    subTitle: '',
  });

  const defaultBridgeHandlers = useMemo(
    () => createBridgeHandlers({store: null}),
    [],
  );

  const bridgeHandlers = useMemo(
    () => ({
      ...defaultBridgeHandlers,
    }),
    [defaultBridgeHandlers],
  );

  const {webViewRef, handleMessage, getInjectedScript} = useBeconBridge({
    handlers: bridgeHandlers,
  });

  useEffect(() => {
    webViewRef.current?.clearCache(true);
  }, []);

  const injectedJavaScript = useMemo(
    () => `
    ${pureWebView ? '' : ''}
    ${enableBridge ? getInjectedScript() : ''}
    (function() {
      if (${pureWebView ? 'true' : 'false'}) {
        true;
      }
      if (${stripSmartHome ? 'true' : 'false'}) {
        try {
          var smartBannerMeta = document.querySelectorAll('meta[name^="smartbanner:"]');
          for (var i = 0; i < smartBannerMeta.length; i += 1) {
            smartBannerMeta[i].remove();
          }

          var smartBannerStyle = document.createElement('style');
          smartBannerStyle.type = 'text/css';
          smartBannerStyle.innerHTML = '.smartbanner, .js_smartbanner, [class*="smartbanner"] { display: none !important; visibility: hidden !important; opacity: 0 !important; height: 0 !important; min-height: 0 !important; } body { padding-top: 0 !important; margin-top: 0 !important; }';
          document.head && document.head.appendChild(smartBannerStyle);
        } catch (e) {
          // ignore
        }
      }

      if (window.__BECON_PAGE_READY_INSTALLED__) {
        true;
      } else {
        window.__BECON_PAGE_READY_INSTALLED__ = true;

        function notifyPageReady(state) {
          try {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'pageLifecycle',
              data: {
                state: state,
                url: window.location && window.location.href,
                title: document && document.title,
                readyState: document && document.readyState,
                timestamp: Date.now()
              }
            }));
          } catch (e) {
            // ignore
          }
        }

        if (document.readyState === 'interactive' || document.readyState === 'complete') {
          notifyPageReady('immediate');
        } else {
          document.addEventListener('DOMContentLoaded', function() {
            notifyPageReady('domcontentloaded');
          }, false);
        }

        window.addEventListener('load', function() {
          notifyPageReady('load');
        }, false);
      }
    })();
    true;
  `,
    [enableBridge, getInjectedScript],
  );

  // 处理加载开始
  const handleLoadStart = useCallback(() => {
    setLoadProgress(0);
    setIsLoading(true);
  }, [webViewUrl]);

  // 处理加载结束
  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  // 处理加载出错
  const handleErrorShow = () => {
    return setShowDialog({
      visible: true,
      title: 'Something went wrong',
      subTitle:
        'Sorry, we couldn’t load this content correctly. Please retry later',
    });
  };

  // 处理加载进度
  const handleLoadProgress = useCallback(
    syntheticEvent => {
      const nativeEvent = syntheticEvent?.nativeEvent || {};
      const progress =
        typeof nativeEvent.progress === 'number' ? nativeEvent.progress : 0;
      setLoadProgress(progress);
      if (progress >= 0.9) {
        setIsLoading(false);
      }
    },
    [webViewUrl],
  );

  // 处理html postMessage通信
  const handleWebMessage = useCallback(
    event => {
      handleMessage(event);
    },
    [handleMessage],
  );

  // 拦截页面跳转，外部链接使用系统浏览器打开
  const handleShouldStartLoadWithRequest = useCallback(
    request => {
      const {url} = request;
      if (!webViewUrl) {
        return false;
      }

      const isSameOrigin = url.startsWith(webViewUrl);
      if (!isSameOrigin) {
        Linking.openURL(url).catch(() => null);
        return false;
      }
      return true;
    },
    [webViewUrl],
  );

  // 处理加载出错
  const handleWebError = useCallback(syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    new ErrorHandler({
      source: 'BeconWebView:onError',
      err: new Error(`WebView load fail: ${nativeEvent?.description}`),
    }).initHandleError();
    handleErrorShow();
    setIsLoading(false);
  }, []);

  // http错误 404/500
  const handleHttpError = useCallback(syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    new ErrorHandler({
      source: 'BeconWebView:onHttpError',
      err: new Error(`WebView http error status: ${nativeEvent?.statusCode}`),
    }).initHandleError();
    setIsLoading(false);
  }, []);

  // android webview进程崩溃
  const handleRenderProcessGone = useCallback(syntheticEvent => {
    const {nativeEvent} = syntheticEvent;
    new ErrorHandler({
      source: 'BeconWebView:renderProcessGone',
      err: new Error(`WebView destroyed: ${JSON.stringify(nativeEvent)}`),
    }).initHandleError();
    setIsLoading(false);
  }, []);

  // webview配置缓存
  const webViewSource = useMemo(() => {
    if (!webViewUrl) {
      return null;
    }
    return {uri: webViewUrl};
  }, [webViewUrl]);

  return (
    <Views
      webViewRef={webViewRef}
      title={title}
      showDialog={showDialog}
      isNavBar={isNavBar}
      source={webViewSource}
      isLoading={isLoading}
      loadProgress={loadProgress}
      loginModalVisible={loginModalVisible}
      injectedJavaScript={injectedJavaScript}
      setLoginModalVisible={setLoginModalVisible}
      setShowDialog={setShowDialog}
      handleLoadStart={handleLoadStart}
      handleLoadEnd={handleLoadEnd}
      handleWebMessage={handleWebMessage}
      handleWebError={handleWebError}
      handleHttpError={handleHttpError}
      handleLoadProgress={handleLoadProgress}
      handleRenderProcessGone={handleRenderProcessGone}
      handleShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
    />
  );
};

export default WebViewBeconController;
