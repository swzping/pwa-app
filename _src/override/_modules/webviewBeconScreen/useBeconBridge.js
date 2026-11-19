import  {useCallback, useMemo, useRef} from 'react';

const defaultHandlers = {
  getToken: async () => ({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'getToken handler is not configured',
    },
  }),
  requestPermission: async () => ({
    granted: false,
    permissions: [],
    deniedPermissions: [],
  }),
  addToCart: async () => ({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'addToCart handler is not configured',
    },
  }),
  navigateTo: async (options = {}) => ({
    success: false,
    message: `navigateTo is not implemented: ${options?.type || 'unknown'}`,
  }),
  showInStoreAssessmentModal: async () => ({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'showInStoreAssessmentModal handler is not configured',
    },
  }),
  showLoginModal: async () => ({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'showLoginModal handler is not configured',
    },
  }),
  getAppInfo: async () => ({
    success: false,
    error: 'getAppInfo handler is not configured',
  }),
  onWebMessage: null,
};

const generateBeconBridgeScript = () => `
  (function() {
    if (!window.BeconBridge) {
      window.BeconBridge = {};
    }
    window.BeconBridge._pendingRequests = {};
    window.BeconBridge._permissionListeners = [];

    window.BeconBridge._resolveRequest = function(requestId, data, error) {
      const request = window.BeconBridge._pendingRequests[requestId];
      if (!request) return;
      if (error) {
        request.reject(new Error(error));
      } else {
        request.resolve(data);
      }
      delete window.BeconBridge._pendingRequests[requestId];
    };

    window.BeconBridge.getToken = function() {
      return new Promise((resolve, reject) => {
        const requestId = 'token_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'getToken',
          params: { requestId }
        }));
      });
    };

    window.BeconBridge.requestPermission = function(options = {}) {
      return new Promise((resolve, reject) => {
        const requestId = 'permission_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'requestPermission',
          params: { ...options, requestId }
        }));
      });
    };

    window.BeconBridge.onPermissionChange = function(callback) {
      const listenerId = 'listener_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      window.BeconBridge._permissionListeners.push({ id: listenerId, callback: callback });
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'beconbridge',
        method: 'subscribePermission',
        params: { listenerId }
      }));
      return function unsubscribe() {
        window.BeconBridge._permissionListeners = window.BeconBridge._permissionListeners.filter(function(item) {
          return item.id !== listenerId;
        });
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'unsubscribePermission',
          params: { listenerId }
        }));
      };
    };

    window.BeconBridge._notifyPermissionChange = function(event) {
      try {
        if (typeof window.alert === 'function') {
        
        }
      } catch (e) {
        // ignore alert errors
      }

      window.BeconBridge._permissionListeners.forEach(function(listener) {
        try {
          listener.callback(event);
        } catch (e) {
          console.error('[BeconBridge] permission listener error', e);
        }
      });
    };

    window.BeconBridge.addToCart = function(params = {}) {
      return new Promise((resolve, reject) => {
        const requestId = 'add_cart_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'addToCart',
          params: { ...params, requestId }
        }));
      });
    };

    window.BeconBridge.navigateTo = function(options = {}) {
      return new Promise((resolve, reject) => {
        const requestId = 'navigate_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'navigateTo',
          params: { ...options, requestId }
        }));
      });
    };

    window.BeconBridge.showInStoreAssessmentModal = function() {
      return new Promise((resolve, reject) => {
        const requestId = 'instore_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'showInStoreAssessmentModal',
          params: { requestId }
        }));
      });
    };

    window.BeconBridge.showLoginModal = function() {
      return new Promise((resolve, reject) => {
        const requestId = 'login_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'showLoginModal',
          params: { requestId }
        }));
      });
    };

    window.BeconBridge.getAppInfo = function() {
      return new Promise((resolve, reject) => {
        const requestId = 'appinfo_' + Date.now() + '_' + Math.random().toString(36).slice(2);
        window.BeconBridge._pendingRequests[requestId] = { resolve, reject };
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'beconbridge',
          method: 'getAppInfo',
          params: { requestId }
        }));
      });
    };

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'beconbridge',
      method: 'ready',
      params: { version: '2.0.0' }
    }));

    window.dispatchEvent(new CustomEvent('BeconBridgeReady', {
      detail: { version: '2.0.0', timestamp: Date.now() }
    }));
  })();
  true;
`;

