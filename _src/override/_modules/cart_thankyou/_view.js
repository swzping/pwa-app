import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import {Image, TouchableOpacity, View} from 'react-native';

import {Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useFocusEffect} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import styles from '@app/_modules/cart_thankyou/styles';
import CartIcon from '@app/assets/svgs/CartV2';
import NotifacationIcon from '@app/assets/svgs/Notifacation';
import WishlistIcon from '@app/assets/svgs/Wishlist';
import Circle from '@app/components/Circle';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import SearchBar from '@app/components/SearchBar';
import Text from '@app/components/Text';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxUserToken} from '@app/services/cache';
import {COUNT_UNREAD_NOTIFICATIONS} from '@app/services/queries/notification';
import {Colors} from '@app/styles';

const ThankyouScreen = ({
  t,
  orderId,
  loadingReset,
  searchPlaceholder,
  onResetToHome,
  onNavigateToTrackOrder,
  onScanGuideClose,
}) => {
  const getRxUserToken = useReactiveVar(rxUserToken);
  const isLoggedIn = getRxUserToken !== null;

  const {data: notifData, onRefetchData: refetchNotifications} = useCustomQuery(
    {
      schema: COUNT_UNREAD_NOTIFICATIONS,
      useInitData: true,
      opts: {fetchPolicy: 'network-only'},
    },
  );

  const prevIsLoggedInRef = useRef(isLoggedIn);
  const refetchNotificationsRef = useRef(refetchNotifications);

  refetchNotificationsRef.current = refetchNotifications;

  useEffect(() => {
    const prevIsLoggedIn = prevIsLoggedInRef.current;
    prevIsLoggedInRef.current = isLoggedIn;

    if (!prevIsLoggedIn && isLoggedIn) {
      refetchNotificationsRef.current();
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      refetchNotificationsRef.current();
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

  const onNavigateWishlist = () => {
    if (isLoggedIn) {
      navigateTo(
        modules.account_wishlist.enable,
        modules.account_wishlist.name,
      );
    } else {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    }
  };

  const handleWishlistPress = useCallback(() => {
    if (onNavigateWishlist) {
      onNavigateWishlist();
    } else {
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

  const handleCartPress = useCallback(() => {
    if (isLoggedIn) {
      navigateTo(modules.cart.enable, modules.cart.name);
    } else {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    }
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'bottom']}>
      <NavBar
        useLogo
        logoColor={Colors.PRIMARY}
        stylesContainer={{height: 'auto'}}
        childrenRight={
          <CustomView row horizontalCenter verticalCenter flex={1}>
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
              style={{paddingLeft: 4}}>
              <TouchableOpacity
                onPress={handleCartPress}
                style={{paddingRight: 8}}>
                <CartIcon width={28} height={28} color={Colors.PRIMARY} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleWishlistPress}
                style={{paddingRight: 8}}>
                <WishlistIcon width={28} height={28} color={Colors.PRIMARY} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNotificationPress}>
                <CustomView>
                  <NotifacationIcon
                    width={28}
                    height={28}
                    color={Colors.PRIMARY}
                  />
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
        useCmsHeader={<></>}
        bgColor={<View style={styles.navBgColor} />}
      />
      <CustomView
        horizontalCenter
        paddingHorizontal={14}
        style={styles.contentContainer}>
        <Image
          source={require('@app/assets/images/purchaseSuccessful.png')}
          style={styles.purchaseSuccessfulLogo}
        />
        <Text center style={styles.purchaseSuccessfulTxt}>
          {t('cart_thankyou.view.purchaseSuccessful')}
        </Text>
        <Text style={styles.orderNumber}>
          {t('cart_thankyou.view.orderNumber', {orderId})}
        </Text>
        <CustomView row verticalCenter style={styles.action}>
          <Button
            uppercase={false}
            labelStyle={{
              fontSize: 14,
              fontWeight: '700',
            }}
            style={styles.viewOrderBtn}
            textColor={Colors.PRIMARY}
            onPress={onNavigateToTrackOrder}>
            {t('cart_thankyou.label.viewOrder')}
          </Button>
          <Button
            loading={loadingReset}
            disabled={loadingReset}
            uppercase={false}
            labelStyle={{
              fontSize: 14,
              fontWeight: '700',
            }}
            style={styles.backHome}
            textColor={Colors.WHITE}
            onPress={onResetToHome}>
            {t('cart_thankyou.label.backHome')}
          </Button>
        </CustomView>
        <CustomView
          row
          horizontalCenter
          marginTop={24}
          paddingHorizontal={12}
          paddingVertical={8}
          borderRadius={8}
          bg="#FFF8E8">
          <Image
            source={require('@app/assets/images/point_icon.png')}
            style={{
              width: 32,
              height: 32,
              marginRight: 8,
            }}
          />
          <CustomView flex={1}>
            <Text style={styles.pointsEarned}>
              {t('cart_thankyou.label.pointsEarned')}
            </Text>
            <Text style={styles.pointsEarnedSummary}>
              {t('cart_thankyou.label.pointsEarnedSummary')}
            </Text>
          </CustomView>
        </CustomView>
      </CustomView>
    </SafeAreaView>
  );
};

export default ThankyouScreen;
