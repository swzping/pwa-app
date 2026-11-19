import perf from '@react-native-firebase/perf';

/**
 * 创建官方 Firebase Performance Trace
 * 用于在 Firebase Performance 控制台显示自定义 trace
 * @param {string} traceName - Trace 名称（如 'homepageInit', 'apiCall'）
 * @returns {Promise<Object>} Trace 对象，包含 start/stop/putMetric 方法
 */
export const startPerfTrace = async traceName => {
  try {
    const trace = await perf().startTrace(traceName);
    return {
      trace,
      putMetric: (name, value) => {
        try {
          trace.putMetric(name, value);
        } catch (error) {
          console.log(`[perf] putMetric error for ${traceName}`, error);
        }
      },
      putAttribute: (name, value) => {
        try {
          trace.putAttribute(name, String(value || ''));
        } catch (error) {
          console.log(`[perf] putAttribute error for ${traceName}`, error);
        }
      },
      stop: () => {
        try {
          trace.stop();
        } catch (error) {
          console.log(`[perf] stop trace error for ${traceName}`, error);
        }
      },
    };
  } catch (error) {
    console.log(`[perf] startTrace error for ${traceName}`, error);
    return {
      trace: null,
      putMetric: () => {},
      putAttribute: () => {},
      stop: () => {},
    };
  }
};

export default startPerfTrace;
