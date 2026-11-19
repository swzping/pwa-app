import React from 'react';
import {FlatList, RefreshControl, View, TouchableOpacity} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import {normalize} from '@app/styles/mixins';
import NavBar from '@app/components/NavBar';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text/index';
import HealthReportIcon from '@app/assets/svgs/HealthReportIcon';
import HealthReportEmptyState from '@app/assets/svgs/HealthReportEmptyState';
import RenderIf from '@app/components/RenderIf';
import styles from '@app/_modules/account_health_report/styles';

const AccountHealthReportScreen = ({
  t,
  healthReports,
  loading,
  onLoadMore,
  noMoreData,
  refreshing,
  onRefresh,
  onPressItem,
}) => {
  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        activeOpacity={0.7}
        onPress={() => {
          if (onPressItem) {
            onPressItem(item);
          }
        }}>
        <View style={styles.iconContainer}>
        <RenderIf condition={item.isUnread}>
            <View style={styles.unreadDot} />
          </RenderIf>
          <HealthReportIcon width={normalize(65)} height={normalize(65)} />
        </View>
        <View style={styles.contentContainer}>
          <Text bold small_14 style={styles.title} numberOfLines={1} ellipsizeMode="clip">
            {item.title}
          </Text>
          <View style={styles.detailsContainer}>
            <Text
              small_12
              color={Colors.GRAY_DARK2}
              style={styles.detailText1}
              numberOfLines={1}
              ellipsizeMode="tail">
              Kegiatan: {item.activity}
            </Text>
            <Text
              small_12
              color={Colors.GRAY_DARK2}
              style={styles.detailText}
              numberOfLines={1}
              ellipsizeMode="tail">
              Jenis Pemeriksaan: {item.checkType}
            </Text>
          </View>
          <Text xsmall color={Colors.GRAY_DARK} style={styles.timeText}>
            {item.time}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Icon
            name="chevron-forward"
            size={normalize(20)}
            color={Colors.GRAY_DARK}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyComponent = () => {
    return (
      <View style={styles.emptyContainer}>
        <HealthReportEmptyState style={styles.emptyIllustration} />
      </View>
    );
  };

  const FooterComponent = () => {
    if (loading && healthReports.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color={Colors.PRIMARY} />
        </View>
      );
    }
    if (noMoreData && healthReports.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text small color={Colors.GRAY_DARK}>
            {t('account_health_report.view.noMoreData')}
          </Text>
        </View>
      );
    }
    return null;
  };

  const itemHeight = normalize(110);

  const getItemLayout = (data, index) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

  return (
    <>
      <NavBar
        useBack
        useWhite
        useShadow={false}
        title={t('account_health_report.title')}
      />
      <FlatList
        data={healthReports}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        getItemLayout={getItemLayout}
        ListEmptyComponent={
          loading && healthReports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          ) : (
            <EmptyComponent />
          )
        }
        ListFooterComponent={FooterComponent}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{
          width: Mixins.MAX_WIDTH,
          backgroundColor: Colors.WHITE,
        }}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      />
    </>
  );
};

export default AccountHealthReportScreen;

