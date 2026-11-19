import {Platform} from 'react-native';

import {AdjustConfig} from 'react-native-adjust';
import Config from 'react-native-config';
import DeviceInfo from 'react-native-device-info';

import _ from 'lodash';
import i18next from 'i18next';

import {rxAppLoading} from '@app/services/cache';
import {Colors} from '@app/styles/index';

/**
 * ---------------------------------------------------- *
 * @const {loadingStart}
 * @summary reactive for app loader start
 * ---------------------------------------------------- *
 */
export const loadingStart = () => {
  rxAppLoading(true);
};

/**
 * ---------------------------------------------------- *
 * @const {loadingStop}
 * @summary reactive for app load stop
 * ---------------------------------------------------- *
 */
export const loadingStop = () => {
  rxAppLoading(false);
};

/**
 * ---------------------------------------------------- *
 * @const {compareSkus}
 * @summary compare between two sku
 * ---------------------------------------------------- *
 */
export const compareSkus = (sku1, sku2) => {
  const arraySku1 = sku1.split('-').sort();
  const arraySku2 = sku2.split('-').sort();

  for (var i = 0; i < arraySku1.length; ++i) {
    if (arraySku1[i] !== arraySku2[i]) {
      return false;
    }
  }
  return true;
};

/**
 * ---------------------------------------------------- *
 * @const {Capitalize}
 * @summary for capital only first letter
 * ---------------------------------------------------- *
 */
export const Capitalize = str => {
  return str?.charAt(0)?.toUpperCase() + str?.slice(1) || '';
};

/**
 * ---------------------------------------------------- *
 * @const {formatDateNotif}
 * @summary for date format notification
 * ---------------------------------------------------- *
 */
export const formatDateNotif = date => {
  const x = date.split('-');
  const d = x[2].split(' ');
  const formatted_date = d[0] + '/' + x[1] + '/' + x[0];
  return formatted_date;
};

/**
 * ---------------------------------------------------- *
 * @const {formatDateOrder}
 * @summary for date format order
 * ---------------------------------------------------- *
 */
export const formatDateOrder = date => {
  const d = date.split(' ');
  return d[0];
};

/**
 * ---------------------------------------------------- *
 * @const {formatDateTime}
 * @summary for date format with time
 * ---------------------------------------------------- *
 */
export const formatDateTime = date => {
  if (date) {
    let d = date.split('T');
    d = d[0] + ' ' + d[1].split('+')[0];
    return d.split('Z')[0];
  } else {
    return date;
  }
};

/**
 * ---------------------------------------------------- *
 * @const {formatDateBy}
 * @summary for date format
 * ---------------------------------------------------- *
 */
