import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {RefreshControl, Text, TouchableOpacity, View} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import throttle from 'lodash.throttle';

import styles from '@app/_modules/main_home/styles';
import NotifacationIcon from '@app/assets/svgs/Notifacation';
import WishlistIcon from '@app/assets/svgs/Wishlist';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import Circle from '@app/components/Circle';
import CmsRender from '@app/components/Cms/index';
import CustomView from '@app/components/CustomView';
import LoyaltyCard from '@app/components/LoyaltyCard';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import SearchBar from '@app/components/SearchBar';
import VariantPickerModal from '@app/components/VariantPickerModal';
import useVariantPicker from '@app/components/VariantPickerModal/useVariantPicker';
import {CART_ACTIONS, TYPE_SHIMMER_CMS_HOME} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxUserToken} from '@app/services/cache';
import {COUNT_UNREAD_NOTIFICATIONS} from '@app/services/queries/notification';
import {Colors} from '@app/styles';

import {ScrollToTopButton} from './atoms/scrollToTopBtn';

const HomeScreen = ({
  t,
  loading,
  refreshing,
  cmsPage,
  cmsPageError,
  onRefreshCmsPage,
  searchPlaceholder,
  onScanGuideClose,
  voucherSliderRef,
  onNavigateWishlist,
}) => {
  const scrollViewRef = useRef(null);
  const skuModalRef = useRef(null);

  const [showBackToTop, setShowBackToTop] = useState(false);
  const getRxUserToken = useReactiveVar(rxUserToken);
  const isLoggedIn = getRxUserToken !== null;
  const throttledScroll = useRef(
    throttle((y, prev) => {
      const next = y > 300;
      if (prev !== next) {
        setShowBackToTop(next);
      }
    }, 200),
  ).current;

  const handleScroll = useCallback(
    event => {
      const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
      throttledScroll(offsetY, showBackToTop);
    },
    [showBackToTop, throttledScroll],
  );

  const backToTop = useCallback(() => {
    scrollViewRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);

  const {data: notifData, onRefetchData: refetchNotifications} = useCustomQuery(
    {
      schema: COUNT_UNREAD_NOTIFICATIONS,
      useInitData: true,
      opts: {fetchPolicy: 'network-only'},
    },
  );

  const prevIsLoggedInRef = useRef(isLoggedIn);
  const refetchNotificationsRef = useRef(refetchNotifications);

  // 更新 ref 以保持最新引用
  refetchNotificationsRef.current = refetchNotifications;

  const picker = useVariantPicker({
    modalRef: skuModalRef,
    onClose: () => skuModalRef.current?.dismiss(),
  });

  const showVariantPopup = item => {
    picker.open({
      cacheKey: item.uid,
      urlKey: item.variant_parent_url_key,
      action:
        item?.variant_preselected_options?.length > 0
          ? CART_ACTIONS.ADD_TO_CART
          : '',
      uid: item.uid,
    });
  };

  // 只在登录状态从 false 变为 true 时调用
  useEffect(() => {
    const prevIsLoggedIn = prevIsLoggedInRef.current;
    prevIsLoggedInRef.current = isLoggedIn;

    if (!prevIsLoggedIn && isLoggedIn) {
      refetchNotificationsRef?.current({params: {}});
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      refetchNotificationsRef?.current({params: {}});
    }, []),
  );

  const unreadCount = useMemo(() => {
    return notifData?.data?.getNotifications?.total_unread ?? 0;
  }, [notifData]);

  const handleNotificationPress = useCallback(() => {
    navigateTo(
      modules.account_notification.enable,
      modules.account_notification.name,
    );
  }, []);

  const handleWishlistPress = useCallback(() => {
    if (onNavigateWishlist) {
      onNavigateWishlist();
    } else {
      // 如果没有传递 onNavigateWishlist，检查登录状态
      if (isLoggedIn) {
        navigateTo(
          modules.account_wishlist.enable,
          modules.account_wishlist.name,
        );
      } else {
        navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
      }
    }
  }, [onNavigateWishlist, isLoggedIn]);

  return (
    <View style={{flex: 1}}>
      <NavBar
        backgroundColor={Colors.WHITE}
        useLogo
        childrenRight={
          <CustomView row horizontalCenter verticalCenter style={{flex: 1}}>
            <CustomView style={{flex: 1, paddingRight: 12}}>
              <SearchBar
                searchPlaceholder={searchPlaceholder}
                showScanIcon
                onScanGuideClose={onScanGuideClose}
              />
            </CustomView>
            <CustomView
              row
              horizontalCenter
              verticalCenter
              style={{paddingLeft: 8}}>
              <TouchableOpacity
                onPress={handleWishlistPress}
                style={{paddingRight: 12}}>
                <WishlistIcon width={28} height={28} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNotificationPress}>
                <CustomView>
                  <NotifacationIcon width={28} height={28} color="white" />
                  <RenderIf condition={isLoggedIn && unreadCount > 0}>
                    <Circle
                      color={'#CC2B1E'}
                      number={unreadCount > 99 ? 99 : unreadCount}
                      textColor={'#FFFFFF'}
                      textSize={10}
                      size={18}
                      topPosition={-4}
                      rightPosition={-6}
                    />
                  </RenderIf>
                </CustomView>
              </TouchableOpacity>
            </CustomView>
          </CustomView>
        }
      />
      {/*{showScanGuider && <ScannerGuider onScanGuideClose={onScanGuideClose} />}*/}
      {/*
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        overScrollMode="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.containerScroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefreshCmsPage} />
        }>
        <RenderIf condition={!loading}>
          <PageBuilder isMainHome htmlBlock={cmsPage} />
        </RenderIf>
      </ScrollView> */}

      <RenderIf condition={cmsPageError}>
        <View style={styles.internalServerErrorText}>
          <Text>{t('message.internalServerError')}</Text>
        </View>
      </RenderIf>
      <RenderIf condition={loading}>
        <ShimmerSkeleton type={TYPE_SHIMMER_CMS_HOME} />
      </RenderIf>
      <RenderIf condition={!loading}>
        <CmsRender
          ref={scrollViewRef}
          isHome={true}
          htmlStr={cmsPage}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefreshCmsPage}
            />
          }
          onScroll={handleScroll}
          contentContainerStyle={{paddingBottom: 40}}
          voucherSliderRef={voucherSliderRef}
          headerComponent={<LoyaltyCard variant="home" />}
          onOpenVariantPopup={showVariantPopup}
        />
      </RenderIf>

      <RenderIf condition={showBackToTop}>
        <ScrollToTopButton onPress={backToTop} />
      </RenderIf>

      <VariantPickerModal ref={skuModalRef} {...picker} />
    </View>
  );
};

export default HomeScreen;
