import {AppState, useEffect, useRef, useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';

import {Adjust} from 'react-native-adjust';
import DeviceInfo from 'react-native-device-info';

import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import Geolocation from '@react-native-community/geolocation';
import messaging from '@react-native-firebase/messaging';
import {
  trackObtainDeviceToken,
  trackPushArrive,
  trackPushClick,
  trackPushSubscribe,
  trackPushUnsubscribe,
} from '@root/_src/core/track';
import {modules, pushNotificationConfig, tabsApp} from '@root/swift.config';

import _ from 'lodash';

import {
  CATEGORY,
  IS_IOS,
  NOTIF_ABANDONED_CART,
  NOTIF_CMS_PAGE,
  NOTIF_PROMO_CATEGORY,
  NOTIF_PROMO_PRODUCT,
} from '@app/helpers/Constants';
import {
  navigatePushTo,
  navigateTo,
  navReset,
  resolveLinkAndNavigate,
} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import client from '@app/services/api';
import {VIEW_NOTIFICATION} from '@app/services/queries/notification';
import {SUBSCRIBER_INFO} from '@app/services/queries/user';

/**
 * ---------------------------------------------------- *
 * @function onPostSubscribers
 * @param {token, isReturn}
 * @summary for post subscriber id with firebase id
 * ---------------------------------------------------- *
 */
export const onPostFcmSubscribers = async ({isReturn = false}) => {
  try {
    const isSubscribed = await Storage.get(Storage.name.FCM_SUBSCRIBER_MAGENTO);
    const fcmToken =
      (await Storage.get(Storage.name.FCM_TOKEN)) ??
      (await messaging().getToken());

    if (isSubscribed) {
      return true;
    }

    const deviceInfo = {
      os: Platform.OS,
      brand: DeviceInfo.getBrand(),
      version: DeviceInfo.getSystemVersion(),
    };

    const res = await client.mutate({
      mutation: SUBSCRIBER_INFO,
      variables: {
        userToken: fcmToken,
        userDevice: JSON.stringify(deviceInfo),
      },
    });

    const isSuccess = _.get(res, 'data.subscriberInfo.status');

    if (isSuccess) {
      Storage.set(Storage.name.FCM_SUBSCRIBER_MAGENTO, fcmToken);
    }

    if (isReturn) {
      return res;
    }
  } catch (err) {
    console.log('[err] fcm notification', err);
  }
};

/**
 * 退订 FCM 订阅（topic）并上报
 */
// export const onUnsubscribeFcmSubscribers = async ({ topic = 'notifications' } = {}) => {
//   try {
//     await messaging().unsubscribeFromTopic(topic);
//     // Storage.delete && Storage.delete(Storage.name.FCM_SUBSCRIBER_MAGENTO);
//     await trackPushUnsubscribe({ topic });
//     return true;
//   } catch (err) {
//     console.log('[err] unsubscribe fcm', err);
//     return false;
//   }
// };

const ORDER_NOTIFICATION_TYPES = [
  'order',
  'order_status',
  'order-status',
  'orderstatus',
  'order_update',
  'order-update',
  'orderupdate',
  'order_detail',
  'order-detail',
  'orderdetail',
];

// 没有地方使用 直接干掉 影响提交
// const ORDER_NUMBER_KEYS = [
//   'order_number',
//   'orderNumber',
//   'order_id',
//   'orderId',
//   'increment_id',
// ];

const ORDER_EMAIL_KEYS = ['email', 'customer_email', 'customerEmail'];

const escapeRegExp = value => `${value}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const getContextData = remoteMessage => {
  if (!remoteMessage || !remoteMessage?.data || !remoteMessage?.data?.context) {
    return {
      campaignId: '',
      publishId: '',
      msgId: '',
      batchId: '',
      taskId: '',
      stepId: '',
      instanceId: '',
    };
  }
  let context = _.get(remoteMessage, 'data.context');

  // 如果context是字符串，尝试解析为对象
  if (typeof context === 'string') {
    try {
      context = JSON.parse(context);
    } catch (e) {
      console.warn(
        '[usePushNotification] Failed to parse context string:',
        context,
      );
      context = {
        campaignId: '',
        publishId: '',
        msgId: '',
        batchId: '',
        taskId: '',
        stepId: '',
        instanceId: '',
      };
    }
  }

  // 确保context是对象
  if (!context || typeof context !== 'object') {
    context = {
      campaignId: '',
      publishId: '',
      msgId: '',
      batchId: '',
      taskId: '',
      stepId: '',
      instanceId: '',
    };
  }

  return context;
};

const decodeUrlValue = value => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const sanitizedValue = `${value}`.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(sanitizedValue);
  } catch (error) {
    return sanitizedValue || null;
  }
};

const getQueryParamValue = (url, keys = []) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const normalizedKeys =
    Array.isArray(keys) && keys.length > 0
      ? keys.map(key => `${key}`.toLowerCase())
      : null;

  const matchesKey = rawKey => {
    if (!normalizedKeys || !normalizedKeys.length) {
      return true;
    }
    return normalizedKeys.includes(`${rawKey}`.toLowerCase());
  };

  const tryParseQueryString = queryString => {
    if (!queryString) {
      return null;
    }
    const params = queryString.split('&');
    for (let i = params.length - 1; i >= 0; i -= 1) {
      const param = params[i];
      if (!param) {
        continue;
      }
      const [rawKey, rawValue = ''] = param.split('=');
      if (!rawKey || !matchesKey(rawKey)) {
        continue;
      }
      const decoded = decodeUrlValue(rawValue);
      if (decoded) {
        return decoded;
      }
    }
    return null;
  };

  try {
    const questionMarkIndex = url.indexOf('?');
    if (questionMarkIndex > -1) {
      const queryString = url.substring(questionMarkIndex + 1).split('#')[0];
      const queryValue = tryParseQueryString(queryString);
      if (queryValue) {
        return queryValue;
      }
    }
  } catch (error) {
    // Error parsing query string
  }

  try {
    if (normalizedKeys && normalizedKeys.length) {
      const pattern = normalizedKeys.map(escapeRegExp).join('|');
      const pathMatch = url.match(/^[^:]+:\/\/[^/]+(.*)$/);
      const pathPart = pathMatch ? pathMatch[1] : url;

      const regex = new RegExp(`(?:${pattern})(?:=|/|:)([^/?#&]+)`, 'i');
      const match = pathPart.match(regex);
      if (match && match[1]) {
        const decoded = decodeUrlValue(match[1]);
        if (decoded) {
          return decoded;
        }
      }
    }
  } catch (error) {
    // Error parsing regex
  }

  return null;
};

