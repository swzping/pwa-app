import {Storage} from '@app/helpers/Storage';
import {query} from '@app/services/api';
import {getFcmToken} from '@app/services/fcmToken';
import {GET_LOYALTY_CARD_DATA} from '@app/services/queries/user';

import {trackUserInfoUpdate} from './home';

const defaultFcmToken = '';

export const initCdpUser = async (params = {}) => {
  const [fcmToken, memberId] = await Promise.all([
    getFcmToken(),
    Storage.get(Storage.name.MEMBER_ID),
  ]);

  const userInfos = {
    Device_token: params?.fcmToken || fcmToken || defaultFcmToken,
    guid_member_id: params?.memberId || memberId || '',
  };

  try {
    await trackUserInfoUpdate(userInfos);
  } catch (e) {
    console.warn('[cdp] initCdpUser setUserInfos error', e);
  }

  return userInfos;
};

export const syncCdpMemberId = async (params = {}) => {
  const fcmPromise = getFcmToken();
  let fcmToken = '';
  let memberId = params.memberId || '';

  if (!memberId) {
    try {
      const {data} = await query(GET_LOYALTY_CARD_DATA, null, {
        fetchPolicy: 'network-only',
      });

      memberId = data?.customer?.qr_code?.memberId || '';
    } catch (e) {
      console.warn('[cdp] syncCdpMemberId error', e);
    }
  }

  try {
    await Storage.set(Storage.name.MEMBER_ID, memberId);
  } catch (e) {
    console.warn('Storage.set error', Storage.name.MEMBER_ID, e);
  }

  fcmToken = await fcmPromise.catch(() => defaultFcmToken);

  try {
    await trackUserInfoUpdate({
      Device_token: fcmToken,
      guid_member_id: memberId,
    });
  } catch (e) {
    console.warn('[cdp] trackUserInfoUpdate error', e);
  }

  return {Device_token: fcmToken, guid_member_id: memberId};
};

export const clearCdpUser = async () => {
  try {
    await trackUserInfoUpdate({
      Device_token: '',
      guid_member_id: '',
    });
  } catch (e) {
    console.warn('[cdp] clearCdpUser error', e);
  }
};
