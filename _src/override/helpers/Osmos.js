import {Linking} from 'react-native';
import {tracker} from '@onlinesales-ai/osmos-react-native-sdk';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';

import {
  navigatePushTo,
  resolveLinkAndNavigate,
} from '@app/helpers/Navigation';
import {query} from '@app/services/api';
import {BRAND, CATEGORY} from '@app/helpers/Constants';
import {Storage} from '@app/helpers/Storage';
import {modules} from '@root/swift.config';
import {
  OSMOS_GET_BRAND_LIST,
  OSMOS_GET_PRODUCT_BY_SKU,
} from '@app/helpers/OsmosSchema';

const OSMOS_CUSTOM_PARAM_1 = 'GUID';

const OSMOS_CLICK_TYPE = {
  URL: 'URL',
  CATEGORY: 'CATEGORY',
  PRODUCT: 'PRODUCT',
  BRAND: 'BRAND',
};

const isInternalUrl = url => {
  if (!url) {
    return false;
  }

  return (
    url.startsWith('/') ||
    (Config.PWA_BASE_URL && url.includes(Config.PWA_BASE_URL))
  );
};

const isExternalUrl = value => {
  if (!value) {
    return false;
  }

  return value.startsWith('http://') || value.startsWith('https://');
};

const toCliUbidValue = value => {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return null;
};

export const normalizeOsmosClickType = clickType => {
  const normalized = `${clickType || ''}`.trim().toUpperCase();

  if (normalized === 'CATEGORY') {
    return OSMOS_CLICK_TYPE.CATEGORY;
  }
  if (normalized === 'PRODUCT') {
    return OSMOS_CLICK_TYPE.PRODUCT;
  }
  if (normalized === 'BRAND') {
    return OSMOS_CLICK_TYPE.BRAND;
  }

  return OSMOS_CLICK_TYPE.URL;
};

export const normalizeOsmosClick = (elements = {}, item = {}) => {
  const clickType = normalizeOsmosClickType(
    elements?.clickType || item?.clickType,
  );
  const rawValue =
    elements?.clickValue ?? elements?.url ?? item?.url ?? item?.clickValue ?? '';
  const clickValue =
    rawValue == null || rawValue === '' ? '' : String(rawValue).trim();

  return {
    clickType,
    clickValue,
    link: clickType === OSMOS_CLICK_TYPE.URL ? clickValue : '',
  };
};

export const getCliUbid = async (userInformation, {guidMemberId} = {}) => {
  const storedMemberId = await Storage.get(Storage.name.MEMBER_ID);
  const memberId =
    toCliUbidValue(userInformation?.guid_member_id) ||
    toCliUbidValue(guidMemberId) ||
    toCliUbidValue(storedMemberId);

  if (memberId) {
    return memberId;
  }

  return DeviceInfo.getUniqueIdSync();
};

export const registerOsmosAdClick = async ({uclid, userInformation, guidMemberId}) => {
  if (!uclid) {
    return;
  }

  try {
    await tracker.registerAdClickEvent({
      cliUbid: await getCliUbid(userInformation, {guidMemberId}),
      customParam1: OSMOS_CUSTOM_PARAM_1,
      uclid,
    });
  } catch (error) {
    void error;
  }
};

const navigateOsmosUrl = async link => {
  if (!link) {
    return;
  }

  if (isInternalUrl(link)) {
    await resolveLinkAndNavigate(link);
    return;
  }

  if (isExternalUrl(link)) {
    try {
      const isSupported = await Linking.canOpenURL(link);
      if (isSupported) {
        await Linking.openURL(link);
      }
    } catch (error) {
      void error;
    }
    return;
  }

  await resolveLinkAndNavigate(link);
};

const resolveProductByOsmosProductId = async productId => {
  const response = await query(OSMOS_GET_PRODUCT_BY_SKU, {
    sku: String(productId),
  });

  return response?.data?.products?.items?.[0] || null;
};

const resolveBrandByAttributeId = async attributeId => {
  const response = await query(OSMOS_GET_BRAND_LIST);
  const items = response?.data?.getBrandList?.items || [];
  const targetId = String(attributeId);

  return (
    items.find(item => String(item?.attribute_id) === targetId) || null
  );
};

const navigateOsmosCategory = categoryId => {
  if (!categoryId) {
    return;
  }

  navigatePushTo(modules.product_list.enable, modules.product_list.name, {
    type: CATEGORY,
    categoryId: String(categoryId),
  });
};

const navigateOsmosProduct = async productId => {
  if (!productId) {
    return;
  }

  const product = await resolveProductByOsmosProductId(productId);
  if (!product?.url_key) {
    return;
  }

  navigatePushTo(modules.product_detail.enable, modules.product_detail.name, {
    productUrlKey: product.url_key,
    productSku: product.sku,
  });
};

const navigateOsmosBrand = async brandId => {
  if (!brandId) {
    return;
  }

  const brand = await resolveBrandByAttributeId(brandId);
  if (!brand?.category_url) {
    return;
  }

  navigatePushTo(modules.product_list.enable, modules.product_list.name, {
    type: BRAND,
    category_url: brand.category_url,
    categoryName: brand.name,
  });
};

const hasOsmosClickTarget = ({clickType, clickValue, link}) => {
  const value = `${clickValue || link || ''}`.trim();
  if (!value) {
    return false;
  }

  if (clickType && clickType !== OSMOS_CLICK_TYPE.URL) {
    return true;
  }

  return !!value;
};

export const handleOsmosAdPress = async ({
  link,
  clickType: rawClickType,
  clickValue: rawClickValue,
  uclid,
  userInformation,
  guidMemberId,
}) => {
  const clickType = normalizeOsmosClickType(rawClickType);
  const clickValue = `${rawClickValue ?? link ?? ''}`.trim();

  if (!hasOsmosClickTarget({clickType, clickValue, link})) {
    return;
  }

  await registerOsmosAdClick({uclid, userInformation, guidMemberId});

  try {
    switch (clickType) {
      case OSMOS_CLICK_TYPE.CATEGORY:
        navigateOsmosCategory(clickValue);
        return;
      case OSMOS_CLICK_TYPE.PRODUCT:
        await navigateOsmosProduct(clickValue);
        return;
      case OSMOS_CLICK_TYPE.BRAND:
        await navigateOsmosBrand(clickValue);
        return;
      case OSMOS_CLICK_TYPE.URL:
      default:
        await navigateOsmosUrl(clickValue || link);
    }
  } catch (error) {
    if (__DEV__) {
      console.log('[Osmos] navigate error', error);
    }
  }
};
