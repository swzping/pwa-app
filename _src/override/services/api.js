import Config from 'react-native-config';

import { ApolloClient, concat, createHttpLink, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { apolloConfig } from '@root/swift.config';

import { ERROR_CUSTOMER_NOT_EXIST_LIST } from '@app/helpers/Constants';
import { Storage } from '@app/helpers/Storage';
import { ensureOAuthAccessFresh } from '@app/helpers/TokenRefresh';
import { cache, rxAppSnackbar } from '@app/services/cache';

/**
 * query
 * @param {*} schema
 * @param {*} data
 * @param {*} opts
 *
 * @return {promise}
 */
export const query = async (schema, data = null, opts = null) => {
  let configClient = { query: schema };
  if (data !== null) {
    configClient.variables = data;
  }
  if (opts !== null) {
    configClient = { ...configClient, ...opts };
  }
  return client.query(configClient);
};

/**
 * mutate
 * @param {*} schema
 * @param {*} data
 * @param {*} opts
 *
 * @return {promise}
 */
export const mutate = async (schema, data = null, opts = null) => {
  let configClient = { mutation: schema };
  if (data !== null) {
    configClient.variables = data;
  }
  if (opts !== null) {
    configClient = { ...configClient, ...opts };
  }
  return client.mutate(configClient);
};

/**
 * ---------------------------------------------------- *
 * this setup for calling graphql
 * ---------------------------------------------------- *
 */
const uri = Config.GRAPHQL_BASE_URL;
const httpLink = createHttpLink({
  useGETForQueries: apolloConfig.method === 'GET',
  uri,
});
const httpLinkPost = new HttpLink({
  uri,
});
const methodLink = new RetryLink().split(
  operation => operation.getContext().method === 'POST',
  httpLinkPost,
  httpLink,
);

const authMiddleware = setContext(async (_, { request, headers }) => {
  await ensureOAuthAccessFresh();

  const getAuthData = await Storage.get(Storage.name.TOKEN);
  const isTokenNull = getAuthData === null;
  const isAuthOff = request === 'auth-off';
  const token = isTokenNull ? '' : getAuthData;
  let headersData = { ...headers, 'Content-Type': 'application/json' };
  if (!isTokenNull && !isAuthOff) {
    headersData.Authorization = token ? `Bearer ${token}` : '';
  }

  // 添加 User-Agent
  const { getUserAgent } = require('@app/helpers/General');
  const userAgent = await getUserAgent();
  headersData['User-Agent'] = userAgent;

  if (apolloConfig.console) {
    console.log('headers', getAuthData);
    console.log('[User-Agent]', userAgent);
  }
  return { headers: headersData };
});

/**
 * ---------------------------------------------------- *
 * @constant errorLink
 * @summary 全局拦截接口错误：
 *  - 接口返回 "Customer does not exist" 时强制退出登录并返回首页
 * ---------------------------------------------------- *
 */
let customerNotExistHandled = false;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  try {
    // 收集所有错误消息（GraphQL errors + 网络错误响应体）
    const messages = [];
    if (graphQLErrors) {
      graphQLErrors.forEach(err => {
        if (err?.message) {messages.push(err.message);}
      });
    }
    if (networkError?.result?.errors) {
      networkError.result.errors.forEach(err => {
        if (err?.message) {messages.push(err.message);}
      });
    }
    if (networkError?.message) {messages.push(networkError.message);}

    if (messages.length > 0) {
      console.log('[api] errorLink messages:', JSON.stringify(messages));
    }

    const isCustomerNotExist = messages.some(msg =>
      ERROR_CUSTOMER_NOT_EXIST_LIST.includes(String(msg)),
    );

    if (isCustomerNotExist && !customerNotExistHandled) {
      customerNotExistHandled = true;
      console.log('[api] 拦截到 Customer does not exist，强制退出登录');
      rxAppSnackbar({
        message: 'Your session has expired, please login again.',
        duration: 4000,
      });
      // 延迟 require 避免循环依赖（Auth -> Navigation -> api / useDataCustomer -> api）
      // 与 Settings 一致：清 OAuth + revoke token + 清数据，然后返回首页
      const { onFullLogOut } = require('@app/hooks/customer/useDataCustomer');
      const { navReset } = require('@app/helpers/Navigation');
      const { tabsApp } = require('@root/swift.config');
      // 注意：必须等 onFullLogOut 完成（rxUserToken 置 null、AppNavigator 切到登录栈）
      // 之后再 navReset，否则先 reset 的首页会被登录栈的初始路由 auth_landing 覆盖。
      // tabsApp.name 在登录栈和 App 栈都注册了，两种状态 reset 都有效。
      onFullLogOut().then(() => {
        navReset(tabsApp.name, { withDispatch: true });
      });
      // 防抖：覆盖 onFullLogOut 的 revoke 请求往返时间，避免二次触发/重复 toast
      setTimeout(() => {
        customerNotExistHandled = false;
      }, 10000);
    }
  } catch (err) {
    console.log('[api] errorLink handle failed', err);
  }
});

/**
 * ---------------------------------------------------- *
 * @instance of apollo client
 * @summary all middleware, httplink, etc.
 * ---------------------------------------------------- *
 */
const client = new ApolloClient({
  cache,
  link: concat(authMiddleware, concat(errorLink, methodLink)),
});

export default client;
