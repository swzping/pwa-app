import cdpAnalytics from 'qidian_cdp_sdk_rn';

/**
 * points_detail_click
 * point_task_click
 */

export const trackPointsDetailClick = params => {
  cdpAnalytics.track('points_detail_click', {});
};

export const trackPointTaskClick = params => {
  cdpAnalytics.track('point_task_click', {});
};
