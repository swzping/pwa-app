import React, {memo, useCallback, useMemo} from 'react';
import {Image} from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';

import LinearGradientView from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';

import ViewLogin from '@app/_modules/auth_signin/_controller';
import NodataForCoupon from '@app/assets/svgs/NodataForCoupon';
import Shimmer from '@app/components/_Shimmer/index';
import CustomView from '@app/components/CustomView';
import PointsInfoModal from '@app/components/LoyaltyCard/atoms/PointsInfoModal/index';
import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import {numberFormatBy} from '@app/helpers/General';

import styles from './styles';

const TABS = [
  {key: 'all', i18nKey: 'account_mypointhistory.all'},
  {key: 'earning', i18nKey: 'account_mypointhistory.earning'},
  {key: 'redemption', i18nKey: 'account_mypointhistory.redemption'},
  {key: 'expiration', i18nKey: 'account_mypointhistory.expiration'},
];

const POINT_STATUS = {
  VALID: 'account_mypointhistory.status.earning',
  USED: 'account_mypointhistory.status.redeemed',
  EXPIRE: 'account_mypointhistory.status.expiration',
  REVERSE_SEND: 'account_mypointhistory.status.refund',
  REVERSE_DEDUCT: 'account_mypointhistory.status.return',
};

const POINT_ICON = require('@app/assets/images/point_icon.png');
const WARNING_ICON = require('@app/assets/images/warning_icon.png');

const EN_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function pad(num) {
  return num.toString().padStart(2, '0');
}

export const formatDate = (iso, opts = {}) => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;

  const day = date.getDate();
  const month = EN_ABBR[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = pad(date.getMinutes());

  let suffix = '';
  if (opts.noHours) {
    return `${pad(day)} ${month} ${year}`;
  }
  if (opts.twelve) {
    suffix = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;
  } else {
    hours = hours % 24;
  }
  return `${pad(day)} ${month} ${year}, ${pad(hours)}:${minutes}${suffix}`;
};

const Tab = memo(({name, active, onPress}) => (
  <TouchableOpacity style={styles.tab} onPress={onPress}>
    <View style={styles.tabContent}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {name}
      </Text>
      {active && <View style={styles.tabIndicator} />}
    </View>
  </TouchableOpacity>
));

