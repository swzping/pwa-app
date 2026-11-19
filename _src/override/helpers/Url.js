export function getParamValue(url, paramName) {
  const paramStartIndex = url.indexOf('?') + 1;
  const paramEndIndex = url.indexOf('#') !== -1 ? url.indexOf('#') : url.length;
  const paramsString = url.slice(paramStartIndex, paramEndIndex);
  const paramsArray = paramsString.split('&');

  for (let i = 0; i < paramsArray.length; i++) {
    const param = paramsArray[i].split('=');
    if (param[0] === paramName) {
      return decodeURIComponent(param[1].replace(/\+/g, ' '));
    }
  }

  return '';
}

export function buildLink(link, params = {}) {
  try {
    const url = new URL(link);
    Object.entries(params).forEach(([key, value]) => {
      if (value != null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.toString();
  } catch (e) {
    console.error('buildLink error:', e);
    return link;
  }
}