const sanitizeUrlInput = url => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  return `${url}`.trim().replace(/^@+/, '');
};

const getOrderNumberFromUrlPath = url => {
  try {
    const input = sanitizeUrlInput(url);
    if (!input) {
      return null;
    }
    const match = input.match(/\/order\/([^/?#]+)/i);
    if (match && match[1]) {
      return decodeUrlValue(match[1]);
    }
  } catch (error) {
    // Error parsing order number from URL
  }
  return null;
};

const getHealthCheckIdFromUrl = url => {
  try {
    const input = sanitizeUrlInput(url);
    if (!input) {
      return null;
    }

    const idFromQuery = getQueryParamValue(input, ['id']);
    if (idFromQuery) {
      return idFromQuery;
    }

    const match = input.match(/health-detail\/(\d+)(?:[/?#]|$)/i);
    if (match && match[1]) {
      return decodeUrlValue(match[1]);
    }
  } catch (error) {
    // Error parsing health check ID from URL
  }
  return null;
};

const getNotificationIdFromUrl = url => {
  try {
    const input = sanitizeUrlInput(url);
    if (!input) {
      console.log('[getNotificationIdFromUrl] Empty input after sanitization');
      return null;
    }

    console.log('[getNotificationIdFromUrl] Processing URL:', input);

    // 移除查询参数和锚点，只处理路径部分
    const pathOnly = input.split('?')[0].split('#')[0];

    // 从路径的最后一个 / 后面提取数字
    const match = pathOnly.match(/\/(\d+)\/?$/);
    if (match && match[1]) {
      console.log(
        '[getNotificationIdFromUrl] Extracted ID from path:',
        match[1],
      );
      return match[1];
    }

    console.warn(
      '[getNotificationIdFromUrl] Could not extract ID from URL:',
      url,
    );
  } catch (error) {
    console.error(
      '[getNotificationIdFromUrl] Error parsing notification ID:',
      error,
    );
  }
  return null;
};

const getFirstAvailableValue = (source, keys = []) => {
  if (!source || !keys || !keys.length) {
    return null;
  }
  for (const key of keys) {
    const value = _.get(source, key);
    if (value !== undefined && value !== null && `${value}` !== '') {
      return value;
    }
  }
  return null;
};

const tryNavigateToOrderDetailFromPush = payload => {
  const data = _.get(payload, 'data') || {};
  const type = `${_.get(data, 'type', '')}`.toLowerCase();
  const categoryType = `${_.get(data, 'category_type', '')}`.toLowerCase();
  const redirectUrl =
    _.get(data, 'redirect_url') ||
    _.get(data, 'url') ||
    _.get(payload, 'redirect_url') ||
    _.get(payload, 'url');

  const orderNumber = getOrderNumberFromUrlPath(redirectUrl);

  const looksLikeOrder =
    ORDER_NOTIFICATION_TYPES.includes(type) ||
    ORDER_NOTIFICATION_TYPES.includes(categoryType) ||
    type.includes('order') ||
    categoryType.includes('order') ||
    (typeof redirectUrl === 'string' &&
      redirectUrl.toLowerCase().includes('order')) ||
    Boolean(orderNumber);

  if (!looksLikeOrder || !orderNumber) {
    return false;
  }

  const email =
    getFirstAvailableValue(data, ORDER_EMAIL_KEYS) ||
    getQueryParamValue(redirectUrl, ORDER_EMAIL_KEYS) ||
    '';

  navigateTo(
    modules.account_purchases_detail.enable,
    modules.account_purchases_detail.name,
    {
      order_number: orderNumber,
      email,
    },
  );

  return true;
};

const normalizeTypeValue = (value, preserveSymbols = false) => {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = `${value}`.trim();
  if (!stringValue) {
    return '';
  }
  const lowered = stringValue.toLowerCase();
  if (preserveSymbols) {
    return lowered;
  }
  return lowered.replace(/\s+/g, '_');
};

/**
 * 提取通知元数据用于埋点
 * @param {Object} notification - 通知对象
 * @returns {Object} 标准化的元数据
 */
// const extractNotificationMetadata = notification => {
//   const payload = _.get(notification, 'data') || _.get(notification, 'notification') || {};
//   const data = payload.data || payload;

//   const notificationId =
//     _.get(data, 'notification_id') ||
//     _.get(data, 'entity_id') ||
//     _.get(data, 'publish_id') ||
//     _.get(data, 'id') ||
//     '';

//   const notificationType = normalizeTypeValue(
//     _.get(data, 'type') || _.get(data, 'notification_type')
//   );

//   const notificationCategory = normalizeTypeValue(
//     _.get(data, 'category_type') || _.get(data, 'category')
//   );

//   const publishId =
//     _.get(data, 'publish_id') ||
//     _.get(data, 'entity_id') ||
//     notificationId ||
//     '';

//   const redirectUrl =
//     _.get(data, 'redirect_url') ||
//     _.get(data, 'url') ||
//     '';

//   const hasRedirectUrl = !!redirectUrl && redirectUrl.length > 0;

//   const redirectType = normalizeTypeValue(
//     _.get(data, 'redirect_type') || _.get(data, 'redirection_type')
//   );

//   const fcmMessageId = _.get(notification, 'messageId') || '';

//   return {
//     notification_id: notificationId,
//     notification_type: notificationType,
//     notification_category: notificationCategory,
//     publish_id: publishId,
//     has_redirect_url: hasRedirectUrl,
//     redirect_type: redirectType,
//     deep_link_url: redirectUrl,
//     fcm_message_id: fcmMessageId,
//   };
// };

/**
 * navigate to page
 * @param {*} data
 */
export const navigateToPage = async data => {
  console.log('[usePushNotification] navigateToPage invoked with:', data);
  const payload = _.get(data, 'data') || {};
  const redirectUrl =
    _.get(payload, 'url') ||
    _.get(payload, 'redirect_url') ||
    _.get(data, 'url') ||
    _.get(data, 'redirect_url');

  const categoryType = normalizeTypeValue(_.get(payload, 'category_type'));
  const knownCategoryTypes = [
    'profile_completion',
    'milestone_completion',
    'abandoned_cart',
    'offline_order',
  ];

  const typeCandidates = [
    ...(knownCategoryTypes.includes(categoryType)
      ? [{value: categoryType, preserveSymbols: false}]
      : []),
    {value: _.get(payload, 'type'), preserveSymbols: true},
    {value: _.get(payload, 'redirect_type'), preserveSymbols: false},
    {value: _.get(payload, 'redirection_type'), preserveSymbols: false},
    {value: _.get(payload, 'notification_type'), preserveSymbols: false},
  ];

  let type = '';
  for (const candidate of typeCandidates) {
    if (candidate.value) {
      const normalized = normalizeTypeValue(
        candidate.value,
        candidate.preserveSymbols,
      );
      if (normalized) {
        type = normalized;
        break;
      }
    }
  }

  const redirectType = normalizeTypeValue(
    _.get(payload, 'redirect_type') || _.get(payload, 'redirection_type'),
  );
  const notificationType = normalizeTypeValue(
    _.get(payload, 'notification_type'),
  );
  const publishId =
    _.get(payload, 'publish_id') ||
    _.get(payload, 'entity_id') ||
    _.get(payload, 'id');

  const handledOrder = tryNavigateToOrderDetailFromPush(data);
  if (handledOrder) {
    return;
  }

  const navigateToNotificationDetail = async () => {
    // 优先从 URL 提取 ID，然后尝试其他字段
    const notificationId =
      getNotificationIdFromUrl(redirectUrl) ||
      publishId ||
      _.get(payload, 'notification_id') ||
      _.get(data, 'notification_id');

    console.log('[navigateToNotificationDetail] Navigate with ID:', {
      notificationId,
      redirectUrl,
      publishId,
    });

    if (!notificationId) {
      console.warn('[navigateToNotificationDetail] No notification ID found');
      return;
    }

    try {
      // 调用 API 获取完整的通知数据
      const result = await client.query({
        query: VIEW_NOTIFICATION,
        variables: {
          publishId: parseInt(notificationId, 10),
        },
        fetchPolicy: 'network-only',
      });

      const notificationData = result?.data?.viewNotification;

      if (notificationData) {
        console.log(
          '[navigateToNotificationDetail] Got notification data:',
          notificationData,
        );

        // 传递完整的通知数据到详情页
        navigateTo(
          modules.account_notification_detail.enable,
          modules.account_notification_detail.name,
          {
            publish_id: notificationId,
            ...notificationData,
          },
        );
      } else {
        console.warn(
          '[navigateToNotificationDetail] No data returned from API',
        );
        // 如果 API 失败，仍然尝试跳转，只传 ID
        navigateTo(
          modules.account_notification_detail.enable,
          modules.account_notification_detail.name,
          {
            publish_id: notificationId,
          },
        );
      }
    } catch (error) {
      console.error(
        '[navigateToNotificationDetail] Error fetching notification:',
        error,
      );
      // 如果出错，仍然尝试跳转，只传 ID
      navigateTo(
        modules.account_notification_detail.enable,
        modules.account_notification_detail.name,
        {
          publish_id: notificationId,
        },
      );
    }
  };

  const navigateToHealthReportDetail = () => {
    const entityId =
      _.get(payload, 'entity_id') ||
      _.get(payload, 'healthcheck_id') ||
      _.get(payload, 'health_check_id') ||
      getHealthCheckIdFromUrl(redirectUrl);
    if (entityId) {
      navigateTo(
        modules.account_health_report_detail.enable,
        modules.account_health_report_detail.name,
        {
          entityId,
          report: payload.report ?? null,
        },
      );
      return true;
    }
    return false;
  };

  const navigateByUrl = async () => {
    if (!redirectUrl) {
      return false;
    }

    const healthId = getHealthCheckIdFromUrl(redirectUrl);
    if (healthId) {
      navigateTo(
        modules.account_health_report_detail.enable,
        modules.account_health_report_detail.name,
        {
          entityId: healthId,
          report: payload.report ?? null,
        },
      );
      return true;
    }

    await resolveLinkAndNavigate(redirectUrl);
    return true;
  };

  const navigateToVoucherDetail = () => {
    // 后端复用线上券的 voucher_distribution 通知,线下券靠 payload 里的
    // voucher_type: 'offline_voucher' 区分,voucher_uid 为线下券 uid,
    // 直接进 MyVoucher 的 Offline 券详情页
    const voucherUid = _.get(payload, 'voucher_uid');
    if (_.get(payload, 'voucher_type') === 'offline_voucher' && voucherUid) {
      navigateTo(
        modules.account_mycoupon_detail.enable,
        modules.account_mycoupon_detail.name,
        {uid: voucherUid},
      );
      return;
    }
    navigateTo(modules.coupon_list.enable, modules.coupon_list.name, {
      voucherCode: redirectUrl,
    });
  };

  if (type) {
    try {
      console.log('[usePushNotification] navigateToPage payload:', {
        type,
        redirectType,
        notificationType,
        data: payload,
      });

      switch (type) {
        case NOTIF_PROMO_PRODUCT:
        case 'product': {
          const productUrlKey =
            _.get(payload, 'url_key') ||
            _.get(payload, 'product_url_key') ||
            '';
          if (productUrlKey) {
            navigatePushTo(
              modules.product_detail.enable,
              modules.product_detail.name,
              {
                productUrlKey,
              },
            );
            break;
          }
          const handledProduct = await navigateByUrl();
          if (!handledProduct) {
            navReset(tabsApp.name);
          }
          break;
        }
        case NOTIF_PROMO_CATEGORY:
        case 'category': {
          const categoryId =
            _.get(payload, 'id') ||
            _.get(payload, 'category_id') ||
            _.get(payload, 'category_identifier') ||
            '';
          if (categoryId) {
            navigatePushTo(
              modules.product_list.enable,
              modules.product_list.name,
              {
                type: CATEGORY,
                categoryId,
              },
            );
            break;
          }
          const handledCategory = await navigateByUrl();
          if (!handledCategory) {
            navReset(tabsApp.name);
          }
          break;
        }
        case NOTIF_ABANDONED_CART:
        case 'abandoned_cart':
          navigateTo(modules.cart.enable, modules.cart.name, {
            refreshCartAt: Date.now(),
          });
          break;
        case 'profile_completion':
          navigateTo(
            modules.account_update_information.enable,
            modules.account_update_information.name,
          );
          break;
        case 'milestone_completion':
          navigateTo(
            modules.account_milestone.enable,
            modules.account_milestone.name,
          );
          break;
        case 'offline_order':
          navigateTo(
            modules.account_purchases.enable,
            modules.account_purchases.name,
            {initialSection: 'offline'},
          );
          break;
        case 'becon_report':
          navigateTo(tabsApp.enable, tabsApp.name, {
            screen: modules.account.name,
          });
          break;
        case NOTIF_CMS_PAGE:
        case 'cms_page': {
          const identifier =
            _.get(payload, 'identifier') ||
            _.get(payload, 'cms_identifier') ||
            _.get(payload, 'url_key') ||
            '';
          if (identifier) {
            navigatePushTo(modules.cms_page.enable, modules.cms_page.name, {
              identifier,
              useWebview: true,
            });
            break;
          }
          const handledCms = await navigateByUrl();
          if (!handledCms) {
            navReset(tabsApp.name);
          }
          break;
        }
        case 'specific_url': {
          const handledSpecific = await navigateByUrl();
          if (!handledSpecific) {
            navReset(tabsApp.name);
          }
          break;
        }
        case 'notification_detail':
          await navigateToNotificationDetail();
          break;
        case 'announcement': {
          const targetType =
            _.get(payload, 'target_type') ||
            _.get(payload, 'targetType') ||
            _.get(data, 'target_type') ||
            _.get(data, 'targetType');

          console.log('[usePushNotification] announcement handler:', {
            targetType,
            redirectUrl,
            payload,
          });

          // 如果 target_type 为 'notification_detail'，直接跳转到通知详情页
          if (targetType === 'notification_detail') {
            console.log(
              '[usePushNotification] Navigating to notification detail page',
            );
            await navigateToNotificationDetail();
            break;
          }

          // 如果 target_type 为 'url'，使用 WebView 打开
          if (
            targetType === 'url' &&
            redirectUrl &&
            redirectUrl.trim() !== ''
          ) {
            console.log(
              '[usePushNotification] Opening announcement URL in WebView:',
              redirectUrl,
            );
            navigateTo(
              modules.hignlight_Web_View.enable,
              modules.hignlight_Web_View.name,
              {url: redirectUrl},
            );
            break;
          }

          // 其他所有情况（包括 category），使用 resolveLinkAndNavigate 直接解析
          // 参考 account_notification/_controller.js 的 readNotification 逻辑
          // 不使用 navigateByUrl，因为它内部会先检查 health-check，导致误判
          if (redirectUrl && redirectUrl.trim() !== '') {
            console.log(
              '[usePushNotification] Resolving announcement URL:',
              redirectUrl,
            );
            await resolveLinkAndNavigate(redirectUrl);
          } else {
            await navigateToNotificationDetail();
          }
          break;
        }
        case 'health_check': {
          const handledHealth = navigateToHealthReportDetail();
          if (!handledHealth) {
            await navigateByUrl();
          }
          break;
        }
        case 'voucher_distribution': {
          navigateToVoucherDetail();
          break;
        }
        default: {
          const handledFallback = await navigateByUrl();
          if (!handledFallback) {
            navReset(tabsApp.name);
          }
          break;
        }
      }
    } catch (err) {
      console.log('[err] handle notification', err);
      navReset(tabsApp.name);
    }
  } else if (redirectType === 'notification_detail') {
    await navigateToNotificationDetail();
  } else if (notificationType === 'health_check') {
    const handledHealth = navigateToHealthReportDetail();
    if (!handledHealth) {
      await navigateByUrl();
    }
  } else if (!(await navigateByUrl())) {
    navReset(tabsApp.name);
  }
};

/**
 * main push notif hook
 * @returns
 */
const usePushNotification = () => {
  const timeout = useRef(null);
  const [notificationData, setNotificationData] = useState(null);

  const getFcmToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        Storage.set(Storage.name.FCM_TOKEN, fcmToken);
        Adjust.setPushToken(fcmToken);
        if (pushNotificationConfig.console) {
          console.log('[res] get fcm token', fcmToken);
        }
      }
    } catch (e) {
      console.log('[err] get fcm token', e);
    }
  };

  const onRequestUserPermission = async () => {
    // Android 13+ 需要请求通知权限
    let granted = false;
    if (Platform.OS === 'android') {
      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL ||
      (Platform.OS === 'android' &&
        granted === PermissionsAndroid.RESULTS.GRANTED);

    if (enabled) {
      getFcmToken().then(() => {
        trackObtainDeviceToken();
      }); //<---- Add this
    }
    setTimeout(() => {
      Adjust.requestAppTrackingAuthorization(function (status) {
        console.log('[Adjust]: Authorization status update!', status);
        Geolocation.getCurrentPosition(
          info => {},
          () => {},
          !IS_IOS
            ? {}
            : {enableHighAccuracy: true, timeout: 20000, maximumAge: 3600000},
        );
      });
    }, 1000);
  };

  const onPressNotif = async props => {
    if (props) {
      setNotificationData(props);
    }
    await notifee.cancelNotification(props.id);
  };

  useEffect(() => {
    let unsubscribe;
    let appStateListener;

    // 检查通知权限，如果被关闭则上报取消订阅
    const checkNotificationPermission = async () => {
      try {
        const authStatus = await messaging().hasPermission();
        const isEnabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL ||
          (Platform.OS === 'android' &&
            authStatus === messaging.AuthorizationStatus.NOT_DETERMINED);

        if (!isEnabled) {
          await trackPushUnsubscribe();
        }
      } catch (e) {
        // ignore
      }
    };

    async function initialize() {
      await onRequestUserPermission();
    }

    initialize().then(async () => {
      await messaging().subscribeToTopic('notifications');
      await trackPushSubscribe();

      await notifee.createChannel({
        id: 'guardian_notification',
        name: 'Guardian notification',
      });

      messaging().onTokenRefresh(async newToken => {
        try {
          // Storage.set(Storage.name.FCM_TOKEN, newToken);
          await trackObtainDeviceToken();
        } catch (e) {}
      });

      // 监听应用状态变化，回到前台时检查权限
      appStateListener = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          checkNotificationPermission();
        }
      });
    });

    // --> when notification app opened
    unsubscribe = messaging().onMessage(async remoteMessage => {
      try {
        const context = getContextData(remoteMessage);
        await trackPushArrive({
          campaign_id:
            _.get(remoteMessage, 'data.campaign_id') ||
            _.get(remoteMessage, 'data.campaignId') ||
            context?.campaign_id ||
            context?.campaignId,
          publish_id:
            _.get(remoteMessage, 'data.publish_id') ||
            _.get(remoteMessage, 'data.publishId') ||
            context?.publish_id ||
            context?.publishId,
          msg_id:
            _.get(remoteMessage, 'data.msg_id') ||
            _.get(remoteMessage, 'data.msgId') ||
            context?.msg_id ||
            context?.msgId,
          batch_id:
            _.get(remoteMessage, 'data.batch_id') ||
            _.get(remoteMessage, 'data.batchId') ||
            context?.batch_id ||
            context?.batchId,
          task_id:
            _.get(remoteMessage, 'data.task_id') ||
            _.get(remoteMessage, 'data.taskId') ||
            context?.task_id ||
            context?.taskId,
          step_id:
            _.get(remoteMessage, 'data.step_id') ||
            _.get(remoteMessage, 'data.stepId') ||
            context?.step_id ||
            context?.stepId,
          instance_id:
            _.get(remoteMessage, 'data.instance_id') ||
            _.get(remoteMessage, 'data.instanceId') ||
            context?.instance_id ||
            context?.instanceId,
          p_instance_id:
            _.get(remoteMessage, 'data.p_instance_id') ||
            _.get(remoteMessage, 'data.p_instanceId') ||
            context?.p_instance_id ||
            context?.p_instanceId,
        });
      } catch (e) {
        console.log('[err] track push arrive foreground', e);
      }
      const getSafeString = val => {
        if (
          val === null ||
          val === undefined ||
          val === 'null' ||
          val === 'undefined'
        ) {
          return '';
        }
        return String(val).trim();
      };

      const title = getSafeString(
        _.get(remoteMessage, 'notification.title') ||
          _.get(remoteMessage, 'data.title'),
      );
      const body = getSafeString(
        _.get(remoteMessage, 'notification.body') ||
          _.get(remoteMessage, 'data.body') ||
          _.get(remoteMessage, 'data.message'),
      );
      const data = _.get(remoteMessage, 'data');
      const imageUrlAndroid = _.get(
        remoteMessage,
        'notification.android.imageUrl',
      );

      let androidOptions = {
        channelId: 'guardian_notification',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        smallIcon: 'ic_notification_transparent',
        color: '#FF8300',
        groupId: 'guardian_group',
      };
      if (imageUrlAndroid) {
        androidOptions.largeIcon = imageUrlAndroid;
      }

      await notifee.displayNotification({
        title,
        body,
        data,
        android: androidOptions,
      });

      // 为 Android 分组显示提供摘要通知，防止收起时显示 "null"
      if (Platform.OS === 'android') {
        await notifee.displayNotification({
          id: 'guardian_group_summary',
          title: title || 'Guardian',
          body: body || '',
          android: {
            channelId: 'guardian_notification',
            groupId: 'guardian_group',
            groupSummary: true,
            smallIcon: 'ic_notification_transparent',
            color: '#FF8300',
            pressAction: {
              id: 'default',
            },
          },
        });
      }
    });

    // for notifee foreground
    notifee.onForegroundEvent(async ({type, detail}) => {
      switch (type) {
        case EventType.DISMISSED:
          await notifee.cancelNotification(detail.notification.id);
          break;
        case EventType.PRESS:
          try {
            const context = getContextData(detail.notification);
            trackPushClick({
              campaign_id: context.campaign_id || context.campaignId,
              publish_id: context.publish_id || context.publishId,
              msg_id: context.msg_id || context.msgId,
              batch_id: context.batch_id || context.batchId,
              task_id: context.task_id || context.taskId,
              step_id: context.step_id || context.stepId,
              instance_id: context.instance_id || context.instanceId,
              p_instance_id: context.instance_id || context.instanceId,
            });
          } catch (e) {}
          await onPressNotif(detail.notification);
          break;
        default:
          break;
      }
    });

    // for notifee background
    notifee.onBackgroundEvent(async ({type, detail}) => {
      const context = getContextData(detail.notification);
      switch (type) {
        case EventType.DISMISSED:
          await notifee.cancelNotification(detail.notification.id);
          break;
        case EventType.PRESS:
          try {
            trackPushClick({
              campaign_id: context.campaign_id || context.campaignId,
              publish_id: context.publish_id || context.publishId,
              msg_id: context.msg_id || context.msgId,
              batch_id: context.batch_id || context.batchId,
              task_id: context.task_id || context.taskId,
              step_id: context.step_id || context.stepId,
              instance_id: context.instance_id || context.instanceId,
              p_instance_id: context.instance_id || context.instanceId,
            });
          } catch (e) {
            // ignore
          }
          timeout.current = setTimeout(() => {
            onPressNotif(detail.notification);
          }, 2000);
          break;
        default:
          break;
      }
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      if (pushNotificationConfig.console) {
        console.log('Message handled in the background!', remoteMessage);
      }
      try {
        const context = getContextData(remoteMessage);
        await trackPushArrive({
          campaign_id:
            _.get(remoteMessage, 'data.campaign_id') ||
            _.get(remoteMessage, 'data.campaignId') ||
            context?.campaign_id ||
            context?.campaignId,
          publish_id:
            _.get(remoteMessage, 'data.publish_id') ||
            _.get(remoteMessage, 'data.publishId') ||
            context?.publish_id ||
            context?.publishId,
          msg_id:
            _.get(remoteMessage, 'data.msg_id') ||
            _.get(remoteMessage, 'data.msgId') ||
            context?.msg_id ||
            context?.msgId,
          batch_id:
            _.get(remoteMessage, 'data.batch_id') ||
            _.get(remoteMessage, 'data.batchId') ||
            context?.batch_id ||
            context?.batchId,
          task_id:
            _.get(remoteMessage, 'data.task_id') ||
            _.get(remoteMessage, 'data.taskId') ||
            context?.task_id ||
            context?.taskId,
          step_id:
            _.get(remoteMessage, 'data.step_id') ||
            _.get(remoteMessage, 'data.stepId') ||
            context?.step_id ||
            context?.stepId,
          instance_id:
            _.get(remoteMessage, 'data.instance_id') ||
            _.get(remoteMessage, 'data.instanceId') ||
            context?.instance_id ||
            context?.instanceId,
          p_instance_id:
            _.get(remoteMessage, 'data.p_instance_id') ||
            _.get(remoteMessage, 'data.p_instanceId') ||
            context?.p_instance_id ||
            context?.p_instanceId,
        });
      } catch (e) {
        // ignore
      }
    });

    messaging().onNotificationOpenedApp(async remoteMessage => {
      try {
        const context = getContextData(remoteMessage);
        trackPushClick({
          campaign_id: context.campaign_id || context.campaignId,
          publish_id: context.publish_id || context.publishId,
          msg_id: context.msg_id || context.msgId,
          batch_id: context.batch_id || context.batchId,
          task_id: context.task_id || context.taskId,
          step_id: context.step_id || context.stepId,
          instance_id: context.instance_id || context.instanceId,
          p_instance_id: context.instance_id || context.instanceId,
        });
      } catch (e) {
        // ignore
      }
      setNotificationData(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          try {
            const context = getContextData(remoteMessage);
            trackPushClick({
              campaign_id: context.campaign_id || context.campaignId,
              publish_id: context.publish_id || context.publishId,
              msg_id: context.msg_id || context.msgId,
              batch_id: context.batch_id || context.batchId,
              task_id: context.task_id || context.taskId,
              step_id: context.step_id || context.stepId,
              instance_id: context.instance_id || context.instanceId,
              p_instance_id: context.instance_id || context.instanceId,
            });
          } catch (e) {
            // ignore
          }
          // init message
          timeout.current = setTimeout(() => {
            setNotificationData(remoteMessage);
          }, 2000);
        }
      });

    return () => {
      unsubscribe();
      appStateListener?.remove();
      clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (notificationData) {
      console.log(
        '[usePushNotification] notificationData changed:',
        notificationData,
      );
      navigateToPage(notificationData);
    }
  }, [notificationData]);

  return [notificationData, setNotificationData];
};

export default usePushNotification;
