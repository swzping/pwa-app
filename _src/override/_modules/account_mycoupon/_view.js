import React, {useMemo,useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Defs, Line, LinearGradient, Stop} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';

import Clipboard from '@react-native-clipboard/clipboard';
import {modules} from '@root/swift.config';

import NodataForCoupon from '@app/assets/svgs/NodataForCoupon';
import AppModal from '@app/components/_AppModal';
import CopyCodeIcon from '@app/components/Cms/ContentTypes/VoucherSlider/CopyCodeIcon';
import VoucherDetailsModal from '@app/components/Cms/ContentTypes/VoucherSlider/VoucherDetailsModal';
import CustomView from '@app/components/CustomView/index';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {
  sortByVoucherStatus,
  TYPE_MODAL_SORT,
} from '@app/helpers/Constants';
import {navigate} from '@app/helpers/Navigation';
import {Colors} from '@app/styles';

import OfflineVoucherConfirmModal from './components/offlineVoucherConfirmModal';
import {useOfflineVoucherStatus} from './components/useOfflineVoucherStatus';
import styles from './styles';
const MyCouponView = ({
  t,
  couponWallet,
  loading,
  currentSelectedSort,
  visibleSort,
  selectedSort,
  onPressVisibleSort,
  onSelectSort,
  noMoreData,

  refreshing,
  onRefresh,
  onLoadMore,
  activeTab,
  onTabChange,
}) => {
  const { offlineVoucherConfirmModalVisible,redeemLoading, setOfflineVoucherConfirmModalVisible, closeOfflineVoucherConfirmModal, onConfirmOfflineVoucher } = useOfflineVoucherStatus();
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [showCopyTip, setShowCopyTip] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [isOffline, setIsOffline] = useState(false);
  const formatDate = dateString => {
    if (!dateString) {
      return '';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (formatError) {
      return dateString;
    }
  };

  const handleCopyCode = async (code, event) => {
    try {
      event.persist();
      await Clipboard.setString(code);
      setShowCopyTip(prev => ({...prev, [code]: true}));
      setTimeout(() => {
        setShowCopyTip(prev => ({...prev, [code]: false}));
      }, 3000);
    } catch (error) {
      console.log('Failed to copy voucher code');
    }
  };

  const openDetailsModal = voucher => {
    setSelectedVoucher(voucher);
    if (activeTab === 'Offline') {
      // 已使用的线下券无需确认弹窗,直接进详情页
      if (voucher?.status === 'used') {
        navigate(modules.account_mycoupon_detail.name, {uid: voucher?.uid, voucherStatus: voucher?.status});
        return;
      }
      setOfflineVoucherConfirmModalVisible(true);
    } else {
      setDetailsModalVisible(true);
    }
  };

  const handleConfirmOfflineVoucher = async () => {
    await onConfirmOfflineVoucher(selectedVoucher?.uid);
    setOfflineVoucherConfirmModalVisible(false);
    // Offline voucher 详情以页面方式打开,页面内通过 uid 调接口取最新数据
    navigate(modules.account_mycoupon_detail.name, {uid: selectedVoucher?.uid, voucherStatus: selectedVoucher?.status});
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedVoucher(null);
  };

  const renderCouponCard = ({item, index}) => {
    // Used 标记：仅看接口返回的 status
    const isUsed = item.status === 'used';
    const showCopy = showCopyTip[item.code];

    return (
      <View
        key={index}
        style={[
          styles.voucherCard,
          styles.couponCardPadding,
          isUsed && styles.voucherCardUsed,
        ]}>
        {isOffline && (<Image
          source={require('@app/assets/images/offline_vouchers_tag_icon.png')}
          style={styles.offlineTag}
        />)}
        {/* Used 置灰由卡片整体 opacity 统一处理，子元素不再单独叠加 */}
        <Text
          style={styles.voucherTitle}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.name || ''}
        </Text>

        <Text
          style={styles.voucherDescription}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.description || ''}
        </Text>

        <View style={styles.actionRow}>
          {/* Details：已使用也可以点击，跟随卡片整体透明度 */}
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => openDetailsModal(item)}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>

          {/* 复制按钮：已使用时禁用点击，跟随卡片整体透明度 */}
          <TouchableOpacity
            style={styles.codeButton}
            onPress={event => handleCopyCode(item.code, event)}
            disabled={isUsed}>
            <Text style={styles.codeText}>
              {item.code}
            </Text>
            <CopyCodeIcon width={16} height={16} color="#FF8200" />
            {showCopy && (
              <View style={styles.copyTip}>
                <View style={styles.copyTipArrow} />
                <Text style={styles.copyTipText}>Code copied</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.myline}>
          <View style={styles.circleLeft} />
          <Svg style={styles.dashedLineSvg} width="100%" height={1}>
            <Defs>
              <LinearGradient id="dashedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="50%" stopColor="#E0E0E0" />
              </LinearGradient>
            </Defs>
            <Line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="url(#dashedGrad)"
              strokeWidth={3}
              strokeDasharray="7"
            />
          </Svg>
          <View style={styles.circleRight} />
        </View>

        {/* 有效期跟随卡片整体透明度 */}
        <Text style={styles.validDate}>
          Valid date: {formatDate(item.from_date)} - {formatDate(item.to_date)}
        </Text>
      </View>
    );
  };

  // 数据已经在服务端根据 status 过滤，直接使用 couponWallet
  const filteredCoupons = useMemo(() => {
    return couponWallet || [];
  }, [couponWallet]);

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#FF8200" />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <NodataForCoupon />
        <Text style={styles.emptyText}>No Coupon at the moment</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (filteredCoupons.length > 0 && ((loading && !refreshing) || noMoreData)) {
      return (
        <>
          <RenderIf condition={!noMoreData}>
            <View style={{paddingVertical: 20}}>
              <ActivityIndicator size="small" color="#FF8200" />
            </View>
          </RenderIf>
          <RenderIf condition={noMoreData}>
            <Text style={[styles.noDataText, {paddingBottom: 20}]} large>
              {t('account_mycoupon.noMoreData')}
            </Text>
          </RenderIf>
        </>
      );
    }
    return <View style={{paddingBottom: 20}} />;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <NavBar useBack useWhite center title={t('account_mycoupon.title')} />

      {/* 标签页 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('Online')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Online' && styles.tabTextActive,
            ]}>
            {t('account_mycoupon.Online')}
          </Text>
          {activeTab === 'Online' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('Offline')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'Offline' && styles.tabTextActive,
            ]}>
            {t('account_mycoupon.Offline')}
          </Text>
          {activeTab === 'Offline' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      <CustomView paddingVertical={4} style={styles.filterWrapper}>
        <TouchableOpacity onPress={() => onPressVisibleSort(true)}>
          <CustomView
            row
            horizontalCenter
            spaceBetween
            backgroundColor={'#f5f5f5'}
            borderRadius={20}
            marginRight={12}
            paddingVertical={8}
            paddingHorizontal={12}
            >
            <RenderIf condition={currentSelectedSort}>
              <Text style={{fontSize: 12, fontWeight: 'bold'}}>
                {currentSelectedSort?.label}
              </Text>
            </RenderIf>
            <Icon
              name="chevron-down-outline"
              size={16}
              color={Colors.BLACK}
              style={{marginLeft: 2}}
            />
          </CustomView>
        </TouchableOpacity>
      </CustomView>

      <FlatList
        data={filteredCoupons}
        renderItem={renderCouponCard}
        keyExtractor={(item, index) => `coupon-${item.code || index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8200']}
            tintColor="#FF8200"
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.2}
        showsVerticalScrollIndicator={false}
      />

      <VoucherDetailsModal
        visible={detailsModalVisible}
        voucher={selectedVoucher}
        onClose={closeDetailsModal}
      />
      <AppModal
        type={TYPE_MODAL_SORT}
        show={visibleSort}
        title={'Filter'}
        data={sortByVoucherStatus}
        selectedSort={selectedSort}
        onPressVisibleSort={onPressVisibleSort}
        onSelectSort={onSelectSort}
      />
      <OfflineVoucherConfirmModal visible={offlineVoucherConfirmModalVisible} loading={redeemLoading} onCancel={closeOfflineVoucherConfirmModal} onConfirm={handleConfirmOfflineVoucher}/>
    </SafeAreaView>
  );
};

export default MyCouponView;
