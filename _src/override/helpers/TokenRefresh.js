import Config from 'react-native-config';

import { Storage } from '@app/helpers/Storage';
import { rxUserToken } from '@app/services/cache';

/**
 * Token refresh utility
 * Handles refreshing access tokens when they expire
 */

/**
 * Store refresh token
 * @param {string} refreshToken - The refresh token to store
 */
export const storeRefreshToken = async (refreshToken) => {
  if (refreshToken) {
    await Storage.set(Storage.name.REFRESH_TOKEN, refreshToken);
  }
};

/** Force refresh token */
export function forceRefreshToken () {
    // Force refresh token, Modify expiration time
    Storage.set(Storage.name.ACCESS_TOKEN_EXPIRES_AT, Date.now());
}

/**
 * Get stored refresh token
 * @returns {Promise<string|null>} The stored refresh token or null
 */
export const getRefreshToken = async () => {
  return await Storage.get(Storage.name.REFRESH_TOKEN);
};

/**
 * Clear refresh token
 */
export const clearRefreshToken = async () => {
  await Storage.del(Storage.name.REFRESH_TOKEN);
};

/**
 * Build mutate opts carrying refresh_token in `X-Revoke-Token-Lr` header
 * for the revokeCustomerToken mutation (pass via paramsOpt.opts of useCustomMutation)
 * @returns {Promise<object|null>} opts or null when no refresh token
 */
export const getRevokeTokenOpts = async () => {
  const refreshToken = await getRefreshToken();
  return refreshToken
    ? {context: {headers: {'X-Revoke-Token-Lr': refreshToken}}}
    : null;
};

export async function getAccessToken(refreshAccessTokenApi) {
    let access_token = await Storage.get(Storage.name.ACCESS_TOKEN);
    const expMs = await getOAuthAccessExpiryAtMs();
    const bufferMs = 300000;
    if (expMs != null && Date.now() + bufferMs >= expMs) {
        const {access_token: new_access_token, expires_in, refresh_token,customer_token } = await refreshAccessToken(refreshAccessTokenApi);
        if(new_access_token) {
            access_token = new_access_token;
            await persistOAuthBundle({
                access_token: new_access_token,
                refresh_token,
                expires_in,
                customer_token,
            });
        }
    }

    return access_token;
}

/**
 * Refresh access token using refresh token
 * @param {Function} refreshAccessTokenMutation - The mutation function for refreshing token
 * @returns {Promise<{access_token: string, refresh_token: string, expires_in: number, customer_token: object}|null>} New tokens or null if failed
 */
export const refreshAccessToken = async (refreshAccessTokenMutation) => {
  try {
    console.log('refreshAccessToken: Starting...');
    const refreshToken = await getRefreshToken();
    console.log('refreshAccessToken: Got refresh token?', !!refreshToken);

    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    console.log('Refreshing access token with refresh token:', refreshToken.substring(0, 20) + '...');
    console.log('refreshAccessTokenMutation available?', !!refreshAccessTokenMutation);

    const res = await refreshAccessTokenMutation({
      params: {
        refresh_token: refreshToken,
      },
      paramsOpt: {isReturn: true},
    });

    console.log('Refresh Access Token Response:', JSON.stringify(res, null, 2));

    const resData = res?.data?.refreshCustomerAccessToken;
    console.log('Refresh Access Token Response Data:', resData);

    if (resData?.status === 'SUCCESS' || resData?.status === true || resData?.access_token) {
      const newAccessToken = resData.access_token;
      const newRefreshToken = resData.refresh_token || refreshToken; // Use new refresh token if provided, otherwise keep old one
      const expires_in = resData.expires_in;
      const customer_token = resData.customer_token;
      // Store new refresh token if provided
      if (resData.refresh_token) {
        await storeRefreshToken(newRefreshToken);
      }

      console.log('Access token refreshed successfully');
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in,
        customer_token,
      };
    } else {
      console.warn('Failed to refresh access token - status:', resData?.status, 'message:', resData?.message);
      return null;
    }
  } catch (err) {
    console.error('Error refreshing access token:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    return null;
  }
};

/**
 * Check if error message indicates token expiration
 * @param {string} message - Error message
 * @returns {boolean} True if message indicates token expiration
 */
export const isTokenExpiredError = (message) => {
  if (!message) {return false;}
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('token has expired') ||
         lowerMessage.includes('access token has expired') ||
         lowerMessage.includes('token expired') ||
         lowerMessage.includes('expired');
};


/********************** TODO: **************************/

let refreshInFlight = null;

/** GraphQL document (keep in sync with signIn.gql REFRESH_ACCESS_TOKEN) */
const REFRESH_ACCESS_TOKEN_QUERY = `
mutation RefreshAccessToken($refresh_token: String!) {
  refreshCustomerAccessToken(refresh_token: $refresh_token) {
    status
    message
    access_token
    refresh_token
    expires_in
    customer_token {
      token
    }
  }
}
`;

// let refreshInFlight = null;

/**
 * Normalize API `expires_in` to absolute expiry time in ms.
 * Supports: OAuth duration (seconds), Unix seconds, epoch ms, ISO/date string.
 */
export function normalizeExpiresInToExpiryAtMs(expires_in) {
    if (expires_in == null || expires_in === '') {
        return null;
    }
    const n = Number(expires_in);
    if (!Number.isFinite(n)) {
        const t = Date.parse(String(expires_in));
        return Number.isNaN(t) ? null : t;
    }
    if (n > 1e12) {
        return n;
    }
    if (n > 1e9) {
        return n * 1000;
    }
    return Date.now() + n * 1000;
}

