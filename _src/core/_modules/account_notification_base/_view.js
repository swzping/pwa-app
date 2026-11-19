import Appbar from '@app/components/AppBar';
import RenderIf from '@app/components/RenderIf';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

import React from 'react';
import {ScrollView} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';

import styles from '@app/_modules/account_notification_base/styles';

function NotificationScreen({t, notifications, readNotification, loading}) {
  const NotificationItem = ({notification, onPress}) => {
    return (
      <CustomView style={styles.barContainer} onPress={onPress}>
        <Text
          style={[
            {
              color: notification.unread ? Colors.BLACK : Colors.GRAY_MEDIUM,
            },
          ]}>
          {notification.subject}
        </Text>
      </CustomView>
    );
  };

  return (
    <>
      <Appbar useBack title={t('account_notification.title.notification')} />
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{alignItems: 'center'}}>
        <RenderIf condition={!loading && notifications.length === 0}>
          <Text style={[styles.marginSpacing]}>
            {t('account_notification.view.noNotification')}
          </Text>
        </RenderIf>
        <RenderIf condition={!loading}>
          {notifications.map((notification, index) => {
            return (
              <NotificationItem
                notification={notification}
                onPress={() => readNotification(notification.entityId)}
                key={notification.subject + '' + index}
              />
            );
          })}
        </RenderIf>
        <RenderIf condition={loading}>
          <ActivityIndicator style={styles.marginSpacing} />
        </RenderIf>
      </ScrollView>
    </>
  );
}

export default NotificationScreen;
