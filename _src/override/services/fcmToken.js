import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import client from '@app/services/api';
import {Storage} from '@app/helpers/Storage';
import {
  INSERT_FCM_TOKEN,
  UPDATE_FCM_TOKEN,
  REMOVE_FCM_TOKEN,
} from '@app/services/mutations/fcmToken';

const LOG_PREFIX = '[fcm-token]';

const ensureString = value => {
  if (typeof value === 'string') {
    return value === '[object Object]' ? '' : value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return '';
  }
  return `${value}`;
};

export const getDeviceToken = async () => {
  try {
    const cached = await Storage.get(Storage.name.DEVICE_TOKEN);
    const cachedDeviceToken = ensureString(cached);
    if (cachedDeviceToken) {
      return cachedDeviceToken;
    }
    if (cached) {
      await Storage.del(Storage.name.DEVICE_TOKEN);
    }
  } catch (error) {
    console.log(LOG_PREFIX, 'read cached device token failed', error);
  }

  try {
    const deviceToken = ensureString(await DeviceInfo.getUniqueId());
    if (deviceToken) {
      Storage.set(Storage.name.DEVICE_TOKEN, deviceToken);
    }
    console.log(LOG_PREFIX, 'device token prepared', deviceToken);
    return deviceToken;
  } catch (error) {
    console.log(LOG_PREFIX, 'getUniqueId error', error);
    return '';
  }
};

export const getFcmToken = async () => {
  try {
    const cached = await Storage.get(Storage.name.FCM_TOKEN);
    if (cached) {
      return ensureString(cached);
    }
  } catch (error) {
    console.log(LOG_PREFIX, 'read cached fcm token failed', error);
  }

  try {
    const fcmToken = ensureString(await messaging().getToken());
    if (fcmToken) {
      Storage.set(Storage.name.FCM_TOKEN, fcmToken);
    }
    console.log(LOG_PREFIX, 'fcm token prepared', fcmToken);
    return fcmToken;
  } catch (error) {
    console.log(LOG_PREFIX, 'messaging getToken error', error);
    return '';
  }
};

export const getIdentifiers = async () => {
  const [deviceToken, fcmToken] = await Promise.all([
    getDeviceToken(),
    getFcmToken(),
  ]);

  if (!deviceToken) {
    console.log(LOG_PREFIX, 'missing deviceToken, skip request');
  }
  if (!fcmToken) {
    console.log(LOG_PREFIX, 'missing fcmToken, skip request');
  }

  return {deviceToken, fcmToken};
};

const mutateInsertToken = async ({deviceToken, fcmToken, source}) => {
  try {
    const res = await client.mutate({
      mutation: INSERT_FCM_TOKEN,
      variables: {
        deviceToken,
        fcmToken,
      },
    });
    console.log(LOG_PREFIX, `${source} insert success`, res?.data);
    return res;
  } catch (error) {
    console.log(LOG_PREFIX, `${source} insert failed`, error);
    throw error;
  }
};

const mutateUpdateToken = async ({deviceToken, fcmToken, source}) => {
  try {
    const res = await client.mutate({
      mutation: UPDATE_FCM_TOKEN,
      variables: {
        deviceToken,
        fcmToken,
      },
    });
    console.log(LOG_PREFIX, `${source} update success`, res?.data);
    return res;
  } catch (error) {
    console.log(LOG_PREFIX, `${source} update failed`, error);
    throw error;
  }
};

export const insertAppToken = async ({source = 'login'} = {}) => {
  const {deviceToken, fcmToken} = await getIdentifiers();
  if (!deviceToken || !fcmToken) {
    console.log(LOG_PREFIX, `${source} insert skipped due to missing token`);
    return null;
  }
  console.log(LOG_PREFIX, `${source} insert start`, {deviceToken, fcmToken});
  return mutateInsertToken({deviceToken, fcmToken, source});
};

export const updateFcmToken = async ({source = 'app_launch'} = {}) => {
  const {deviceToken, fcmToken} = await getIdentifiers();
  if (!deviceToken || !fcmToken) {
    console.log(LOG_PREFIX, `${source} update skipped due to missing token`);
    return null;
  }
  console.log(LOG_PREFIX, `${source} update start`, {deviceToken, fcmToken});
  return mutateUpdateToken({deviceToken, fcmToken, source});
};

export const removeFcmToken = async ({source = 'logout'} = {}) => {
  try {
    const deviceToken = await getDeviceToken();
    if (!deviceToken) {
      console.log(
        LOG_PREFIX,
        `${source} remove skipped due to missing deviceToken`,
      );
      return null;
    }
    const res = await client.mutate({
      mutation: REMOVE_FCM_TOKEN,
      variables: {
        deviceToken,
      },
    });
    console.log(LOG_PREFIX, `${source} remove success`, res?.data);
    return res;
  } catch (error) {
    console.log(LOG_PREFIX, `${source} remove failed`, error);
    throw error;
  }
};
