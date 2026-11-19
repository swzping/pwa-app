import React, {useMemo,useRef, useState} from 'react';
import {
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Svg, {Defs, Line, LinearGradient, Stop} from 'react-native-svg';

import {useIsFocused} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import Clipboard from '@react-native-clipboard/clipboard';
import {modules} from '@root/swift.config';

import NodataForCoupon from '@app/assets/svgs/NodataForCoupon';
import Shimmer from '@app/components/_Shimmer/index';
import {navigateTo} from '@app/helpers/Navigation';
import useCollectCoupon from '@app/hooks/useCollectCoupon';
import useCoupons from '@app/hooks/useCoupons';
import useCouponWallet from '@app/hooks/useCouponWallet';
import {rxAppSnackbar,rxRefreshVoucherSlider, rxUserToken} from '@app/services/cache';

import CopyCodeIcon from './CopyCodeIcon';
import styles from './styles';
import VoucherDetailsModal from './VoucherDetailsModal';

const {width: screenWidth} = Dimensions.get('window');

const VoucherSlider = React.forwardRef(
  ({data, onVoucherPress, onDetailsPress, voucherSliderRef}, ref) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [showCopyTip, setShowCopyTip] = useState(false);
    const scrollViewRef = useRef(null);
    const isManualScrolling = useRef(false);

    const userToken = useReactiveVar(rxUserToken);
    const refreshTrigger = useReactiveVar(rxRefreshVoucherSlider);
    const lastHandledTriggerRef = useRef(0);
    const isFocused = useIsFocused();

    const {
      coupons,
      loading: couponsLoading,
      error: couponsError,
      fetchCoupons,
    } = useCoupons();
    const {
      couponWallet,
      loading: walletLoading,
      error: walletError,
      fetchCouponWallet,
    } = useCouponWallet();

    const {collectCoupon, loading: collectLoading} = useCollectCoupon();

    const voucherData = useMemo(() => {
      if (data && data.length > 0) {
        return data;
      }

      return coupons || [];
    }, [data, coupons]);

    const isLoading = couponsLoading;
    const error = couponsError;

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

    React.useEffect(() => {
      if (isFocused) {
        setTimeout(() => {
          refreshData();
        }, 100);
      }
    }, [isFocused]);

    React.useEffect(() => {
      setTimeout(() => {
        fetchCoupons({pageSize: 999, currentPage: 1});
        if (rxUserToken()) {
          fetchCouponWallet({pageSize: 999, currentPage: 1});
        }
      }, 100);
    }, []);

    const [localCollectedCoupons, setLocalCollectedCoupons] = useState([]);
    const [claimingCouponCode, setClaimingCouponCode] = useState(null);

    const isCouponCollected = React.useCallback(
      couponCode => {
        if (!couponCode || !userToken) {
          return false;
        }

        if (localCollectedCoupons.some(coupon => coupon.code === couponCode)) {
          return true;
        }

        if (couponWallet) {
          return couponWallet.some(
            collectedCoupon => collectedCoupon.code === couponCode,
          );
        }

        return false;
      },
      [couponWallet, localCollectedCoupons, userToken],
    );

    const refreshData = React.useCallback(() => {
      fetchCoupons({pageSize: 999, currentPage: 1});
      // customerCoupons 是登录态接口，调用时实时读取 token，游客态（含登出后）不请求
      if (rxUserToken()) {
        fetchCouponWallet({pageSize: 999, currentPage: 1});
      }
    }, [fetchCoupons, fetchCouponWallet]);

    // 监听全局刷新触发器，自动刷新 VoucherSlider 数据（且每个触发值只处理一次）
    React.useEffect(() => {
      if (
        refreshTrigger > 0 &&
        refreshTrigger !== lastHandledTriggerRef.current
      ) {
        lastHandledTriggerRef.current = refreshTrigger;
        refreshData();
      }
    }, [refreshTrigger, refreshData]);

    // 通过 ref 暴露 refresh 方法（目前未在首页使用，但保留以备后用）
    React.useImperativeHandle(
      ref,
      () => ({
        refresh: refreshData,
      }),
      [refreshData],
    );

    React.useEffect(() => {}, [coupons, couponsLoading, couponsError]);

    React.useEffect(() => {
      if (couponWallet && !walletLoading && !walletError) {
        setLocalCollectedCoupons(couponWallet);
      }
    }, [couponWallet, walletLoading, walletError]);

    // 登录/登出切换时重置游客态；登出后不再请求登录态的券包接口
    const prevUserTokenRef = useRef(userToken);
    React.useEffect(() => {
      if (prevUserTokenRef.current === userToken) {
        return;
      }
      prevUserTokenRef.current = userToken;
      setLocalCollectedCoupons([]);
      setCurrentIndex(0);
      if (userToken) {
        fetchCouponWallet({pageSize: 999, currentPage: 1});
      } else {
        fetchCoupons(
          {pageSize: 20, currentPage: 1},
          {fetchPolicy: 'network-only'},
        );
      }
    }, [userToken, fetchCoupons, fetchCouponWallet]);

    const handleDetailsPress = (voucher, index) => {
      setSelectedVoucher(voucher);
      setDetailsModalVisible(true);
      onDetailsPress?.(voucher, index);
    };

    const closeDetailsModal = () => {
      setDetailsModalVisible(false);
      setSelectedVoucher(null);
    };

    const handleClaimPress = async (voucher, index) => {
      if (!userToken) {
        navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
          redirectTo: 'voucher-claim',
        });
        return;
      }

      const couponCode = voucher.code;
      if (!couponCode || isCouponCollected(couponCode)) {
        return;
      }

      if (claimingCouponCode) {
        return;
      }

      setClaimingCouponCode(couponCode);

      try {
        await collectCoupon(couponCode);

        setLocalCollectedCoupons(prev => [...prev, voucher]);

        onVoucherPress?.(voucher, index);
      } catch (claimError) {
        // Handle error silently
        // 领取优惠券接口返回失败：toast 提示
        rxAppSnackbar({
          message: claimError?.message || 'Sorry, the operation failed, please try again!',
          duration: 2000,
        });
      } finally {
        setClaimingCouponCode(prev => (prev === couponCode ? null : prev));
      }
    };

    if (!voucherData || voucherData.length === 0) {
      if (isLoading) {
        // 使用骨架屏占位，而不是 loading spinner
        return (
          <View style={styles.containerOut}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}>
              {[0, 1, 2].map(index => (
                <View
                  key={`voucher-skeleton-${index}`}
                  style={styles.voucherCard}>
                  <Shimmer
                    wrapperStyle={{
                      borderRadius: 8,
                      height: 16,
                      width: '70%',
                      marginBottom: 12,
                    }}
                  />
                  <Shimmer
                    wrapperStyle={{
                      borderRadius: 8,
                      height: 32,
                      width: '90%',
                      marginBottom: 12,
                    }}
                  />
                  <Shimmer
                    wrapperStyle={{
                      borderRadius: 8,
                      height: 24,
                      width: '50%',
                      marginBottom: 16,
                    }}
                  />
                  <Shimmer
                    wrapperStyle={{
                      borderRadius: 8,
                      height: 14,
                      width: '80%',
                      marginBottom: 10,
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        );
      }

      if (error) {
        return (
          <View style={styles.container}>
            <Text style={styles.emptyText}>Failed to load vouchers</Text>
          </View>
        );
      }

      return (
        <View style={[styles.container, styles.emptyContainer]}>
          <NodataForCoupon />
          <Text style={styles.emptyText}>No Coupon at the moment</Text>
        </View>
      );
    }

    const renderVoucherCard = (voucher, index) => (
      <View key={index} style={styles.voucherCard}>
        <View style={styles.titleRow}>
          <Text
            style={styles.voucherTitle}
            testID="voucher-title"
            numberOfLines={1}
            ellipsizeMode="tail">
            {voucher.name || voucher.title || ''}
          </Text>

          {isCouponCollected(voucher.code) && (
            <TouchableOpacity
              style={styles.copyCodeButton}
              onPress={() => {
                Clipboard.setString(voucher.code);
                setShowCopyTip(true);
                setTimeout(() => setShowCopyTip(false), 2000);
              }}>
              <CopyCodeIcon width={16} height={16} color="#FF8200" />
              <Text style={styles.copyCodeText}>Copy Code</Text>

              {showCopyTip && (
                <View style={styles.copyTip}>
                  <View style={styles.copyTipArrow} />
                  <Text style={styles.copyTipText}>Code copied</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text
          style={styles.voucherDescription}
          testID="voucher-description"
          numberOfLines={2}
          ellipsizeMode="tail">
          {voucher.description || ''}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={() => handleDetailsPress(voucher, index)}>
            <Text style={styles.detailsText}>Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.claimButton,
              (collectLoading || claimingCouponCode === voucher.code) &&
                styles.claimButtonDisabled,
              isCouponCollected(voucher.code) && styles.claimButtonCollected,
            ].filter(Boolean)}
            onPress={() => handleClaimPress(voucher, index)}
            disabled={
              collectLoading ||
              claimingCouponCode === voucher.code ||
              isCouponCollected(voucher.code)
            }>
            <Text
              style={[
                styles.claimText,
                (collectLoading || claimingCouponCode === voucher.code) &&
                  styles.claimTextDisabled,
                isCouponCollected(voucher.code) && styles.claimTextCollected,
              ].filter(Boolean)}>
              {claimingCouponCode === voucher.code
                ? 'Claiming...'
                : isCouponCollected(voucher.code)
                ? 'Claimed'
                : 'Claim'}
            </Text>
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

        <Text style={styles.validDate} testID="voucher-valid-date">
          Valid date: {formatDate(voucher.from_date || voucher.validFrom)} -{' '}
          {formatDate(voucher.to_date || voucher.validTo)}
        </Text>
      </View>
    );

    const handleScroll = event => {
      if (isManualScrolling.current) {
        return;
      }

      if (!event || !event.nativeEvent || !event.nativeEvent.contentOffset) {
        return;
      }

      const contentOffset = event.nativeEvent.contentOffset.x;
      const cardWidth = screenWidth * 0.65 + 16;
      const index = Math.round(contentOffset / cardWidth);

      setTimeout(() => {
        setCurrentIndex(index);
      }, 0);
    };

    const renderPaginationDots = () => {
      if (!voucherData || voucherData.length <= 1) {
        return null;
      }

      const handleDotPress = index => {
        const cardWidth = screenWidth * 0.65 + 16;
        const targetOffset = index * cardWidth;

        isManualScrolling.current = true;

        setCurrentIndex(index);

        scrollViewRef.current?.scrollTo({
          x: targetOffset,
          animated: true,
        });

        setTimeout(() => {
          isManualScrolling.current = false;
        }, 500);
      };

      return (
        <View style={styles.paginationContainer}>
          {voucherData.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleDotPress(index)}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.paginationDotActive,
              ]}
              activeOpacity={0.7}
            />
          ))}
        </View>
      );
    };
    return (
      <View style={styles.containerOut}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
          snapToInterval={screenWidth * 0.65 + 16}
          decelerationRate="fast"
          pagingEnabled={false}
          onScroll={handleScroll}
          scrollEventThrottle={100}>
          {voucherData?.map((voucher, index) =>
            renderVoucherCard(voucher, index),
          )}
        </ScrollView>
        {renderPaginationDots()}

        {/* Details弹窗 */}
        <VoucherDetailsModal
          visible={detailsModalVisible}
          voucher={selectedVoucher}
          onClose={closeDetailsModal}
        />
      </View>
    );
  },
);

export default VoucherSlider;
