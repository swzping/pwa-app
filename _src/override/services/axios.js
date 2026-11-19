import axios from 'axios';
import Config from 'react-native-config';
import perf from '@react-native-firebase/perf';

const DEFAULT_TIMEOUT = Number(Config?.API_TIMEOUT || 15000);

const api = axios.create({
  baseURL: Config?.API_BASE_URL || '',
  timeout: DEFAULT_TIMEOUT,
});

const emitPerf = async (config, status) => {
  try {
    if (!config || !config.metadata) {
      return;
    }

    const httpMetric = config.metadata.httpMetric;

    // 停止官方 HTTP Metric（如果存在）
    if (httpMetric) {
      try {
        if (status.startsWith('HTTP_')) {
          const statusCode = parseInt(status.replace('HTTP_', ''), 10);
          if (!isNaN(statusCode)) {
            httpMetric.setHttpResponseCode(statusCode);
          }
        }
        httpMetric.stop();
        const duration = Date.now() - (config.metadata?.startedAt || Date.now());
        console.log(`[perf] ✅ HTTP Metric stopped: ${config.metadata?.apiName || 'unknown'}, status=${status}, duration=${duration}ms`);
      } catch (error) {
        console.log('[axios] httpMetric stop error', error);
      }
    }
  } catch (error) {
    console.log('[axios] emitPerf error', error);
  }
};

api.interceptors.request.use(
  async requestConfig => {
    const method = (requestConfig?.method || 'GET').toUpperCase();
    const url = requestConfig?.url || '';
    const fullUrl = `${requestConfig.baseURL || ''}${url}`;

    // 创建官方 HTTP Metric（用于网络请求监控）
    let httpMetric = null;
    try {
      httpMetric = await perf().newHttpMetric(fullUrl, method);
      httpMetric.start();
      console.log(`[perf] ✅ HTTP Metric started: ${method} ${url}`);
    } catch (error) {
      console.log('[axios] httpMetric start error', error);
    }

    requestConfig.metadata = {
      httpMetric,
      apiName: `${method} ${url}`,
      startedAt: Date.now(),
    };
    return requestConfig;
  },
  error => Promise.reject(error),
);

api.interceptors.response.use(
  response => {
    emitPerf(response.config, `HTTP_${response.status}`);
    return response;
  },
  error => {
    const status = error?.response?.status
      ? `HTTP_${error.response.status}`
      : error?.code || 'error';
    
    if (error?.config) {
      emitPerf(error.config, status);
    }
    
    return Promise.reject(error);
  },
);

export default api;