export const formatDateBy = (isoString, format) => {
  if (!isoString) {
    return '';
  }

  if (format === 'hh:mm') {
    const time = isoString.split('T')[1];
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  }

  if (format === 'd en-M yyyy') {
    const [date] = isoString.split('T');
    const [year, month, day] = date.split('-');

    const monthNames = [
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

    return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`;
  }

  if (format === 'yyyy M-d') {
    const [date] = isoString.split('T');
    const [year, month, day] = date.split('-');

    return `${year} ${Number(month)}-${Number(day)}`;
  }

  return isoString;
};

/**
 * ---------------------------------------------------- *
 * @const {toFixedFix}
 * @summary for fix number behind comma
 * ---------------------------------------------------- *
 */
export const toFixedFix = (n, prec) => {
  var k = Math.pow(10, prec);
  return '' + Math.round(n * k) / k;
};

/**
 * ---------------------------------------------------- *
 * @const {numberFormat}
 * @summary for number format with currency
 * ---------------------------------------------------- *
 */
export const numberFormat = (
  prefix = null,
  number,
  thousandSeparator,
  decimals,
  decPoint,
) => {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  let disc = '';
  if (number.split('-').length > 1) {
    disc = '-';
    number = number.split('-').join('');
  }
  let n = !isFinite(+number) ? 0 : +number;
  let prec = !isFinite(+decimals) ? 0 : Math.abs(decimals);
  let sep = typeof thousandSeparator === 'undefined' ? ',' : thousandSeparator;
  let dec = typeof decPoint === 'undefined' ? '.' : decPoint;
  let s = '';

  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');

  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }

  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }

  prefix = prefix === null ? 'IDR' : prefix;
  return disc + prefix + ' ' + s.join(dec);
};

export const numberFormatBy = (
  prefix = null,
  number,
  thousandSeparator,
  decimals,
  decPoint,
) => {
  let result = numberFormat(
    prefix,
    number,
    thousandSeparator,
    decimals,
    decPoint,
  );
  if (prefix === '') {
    return result.trimStart().replace(/-\s+/g, '-');
  }
  return result;
};

/**
 * ---------------------------------------------------- *
 * @const {convertAndRound}
 * @summary for covert number to percentage
 * ---------------------------------------------------- *
 */
export const convertAndRound = number => {
  const num = parseFloat(number);
  return Math.round(num) + '%';
};

/**
 * ---------------------------------------------------- *
 * @const {shortenText}
 * @summary for excerpt sentences
 * ---------------------------------------------------- *
 */
export const shortenText = (text, limit = 40) => {
  if (text.length > limit) {
    return text.substring(0, limit - 1) + '...';
  } else {
    return text;
  }
};

/**
 * ---------------------------------------------------- *
 * @const {trimHTMLTags}
 * @summary for remove space in html content
 * ---------------------------------------------------- *
 */
export const trimHTMLTags = text => {
  const regex = /(<([^>]+)>)/gi;
  let trimmedTags = text.replace(regex, '');

  let result = trimmedTags.replace('&nbsp;', '');

  return result;
};

/**
 * ---------------------------------------------------- *
 * @const {getErrorGQL}
 * @summary for get error gql
 * ---------------------------------------------------- *
 */
export const getErrorGQL = res => {
  let data = {
    isError: false,
    message: null,
    category: null,
  };
  if (res?.graphQLErrors) {
    if (res?.graphQLErrors?.length && res?.graphQLErrors?.length > 0) {
      const issetErrorGqlMessage =
        res?.graphQLErrors[0]?.hasOwnProperty('message');
      const issetErrorGqlExtension =
        res?.graphQLErrors[0]?.hasOwnProperty('extensions');

      if (issetErrorGqlMessage) {
        data = {
          ...data,
          isError: true,
          message: res?.graphQLErrors[0]?.message,
        };
      }

      if (issetErrorGqlExtension) {
        data = {
          ...data,
          category: res?.graphQLErrors[0]?.extensions?.category,
        };
      }
    }
  }

  return data;
};

/**
 * ---------------------------------------------------- *
 * @const {getCleanHTML}
 * @summary for cleanup html code
 * ---------------------------------------------------- *
 */
export const getCleanHTML = ({
  htmlBlock,
  contentBackgroundColor = Colors.PRIMARY,
  contentTextColor = Colors.BLACK,
  contentFontSize = 30,
}) => {
  let finalHtmlBlock =
    '<!DOCTYPE html><html lang="en"><body style="background-color: ' +
    contentBackgroundColor +
    ';color:' +
    contentTextColor +
    ';font-size: ' +
    contentFontSize.toString() +
    'px;">' +
    htmlBlock +
    '</body></html>';
  finalHtmlBlock = encodeURIComponent(finalHtmlBlock);
  finalHtmlBlock = decodeURIComponent(finalHtmlBlock);
  finalHtmlBlock = finalHtmlBlock
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  return finalHtmlBlock;
};

/**
 * ---------------------------------------------------- *
 * @const {onRequestTimeout}
 * @summary for add request timeout to query or mutation
 * ---------------------------------------------------- *
 */
export const onRequestTimeout = ({
  aborterRef = null,
  timeout = 30000, // in ms
  timeoutMessage = null,
  requestCallback = null,
  successCallback = null,
  errorCallback = null,
  finallyCallback = null,
}) => {
  let requestTimeout;
  const timeoutPromise = new Promise((resolve, reject) => {
    // abort request after specific amount of time
    requestTimeout = setTimeout(() => {
      aborterRef.current.abort();
      aborterRef.current = new AbortController();
      const errorRequestTimeoutMessage = _.isEmpty(timeoutMessage)
        ? i18next.t('message.requestTimeout')
        : timeoutMessage;
      return reject(errorRequestTimeoutMessage);
    }, timeout);
  });

  const requestPromise = new Promise(requestCallback);

  Promise.race([timeoutPromise, requestPromise])
    // handle register response data
    .then(successCallback)
    // handle request timeout
    .catch(errorCallback)
    .finally(() => {
      clearTimeout(requestTimeout);
      finallyCallback();
    });
};

/**
 * ---------------------------------------------------- *
 * @const {getAdjustEnvironment}
 * @summary get appropriate Adjust environment based on MODE_ACTIVE
 * ---------------------------------------------------- *
 */
export const getAdjustEnvironment = () => {
  switch (Config.MODE_ACTIVE) {
    case 'production':
      return AdjustConfig.EnvironmentProduction;
    case 'staging':
    case 'development':
    default:
      return AdjustConfig.EnvironmentSandbox;
  }
};

/**
 * ---------------------------------------------------- *
 * @function getUserAgent
 * @summary 生成符合后端要求的 User-Agent
 * @return {string}
 * ---------------------------------------------------- *
 */
export const getUserAgent = async () => {
  const appName = 'Guardian_ID';
  const appVersion = DeviceInfo.getVersion();
  const systemVersion = DeviceInfo.getSystemVersion();
  const brand = DeviceInfo.getBrand();
  const model = DeviceInfo.getModel();
  const buildNumber = DeviceInfo.getBuildNumber();

  let userAgent = '';

  if (Platform.OS === 'ios') {
    userAgent = `Mozilla/5.0 (iPhone; CPU iPhone OS ${systemVersion.replace(
      /\./g,
      '_',
    )} like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/${buildNumber} ${appName}/${appVersion}`;
  } else {
    // Android
    userAgent = `Mozilla/5.0 (Linux; Android ${systemVersion}; ${brand} ${model}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 ${appName}/${appVersion}`;
  }

  return userAgent;
};

/**
 * ---------------------------------------------------- *
 * @const {toNumber}
 * @summary for string to number
 * ---------------------------------------------------- *
 */export const toNumber = value => {
  return parseInt(String(value)?.replace(/[^\d]/g, '')) || 0;
};
