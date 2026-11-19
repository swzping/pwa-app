import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Defs, Line, LinearGradient, Stop} from 'react-native-svg';

import Clipboard from '@react-native-clipboard/clipboard';

import NodataForCoupon from '@app/assets/svgs/NodataForCoupon';
import CopyCodeIcon from '@app/components/Cms/ContentTypes/VoucherSlider/CopyCodeIcon';
import VoucherDetailsModal from '@app/components/Cms/ContentTypes/VoucherSlider/VoucherDetailsModal';
import NavBar from '@app/components/NavBar';

import MessageToast from './MessageToast';
import styles from './styles';

const CouponListView = ({
  t,
  coupons,
  loading,
  refreshing,
  hasMore,
  collectLoading,
  claimingCouponCode,
  isCouponCollected,
  onRefresh,
  loadMore,
  handleClaimCoupon,
  handleGoToMyCoupons,
  messageToast,
  route,
  voucherData,
}) => {
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
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

  const handleDetailsPress = voucher => {
    setSelectedVoucher(voucher);
    setDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalVisible(false);
    setSelectedVoucher(null);
  };

  const handleCopyCode = (code, index) => {
    Clipboard.setString(code);
    setShowCopyTip({...showCopyTip, [index]: true});
    setTimeout(() => {
      setShowCopyTip({...showCopyTip, [index]: false});
    }, 2000);
  };

  const renderCouponCard = ({item, index}) => {
    const collected = isCouponCollected(item.code);
    const isClaiming = collectLoading && claimingCouponCode === item.code;

    return (
      <View style={[styles.couponCard, isOffline && styles.couponCardPadding]}>
        {isOffline && (
          <Image
            source={require('@app/assets/images/offline_vouchers_tag_icon.png')}
            style={styles.offlineTag}
          />
        )}
        <Text
          style={styles.couponTitle}
          numberOfLines={1}
          breakStrategy="simple">
          {item.name || item.title || ''}
        </Text>

        <Text
          style={styles.couponDescription}
          numberOfLines={2}
          breakStrategy="simple">
          {item.description || ''}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleDetailsPress(item)}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>

          {collected ? (
            <TouchableOpacity
              style={styles.codeButton}
              onPress={() => handleCopyCode(item.code, index)}>
              <Text style={styles.codeText}>{item.code}</Text>
              <CopyCodeIcon width={16} height={16} color="#FF8200" />
              {showCopyTip[index] && (
                <View style={styles.copyTip}>
                  <View style={styles.copyTipArrow} />
                  <Text style={styles.copyTipText}>Code copied</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.claimButton,
                isClaiming && styles.claimButtonDisabled,
              ].filter(Boolean)}
              onPress={() => handleClaimCoupon(item)}
              disabled={isClaiming}>
              <Text
                style={[
                  styles.claimText,
                  isClaiming && styles.claimTextDisabled,
                ].filter(Boolean)}>
                {isClaiming ? 'Claiming...' : 'Claim'}
              </Text>
            </TouchableOpacity>
          )}
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

        <Text style={styles.validDate}>
          Valid date: {formatDate(item.from_date || item.validFrom)} -{' '}
          {formatDate(item.to_date || item.validTo)}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (loading && !refreshing && coupons.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color="#FF8200" />
        </View>
      );
    }
    return <View style={{paddingBottom: 40}} />;
  };

  useEffect(() => {
    if (route?.params?.voucherCode) {
      setSelectedVoucher(voucherData?.data?.customerCoupons?.items[0] || {});
      setDetailsModalVisible(true);
    }
  }, [
    route?.params?.voucherCode,
    voucherData?.data?.customerCoupons?.items[0],
  ]);

  const renderEmpty = () => {
    if (loading && coupons.length === 0) {
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

  return (
    <View style={styles.container}>
      <NavBar useBack useWhite center title={'Vouchers'} />
      <FlatList
        data={coupons}
        renderItem={renderCouponCard}
        keyExtractor={(item, index) => `coupon-${item.code || index}`}
        contentContainerStyle={[styles.listContent, {paddingBottom: 100}]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8200']}
            tintColor="#FF8200"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      <VoucherDetailsModal
        visible={detailsModalVisible}
        voucher={selectedVoucher}
        onClose={closeDetailsModal}
      />

      <MessageToast
        visible={messageToast?.visible || false}
        type={messageToast?.type}
        message={messageToast?.message}
        onDismiss={messageToast?.onDismiss}
      />

      {/* Go To My Coupons Button */}
      <SafeAreaView style={styles.bottomButtonContainer} edges={['bottom']}>
        <TouchableOpacity
          style={styles.goToMyCouponsButton}
          onPress={handleGoToMyCoupons}>
          <Text style={styles.goToMyCouponsText}>
            {t('account_mycoupon.goToMyVouchers')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default CouponListView;
