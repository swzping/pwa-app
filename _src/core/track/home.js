import {modules} from '@root/swift.config';

import cdpAnalytics from 'qidian_cdp_sdk_rn';

/**
 * bottom_menu_click
 * pop_up_exposure
 * $app_pop_up_click
 * homepage_module_click
 * homepage_top_banner_click
 * homepage_middle_banner_click
 * homepage_bottom_banner_click
 * homepage_second_slides_exposure
 */

export const trackBottomMenuClick = params => {
  cdpAnalytics.track('bottom_menu_click', {
    menu_name: params.menu_name,
  });
};

// export const trackPopupExposure = params => {
//   cdpAnalytics.track('pop_up_exposure', {
//     pop_up_name: params.pop_up_name,
//   });
// };

export const trackUserInfoUpdate = async params => {
  await cdpAnalytics.setUserInfos({
    Device_token: params.Device_token || '',
    guid_member_id: params.guid_member_id || '',
  });
};

export const trackPopupClick = params => {
  cdpAnalytics.track('$app_pop_up_click', {
    jump_url: params.jump_url || '',
    is_closed: params.is_closed,
  });
};

export const trackHomepageModuleClick = params => {
  if (params.routeName !== modules.main_home.name) {
    return;
  }

  cdpAnalytics.track('homepage_module_click', {
    module_rank: params.module_rank, // module type number
    module_content: params.module_content?.join(',') || '', // module item content
    location_name: params.location_name || '', // module title
    resource_type: params.resource_type || '',
  });
};

// export const trackHomepageTopBannerClick = params => {
//   cdpAnalytics.track('homepage_top_banner_click', {
//     banner_name: '',
//     banner_rank: '',
//   });
// };

// export const trackHomepageMiddleBannerClick = params => {
//   cdpAnalytics.track('homepage_middle_banner_click', {
//     banner_name: '',
//     banner_rank: '',
//   });
// };

// export const trackHomepageBottomBannerClick = params => {
//   cdpAnalytics.track('homepage_bottom_banner_click', {
//     banner_name: '',
//     banner_rank: '',
//   });
// };

// export const trackHomepageSecondSlidesExposure = params => {
//   cdpAnalytics.track('homepage_second_slides_exposure', {
//     location_name: '',
//     banner_name: '',
//     banner_rank: '',
//     resource_type: '',
//   });
// };