const useBeconBridge = (options = {}) => {
  const {handlers = {}} = options;

  const mergedHandlers = useMemo(
    () => ({...defaultHandlers, ...handlers}),
    [handlers],
  );
  const webViewRef = useRef(null);

  const sendBridgeResponse = useCallback((requestId, data, error = null) => {
    if (!webViewRef.current || !requestId) {
      return;
    }
    const errorStr = error ? JSON.stringify(String(error)) : 'null';
    const dataStr = JSON.stringify(data);
    const script = `
      (function() {
        if (window.BeconBridge && window.BeconBridge._resolveRequest) {
          window.BeconBridge._resolveRequest('${requestId}', ${dataStr}, ${errorStr});
        }
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  }, []);

  const notifyPermissionChange = useCallback(eventPayload => {
    if (!webViewRef.current) {
      return;
    }
    const payload = eventPayload || {};
    const payloadStr = JSON.stringify(payload);
    const script = `
      (function() {
        if (window.BeconBridge && window.BeconBridge._notifyPermissionChange) {
          window.BeconBridge._notifyPermissionChange(${payloadStr});
        }
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(script);
  }, []);

  const handleBridgeMessage = useCallback(
    async message => {
      const {method, params = {}} = message;
      const requestId = params?.requestId;

      try {
        switch (method) {
          case 'getToken': {
            const result = await mergedHandlers.getToken(params);
            sendBridgeResponse(requestId, result);
            break;
          }
          case 'getAppInfo': {
            const result = await mergedHandlers.getAppInfo(params);
            sendBridgeResponse(requestId, result);
            break;
          }
          case 'navigateTo': {
            const result = await mergedHandlers.navigateTo(params);
            sendBridgeResponse(requestId, result);
            break;
          }
          case 'requestPermission': {
            const result = await mergedHandlers.requestPermission(params);
            sendBridgeResponse(requestId, result);
            const requestedType = params?.type;
            if (
              requestedType === 'camera' ||
              requestedType === 'storage' ||
              requestedType === 'both'
            ) {
              const grantedNames = Array.isArray(result?.data?.permissions)
                ? result.data.permissions
                : [];
              const deniedNames = Array.isArray(result?.data?.deniedPermissions)
                ? result.data.deniedPermissions
                : [];
              const targets =
                requestedType === 'both'
                  ? ['camera', 'storage']
                  : [requestedType];
              targets.forEach(name => {
                const granted =
                  grantedNames.includes(name) && !deniedNames.includes(name);
                notifyPermissionChange({
                  type: name,
                  status: granted ? 'granted' : 'denied',
                  granted,
                  timestamp: Date.now(),
                });
              });
            }
            break;
          }
          case 'subscribePermission':
          case 'unsubscribePermission': {
            sendBridgeResponse(requestId, {success: true});
            break;
          }
          case 'addToCart': {
            const result = await mergedHandlers.addToCart(params);
            sendBridgeResponse(requestId, result);
            break;
          }

          case 'showInStoreAssessmentModal': {
            const result = await mergedHandlers.showInStoreAssessmentModal(
              params,
            );
            sendBridgeResponse(requestId, result);
            break;
          }
          case 'showLoginModal': {
            const result = await mergedHandlers.showLoginModal(params);
            sendBridgeResponse(requestId, result);
            break;
          }

          default: {
            sendBridgeResponse(
              requestId,
              null,
              `Unknown method: ${String(method)}`,
            );
            break;
          }
        }
      } catch (error) {
        if (requestId) {
          sendBridgeResponse(requestId, null, error?.message || String(error));
        }
      }
    },
    [mergedHandlers, notifyPermissionChange, sendBridgeResponse],
  );

  const handleMessage = useCallback(
    event => {
      try {
        const rawData = event?.nativeEvent?.data;
        const message = JSON.parse(rawData);
        if (message?.type === 'beconbridge') {
          handleBridgeMessage(message);
          return;
        }
        if (message?.type === 'webMessage') {
          mergedHandlers?.onWebMessage?.(message.data);
        }
      } catch (error) {
        // Ignore unparsable payloads.
      }
    },
    [handleBridgeMessage, mergedHandlers],
  );

  const getInjectedScript = useCallback(() => generateBeconBridgeScript(), []);

  return {
    webViewRef,
    handleMessage,
    getInjectedScript,
    sendBridgeResponse,
    notifyPermissionChange,
  };
};

export default useBeconBridge;
