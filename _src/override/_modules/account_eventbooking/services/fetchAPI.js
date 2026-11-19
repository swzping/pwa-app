import Config from 'react-native-config';

import {Storage} from '@app/helpers/Storage';

const WAITING_ROOM_QUERY = 'query waitingRoom { waitingRoom }';
const WAITING_ROOM_GRAPHQL_PATH = new URLSearchParams({
  query: WAITING_ROOM_QUERY,
  operationName: 'waitingRoom',
  variables: '{}',
}).toString();

const request = async ({
  path,
  method = 'GET',
  authorization,
  cookie,
  signal,
  headers: customHeaders = {},
}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = await Storage.get(Storage.name.TOKEN);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${Config.PWA_BASE_URL}${path}`, {
    method,
    headers,
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || '请求失败，请稍后重试');
  }

  return response;
};

/**
 * 获取 waiting room 队列初始状态
 * 只调用一次，用于获取 Queue 所需要的 Cookie
 */
export const getOfflineEventQueue = async ({signal} = {}) => {
  const response = await request({
    path: `/graphql?${WAITING_ROOM_GRAPHQL_PATH}`,
    signal,
    headers: {
      'X-client': 'native',
    },
  });

  return {
    data: await response.json().catch(() => {
      throw new Error('Response parsing failed. Please try again later');
    }),
  };
};

/**
 * 获取队列状态（单次，不轮询）
 */
export const getQueueStatus = async ({authorization, cookie, signal} = {}) => {
  const response = await request({
    path: '/queue/status',
    authorization,
    cookie,
    signal,
  });

  return response.json();
};

/**
 * 轮询版本的队列状态请求
 * @returns {Object} 返回包含 stopPolling 方法的对象
 */
export const pollQueueStatus = ({
  authorization = '',
  cookie,
  interval = 5000,
  onSuccess,
  onError,
}) => {
  let isPollingActive = true;
  let timeoutId = null;
  let currentAbortController = null;

  const poll = async () => {
    if (!isPollingActive) {
      return;
    }
    currentAbortController = new AbortController();
    try {
      const data = await getQueueStatus({
        authorization,
        cookie,
        signal: currentAbortController.signal,
      });

      if (isPollingActive) {
        onSuccess?.(data);
        timeoutId = setTimeout(poll, interval);
      }
    } catch (error) {
      if (!isPollingActive || error.name === 'AbortError') {
        return;
      }
      onError?.(error);
      timeoutId = setTimeout(poll, interval);
    }
  };

  // 立即发起第一次请求
  poll();

  return {
    stopPolling: () => {
      isPollingActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (currentAbortController) {
        currentAbortController.abort();
      }
    },
  };
};
