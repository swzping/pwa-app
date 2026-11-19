import cdpAnalytics from 'qidian_cdp_sdk_rn';

/**
 * sku_component_exposure
 * sku_component_filter
 * click_sku_component
 * view_sku_pdp
 * product_share
 * add_to_wishlist
 * add_to_cart
 */

export const trackSkuComponentExposure = params => {
  cdpAnalytics.track('sku_component_exposure', {
    location_name: params.location_name,
    sku_name: params.sku_name,
    sku_id: params.sku_id,
  });
};

export const trackSkuComponentFilter = params => {
  cdpAnalytics.track('sku_component_filter', {
    location_name: params.location_name,
    price_scope: params.price_scope,
    category_name: params.category_name,
    brand_name: params.brand_name,
    sku_name: params.sku_name,
    sku_id: params.sku_id,
  });
};

export const trackClickSkuComponent = params => {
  cdpAnalytics.track('click_sku_component', {
    location_name: params.location_name,
    sku_name: params.sku_name,
    sku_id: params.sku_id,
  });
};

export const trackViewSkuPdp = params => {
  cdpAnalytics.track('view_sku_pdp', {
    sku_name: params.sku_name,
    sku_id: params.sku_id,
    sku_current_price: params.sku_current_price,
    location_name: params.location_name,
  });
};

export const trackProductShare = params => {
  cdpAnalytics.track('product_share', {
    location_name: params.location_name,
    sku_name: params.sku_name,
    sku_id: params.sku_id,
  });
};

export const trackAddToWishlist = params => {
  cdpAnalytics.track('add_to_wishlist', {
    location_name: params.location_name,
    sku_name: params.sku_name,
    sku_id: params.sku_id,
  });
};

export const trackAddToCart = params => {
  cdpAnalytics.track('add_to_cart', {
    location_name: params.location_name,
    sku_name: params.sku_name,
    sku_id: params.sku_id,
    sku_current_price: params.sku_current_price,
  });
};
