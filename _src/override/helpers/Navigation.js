import * as React from 'react';
import {Linking} from 'react-native';

import Config from 'react-native-config';

import {CommonActions, StackActions} from '@react-navigation/native';

import analytics from '@react-native-firebase/analytics';
import {modules} from '@root/swift.config';

import gql from 'graphql-tag';

import {URL_RESOLVER} from '@app/_modules/product_list/services/schema';
import {
  CATEGORY,
  OFFLINE_ACTIVITY_DETAIL,
  TYPE_PAGE,
} from '@app/helpers/Constants';
import {LogUtils} from '@app/helpers/LoggerUtils';
import {Storage} from '@app/helpers/Storage';
import {query} from '@app/services/api';
import {rxAppSnackbar} from '@app/services/cache';
import {filterGraphql} from '@app/services/helper';
import {CmsStyles, Colors} from '@app/styles';

const ACCOUNT_STATUS_BAR_COLOR = '#FF9225';

// GraphQL 查询：获取 CMS 页面内容以判断渲染方式
const GET_CMS_PAGE_CONTENT = gql(
  filterGraphql(`
    query CmsPageContent($identifier: String) {
      cmsPage(identifier: $identifier) {
        content
      }
    }
  `),
);

export const navigationRef = React.createRef();

export const navigate = (name, params) => {
  analytics().logEvent(name);
  navigationRef?.current?.navigate(name, params);
};

export const stackReset = (stacks = []) => {
  navigationRef?.current?.reset({
    index: Math.max(stacks.length - 1, 0),
    routes: stacks,
  });
};

export const navReset = (name, opts = {}) => {
  const params = opts?.params;
  if (opts?.withDispatch) {
    // 注：navigation.reset() 在 React Navigation v7 中内部已 dispatch 且返回 undefined，
    // 不能再把它传给 dispatch()，否则会报 Cannot read property 'target' of undefined。
    navigationRef?.current?.dispatch(
      CommonActions.reset({index: 0, routes: [{key: name, name, params}]}),
    );
  } else {
    navigationRef?.current?.reset({
      index: 0,
      routes: [{key: name, name, params}],
    });
  }
};

/**
 * function for navigate without same screen
 * @returns
 */
export function navigateTo(isEnable, name, params = {}) {
  if (!isEnable) {
    return rxAppSnackbar({
      message: `${name} feature is currently disabled!`,
    });
  }
  analytics().logEvent(name);
  return navigationRef.current?.navigate(name, params);
}

/**
 * function for navigate with same screen
 * @returns
 */
export function navigatePushTo(isEnable, name, params = {}) {
  if (!isEnable) {
    return rxAppSnackbar({
      message: `${name} feature is currently disabled!`,
    });
  }
  analytics().logEvent(name);
  return navigationRef.current?.dispatch(StackActions.push(name, params));
}

export function pushTo(navigation, isEnable, name, params = {}) {
  if (!isEnable) {
    return rxAppSnackbar({
      message: `${name} feature is currently disabled!`,
    });
  }
  analytics().logEvent(name);
  return navigation?.push(name, params);
}

const getOfflineActivityDetailId = fullUrl =>
  fullUrl
    ?.split('eventId=')[1]
    ?.split('&')[0]
    ?.replace(/,+$/, '');

const openOfflineActivityDetail = async fullUrl => {
  let token = null;

  try {
    token = await Storage.get(Storage.name.TOKEN);
  } catch (error) {
    LogUtils.error('[Navigation] Failed to get user token', error);
  }

  if (!token) {
    navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    return true;
  }

  const eventId = getOfflineActivityDetailId(fullUrl);
  if (eventId) {
    navigateTo(modules.event_detail.enable, modules.event_detail.name, {
      id: eventId,
    });
  }

  return true;
};

const openUrlInsideApp = fullUrl => {
  if (
    !fullUrl ||
    !modules?.hignlight_Web_View?.enable ||
    !modules?.hignlight_Web_View?.name
  ) {
    return false;
  }

  navigatePushTo(
    modules.hignlight_Web_View.enable,
    modules.hignlight_Web_View.name,
    {url: fullUrl},
  );

  return true;
};

