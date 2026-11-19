import {Platform} from 'react-native';

import Config from 'react-native-config';

import CookieManager from '@react-native-cookies/cookies';

import {Storage} from '@app/helpers/Storage';

const OFFLINE_QUEUE_COOKIE_NAMES = ['gh_adm', 'gh_q'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const formatIDDate = iso => {
  if (!iso) {
    return '';
  }
  const [d, t] = iso.split('T');
  const [y, m, day] = d.split('-');
  let [h, min] = t.split(':');
  h = +h % 12 || 12;
  const ampm = +t.split(':')[0] >= 12 ? 'PM' : 'AM';
  const month = MONTHS[+m - 1];
  return `${h
    .toString()
    .padStart(2, '0')}:${min} ${ampm} on ${+day} ${month} ${y}`;
};

export const formatThousands = num => {
  return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const getExpireTime = (createdTime, hourNum) => {
  if (!createdTime || typeof hourNum !== 'number') {
    return '';
  }
  // 1. 从原字符串中提取时区偏移量（单位：分钟）
  const tzMatch = createdTime.match(/([+-])(\d{2}):(\d{2})$/);
  let offsetMinutes = 0;
  if (tzMatch) {
    const sign = tzMatch[1] === '+' ? 1 : -1;
    offsetMinutes =
      sign * (parseInt(tzMatch[2], 10) * 60 + parseInt(tzMatch[3], 10));
  }

  // 解析时间并加上hourNum小时
  const date = new Date(createdTime);
  date.setTime(date.getTime() + hourNum * 60 * 60 * 1000);

  const targetTimestamp = date.getTime() + offsetMinutes * 60 * 1000;
  const targetDate = new Date(targetTimestamp);

  const y = targetDate.getUTCFullYear();
  const m = String(targetDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getUTCDate()).padStart(2, '0');
  const h = String(targetDate.getUTCHours()).padStart(2, '0');
  const min = String(targetDate.getUTCMinutes()).padStart(2, '0');
  const s = String(targetDate.getUTCSeconds()).padStart(2, '0');

  const fakeIso = `${y}-${m}-${d}T${h}:${min}:${s}`;

  return formatIDDate(fakeIso);
};

// 清除 offline 队列 Cookie
export const clearOfflineQueueCookies = async () => {
  const url = Config.PWA_BASE_URL;
  try {
    const cookies = await CookieManager.get(url);
    await Promise.all(
      OFFLINE_QUEUE_COOKIE_NAMES.map(async name => {
        const cookie = cookies[name];
        if (!cookie) {
          return;
        }
        if (Platform.OS === 'ios') {
          await CookieManager.clearByName(url, name, false);
          await CookieManager.clearByName(url, name, true);
          return;
        }
        await CookieManager.setFromResponse(
          url,
          `${name}=; Path=${
            cookie.path || '/'
          }; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${
            cookie.domain ? `; Domain=${cookie.domain}` : ''
          }`,
        );
      }),
    );
    if (Platform.OS === 'android') {
      await CookieManager.flush();
    }
    return true;
  } catch (error) {
    console.error('Failed to clear offline queue cookies:', error);
    return false;
  }
};

// 保存 Waiting Room 队列 Cookie 的过期时间（Unix 时间戳，单位：秒）
export const setOfflineWaitingRoomExpireTime = async waitingRoomExpireTime => {
  const durationSeconds = Number(waitingRoomExpireTime ?? 0);

  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return false;
  }

  await Storage.set(
    Storage.name.WAITING_ROOM_EXPIRE_AT,
    Math.floor(Date.now() / 1000) + durationSeconds,
  );
  return true;
};

// 进入 MyAccount 页面时，仅在 Waiting Room Cookie 已过期后清除 Cookie
export const clearExpiredOfflineQueueCookies = async () => {
  try {
    const expireAt = Number(
      await Storage.get(Storage.name.WAITING_ROOM_EXPIRE_AT),
    );

    if (
      !Number.isFinite(expireAt) ||
      Math.floor(Date.now() / 1000) <= expireAt
    ) {
      return false;
    }

    const cleared = await clearOfflineQueueCookies();
    if (cleared) {
      await Storage.del(Storage.name.WAITING_ROOM_EXPIRE_AT);
    }
    return cleared;
  } catch (error) {
    console.error('Failed to clear expired offline queue cookies:', error);
    return false;
  }
};
