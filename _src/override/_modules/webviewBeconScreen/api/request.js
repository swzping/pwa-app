import Config from 'react-native-config';

const LOG_PREFIX = '[Becon-Request]';
const DEFAULT_TIMEOUT = 15000;

/**
 * 创建统一错误对象
 * @param {string} message 错误信息
 * @param {string} code 错误编码
 * @param {number} status HTTP状态码
 * @param {*} data 返回数据
 */
const createRequestError = ({
  message = 'Request Error',
  code = 'UNKNOWN_ERROR',
  status = 0,
  data = null,
}) => {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  error.data = data;
  return error;
};

/**
 * 安全解析JSON
 * 防止接口返回非JSON格式导致异常
 */
const safeJson = async response => {
  try {
    return await response.json();
  } catch (e) {
    return null;
  }
};

/**
 * fetch增加超时控制
 * RN fetch默认没有timeout
 */
const fetchWithTimeout = (url, options, timeout = DEFAULT_TIMEOUT) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        createRequestError({
          message: 'Request timeout',
          code: 'TIMEOUT_ERROR',
        }),
      );
    }, timeout);

    fetch(url, options)
      .then(response => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

/**
 * 通用请求方法
 *
 * @param {Object} options
 * @param {string} options.url 请求路径
 * @param {string} options.method 请求方式 GET/POST/PUT/DELETE
 * @param {Object} options.data 请求body参数
 * @param {Object} options.params URL查询参数
 * @param {Object} options.headers 自定义请求头
 * @param {string} options.token Bearer Token
 * @param {number} options.timeout 超时时间
 * @param {string} options.baseURL 自定义接口地址
 */
const beconCommonRequest = async ({
  url,
  method = 'GET',
  data = null,
  params = null,
  headers = {},
  token,
  timeout = DEFAULT_TIMEOUT,
  baseURL = Config.BECON_API_BASE_URL,
}) => {
  let endpoint = `${baseURL}${url}`;

  // GET参数拼接
  if (params) {
    const query = new URLSearchParams(params).toString();

    if (query) {
      endpoint += `?${query}`;
    }
  }

  // 默认请求头，可通过headers覆盖
  const requestHeaders = {
    Accept: 'application/json',
    ...(data ? {'Content-Type': 'application/json'} : {}),
    ...headers,
  };

  // token默认添加Authorization
  if (token && !requestHeaders.Authorization) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const requestConfig = {
    method,
    headers: requestHeaders,
    cache: 'no-store',
  };

  // GET请求不传body
  if (method !== 'GET' && data !== null) {
    requestConfig.body = JSON.stringify(data);
  }

  let response;

  try {
    response = await fetchWithTimeout(endpoint, requestConfig, timeout);
  } catch (error) {
    // 超时或已处理错误直接抛出
    if (error.code) {
      throw error;
    }

    console.error(`${LOG_PREFIX} networkError`, {
      message: error.message,
      url,
    });

    throw createRequestError({
      message: error.message || 'Network Error',
      code: 'NETWORK_ERROR',
    });
  }

  const body = await safeJson(response);

  if (!response.ok) {
    const error = createRequestError({
      message: body?.message || `Request failed ${response.status}`,
      code: body?.code || 'REQUEST_FAILED',
      status: response.status,
      data: body,
    });

    console.error(`${LOG_PREFIX} requestError`, {
      url,
      status: error.status,
      code: error.code,
      message: error.message,
    });

    throw error;
  }

  return body;
};

export default beconCommonRequest;
