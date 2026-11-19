import React, {useEffect, useRef,useState} from 'react';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';
import {tabsApp} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/cart_thankyou/_view';
import {GET_ORDER_DETAIL} from '@app/_modules/cart_thankyou/services/schema';
import {GET_SEARCH_PLACEHOLDER} from '@app/_modules/main_home/services/schema';
import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {navReset} from '@app/helpers/Navigation';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {
  rxCartInfo,
  rxCartOrderId,
  rxUserInformation,
} from '@app/services/cache';

const Thankyou = props => {
  if (!modules.cart_thankyou.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [loadingReset, setLoadingReset] = useState(false);
  const getRxCartOrderId = useReactiveVar(rxCartOrderId);
  const accountInformation = useReactiveVar(rxUserInformation);
  const getRxCartInfo = useReactiveVar(rxCartInfo);
  const [customerOrder, setCustomerOrder] = useState({});
  const [searchPlaceholder, setSearchPlaceholder] = useState(null);

  const mount = useRef();
  const timerReset = useRef(null);

  const {data: orderData} = useCustomQuery({
    schema: GET_ORDER_DETAIL,
    useInitData: true,
    opts: {fetchPolicy: 'cache-first', context: {method: 'GET'}},
    variables: {
      filter: {number: {eq: getRxCartOrderId}},
    },
  });

  const {data: placeholderData} = useCustomQuery({
    schema: GET_SEARCH_PLACEHOLDER,
    useInitData: true,
    opts: {fetchPolicy: 'no-cache'},
  });

  useEffect(() => {
    if (!orderData?.data) {
      return;
    }
    const result = orderData?.data?.customer?.orders?.items?.[0] || {};
    setCustomerOrder(result);
  }, [orderData]);

  useEffect(() => {
    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.THANK_YOU_PAGE);
    mount.current = true;
    return () => {
      mount.current = false;
      clearTimeout(timerReset.current);
    };
  }, []);

  useEffect(() => {
      if (mount.current && placeholderData?.data) {
        setSearchPlaceholder(
          placeholderData?.data?.getProductSearchPlaceholder?.text,
        );
      }
    }, [placeholderData]);

  const formatAddress = addr => {
    if (!addr) {
      return '';
    }
    const street = addr.street?.join(', ') || '';
    return `${street}, ${addr.city || ''}, ${addr.region || ''} ${
      addr.postcode || ''
    }`
      .replace(/,\s*,/g, ',')
      .replace(/,\s*$/, '')
      .trim();
  };

  const deliveryData = {
    shippingAddress: formatAddress(customerOrder?.shipping_address),
  };

  const onNavigateToTrackOrder = () => {
    const params = {
      email: accountInformation?.email || getRxCartInfo?.email,
      orderId: getRxCartOrderId || '',
      deliverAddress: deliveryData.shippingAddress,
    };
    navigateTo(
      modules.account_trackorder.enable,
      modules.account_trackorder.name,
      params,
    );
  };

  const onResetToHome = () => {
    setLoadingReset(true);
    timerReset.current = setTimeout(() => {
      setLoadingReset(true);
      navReset(tabsApp.name);
      rxCartOrderId(null);
    }, 500);
  };

  const controllerProps = {
    t,
    loadingReset,
    orderId: getRxCartOrderId,
    searchPlaceholder,
    onResetToHome,
    onNavigateToTrackOrder,
    // onScanGuideClose,
  };

  return <Views {...controllerProps} />;
};

export default Thankyou;
