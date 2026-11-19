import cdpAnalytics from 'qidian_cdp_sdk_rn';

/**
 * submit_order
 */

export const trackSubmitOrder = params => {
  cdpAnalytics.track('submit_order', {
    order_id: params.order_id,
    pharmacy_name: params.pharmacy_name || '',
    delivery_method: params.delivery_method || '',
    payment_method: params.payment_method,
    shipping_method: params.shipping_method || '',
    order_total: params.order_total,
  });
};
