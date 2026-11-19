import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

import {modules, tabsApp} from '@root/swift.config';

import {navigateTo as navigateToHelper} from '@app/helpers/Navigation';

import {fetchBeconCustomerToken} from './api/getBeconToken';

const BECON_PAGE_PATH = '/redirect?market=ID&type=main';

const normalizeProductUrlKey = value => {
  if (value === null || value === undefined) {
    return null;
  }

  let urlKey = String(value)
    .trim()
    .split(/[?#]/)[0]
    .split('/')
    .filter(Boolean)
    .pop();

  if (!urlKey) {
    return null;
  }

  try {
    urlKey = decodeURIComponent(urlKey);
  } catch (e) {
    // Keep the raw value when a configured segment contains invalid encoding.
  }

  urlKey = urlKey.replace(/\.html?$/i, '');

  if (!urlKey) {
    return null;
  }

  return urlKey;
};

const getProductUrlKey = productUrl => {
  return normalizeProductUrlKey(productUrl);
};

export const createBridgeHandlers = ({
  store,
  showLoginModal: openLoginModal,
}) => {
  const getToken = async () => {
    try {
      const beconToken = await fetchBeconCustomerToken();
      return {success: true, data: beconToken};
    } catch (e) {
      return {
        success: false,
        error: {
          code: e.code || 'BECON_TOKEN_ERROR',
          message: e.message,
          endpoint: Config.GRAPHQL_BASE_URL,
        },
      };
    }
  };

  const addToCart = async (params = {}) => {
    try {
      const {sku, quantity = 1} = params;
      if (!sku) {
        return {
          success: false,
          error: {code: 'INVALID_PARAMS', message: 'sku is required'},
        };
      }
      return new Promise(resolve => {
        store.dispatch({
          type: 'CORE_ADD_CART_API_ITEM_QUEUE',
          payload: {sku, qty: quantity},
        });
        resolve({
          success: true,
          data: {message: 'Added to cart', sku, quantity},
        });
      });
    } catch (e) {
      return {success: false, error: {code: 'CART_ERROR', message: e.message}};
    }
  };

  const navigateTo = async (options = {}) => {
    try {
      const {type, params = {}} = options;

      const routeHandlers = {
        my_account: () => {
          navigateToHelper(tabsApp.enable, tabsApp.name, {
            screen: modules.account.name,
          });
        },
        product_detail: () => {
          const {sku, url_key} = params;
          const urlKeyStr = getProductUrlKey(url_key);

          navigateToHelper(
            modules.product_detail.enable,
            modules.product_detail.name,
            {
              productUrlKey: urlKeyStr,
              productSku: sku,
            },
          );
        },
        login: () => {
          navigateToHelper(
            modules.auth_signin.enable,
            modules.auth_signin.name,
            {
              redirectRoute: {
                name: modules.webview_becon_screen.name,
                params: {
                  isNavBar: false,
                  url: `${Config.BECON_BASE_URL}${BECON_PAGE_PATH}`,
                },
              },
            },
          );
        },
        store_locator: () => {
          const baseUrl = Config.PWA_BASE_URL;
          const storeLocatorUrl = `${baseUrl}/guardian-pharmacists?hideTopNav=1&hideBottomNav=1`;
          navigateToHelper(
            modules.full_screen_web_view.enable,
            modules.full_screen_web_view.name,
            {
              isNavBar: true,
              url: storeLocatorUrl,
            },
          );
          return {success: true};
        },
      };

      const handler = routeHandlers[type];
      if (!handler) {
        return {success: false, message: 'Unknown navigation type: ' + type};
      }
      handler();
      return {success: true};
    } catch (e) {
      return {success: false, message: e.message};
    }
  };

  const showLoginModal = async () => {
    try {
      navigateToHelper(modules.auth_signin.enable, modules.auth_signin.name, {
        redirectRoute: {
          name: modules.webview_becon_screen.name,
          params: {
            isNavBar: false,
            url: `${Config.BECON_BASE_URL}${BECON_PAGE_PATH}`,
          },
        },
      });
      return {success: true, data: null};
    } catch (e) {
      return {success: false, error: {code: 'LOGIN_ERROR', message: e.message}};
    }
  };

  const showInStoreAssessmentModal = async () => {
    return {
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'In-store assessment not yet available',
      },
    };
  };

  const getAppInfo = async () => {
    try {
      const version = 'V' + DeviceInfo.getVersion();
      let country = 'ID';
      try {
        const deviceCountry = await DeviceInfo.getDeviceCountry();
        if (deviceCountry && typeof deviceCountry === 'string') {
          country = deviceCountry.toUpperCase();
        }
      } catch (_) {
        // fallback to default country
      }
      return {
        success: true,
        data: {
          code: 200,
          version,
          country,
        },
      };
    } catch (e) {
      return {success: false, error: e.message || 'something was wrong'};
    }
  };

  return {
    getToken,
    addToCart,
    navigateTo,
    showLoginModal,
    showInStoreAssessmentModal,
    getAppInfo,
  };
};