export async function getOAuthAccessExpiryAtMs() {
    const raw = await Storage.get(Storage.name.ACCESS_TOKEN_EXPIRES_AT);
    console.log(Storage.name.ACCESS_TOKEN_EXPIRES_AT,raw);
    if (raw == null || raw === '') {
        return null;
    }
    if (typeof raw === 'number') {
        return raw;
    }
    const n = Number(raw);
    if (Number.isFinite(n) && n > 1e12) {
        return n;
    }
    const parsed = Date.parse(String(raw));
    return Number.isNaN(parsed) ? null : parsed;
}

export async function shouldRefreshOAuthAccess(bufferMs = 300000) {
    const expMs = await getOAuthAccessExpiryAtMs();

    if (expMs == null) {
        return false;
    }
    const token = await Storage.get(Storage.name.TOKEN);
    // console.log('Boolean(Storage.get(Storage.name.TOKEN))', Boolean(token));

    // console.log('Date.now() + bufferMs >= expMs || !token', Date.now() + bufferMs >= expMs || !token);
    return token && Date.now() + bufferMs >= expMs;
}

export async function persistOAuthBundle({
    access_token,
    refresh_token,
    expires_in,
    customer_token,
}) {
    console.log('🚀setting tokens');
    if (access_token) {
        await Storage.set(Storage.name.ACCESS_TOKEN, access_token);
    }
    if (refresh_token) {
        await Storage.set(Storage.name.REFRESH_TOKEN, refresh_token);
    }
    const expMs = normalizeExpiresInToExpiryAtMs(expires_in);
    if (expMs != null) {
        await Storage.set(Storage.name.ACCESS_TOKEN_EXPIRES_AT, new Date(expMs).toISOString());
    }
    const magentoToken = customer_token && customer_token.token;
    if (magentoToken) {
        console.log('🚀refresh token success');
        await Storage.set(Storage.name.TOKEN, magentoToken);
        rxUserToken(magentoToken);
        // store.dispatch(userActions.setToken(magentoToken));
    }
}

export async function clearOAuthSessionFromStorage() {
    await Promise.all([
        Storage.del(Storage.name.ACCESS_TOKEN),
        Storage.del(Storage.name.REFRESH_TOKEN),
        Storage.del(Storage.name.ACCESS_TOKEN_EXPIRES_AT),
    ]);
}

async function postGraphQL(apiBase, body, headers) {
    const res = await fetch(apiBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
        credentials: 'include',
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(json?.errors?.[0]?.message || res.statusText || 'Network error');
    }
    if (json.errors && json.errors.length) {
        throw new Error(json.errors[0].message);
    }
    return json.data;
}


/**
 * Refresh LoginRadius / customer OAuth session via standalone fetch (not Apollo),
 * then persist tokens and Magento customer `token` when `customer_token` is returned.
 */
export async function refreshOAuthSessionViaFetch() {
    const refresh_token = await Storage.get(Storage.name.REFRESH_TOKEN);
    if (!refresh_token) {
        return { ok: false, reason: 'no_refresh_token' };
    }
    console.log('🚀refresh_token', refresh_token);
    const uri = Config.GRAPHQL_BASE_URL;
    if (!uri) {
      return null;
    }
    let userAgent = '';
    try {
      const { getUserAgent } = require('@app/helpers/General');
      userAgent = await getUserAgent();
    } catch (_) {
      // optional
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🚀 Refresh attempt ${attempt}/${maxRetries}...`);
            const data = await postGraphQL(
                uri,
                {
                    query: REFRESH_ACCESS_TOKEN_QUERY,
                    variables: { refresh_token },
                },
                {
                   ...(userAgent ? { 'User-Agent': userAgent } : {}),
                },
            );

            const payload = data?.refreshCustomerAccessToken;
            if (!payload) {
                if (attempt < maxRetries) {
                    continue;
                }
                return { ok: false, reason: 'empty_response' };
            }

            if (!payload.status) {
                if (attempt < maxRetries) {
                    continue;
                }
                return {
                    ok: false,
                    reason: 'api_status',
                    message: payload.message,
                };
            }

            await persistOAuthBundle({
                access_token: payload.access_token,
                refresh_token: payload.refresh_token,
                expires_in: payload.expires_in,
                customer_token: payload.customer_token,
            });

            return { ok: true, payload };
        } catch (e) {
            if (attempt < maxRetries) {
                continue;
            } else {
                return { ok: false, reason: 'error', message: e.message };
            }
        }
    }
}

export async function ensureOAuthAccessFresh() {
    const refresh_token = await Storage.get(Storage.name.REFRESH_TOKEN);
    if (!refresh_token) {
        console.log('🔔 No refresh token available, skipping refresh');
        return Promise.resolve();
    }
    if (!await shouldRefreshOAuthAccess()) {
        console.log('🔔 OAuth access token is still fresh, no need to refresh');
        return Promise.resolve();
    }
    if (!refreshInFlight) {
        console.log('🚀 Refreshing OAuth access token...');
        refreshInFlight = refreshOAuthSessionViaFetch().finally(() => {
            refreshInFlight = null;
        });
    }
    return refreshInFlight.then(async (result) => {
        // 如果刷新失败，清理存储
        if (result && !result.ok) {
          console.log('🚀refresh token fail');
            await clearOAuthSessionFromStorage();
            // 清理 Redux 中的 token
            // store.dispatch(userActions.clearToken());
        }
    });
}
