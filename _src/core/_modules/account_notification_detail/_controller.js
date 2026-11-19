import React, {useEffect, useState} from 'react';

import Views from '@app/_modules/account_notification_detail/_view';
import {modules} from '@root/swift.config';

const NotificationDetail = ({route}) => {
  if (!modules.account_notification_detail.enable) {
    return null;
  }

  const [notification, setNotification] = useState(null);
  useEffect(() => {
    if (route.params) {
      setNotification(route.params.variables);
    }
  }, [route]);
  return <Views notification={notification} />;
};

export default NotificationDetail;
