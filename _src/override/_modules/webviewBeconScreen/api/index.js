import {fetchBeconCustomerToken} from './getBeconToken';
import beconCommonRequest from './request';

const LOG_PREFIX = '[Becon-Wellness]';
const AUTH_RECOVERY_HTTP_STATUSES = [400, 401];
const getBeconErrorCode = response => {
  const status = Number(response?.status);
  if (!AUTH_RECOVERY_HTTP_STATUSES.includes(status)) {
    return '';
  }
  const code = response?.code || '';
  return code;
};

export const fetchAnalysisSummary = async dfiToken => {
  const response = await beconCommonRequest({
    url: '/dfi/analysis-summary-b2c',
    method: 'GET',
    token: dfiToken,
  });
  return response;
};

//  加入DFI B2C
export const joinDfiB2c = async dfiToken => {
  return beconCommonRequest({
    url: '/account/join/dfi-b2c',
    method: 'POST',
    data: {dfi_token: dfiToken},
  });
};
// 流程：
//   1) 请求BE API fetchBeconCustomerToken -> 拿 dfi_token
//   2) GET /dfi/analysis-summary-b2c
//   3) 收到 OAUTH_JOIN_REQUIRED -> 重新拿 dfi_token，POST /account/join/dfi-b2c 注册，再用同一 token 重试一次
//   4) 收到 AUTH_FAILED        -> 重新拿 dfi_token，重试一次
// 任何一步异常都只重试一次，避免无限循环
export const fetchWellnessSummary = async () => {
  const dfiToken = await fetchBeconCustomerToken();
  if (!dfiToken) {
    return null;
  }
  try {
    const summary = await fetchAnalysisSummary(dfiToken);
    return summary;
  } catch (e) {
    console.log(`${LOG_PREFIX} fetchWellnessSummary:error`, e);
    let errorCode = getBeconErrorCode(e);
    if (errorCode === 'OAUTH_JOIN_REQUIRED') {
      const freshToken = await fetchBeconCustomerToken();
      await joinDfiB2c(freshToken);
      const summary = await fetchAnalysisSummary(freshToken);
      return summary;
    }
    if (['AUTH_EXPIRED', 'AUTH_FAILED'].includes(errorCode)) {
      const freshToken = await fetchBeconCustomerToken();
      const summary = await fetchAnalysisSummary(freshToken);
      return summary;
    }
    throw e;
  }
};
