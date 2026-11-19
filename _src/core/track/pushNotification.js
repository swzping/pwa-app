import cdpAnalytics from 'qidian_cdp_sdk_rn';

import {Storage} from '@app/helpers/Storage';
import {getFcmToken} from '@app/services/fcmToken';

const defaultFcmToken =
  'eeJgfZdRoUQ8uKJPWEP7fE:APA91bEtPTgArtQbIR8ogc8qXuooT6aRRdbkhprLHavPcdNAah3NP41GM5SoivhErCy2EUoXCtIsM6nzEIvgBcrglLYkZiLc1uj_w4mKckNVXl_F4QNSgVc';

const getTrackUser = async () => {
  const [fcmToken, memberId] = await Promise.all([
    getFcmToken(),
    Storage.get(Storage.name.MEMBER_ID),
  ]);

  return {
    Device_token: fcmToken || defaultFcmToken,
    guid_member_id: memberId || '',
  };
};

const trackWithUser = async (eventName, params = {}) => {
  const userInfo = await getTrackUser();
  cdpAnalytics.track(eventName, {...params, ...userInfo});
};

export const trackObtainDeviceToken = async (params = {}) => {
  await trackWithUser('app_obtain_device_token', params);
};

export const trackPushArrive = async (params = {}) => {
  await trackWithUser('$app_push_arrive', params);
};

export const trackPushClick = async (params = {}) => {
  await trackWithUser('$app_push_click', params);
};

export const trackPushSubscribe = async (params = {}) => {
  await trackWithUser('$app_push_subscribe', params);
};

export const trackPushUnsubscribe = async (params = {}) => {
  await trackWithUser('$app_push_unsubscribe', params);
};
