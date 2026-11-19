import cdpAnalytics from 'qidian_cdp_sdk_rn';

/**
 * category_first_module_click
 * category_second_module_click
 * category_third_module_click
 */

export const trackCategoryFirstModuleClick = params => {
  cdpAnalytics.track('category_first_module_click', {
    first_level_module: params.first_level_module,
    first_level_module_rank: params.first_level_module_rank,
  });
};

export const trackCategorySecondModuleClick = params => {
  cdpAnalytics.track('category_second_module_click', {
    first_level_module: params.first_level_module,
    first_level_module_rank: params.first_level_module_rank,
    second_level_module: params.second_level_module,
    second_level_module_rank: params.second_level_module_rank,
  });
};

export const trackCategoryThirdModuleClick = params => {
  cdpAnalytics.track('category_third_module_click', {
    first_level_module: params.first_level_module,
    first_level_module_rank: params.first_level_module_rank,
    second_level_module: params.second_level_module,
    second_level_module_rank: params.second_level_module_rank,
    third_level_title: params.third_level_title,
    third_level_module: params.third_level_module,
    third_level_module_rank: params.third_level_module_rank,
  });
};
