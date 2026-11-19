import React from 'react';
import {ActivityIndicator} from 'react-native-paper';
import {formatDateNotif} from '@app/helpers/General';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import styles from '@app/_modules/account_notification_detail/styles';

function NotificationScreen({notification}) {
  if (!notification) {
    return <ActivityIndicator />;
  }

  return (
    <>
      <NavBar title="Notifications" />
      <CustomView style={styles.mainContainer}>
        <Text style={[styles.titleText]}>{notification.subject}</Text>
        <Text style={[styles.dateText]}>
          {formatDateNotif(notification.createdAt)}
        </Text>
        <Text>{notification.content}</Text>
      </CustomView>
    </>
  );
}

export default NotificationScreen;
