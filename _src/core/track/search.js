import cdpAnalytics from 'qidian_cdp_sdk_rn';

/**
 * search_click
 * brand_search_click
 * searched_brand_exposure
 * searched_brand_click
 */

export const trackSearchClick = params => {
  cdpAnalytics.track('search_click', {
    search_keyword: params.search_keyword,
  });
};

// export const trackBrandSearchClick = params => {
//   cdpAnalytics.track('brand_search_click', {});
// };

// export const trackSearchedBrandExposure = params => {
//   cdpAnalytics.track('searched_brand_exposure', {});
// };

// export const trackSearchedBrandClick = params => {
//   cdpAnalytics.track('searched_brand_click', {});
// };
