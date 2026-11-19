import React from 'react';
import {ScrollView, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from '@d11/react-native-fast-image';
import {formatDateNotif} from '@app/helpers/General';
import {resolveMagentoMediaUrl} from '@app/helpers/MakeUrl';
import Appbar from '@app/components/AppBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import styles from '@app/_modules/account_notification_detail/styles';

function NotificationDetailScreen({notification}) {
  if (!notification) {
    return (
      <>
        <Appbar useBack title="NOTIFICATION DETAIL" />
        <CustomView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </CustomView>
      </>
    );
  }

  /**
   * Format date for display: "2025-10-22 10:30:00"
   */
  const formatNotificationDate = dateString => {
    if (!dateString) return '';
    if (dateString.includes(' ') && dateString.split(' ').length === 2) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return formatDateNotif(dateString);
    }
  };

  const resolvedImageUrl = resolveMagentoMediaUrl(notification.image);
  const hasImage = Boolean(resolvedImageUrl);
  
  return (
    <>
      <Appbar useBack title="NOTIFICATION DETAIL" />
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}>
        <CustomView style={styles.mainContainer}>
          {/* Image or Icon Section */}
          <CustomView style={styles.iconSection}>
            {hasImage ? (
              <CustomView style={styles.imageContainer}>
                <FastImage
                  source={{
                    uri: resolvedImageUrl,
                    priority: FastImage.priority.normal,
                  }}
                  style={styles.image}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </CustomView>
            ) : (
              <CustomView style={styles.iconContainer}>
                <Icon
                  name="megaphone"
                  size={normalize(40)}
                  color={Colors.PRIMARY}
                />
              </CustomView>
            )}
          </CustomView>
          
          {/* Title */}
          <Text style={styles.titleText} numberOfLines={2}>
            {notification.subject || notification.title || 'No Subject'}
          </Text>
          
          {/* Date - Show start_date if available, otherwise show createdAt */}
          {(notification.startDate || notification.createdAt) && (
            <Text style={styles.dateText}>
              {formatNotificationDate(notification.startDate || notification.createdAt)}
            </Text>
          )}
          
          {/* Description - Show description if available, otherwise show content */}
          {(() => {
            const descriptionText = notification.description || notification.content || '';
            const trimmedText = descriptionText.trim();
            return trimmedText ? (
              <Text style={styles.contentText}>
                {descriptionText}
              </Text>
            ) : null;
          })()}
        </CustomView>
      </ScrollView>
    </>
  );
}

export default NotificationDetailScreen;

