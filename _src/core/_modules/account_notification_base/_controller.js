import React, {useEffect, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

import {
  GET_NOTIFICATIONS,
  READ_NOTIFICATION,
} from '@app/_modules/account_notification_base/services/schema';
import Views from '@app/_modules/account_notification_base/_view';
import {useTranslation} from 'react-i18next';

const NotificationList = () => {
  if (!modules.account_notification.enable) {
    return null;
  }

  const [notifications, setNotifications] = useState([]);
  const {data, loading} = useCustomQuery({
    schema: GET_NOTIFICATIONS,
    useInitData: true,
  });
  const {onRefetchData: readNotificationHook} = useCustomMutation({
    schema: READ_NOTIFICATION,
  });
  const {t} = useTranslation();

  useEffect(() => {
    if (data?.data) {
      setNotifications(data?.data.customerNotificationList.items);
    }
  }, [data]);

  const readNotification = entityId => {
    const notification = notifications.filter(
      notif => notif.entityId === entityId,
    );
    readNotificationHook({
      params: {
        entityId,
      },
    });
    navigateTo(
      modules.account_notification_detail.enable,
      modules.account_notification_detail.name,
      notification[0],
    );
  };

  return (
    <Views
      t={t}
      notifications={notifications}
      readNotification={readNotification}
      loading={loading}
    />
  );
};

export default NotificationList;