export const navigateUrlToPage = async ({t, fullUrl, type, id, url_key}) => {
  console.log(t, fullUrl, type, id, url_key);
  if (fullUrl?.includes('/brands')) {
    navigateTo(modules.brand_page.enable, modules.brand_page.name);
  } else if (fullUrl?.includes('/blog')) {
    navigateTo(modules.blog_list.enable, modules.blog_list.name);
  } else if (type === 'CATEGORY') {
    // 使用 push，避免重复 navigate 导致回退直接到首页
    navigatePushTo(modules.product_list.enable, modules.product_list.name, {
      type: CATEGORY,
      categoryId: id,
    });
    return;
  } else if (type === 'PRODUCT') {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey: url_key,
    });
    return;
  } else if (url_key === 'home') {
    navigateTo(modules.main_home.enable, modules.main_home.name);
    return;
  } else if (type === 'CMS_PAGE') {
    // 不再显示全局 loading，依赖各页面自身的骨架/局部 loading
    try {
      const cmsContent = await query(GET_CMS_PAGE_CONTENT, {
        identifier: url_key,
      });
      const htmlContent = cmsContent?.data?.cmsPage?.content || '';
      const isPageBuilder =
        url_key === 'guardian-family' || url_key === 'review-produk';
      const hasHtmlContentType = htmlContent.includes(
        'data-content-type="html"',
      );
      if (hasHtmlContentType || isPageBuilder) {
        navigateTo(modules.cms_page.enable, modules.cms_page.name, {
          identifier: url_key,
          type: TYPE_PAGE,
          tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
          classesStyles: CmsStyles.classesStylesPrivacyPolicy,
          isPageBuilder,
        });
      } else {
        navigateTo(modules.new_cms.enable, modules.new_cms.name, {
          identifier: url_key,
          tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
          classesStyles: CmsStyles.classesStylesPrivacyPolicy,
        });
      }
    } catch (error) {
      navigateTo(modules.cms_page.enable, modules.cms_page.name, {
        identifier: url_key,
        type: TYPE_PAGE,
        tagsStyles: CmsStyles.tagStylesPrivacyPolicy,
        classesStyles: CmsStyles.classesStylesPrivacyPolicy,
      });
    }
    return;
  } else if (fullUrl?.includes(OFFLINE_ACTIVITY_DETAIL)) {
    await openOfflineActivityDetail(fullUrl);
    return;
  } else if (openUrlInsideApp(fullUrl)) {
    return;
  }

  const isSupported = await Linking.canOpenURL(fullUrl);
  if (isSupported) {
    await Linking.openURL(fullUrl);
  } else {
    rxAppSnackbar({
      message: `${t('message.urlNotFound')} ${fullUrl}`,
    });
  }
};

export const getStatusBarColor = routeName => {
  switch (routeName) {
    case 'MainHome':
      return Colors.ORANGE_LIGHT;
    case 'Account':
      return ACCOUNT_STATUS_BAR_COLOR;
    case 'Cart':
      return '#F2F0ED';
    default:
      return Colors.WHITE;
  }
};

const parseWebUrlToUrlkey = url => {
  const tmpStr = url.split('?')?.[0];
  return tmpStr.replace(`${Config.PWA_BASE_URL}`, '');
};

export const resolveWebUrl = originUrl => {
  if (!originUrl?.includes(Config.PWA_BASE_URL)) {
    return;
  }
  return parseWebUrlToUrlkey(originUrl);
};

export const redirectWebUrl = urlData => {
  if (!urlData) {
    return;
  }
  const {type, relative_url, id} = urlData;
  switch (type) {
    case 'CATEGORY':
      if (id) {
        navigateTo(modules.product_list.enable, modules.product_list.name, {
          type: 'category',
          categoryId: id,
        });
      }
      return;
    case 'PRODUCT':
      if (relative_url) {
        navigateTo(modules.product_detail.enable, modules.product_detail.name, {
          productUrlKey: relative_url.split('.html')?.[0],
        });
      }
      return;
    default:
      return;
  }
};

/**
 * @param {{ link: string }} url
 * @param {Function} t
 */
export async function resolveLinkAndNavigate(url, t) {
  try {
    if (!url) {
      return;
    }
    // 不再显示全局 loading，依赖各页面自身的骨架/局部 loading
    const res = await query(URL_RESOLVER, {url});

    const {type, id, relative_url} = res.data?.urlResolver || {};
    const url_key = relative_url?.replace('.html', '');
    navigateUrlToPage({t, fullUrl: url, type, id, url_key});
  } catch (err) {
    LogUtils.error('[resolveLinkAndNavigate] error: ', err);
  }
}
