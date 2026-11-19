import React, {useMemo, useCallback} from 'react';
import {FlatList, RefreshControl, ActivityIndicator, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from '@d11/react-native-fast-image';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import EmptyNotification from '@app/assets/svgs/EmptyNotification';
import DefaultNotificationIcon from '@app/assets/svgs/DefaultNotificationIcon';
import styles from '@app/_modules/account_notification/styles';

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
    return dateString;
  }
};

/**
 * Empty Component
 */
const EmptyComponent = React.memo(() => (
  <CustomView style={styles.emptyContainer}>
    <EmptyNotification
      width={normalize(169)}
      height={normalize(122)}
      style={styles.emptyIcon}
    />
  </CustomView>
));

/**
 * Loading Component
 */
const LoadingComponent = React.memo(() => (
  <CustomView style={styles.emptyContainer}>
    <ActivityIndicator size="large" color={Colors.PRIMARY} />
  </CustomView>
));

/**
 * Footer Component for pagination loading
 */
const FooterComponent = React.memo(({loading, noMoreData, hasData}) => {
  if (loading) {
    return (
      <CustomView style={styles.footerContainer}>
        <ActivityIndicator size="small" color={Colors.PRIMARY} />
      </CustomView>
    );
  }
  // Only show "No more notifications" if there is data and no more data available
  if (noMoreData && hasData) {
    return (
      <CustomView style={styles.footerContainer}>
        <Text style={styles.footerText}>No more notifications</Text>
      </CustomView>
    );
  }
  return null;
});

/**
 * Tab Item Component
 */
const TabItem = React.memo(({category, selectedTab, onTabChange}) => {
  const isActive = selectedTab === category.code;
  const handlePress = React.useCallback(() => {
    onTabChange(category.code);
  }, [category.code, onTabChange]);
  
  return (
    <CustomView
      style={[styles.tabItem, isActive && styles.activeTab]}
      onPress={handlePress}>
      <Text
        style={[
          styles.tabText,
          isActive && styles.activeTabText,
        ]}>
        {category.label || category.code}
      </Text>
    </CustomView>
  );
});

/**
 * Notification Item Component - Left, Middle, Right layout
 */
const NotificationItem = React.memo(({item, readNotification}) => {
  // 根据映射后的字段：unread 为 true 表示未读
  const isUnread = item.unread;
  const handlePress = React.useCallback(() => {
    readNotification(item.entityId);
  }, [item.entityId, readNotification]);
  
  const formattedDate = React.useMemo(
    () => formatNotificationDate(item.createdAt),
    [item.createdAt]
  );
  
  // Check if icon is a URL (image) or icon name
  const iconIsUrl = React.useMemo(() => {
    if (!item.icon) return false;
    const iconStr = String(item.icon).trim();
    return iconStr.startsWith('http://') || iconStr.startsWith('https://');
  }, [item.icon]);
  
  return (
    <CustomView
      style={[
        styles.notificationItem,
        isUnread && styles.unreadNotificationItem,
      ]}
      onPress={handlePress}>
      <CustomView style={styles.leftSection}>
        <CustomView
          style={[
            styles.unreadDot,
            !isUnread && styles.unreadDotPlaceholder,
          ]}
        />
        <CustomView style={styles.iconContainer}>
          {!item.icon ? (
            <DefaultNotificationIcon
              width={normalize(65)}
              height={normalize(65)}
            />
          ) : iconIsUrl ? (
            <FastImage
              source={{
                uri: item.icon,
                priority: FastImage.priority.normal,
              }}
              style={styles.iconImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <Icon
              name={item.icon}
              size={normalize(60)}
              color={Colors.PRIMARY}
            />
          )}
        </CustomView>
      </CustomView>
      <CustomView style={styles.middleSection}>
        <Text
          style={[
            styles.titleText,
            isUnread ? styles.unreadTitleText : styles.readTitleText,
          ]}
          numberOfLines={1}>
          {item.subject || 'No Subject'}
        </Text>
        <Text
          style={styles.descriptionText}
          numberOfLines={2}>
          {item.content || ''}
        </Text>
        <Text style={styles.dateText}>
          {formattedDate}
        </Text>
      </CustomView>
      <CustomView style={styles.rightSection}>
        <Icon
          name="chevron-forward"
          size={normalize(20)}
          color={Colors.GRAY_DARK2}
        />
      </CustomView>
    </CustomView>
  );
});

function NotificationScreen({
  t,
  notifications,
  readNotification,
  loading,
  refreshing,
  onRefresh,
  selectedTab,
  onTabChange,
  categories = [],
  onLoadMore,
  noMoreData = false,
}) {
  // Notifications are already filtered by category in controller
  const filteredNotifications = notifications;

  /**
   * Render notification item
   */
  const renderNotificationItem = useCallback(
    ({item}) => (
      <NotificationItem item={item} readNotification={readNotification} />
    ),
    [readNotification]
  );

  /**
   * Extract key for notification items
   */
  const keyExtractor = useCallback(
    (item, index) => `notification-${item.entityId || index}`,
    []
  );

  /**
   * Content container style
   */
  const contentContainerStyle = useMemo(
    () => (filteredNotifications.length === 0 ? {flex: 1} : {}),
    [filteredNotifications.length]
  );

  /**
   * Refresh control
   */
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        colors={[Colors.PRIMARY]}
        tintColor={Colors.PRIMARY}
      />
    ),
    [refreshing, onRefresh]
  );

  /**
   * Footer component for pagination
   */
  const listFooterComponent = useMemo(
    () => (
      <FooterComponent
        loading={loading && !refreshing}
        noMoreData={noMoreData}
        hasData={filteredNotifications.length > 0}
      />
    ),
    [loading, refreshing, noMoreData, filteredNotifications.length]
  );

  const showLoading = loading && !refreshing && filteredNotifications.length === 0;
  const showList = !loading || refreshing || filteredNotifications.length > 0;

  return (
    <>
      <NavBar
        useBack
        useWhite
        useShadow={false}
        stylesContainer={styles.navBarNoBorder}
        title={t('account_notification.title.notification')}
      />
      
      {/* Tab Navigation - Horizontal Scrollable */}
      <CustomView style={styles.tabContainerWrapper}>
        <CustomView style={styles.tabBottomDivider} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
          style={styles.tabScrollView}>
          {categories.map((category, index) => (
            <TabItem
              key={category.code || index}
              category={category}
              selectedTab={selectedTab}
              onTabChange={onTabChange}
            />
          ))}
        </ScrollView>
      </CustomView>
      
      {/* Notification List */}
      {showLoading && <LoadingComponent />}
      
      {showList && (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={<EmptyComponent />}
          ListFooterComponent={listFooterComponent}
          refreshControl={refreshControl}
          contentContainerStyle={contentContainerStyle}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={false}
        />
      )}
    </>
  );
}

export default NotificationScreen;
