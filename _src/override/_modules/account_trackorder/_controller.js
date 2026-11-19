import React, {useEffect, useState} from 'react';
import {rxAppSnackbar} from '@app/services/cache';
import {modules} from '@root/swift.config';
import {ACCOUNT_TRACK_ORDER} from '@app/_modules/account_trackorder/services/schema';
import Views from '@app/_modules/account_trackorder/_view';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {navigateTo} from '@app/helpers/Navigation';

const TrackOrder = props => {
  if (!modules.account_trackorder.enable) {
    return null;
  }

  const {email, orderId, orderStatus} = props.route?.params || {};
  const {navigation} = props;

  const [dataOrder, setDataOrder] = useState({});
  const [trackingData, setTrackingData] = useState(null);
  const [orderInfo, setOrderInfo] = useState(null);
  const {data, onRefetchData, loading} = useCustomQuery({
    schema: ACCOUNT_TRACK_ORDER,
  });

  useEffect(() => {
    if (data && data?.data) {
      const orderData = data?.data?.ordersFilter?.data?.[0];
      if (
        orderData?.detail?.[0]?.shipping_methods?.shipping_detail?.[0]
          ?.data_detail
      ) {
        try {
          const dataDetailStr =
            orderData.detail[0].shipping_methods.shipping_detail[0].data_detail;

          let dataDetailObj;
          try {
            dataDetailObj = JSON.parse(dataDetailStr);
          } catch (jsonError) {
            try {
              const fixedStr = dataDetailStr.replace(/'/g, '"');
              dataDetailObj = JSON.parse(fixedStr);
            } catch (fixedError) {
              console.log('fixedError', fixedError);
            }
          }

          if (orderData?.detail?.[0]?.shipping_methods?.shipping_description) {
            setOrderInfo({
              plName:
                orderData?.detail?.[0]?.shipping_methods
                  ?.shipping_description || '',
            });
          }

          if (dataDetailObj?.content?.history) {
            const processedTrackingData = dataDetailObj.content.history.map(
              (item, index) => {
                const date = new Date(item.timestamp);
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                return {
                  type: item.history_message || '',
                  description: item.message?.id || '',
                  datetime: formattedDate,
                  location: item.hub_name || '',
                  progress_bar_message: item.progress_bar_message || '',
                  timestamp: item.timestamp,
                  tracking_code: item.tracking_code,
                };
              },
            );
            setTrackingData(processedTrackingData);
          }
        } catch (error) {
          console.log(' data_detail :', error);
        }
      }

      setDataOrder(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (email && orderId) {
      onRefetchData({
        params: {
          email: email,
          order_id: orderId,
        },
      });
    }
  }, [email, orderId]);

  /**
   * ---------------------------------------------------- *
   * @function onPostData
   * @summary post data for track order
   * ---------------------------------------------------- *
   */

  const onPostData = params => {
    const paramsEmail = params.email;
    const order_number = params.order_number;
    onRefetchData({
      params: {
        email: paramsEmail,
        order_id: order_number,
      },
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onPostError
   * @summary on event for error in forms
   * ---------------------------------------------------- *
   */
  const onPostError = () => {
    rxAppSnackbar({message: 'Please complete all fields'});
  };

  /**
   * ----------------------------------------- *
   * @function onPressCart
   * @summary navigate to product detail
   * ----------------------------------------- *
   */
  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    onPostData,
    onPostError,
    loading,
    dataOrder: dataOrder?.ordersFilter,
    onPressCart,
    email,
    orderId,
    orderStatus,
    trackingData,
    orderInfo,
    navigation,
  };

  return <Views {...controllerProps} />;
};

export default TrackOrder;