const PointMetaItem = ({label, value}) => (
  <View style={styles.metaItem}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const PointCard = memo(
  ({item, t, activedTab}) => {
    const signedPoint = useMemo(
      () => (item.signedPoint >= 0 ? `+${item.signedPoint}` : item.signedPoint),
      [item.signedPoint],
    );

    const formattedDate = useMemo(() => formatDate(item.date), [item.date]);
    const statusText =
      activedTab === 'all'
        ? t(POINT_STATUS[item.recordType] || POINT_STATUS[item.status])
        : t(POINT_STATUS[item.status]);
    const statusStyle = useMemo(
      () => (signedPoint >= 0 ? styles.VALID : styles.USED),
      [signedPoint],
    );

    const showMeta = useMemo(
      () => Boolean(item.transactionNumber || item.earnedFrom),
      [item.transactionNumber, item.earnedFrom],
    );

    if (item.status === 'EXPIRE') {
      return (
        <View style={styles.pointContentCard}>
          <View style={styles.pointHeader}>
            <Text style={styles.pointDateText}>
              <Text style={styles.f14}>{formattedDate}</Text>
              <Text style={styles.f14}>｜</Text>
              <Text style={[styles.f14, styles.EXPIRE]}>{statusText}</Text>
            </Text>
            <View style={styles.pointNumContent}>
              <Text style={[styles.pointNumValue, statusStyle]}>
                {signedPoint > 0 && '+'}
                {numberFormatBy('', signedPoint)}
              </Text>
              <Text style={styles.pointText}>Points</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.pointContentCard}>
        <View style={styles.pointHeader}>
          <Text style={styles.pointDateText}>
            <Text style={styles.f14}>{formattedDate}</Text>
            <Text style={styles.f14}>｜</Text>
            <Text
              style={[
                styles.f14,
                styles[item.recordType] || styles[item.status],
              ]}>
              {statusText}
            </Text>
          </Text>
          <View style={styles.pointNumContent}>
            <Text style={[styles.pointNumValue, statusStyle]}>
              {signedPoint > 0 && '+'}
              {numberFormatBy('', signedPoint)}
            </Text>
            <Text style={styles.pointText}>Points</Text>
          </View>
        </View>
        {showMeta && (
          <View style={[styles.cardBody]}>
            {item.transactionNumber && (
              <PointMetaItem
                label={t('account_mypointhistory.transactionNumber')}
                value={item.transactionNumber}
              />
            )}
            {item.earnedFrom && (
              <PointMetaItem
                label={t('account_mypointhistory.channel')}
                value={item.earnedFrom}
              />
            )}
          </View>
        )}
      </View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.signedPoint === nextProps.item.signedPoint &&
      prevProps.item.date === nextProps.item.date &&
      prevProps.item.status === nextProps.item.status &&
      prevProps.item.transactionNumber === nextProps.item.transactionNumber &&
      prevProps.item.earnedFrom === nextProps.item.earnedFrom &&
      prevProps.t === nextProps.t &&
      prevProps.activedTab === nextProps.activedTab
    );
  },
);

const MyPointHistoryView = ({
  disabled,
  t,
  pointRecords,
  loadingStates,
  refreshing,
  activedTab,
  hasMore,
  pointsLoading,
  balancePoint,
  expiringPoint,
  expiringTime,
  isGuest,
  modalVisible,
  cmsPageTitle,
  cmsPageLoading,
  cmsPageError,
  cmsPageContent,
  flatListRefs,
  onRefresh,
  onTabChange,
  onLoadMore,
  setModalVisible,
}) => {
  if (disabled) {
    return null;
  }
  if (isGuest) {
    return <ViewLogin />;
  }

  const renderEmpty = tab => {
    if (!refreshing && loadingStates[tab]) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF8200" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <NodataForCoupon />
        <Text style={styles.emptyText}>No historical records available</Text>
      </View>
    );
  };

  const renderFooter = tab => {
    const currentRecords = pointRecords[tab];
    const currentLoading = loadingStates[tab];
    const currentHasMore = hasMore[tab];

    if (
      refreshing ||
      currentRecords.length === 0 ||
      (currentLoading && currentRecords.length === 0)
    ) {
      return null;
    }
    if (currentLoading && currentHasMore) {
      return (
        <View style={{paddingVertical: 20}}>
          <ActivityIndicator size="small" color="#FF8200" />
        </View>
      );
    }
    if (!currentHasMore && currentRecords.length > 0) {
      return (
        <View style={styles.noMore}>
          <Text style={[styles.noMoreTxt, styles.EXPIRE]}>
            {t('account_mypointhistory.noMore')}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderItem = useCallback(
    ({item}) => <PointCard item={item} t={t} activedTab={activedTab} />,
    [t, activedTab],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <LinearGradientView
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={['#FFEBD6', '#FFEBD6', '#FFF']}
        locations={[0, 0.5, 1]}
        style={styles.headerImageBackground}
      />
      <NavBar
        useBack
        center
        title={t('account_mypointhistory.title')}
        stylesContainer={{backgroundColor: 'transparent'}}
      />
      <View style={styles.headerContent}>
        {pointsLoading ? (
          <CustomView width="100%" paddingBottom={8}>
            <Shimmer
              wrapperStyle={{width: '60%', height: 28, borderRadius: 8}}
            />
            <Shimmer
              wrapperStyle={{
                width: '80%',
                height: 16,
                marginTop: 8,
                borderRadius: 8,
              }}
            />
          </CustomView>
        ) : (
          <>
            <View style={styles.headerContentNum}>
              <Text style={styles.headerContentValue}>
                {numberFormatBy('', balancePoint)}
              </Text>
              <Image source={POINT_ICON} style={styles.pointIcon} />
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image source={WARNING_ICON} style={styles.warningIcon} />
              </TouchableOpacity>
            </View>
            {!!expiringPoint && !!expiringTime && (
              <Text style={styles.headerContentText}>
                {t('account_mypointhistory.expiring', {
                  expiringPoint: numberFormatBy('', expiringPoint),
                  expiringTime: formatDate(expiringTime, {noHours: true}),
                })}
              </Text>
            )}
          </>
        )}
      </View>
      <View
        style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          flex: 1,
          overflow: 'hidden',
          position: 'relative',
        }}>
        <View style={{...styles.tabContainer}}>
          {TABS.map(({key, i18nKey}) => {
            return (
              <Tab
                key={key}
                name={t(i18nKey)}
                active={activedTab === key}
                onPress={() => onTabChange(key)}
              />
            );
          })}
        </View>

        {TABS.map(({key}) => {
          const currentTab = key;
          const isActive = activedTab === currentTab;

          return (
            <View
              key={`list-container-${currentTab}`}
              style={{
                flex: 1,
                position: 'absolute',
                top: 48,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? 'auto' : 'none',
              }}>
              <FlatList
                style={{flex: 1}}
                ref={ref => (flatListRefs.current[currentTab] = ref)}
                data={pointRecords[currentTab]}
                renderItem={props => renderItem(props)}
                keyExtractor={(item, index) =>
                  `point-${currentTab}-${item.id || index}`
                }
                contentContainerStyle={[
                  styles.listContent,
                  pointRecords[currentTab].length > 0
                    ? {
                        minHeight: 0,
                      }
                    : {
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                ]}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing && isActive}
                    onRefresh={() => onRefresh(currentTab)}
                    colors={['#FF8200']}
                    tintColor="#FF8200"
                  />
                }
                ListEmptyComponent={() => renderEmpty(currentTab)}
                ListFooterComponent={() => renderFooter(currentTab)}
                onEndReached={() => {
                  onLoadMore(currentTab);
                }}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
                maintainVisibleContentPosition={{
                  minIndexForVisible: 0,
                }}
              />
            </View>
          );
        })}
      </View>
      <PointsInfoModal
        modalVisible={modalVisible}
        cmsPageTitle={cmsPageTitle}
        cmsPageLoading={cmsPageLoading}
        cmsPageError={cmsPageError}
        cmsPageContent={cmsPageContent}
        setModalVisible={setModalVisible}
      />
    </SafeAreaView>
  );
};

export default MyPointHistoryView;
