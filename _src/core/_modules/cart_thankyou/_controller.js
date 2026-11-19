import React, {useEffect, useState} from 'react';
import Views from '@app/_modules/cart_thankyou/_view';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';

const Thankyou = ({route}) => {
  if (!modules.cart_thankyou.enable) {
    return null;
  }

  const {t} = useTranslation();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (route) {
      setOrderId(route?.params?.orderId);
    }
  }, [route]);

  return <Views t={t} orderId={orderId} />;
};

export default Thankyou;
