import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import Svg, {Path} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';

import {useIsFocused} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';

import {useQuery, useReactiveVar} from '@apollo/client';
import FastImage from '@d11/react-native-fast-image';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {GET_GAMIFICATION_CAMPAIGN_PROGRESS} from '@app/_modules/account_milestone/services/schema';
import {GET_CMS_PAGE} from '@app/_modules/cms_page/services/schema';
import ArrowRight from '@app/assets/svgs/ArrowRight';
import BackgroundGradient from '@app/assets/svgs/BackgroundGradient';
import BackgroundGradientMyAcc from '@app/assets/svgs/BackgroundGradientMyAcc';
import G from '@app/assets/svgs/G';
import I from '@app/assets/svgs/I';
import QrcodePlaceholder from '@app/assets/svgs/QrcodePlaceholder';
// import QrcodePlaceholderMyAcc from '@app/assets/svgs/QrcodePlaceholderMyAcc';
// import RectangleBg from '@app/assets/svgs/RectangleBg';
import StudentCap from '@app/assets/svgs/StudentCap';
import Shimmer from '@app/components/_Shimmer/index';
import Circle from '@app/components/Circle';
import CustomView from '@app/components/CustomView';
import PointsInfoModal from '@app/components/LoyaltyCard/atoms/PointsInfoModal/index';
import WellnessProfile from '@app/components/LoyaltyCard/atoms/WellnessProfile/index';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import WebViewContent from '@app/components/WebViewContent';
import AnalyticsHelper from '@app/helpers/Analytics';
import {numberFormat, numberFormatBy} from '@app/helpers/General';
import {navigate, navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxUserToken} from '@app/services/cache';
import {GET_COUPONS} from '@app/services/queries/coupons';
import {COUNT_UNREAD_NOTIFICATIONS} from '@app/services/queries/notification';
import {GET_BALANCE_POINT} from '@app/services/queries/points';
import {GET_LOYALTY_CARD_DATA} from '@app/services/queries/user';

// import FastImage from 'react-native-fast-image';
// import {getLoyaltyCardTop, ICONS_CONFIG} from './iconsConfig';
import styles from './styles';

const HEADER_CART_AFTER_LOGIN = require('@app/assets/svg/headerCartAfterLogin.png');
const HEADER_CART_BEFORE_LOGIN = require('@app/assets/svg/headerCartBeforeLogin.png');
// const ICONS_SOURCE = require('@app/assets/svg/icons.png');
const POINT_ICON_SOURCE = require('@app/assets/images/point_icon.png');
const COUPONS_SOURCE = require('@app/assets/images/coupons.png');
const GSTORE_SOURCE = require('@app/assets/images/gstore.png');
const MILESTON_BG_SOURCE = require('@app/assets/images/milestonBg.png');
// const SHOW_BACKGROUND_COINS = false;
// const ACCOUNT_QR_TOP_MARGIN = 28;
// const ACCOUNT_QR_TOP_MARGIN_WITH_STUDENT = 28;

const COUNT_DOWN = 60; // 60秒 = 1分钟

const LoyaltyCard = React.forwardRef((props, ref) => {
  const {variant = 'account'} = props;
  const {t} = useTranslation();
  const isFocused = useIsFocused();
  const userToken = useReactiveVar(rxUserToken);
  const isLoggedIn = userToken !== null;
  const isHome = variant === 'home';
  const showMilestoneOnAccount =
    !isHome && isLoggedIn && modules.account_milestone?.enable;
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPointsInfoModal, setShowPointsInfoModal] = useState(false);
  const [showStudentBenefitsModal, setShowStudentBenefitsModal] =
    useState(false);
  const [countdown, setCountdown] = useState(COUNT_DOWN);
  const [qrValue, setQrValue] = useState('');
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  // 过期积分文案行数（1 = 单行，2 = 换行），onTextLayout 渲染后异步回调更新
  const [expirationLineCount, setExpirationLineCount] = useState(1);
  const countdownIntervalRef = useRef(null);
  const cmsPageFetchedRef = useRef(false);
  const hasFetchedOnFocus = useRef(false);
  const milestoneFocusOnceRef = useRef(false);
  const wellnessProfileRef = useRef(null);

  // 底部 Coupons/G-STORE：useWindowDimensions 统一计算宽度，iOS/Android 一致，避免 NaN
  const {height: windowHeight} = useWindowDimensions();

  // 用 Apollo useQuery 拉取姓名/手机号等，保存个人信息后 apolloClient.query 会更新缓存，这里自动拿到新数据
  const {
    data: loyaltyCardQueryData,
    loading: loyaltyCardLoading,
    refetch: refetchLoyaltyCardQuery,
  } = useQuery(GET_LOYALTY_CARD_DATA, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
  });
  const refetchLoyaltyCardData = useCallback(
    () => refetchLoyaltyCardQuery(),
    [refetchLoyaltyCardQuery],
  );
  const loyaltyCardData = loyaltyCardQueryData
    ? {data: loyaltyCardQueryData}
    : null;

  const {
    data: pointBalanceData,
    loading: pointBalanceLoading,
    refetch: refetchPoints,
  } = useQuery(GET_BALANCE_POINT, {
    fetchPolicy: 'network-only',
    skip: !isLoggedIn,
  });

  // 暴露给父组件（如 Account）在返回页面或下拉刷新时主动拉取最新数据
  React.useImperativeHandle(
    ref,
    () => ({
      refetchLoyaltyCard: refetchLoyaltyCardData,
      refresh: () => {
        try {
          if (!isLoggedIn) {
            return;
          }
          refetchLoyaltyCardData();
          refetchPoints();
          wellnessProfileRef.current?.refresh();
        } catch (e) {
          //
        }
      },
    }),
    [isLoggedIn, refetchLoyaltyCardData, refetchPoints],
  );

  const {data: notifData, onRefetchData: refetchNotificationData} =
    useCustomQuery({
      schema: COUNT_UNREAD_NOTIFICATIONS,
      useInitData: isLoggedIn,
      opts: {fetchPolicy: 'network-only'},
    });

  // 获取优惠券数量（使用 getCoupons 接口）
  const {data: couponsData} = useCustomQuery({
    schema: GET_COUPONS,
    useInitData: isLoggedIn,
    variables: {
      pageSize: 1,
      currentPage: 1,
    },
    opts: {fetchPolicy: 'network-only'},
  });

  const {
    data: gamificationProgressData,
    refetch: refetchGamificationProgress,
    loading: gamificationProgressLoading,
  } = useQuery(GET_GAMIFICATION_CAMPAIGN_PROGRESS, {
    skip: !showMilestoneOnAccount,
    fetchPolicy: 'network-only',
  });

  useFocusEffect(
    useCallback(() => {
      if (!showMilestoneOnAccount) {
        return;
      }
      if (!milestoneFocusOnceRef.current) {
        milestoneFocusOnceRef.current = true;
        return;
      }
      refetchGamificationProgress();
    }, [showMilestoneOnAccount, refetchGamificationProgress]),
  );

  const milestoneCampaign = gamificationProgressData?.gamificationCampaign;
  const milestoneRewardClaimed = !!milestoneCampaign?.is_reward_claimed;
  const milestoneTasksRaw = milestoneCampaign?.tasks ?? [];
  const milestoneTaskCount = milestoneTasksRaw.length;
  const milestoneDoneTasks = milestoneTasksRaw.filter(
    task => task.status === 'completed',
  ).length;
  const milestoneBarNodeCount =
    showMilestoneOnAccount && milestoneTaskCount > 0
      ? milestoneTaskCount - 1
      : 0;
  const milestoneAllDone =
    showMilestoneOnAccount &&
    milestoneTaskCount > 0 &&
    milestoneDoneTasks === milestoneTaskCount;
  const milestoneNodeFillSteps = showMilestoneOnAccount
    ? milestoneAllDone
      ? milestoneBarNodeCount
      : Math.min(milestoneDoneTasks, milestoneBarNodeCount)
    : 1;
  const legacyMilestoneCompleted = 1;
  const milestoneIndices = !showMilestoneOnAccount
    ? [0, 1, 2, 3]
    : milestoneBarNodeCount > 0
    ? Array.from({length: milestoneBarNodeCount}, (_, i) => i)
    : gamificationProgressLoading
    ? [0, 1, 2, 3]
    : [];

  const unreadCount = notifData?.data?.getNotifications?.total_unread ?? 0;
  const voucherCount = couponsData?.data?.coupons?.totalCount ?? 0;

  // 从新 query 中提取数据
  const customerData = loyaltyCardData?.data?.customer;
  const studentData = customerData?.student_data;
  const showStudentTag = !isHome && isLoggedIn && studentData?.is_student_pass;
  const qrCodeData = customerData?.qr_code;
  const storeConfig = loyaltyCardData?.data?.storeConfig;
  const cmsHomepageIdentifier = storeConfig?.cms_homepage_identifer;
  // Student 弹框文案来自 cmsBlocks(student_benefit_content)
  const studentBenefitBlock = loyaltyCardData?.data?.cmsBlocks?.items?.[0];

  // 从积分接口提取数据（复用 point history 的逻辑）
  const balancePoint = pointBalanceData?.getBalancePoint?.data?.point || 0;
  const expiringPoint =
    pointBalanceData?.getExpiringPoints?.data?.expiringPoint || 0;
  const expiringTime =
    pointBalanceData?.getExpiringPoints?.data?.expiringTime || null;

  // 生成二维码内容对象 - 使用从 API 获取的数据
  const updateQrValue = useCallback(async () => {
    if (qrCodeData?.memberId && qrCodeData?.expireTime) {
      const qrObj = {
        memberId: qrCodeData.memberId,
        expireTime: qrCodeData.expireTime, // 使用接口返回的 expireTime
      };
      setQrValue(JSON.stringify(qrObj));
    }
  }, [qrCodeData]);

  useEffect(() => {
    if (isLoggedIn && qrCodeData) {
      updateQrValue();
    }
  }, [isLoggedIn, qrCodeData, updateQrValue]);

  // 数据未返回时不展示假数据，改用骨架图
  const firstName = customerData?.firstname?.split(' ')?.[0];
  const maxNameLen = 10; // 名字最多展示长度，超出用省略号
  const displayName =
    firstName && firstName.trim().length > maxNameLen
      ? firstName.trim().slice(0, maxNameLen) + '...'
      : firstName?.trim() || ' ';
  const phoneNumber = customerData?.phonenumber;
  // 格式化为 +62 XXX XXXX XXXX
  const displayPhoneNumber = (() => {
    if (!phoneNumber) {
      return null;
    }
    const raw = String(phoneNumber).replace(/\s+/g, '');
    if (raw.startsWith('+62')) {
      const local = raw.slice(3);
      const p1 = local.slice(0, 3);
      const p2 = local.slice(3, 7);
      const p3 = local.slice(7);
      return `+62 ${[p1, p2, p3].filter(Boolean).join(' ')}`;
    }
    return raw;
  })();

  // 个人信息加载状态：只检查 customer 数据
  const isInfoLoading =
    isLoggedIn &&
    (loyaltyCardLoading || !customerData || !customerData?.firstname);

  // 积分加载状态：检查积分数据
  const isPointsLoading =
    isLoggedIn &&
    (pointBalanceLoading ||
      balancePoint === undefined ||
      balancePoint === null);

  // LoyaltyCard 骨架：用半透明白色渐变，避免默认灰色过重
  // const shimmerColors = [
  //   'rgba(255,255,255,0.18)',
  //   'rgba(255,255,255,0.35)',
  //   'rgba(255,255,255,0.18)',
  // ];

  // 格式化日期：复用 point history 的逻辑
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

  const pad = num => {
    return num.toString().padStart(2, '0');
  };

  const formatDate = (iso, opts = {}) => {
    if (!iso) {
      return '';
    }
    const date = typeof iso === 'string' ? new Date(iso) : iso;
    const day = date.getDate();
    const month = EN_ABBR[date.getMonth()];
    const year = date.getFullYear();

    if (opts.noHours) {
      return `${pad(day)} ${month} ${year}`;
    }

    let hours = date.getHours();
    const minutes = pad(date.getMinutes());
    let suffix = '';
    if (opts.twelve) {
      suffix = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    } else {
      hours = hours % 24;
    }
    return `${pad(day)} ${month} ${year}, ${pad(hours)}:${minutes}${suffix}`;
  };

  const handleHealthReport = () => {
    const healthReportItem = modules.account?.atoms?.menus?.find(
      item => item.enable && item.label === 'healthReport',
    );
    if (healthReportItem) {
      navigateTo(healthReportItem.enable, healthReportItem.moduleName);

      AnalyticsHelper.eventHealthCheckClick({
        entry_point: 'my_account',
        loyalty_id: qrCodeData?.memberId,
        is_logged_in: isLoggedIn,
      });
    }
  };

  const handleMyVoucherPress = () => {
    // 如果未登录，跳转到登录页
    if (!isLoggedIn) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
      return;
    }
    // 导航到优惠券页面
    navigateTo(modules.coupon_list.enable, modules.coupon_list.name);
  };

  const handleQrCodePress = () => {
    setShowQrModal(true);
    updateQrValue(); // 每次点击刷新时间戳
    setCountdown(COUNT_DOWN); // 重置倒计时
  };

  const handleRefreshQr = async () => {
    // 重新请求接口获取新的 expireTime
    setIsRefreshingQr(true);
    try {
      await refetchLoyaltyCardData({
        params: null,
        paramsOpt: {isReturn: false},
      });
      // 等待数据更新后，updateQrValue 会在 useEffect 中自动调用
      setCountdown(COUNT_DOWN); // 重置倒计时为5分钟
    } catch (error) {
      console.log('[err] refresh QR code', error);
      // 即使请求失败，也尝试使用当前数据更新
      updateQrValue();
      setCountdown(COUNT_DOWN);
    } finally {
      setIsRefreshingQr(false);
    }
  };

  const handleCloseModal = () => {
    setShowQrModal(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  // 倒计时效果
  useEffect(() => {
    if (showQrModal) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            // 倒计时到0时，自动刷新二维码 - 重新请求接口获取新的 expireTime
            setIsRefreshingQr(true);
            refetchLoyaltyCardData({
              params: null,
              paramsOpt: {isReturn: false},
            })
              .then(() => {
                setIsRefreshingQr(false);
              })
              .catch(error => {
                console.log('[err] auto refresh QR code', error);
                setIsRefreshingQr(false);
              });
            return COUNT_DOWN; // 重置为2分钟
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [showQrModal, refetchLoyaltyCardData]);

  // 格式化倒计时显示 (MM:SS)
  const formatCountdown = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCardPress = () => {
    navigateTo(modules.account.enable, modules.account.name);
  };

  const handleSettingsPress = () => {
    // 未登录也可进入设置页，设置页内会根据 isLoggedIn 显示较少内容
    navigateTo(modules.account_settings.enable, modules.account_settings.name);
  };

  const handleNotificationPress = () => {
    navigate(modules.account_notification.name);
  };

  const handleSignInPress = () => {
    // 如果是在 account 页面，传递 fromAccount 参数，以便返回时能回到 account 页面
    navigateTo(modules.auth_signin.enable, modules.auth_signin.name, {
      fromAccount: !isHome, // 非首页（account 页面）时传递 true
      useEmailSignin: true,
    });
  };

  const handlePointsInfoPress = () => {
    if (cmsHomepageIdentifier) {
      setShowPointsInfoModal(true);
    }
  };

  const handleViewTasksPress = () => {
    // 优先通过 account 菜单里的 milestone 配置跳转，方便后端/配置侧接入
    const milestoneItem = modules.account?.atoms?.menus?.find(
      item => item.enable && item.label === 'milestone',
    );
    if (milestoneItem) {
      navigateTo(milestoneItem.enable, milestoneItem.moduleName);
    }
  };

  // 获取 CMS 页面数据（仅在 Modal 打开时获取）
  const {
    data: cmsPageData,
    loading: cmsPageLoading,
    error: cmsPageError,
    onRefetchData: refetchCmsPage,
  } = useCustomQuery({
    schema: GET_CMS_PAGE,
    useInitData: false,
    variables: {identifier: cmsHomepageIdentifier},
    opts: {context: {method: 'POST'}},
  });

  // 当 Modal 打开时，获取 CMS 数据（仅请求一次）
  useEffect(() => {
    if (
      showPointsInfoModal &&
      cmsHomepageIdentifier &&
      !cmsPageFetchedRef.current
    ) {
      cmsPageFetchedRef.current = true;
      refetchCmsPage({
        params: {identifier: cmsHomepageIdentifier},
        paramsOpt: {isReturn: false},
      }).catch(() => {
        // 请求失败时，重置标记以便下次可以重试
        cmsPageFetchedRef.current = false;
      });
    }
    // 当 Modal 关闭时，重置标记
    if (!showPointsInfoModal) {
      cmsPageFetchedRef.current = false;
    }
  }, [showPointsInfoModal, cmsHomepageIdentifier]);

  useEffect(() => {
    if (isFocused && isLoggedIn) {
      if (hasFetchedOnFocus.current) {
        refetchLoyaltyCardData();
        refetchPoints();
        if (variant !== 'home') {
          refetchNotificationData({params: {}});
        }
      } else {
        hasFetchedOnFocus.current = true;
      }
    }
  }, [isFocused, isLoggedIn, refetchLoyaltyCardData, refetchPoints, variant]);

  const cmsPageContent = cmsPageData?.data?.cmsPage?.content;
  const cmsPageTitle = cmsPageData?.data?.cmsPage?.title || 'About Your Points';

  // 如果未登录，显示促销横幅
  if (!isLoggedIn) {
    // 首页：新样式（包含三个卡片）
    if (isHome) {
      return (
        <View style={styles.promoContainer}>
          <View
            style={[
              styles.promoBanner,
              {
                paddingHorizontal: 32,
                // paddingTop: 20,
                paddingBottom: 16,
                position: 'relative',
              },
            ]}>
            {/* backGroundColor.svg 背景 - 和登录后一样 */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
              }}>
              <BackgroundGradient />
            </View>
            {/* icons.png 装饰层 - 和登录后一样 */}
            {/* {SHOW_BACKGROUND_COINS && ICONS_SOURCE ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: getLoyaltyCardTop(),
                  left: ICONS_CONFIG.LEFT,
                  right: 0,
                  height: ICONS_CONFIG.HEIGHT,
                  zIndex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <FastImage
                  source={ICONS_SOURCE}
                  style={{
                    width: ICONS_CONFIG.WIDTH,
                    height: ICONS_CONFIG.HEIGHT,
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                  priority={FastImage.priority.high}
                />
              </View>
            ) : null} */}
            {/* 背景装饰：半透明的 g 字母 */}
            {/* <View style={[styles.backgroundLogo, {zIndex: 2}]}>
              <Text style={styles.backgroundLogoText}>g</Text>
            </View> */}

            {/* 首页未登录头部背景：HEADER_CART_BEFORE_LOGIN（62px，左右内缩与白色矩形对齐） */}
            <FastImage
              source={HEADER_CART_BEFORE_LOGIN}
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                height: 62,
                zIndex: 0,
              }}
              resizeMode={FastImage.resizeMode.stretch}
              priority={FastImage.priority.high}
              pointerEvents="none"
            />
            {/* 白色矩形背景层（position absolute，下圆角，只覆盖内容区） */}
            <View
              pointerEvents="none"
              style={[
                styles.whiteCardBackground,
                {left: 12, right: 12, bottom: 16},
              ]}
            />

            {/* 左上角：Sign in/Sign up 链接 - 位于白色矩形上，橙色文字 */}
            <TouchableOpacity
              onPress={handleSignInPress}
              style={[styles.signInLink, {zIndex: 2}]}
              activeOpacity={0.7}>
              <CustomView row horizontalCenter>
                <Text style={[styles.signInText, {color: '#FF8200'}]}>
                  Login/Register
                </Text>
                <ArrowRight
                  color="#FF8200"
                  width={20}
                  height={20}
                  strokeWidth={1.67}
                />
              </CustomView>
            </TouchableOpacity>

            {/* 三个卡片区域 - RectangleBg 框暂注释，直接放白色矩形上
                marginTop 72 = 头部图 62 + 间距 10，确保内容在白色矩形（top 62）内 */}
            <View style={{marginTop: 53, position: 'relative', zIndex: 2}}>
              {/*
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: -5,
                  left: -10,
                  right: -10,
                  bottom: -5,
                  zIndex: 0,
                }}>
                <RectangleBg />
              </View>
              */}
              {/* 卡片内容 */}
              <CustomView
                row
                paddingTop={19}
                paddingBottom={20}
                style={{
                  justifyContent: 'space-between',
                  zIndex: 1,
                  // paddingHorizontal: 16,
                  alignItems: 'start',
                }}>
                {/* Welcome Benefit 卡片 - 不可点击 */}
                {/* <View style={{flex: 1,}}> */}
                <FastImage
                  source={require('@app/assets/svg/welcomeMyaccount.png')}
                  style={{width: 98, height: 74}}
                  resizeMode={FastImage.resizeMode.contain}
                  priority={FastImage.priority.high}
                />
                {/* </View> */}

                {/* Member Special Price 卡片 - 不可点击 */}
                {/* <View style={{flex: 1, zIndex: 2}}> */}
                <FastImage
                  source={require('@app/assets/svg/guardianMyaccount.png')}
                  style={{width: 98, height: 104}}
                  resizeMode={FastImage.resizeMode.contain}
                  priority={FastImage.priority.high}
                />
                {/* </View> */}

                {/* Rewards 卡片 - 不可点击 */}
                {/* <View style={{flex: 1 }}> */}
                <FastImage
                  source={require('@app/assets/svg/rewardsMyaccount.png')}
                  style={{width: 98, height: 88}}
                  resizeMode={FastImage.resizeMode.contain}
                  priority={FastImage.priority.high}
                />
                {/* </View> */}
              </CustomView>
            </View>
          </View>
        </View>
      );
    }

    // Account 页面：新样式（参考首页逻辑）
    return (
      <View>
        <View style={[styles.promoContainer, {marginBottom: 0}]}>
          <View
            style={[
              styles.promoBanner,
              {
                paddingHorizontal: 16,
                // paddingTop: 25,
                paddingBottom: 60,
                position: 'relative',
              },
            ]}>
            {/* backGroundColor.svg 背景 - 和登录后一样 */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0,
              }}>
              <BackgroundGradientMyAcc />
            </View>
            {/* icons.png 装饰层 - 和登录后一样 */}
            {/* {SHOW_BACKGROUND_COINS && ICONS_SOURCE ? (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: getLoyaltyCardTop(),
                  left: ICONS_CONFIG.LEFT,
                  right: 0,
                  height: ICONS_CONFIG.HEIGHT,
                  zIndex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={ICONS_SOURCE}
                  style={{
                    width: ICONS_CONFIG.WIDTH,
                    height: ICONS_CONFIG.HEIGHT,
                  }}
                  resizeMode="contain"
                />
              </View>
            ) : null} */}
            {/* 未登录头部背景：HEADER_CART_AFTER_LOGIN（62px，与已登录一致，左右内缩与白色矩形对齐） */}
            <FastImage
              source={HEADER_CART_AFTER_LOGIN}
              style={{
                position: 'absolute',
                top: 8,
                left: 16,
                right: 16,
                height: 62,
                zIndex: 0,
              }}
              resizeMode={FastImage.resizeMode.stretch}
              priority={FastImage.priority.high}
              pointerEvents="none"
            />
            {/* 白色矩形背景层（position absolute，下圆角，与已登录一致）
                bottom: 60 使其只覆盖内容区（到 Health Report），不延伸进底部留白 */}
            <View
              pointerEvents="none"
              style={[
                styles.whiteCardBackground,
                {left: 16, right: 16, bottom: 60, top: 70},
              ]}
            />

            {/* 右上角：设置和通知图标 - 位于白色矩形上 */}
            <CustomView
              row
              style={[
                styles.topIconsRightUnlogged,
                {top: 14, right: 36, zIndex: 3},
              ]}>
              <TouchableOpacity
                onPress={handleSettingsPress}
                style={styles.iconButton}>
                <Icon name="settings" size={24} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNotificationPress}
                style={styles.iconButton}>
                <Icon name="bell" size={24} color="#ffffff" />
              </TouchableOpacity>
            </CustomView>

            {/* 内容区：位于头部图下方、白色矩形上方（与已登录一致） */}
            <View style={{position: 'relative', zIndex: 2}}>
              {/* 卡片内容 */}
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 24,
                  paddingBottom: 20,
                  position: 'relative',
                }}>
                {/* Login/Register 按钮 - 仅此区域点击跳转登录 */}
                <TouchableOpacity
                  onPress={handleSignInPress}
                  activeOpacity={0.7}
                  style={{width: '50%'}}>
                  <CustomView row horizontalCenter width={'100%'}>
                    <Text
                      style={[styles.signInTextAccount, {color: '#FF8200'}]}>
                      Login/Register
                    </Text>
                    <ArrowRight
                      color="#FF8200"
                      width={18}
                      height={18}
                      strokeWidth={1.67}
                    />
                  </CustomView>
                </TouchableOpacity>

                {/* 三个卡片（中间更大，两侧略小） */}
                <CustomView
                  row
                  paddingTop={32}
                  paddingBottom={12}
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                  {/* Welcome Benefit 卡片 - 不可点击（略缩小） */}
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <FastImage
                      source={require('@app/assets/svg/welcomeMyaccount.png')}
                      style={{width: 98, height: 74}}
                      resizeMode={FastImage.resizeMode.contain}
                      priority={FastImage.priority.high}
                    />
                  </View>

                  {/* Member Special Price 卡片（中间放大） - 不可点击 */}
                  <View
                    style={{
                      flex: 1,
                      zIndex: 2,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <FastImage
                      source={require('@app/assets/svg/guardianMyaccount.png')}
                      style={{width: 98, height: 104}}
                      resizeMode={FastImage.resizeMode.contain}
                      priority={FastImage.priority.high}
                    />
                  </View>

                  {/* Rewards 卡片 - 不可点击（略缩小） */}
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <FastImage
                      source={require('@app/assets/svg/rewardsMyaccount.png')}
                      style={{width: 98, height: 88}}
                      resizeMode={FastImage.resizeMode.contain}
                      priority={FastImage.priority.high}
                    />
                  </View>
                </CustomView>
              </View>
            </View>
          </View>
        </View>

        {/* becon入口-未登录  */}
        <WellnessProfile
          isLoggedIn={isLoggedIn}
          styleCustom={{marginTop: -60}}
          onJump={() => {
            AnalyticsHelper.eventBeconClick({
              entry_point: 'my_account',
              loyalty_id: qrCodeData?.memberId,
              is_logged_in: isLoggedIn,
            });
          }}
        />

        {/* Health Report 卡片 - 未登录时不可点击，上下间距收紧 */}
        <CustomView style={styles.healthReportCards}>
          <TouchableOpacity
            disabled={true}
            style={{
              position: 'relative',
              opacity: 0.8,
            }}
            activeOpacity={1}>
            <FastImage
              source={require('@app/assets/svg/healthReport.png')}
              style={{width: '100%', aspectRatio: 343 / 78}}
              resizeMode={FastImage.resizeMode.contain}
              priority={FastImage.priority.high}
            />
            {/* 文字和按钮叠加在图片上 */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                paddingTop: 0,
                paddingLeft: 12,
                // paddingBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#212121',
                  marginBottom: 4,
                }}>
                Health Report
              </Text>
              <View
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 16,
                  borderColor: '#FF8200',
                  borderWidth: 1,
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '400',
                    color: '#FF8200',
                  }}>
                  Go Check It
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </CustomView>

        {/* 底部卡片区域：Coupons 和 G-STORE，未登录时置灰 */}
        <CustomView
          row
          spaceBetween
          paddingTop={16}
          paddingHorizontal={16}
          style={styles.bottomCards}>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={isLoggedIn ? handleMyVoucherPress : undefined}
            activeOpacity={isLoggedIn ? 0.9 : 1}
            disabled={!isLoggedIn}>
            <View style={[styles.voucherCard]}>
              <FastImage
                source={COUPONS_SOURCE}
                style={[StyleSheet.absoluteFill, styles.voucherCardBackground]}
                resizeMode={FastImage.resizeMode.cover}
                priority={FastImage.priority.high}
              />
              <Text style={styles.cardTitle}>{t('vouchers')}</Text>
              <TouchableOpacity
                style={styles.cardButton}
                activeOpacity={0.9}
                onPress={isLoggedIn ? handleMyVoucherPress : undefined}
                disabled={!isLoggedIn}>
                <Text style={styles.cardButtonText}>Go use it</Text>
              </TouchableOpacity>
              {!isLoggedIn && (
                <View
                  pointerEvents="none"
                  style={[
                    StyleSheet.absoluteFill,
                    styles.voucherCardBackground,
                    {backgroundColor: 'rgba(255,255,255,0.55)'},
                  ]}
                />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={{flex: 1}} activeOpacity={1} disabled={true}>
            <View style={[styles.storeCard]}>
              <FastImage
                source={GSTORE_SOURCE}
                style={[StyleSheet.absoluteFill, styles.storeCardBackground]}
                resizeMode={FastImage.resizeMode.cover}
                priority={FastImage.priority.high}
              />
              <Text style={styles.cardTitle}>G-STORE</Text>
              <TouchableOpacity
                style={styles.cardButton}
                activeOpacity={1}
                disabled={true}>
                <Text style={styles.cardButtonText}>Go redeem it</Text>
              </TouchableOpacity>
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.storeCardBackground,
                  {backgroundColor: 'rgba(255,255,255,0.55)'},
                ]}
              />
            </View>
          </TouchableOpacity>
        </CustomView>
      </View>
    );
  }

  const CardContentWrapper = isHome ? TouchableOpacity : View;
  const cardContentWrapperProps = isHome
    ? {activeOpacity: 0.9, onPress: handleCardPress}
    : {};

  return (
    <View style={styles.container}>
      <CardContentWrapper
        {...cardContentWrapperProps}
        style={[
          styles.cardContent,
          {
            paddingHorizontal: isHome ? 20 : 16,
            paddingTop: isHome ? 12 : 8,
            paddingBottom: isHome ? 10 : 60,
            position: 'relative',
          },
        ]}>
        {/* backGroundColor.svg 背景 - 首页和 account 页面都使用 */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
          }}>
          {isHome ? <BackgroundGradient /> : <BackgroundGradientMyAcc />}
        </View>
        {/* icons.png 装饰层 - 首页和 account 页面都使用，跟随滚动 */}
        {/* {SHOW_BACKGROUND_COINS && ICONS_SOURCE ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: getLoyaltyCardTop(),
              left: ICONS_CONFIG.LEFT,
              right: 0,
              height: ICONS_CONFIG.HEIGHT,
              zIndex: ICONS_CONFIG.Z_INDEX,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FastImage
              source={ICONS_SOURCE}
              style={{
                width: ICONS_CONFIG.WIDTH,
                height: ICONS_CONFIG.HEIGHT,
              }}
              resizeMode={FastImage.resizeMode.contain}
              priority={FastImage.priority.high}
            />
          </View>
        ) : null} */}
        {/* 主要内容区域 */}
        <CustomView style={{position: 'relative', zIndex: 2, borderRadius: 15}}>
          {/* 首页：RectangleBg 已被 HEADER_CART_BEFORE_LOGIN 头部图 + 白色矩形替代 */}
          {/* 登录后头部背景：首页用 HEADER_CART_BEFORE_LOGIN，My Account 用 HEADER_CART_AFTER_LOGIN */}
          <FastImage
            source={isHome ? HEADER_CART_BEFORE_LOGIN : HEADER_CART_AFTER_LOGIN}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              height: 62,
              zIndex: 0,
            }}
            resizeMode={FastImage.resizeMode.stretch}
            priority={FastImage.priority.high}
          />
          {/* 登录后：白色矩形背景层（下圆角、上边与头部图衔接、高度随内容自适应）
              名字/手机号等内容在 zIndex 2，位于该背景层上方 */}
          <View pointerEvents="none" style={styles.whiteCardBackground} />
          <CustomView
            row
            style={[
              styles.mainContent,
              {
                position: 'relative',
                zIndex: 2,
                paddingBottom: isHome ? 12 : 8,
                alignItems: 'flex-start',
              },
            ]}>
            {/* 左侧：用户信息和积分 */}
            <CustomView
              style={[
                styles.leftSection,
                {
                  zIndex: 1,
                  paddingHorizontal: 16,
                  paddingTop: isHome ? 12 : 16,
                },
              ]}>
              {isInfoLoading ? (
                <>
                  {/* greeting / phone skeleton */}
                  <CustomView row style={styles.greetingRow}>
                    <CustomView style={styles.greetingContainer}>
                      <CustomView marginBottom={8} width={'50%'}>
                        <Shimmer
                          // colors={shimmerColors}
                          wrapperStyle={{
                            height: 18,
                            width: '100%',
                            borderRadius: 6,
                          }}
                        />
                      </CustomView>
                      {/* <RenderIf condition={!isHome}> */}
                      <CustomView width={'50%'}>
                        <Shimmer
                          // colors={shimmerColors}
                          wrapperStyle={{
                            height: 14,
                            width: '100%',
                            borderRadius: 6,
                          }}
                        />
                      </CustomView>
                      {/* </RenderIf> */}
                    </CustomView>
                  </CustomView>

                  {/* points skeleton */}
                  <CustomView row horizontalCenter style={styles.pointsRow}>
                    <CustomView width={'90%'}>
                      <Shimmer
                        // colors={shimmerColors}
                        wrapperStyle={{
                          height: 26,
                          width: '100%',
                          borderRadius: 8,
                        }}
                      />
                    </CustomView>
                  </CustomView>
                </>
              ) : (
                <>
                  <CustomView row style={[styles.greetingRow, {width: 180}]}>
                    <CustomView style={styles.greetingContainer}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[styles.greeting, {color: '#212121'}]}>
                        {displayName !== ' ' ? `Hi, ${displayName}!` : ' '}
                      </Text>
                      <Text
                        style={[
                          styles.phoneNumber,
                          {color: '#757575'},
                          isHome ? {marginTop: 2} : {marginBottom: 5},
                        ]}>
                        {displayPhoneNumber ?? ' '}
                      </Text>
                    </CustomView>
                  </CustomView>

                  <CustomView
                    row
                    style={[styles.pointsRow, {marginTop: isHome ? 2 : 8}]}>
                    <CustomView style={styles.pointsIcon}>
                      <Image
                        source={POINT_ICON_SOURCE}
                        style={{width: 30, height: 30}}
                        resizeMode="contain"
                      />
                    </CustomView>
                    {isPointsLoading ? (
                      <CustomView width={'55%'}>
                        <Shimmer
                          // colors={shimmerColors}
                          wrapperStyle={{
                            height: 36,
                            width: '100%',
                            borderRadius: 8,
                          }}
                        />
                      </CustomView>
                    ) : (
                      <Text
                        bold
                        style={[styles.pointsBalance, {color: '#FF8200'}]}>
                        {balancePoint !== undefined && balancePoint !== null
                          ? numberFormat('', balancePoint)
                          : '-'}
                      </Text>
                    )}
                    {/* 信息图标 */}
                    <TouchableOpacity
                      style={styles.infoIcon}
                      onPress={handlePointsInfoPress}>
                      <I width={16} height={16} color="#BDBDBD" />
                    </TouchableOpacity>
                  </CustomView>
                </>
              )}

              {!!expiringPoint && !!expiringTime && (
                <Text
                  onLayout={e => {
                    // 用高度/行高换算行数：Android 上 onTextLayout 可能只上报首次
                    // 未换行的中间态且不再重触发，导致 QR 尺寸卡在 1 行状态
                    const lineHeight = 16;
                    const lineCount = Math.round(
                      e.nativeEvent.layout.height / lineHeight,
                    );

                    if (lineCount > 0 && lineCount !== expirationLineCount) {
                      setExpirationLineCount(lineCount);
                    }
                  }}
                  style={[styles.expirationText, {color: '#9E9E9E'}]}>
                  {t('account_mypointhistory.expiring', {
                    expiringPoint: numberFormatBy('', expiringPoint),
                    expiringTime: formatDate(expiringTime, {noHours: true}),
                  })}
                </Text>
              )}
            </CustomView>
            {/* 右侧：QR码区域 */}
            {/* <View
              style={[
                styles.rightSection,
                isHome ? styles.rightSectionHome : styles.rightSectionAccount,
                {
                  zIndex: 1,
                  paddingTop: 10,
                },
              ]}> */}
            {/* 设置和铃铛图标 - 只在 account 页面显示，在二维码正上方，电话和Hi中间 */}
            <RenderIf condition={!isHome}>
              <CustomView
                row
                style={[styles.topIconsRight, {top: 2, right: 10, zIndex: 2}]}>
                <TouchableOpacity
                  onPress={handleSettingsPress}
                  style={styles.iconButton}>
                  <Icon name="settings" size={24} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleNotificationPress}
                  style={styles.iconButton}>
                  <Icon name="bell" size={24} color="#ffffff" />
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
                </TouchableOpacity>
              </CustomView>
            </RenderIf>

            <CustomView
              style={{
                alignItems: 'flex-end',
                marginRight: 0,
                marginTop: isHome ? 8 : 32,
              }}>
              <FastImage
                source={require('@app/assets/svg/guardianMyaccountIcon.png')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: 110,
                  height: 32,
                  zIndex: 0,
                }}
                resizeMode={FastImage.resizeMode.stretch}
                priority={FastImage.priority.high}
              />
            </CustomView>

            {/* QR Code 链接 - 首页 */}
            {/* 固定列宽（= 2 行态 QR 尺寸 + marginRight）：切断
                  行数 → QR 尺寸 → 文本可用宽度 → 行数 的反馈环，
                  否则文案宽度在换行临界值附近会 1↔2 行来回翻转导致闪屏。
                  QR 在固定列内 alignItems flex-end 右对齐，两种行数下右边缘位置不变 */}
            {isInfoLoading ? (
              <CustomView
                style={{
                  alignItems: 'flex-end',
                  marginRight: 16,
                  marginTop: isHome ? 48 : 71,
                  width: 90,
                }}>
                <Shimmer
                  wrapperStyle={{
                    height: isHome ? 68 : 56,
                    width: isHome ? 68 : 56,
                    borderRadius: 6,
                  }}
                />
              </CustomView>
            ) : (
              <CustomView
                style={{
                  alignItems: 'flex-end',
                  marginRight: 16,
                  marginTop: isHome ? 48 : 71,
                  width: 90,
                }}>
                <TouchableOpacity
                  onPress={handleQrCodePress}
                  activeOpacity={0.8}
                  style={
                    isHome && {
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  }>
                  <View style={styles.qrCodeBox}>
                    <QrcodePlaceholder
                      width={
                        isHome
                          ? expirationLineCount === 1
                            ? 68
                            : 86
                          : expirationLineCount === 1
                          ? 56
                          : 76
                      }
                      height={
                        isHome
                          ? expirationLineCount === 1
                            ? 68
                            : 86
                          : expirationLineCount === 1
                          ? 56
                          : 76
                      }
                    />
                  </View>
                </TouchableOpacity>
              </CustomView>
            )}

            {/* </View> */}
          </CustomView>
          {/* Student 进度条 - 只在 account 页面且 is_student_pass 为 true 时显示，点击整块弹出 Student Benefits 弹框 */}
          <RenderIf condition={showStudentTag}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowStudentBenefitsModal(true)}
              style={styles.studentSection}>
              <CustomView row style={styles.studentRow}>
                <CustomView row horizontalCenter>
                  <StudentCap
                    width={18}
                    height={18}
                    color="#FF8200"
                    style={styles.studentIcon}
                  />
                  <Text style={[styles.studentLabel, {color: '#000'}]}>
                    Student
                  </Text>
                </CustomView>
                <Text style={[styles.studentProgressText, {color: '#9E9E9E'}]}>
                  {numberFormat('', studentData?.remaining_quota ?? 0)} /{' '}
                  {numberFormat('', studentData?.student_quota ?? 0)}
                </Text>
              </CustomView>
              <View style={styles.studentProgressWrap}>
                <View
                  style={[
                    styles.studentProgressFill,
                    {
                      width: `${Math.min(
                        100,
                        ((studentData?.remaining_quota ?? 0) /
                          (studentData?.student_quota || 1)) *
                          100,
                      )}%`,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </RenderIf>
        </CustomView>
      </CardContentWrapper>

      {/* becon入口  */}
      <RenderIf condition={!isHome}>
        <WellnessProfile
          ref={wellnessProfileRef}
          isLoggedIn={isLoggedIn}
          styleCustom={{marginTop: -60}}
          onJump={() => {
            AnalyticsHelper.eventBeconClick({
              entry_point: 'my_account',
              loyalty_id: qrCodeData?.memberId,
              is_logged_in: isLoggedIn,
            });
          }}
        />
      </RenderIf>

      {/* Health Report 卡片 - 只在 account 页面显示，上下间距收紧避免真机显大 */}
      <RenderIf condition={!isHome}>
        <CustomView style={styles.healthReportCards}>
          <TouchableOpacity
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: 0,
              zIndex: 2,
            }}
            activeOpacity={0.9}
            onPress={handleHealthReport}>
            <FastImage
              source={require('@app/assets/svg/healthReport.png')}
              style={{width: '100%', aspectRatio: 343 / 78}}
              resizeMode={FastImage.resizeMode.contain}
              priority={FastImage.priority.high}
            />
            {/* 文字和按钮叠加在图片上 */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                marginLeft: 10,
                paddingBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#212121',
                  marginBottom: 4,
                }}>
                Health Report
              </Text>
              <TouchableOpacity
                onPress={handleHealthReport}
                style={{
                  alignSelf: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 16,
                  borderColor: '#FF8200',
                  borderWidth: 1,
                }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '400',
                    color: '#FF8200',
                  }}>
                  Go Check It
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </CustomView>
      </RenderIf>

      {/* Account 页面：底部卡片区域 Coupons + G-STORE */}
      <RenderIf condition={!isHome}>
        <CustomView
          row
          spaceBetween
          paddingHorizontal={16}
          paddingTop={16}
          style={styles.bottomCards}>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={handleMyVoucherPress}
            activeOpacity={0.9}>
            <View style={[styles.voucherCard]}>
              <FastImage
                source={COUPONS_SOURCE}
                style={[StyleSheet.absoluteFill, styles.voucherCardBackground]}
                resizeMode={FastImage.resizeMode.cover}
                priority={FastImage.priority.high}
              />
              <Text style={styles.cardTitle}>{t('vouchers')}</Text>
              <TouchableOpacity
                style={styles.cardButton}
                onPress={handleMyVoucherPress}>
                <Text style={styles.cardButtonText}>
                  Go use it ({voucherCount})
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={{flex: 1}}
            onPress={undefined}
            activeOpacity={0.9}
            disabled={true}>
            <View style={[styles.storeCard]}>
              <FastImage
                source={GSTORE_SOURCE}
                style={[StyleSheet.absoluteFill, styles.storeCardBackground]}
                resizeMode={FastImage.resizeMode.cover}
                priority={FastImage.priority.high}
              />
              <Text style={styles.cardTitle}>G-STORE</Text>
              <TouchableOpacity style={styles.cardButton} disabled={true}>
                <Text style={styles.cardButtonText}>Go redeem it</Text>
              </TouchableOpacity>
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.storeCardBackground,
                  {backgroundColor: 'rgba(255,255,255,0.55)'},
                ]}
              />
            </View>
          </TouchableOpacity>
        </CustomView>
      </RenderIf>

      {/* Account 页面：Milestone 区块 - 在 Coupons/G-STORE 下方，背景 milestonBg */}
      <RenderIf condition={!isHome && !milestoneRewardClaimed}>
        <View style={styles.milestoneWrap}>
          <FastImage
            source={MILESTON_BG_SOURCE}
            style={{
              width: '100%',
              aspectRatio: 1372 / 325,
            }}
            resizeMode={FastImage.resizeMode.contain}
            priority={FastImage.priority.high}
          />
          <View style={styles.milestoneContent}>
            <TouchableOpacity
              style={styles.milestoneViewTasksButton}
              activeOpacity={0.8}
              onPress={handleViewTasksPress}>
              <View style={styles.milestoneViewTasksContent}>
                <Text style={styles.milestoneViewTasksText}>View Tasks</Text>
                <Svg width={11} height={11} viewBox="0 0 11 11" fill="none">
                  <Path
                    d="M6 1L10 5.20779M10 5.20779L6 9.41558M10 5.20779H1"
                    stroke="white"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </View>
            </TouchableOpacity>
            <Text style={styles.milestoneTitle}>Milestone</Text>
            <Text style={styles.milestoneDesc}>
              Complete tasks to unlock exclusive rewards!
            </Text>
            {/* Milestone 进度条：节点数 = tasks.length，完成数 = status completed */}
            <View style={styles.milestoneProgressWrap}>
              {milestoneIndices.map(index => (
                <React.Fragment key={index}>
                  <View
                    style={[
                      styles.milestoneProgressLine,
                      index <
                        (showMilestoneOnAccount
                          ? milestoneNodeFillSteps
                          : legacyMilestoneCompleted) &&
                        styles.milestoneProgressLineFilled,
                    ]}
                  />
                  <View style={styles.milestoneNodeWrap}>
                    {index <
                    (showMilestoneOnAccount
                      ? milestoneNodeFillSteps
                      : legacyMilestoneCompleted) ? (
                      <View
                        style={[
                          styles.milestoneNode,
                          styles.milestoneNodeFilled,
                        ]}
                      />
                    ) : (
                      <View style={styles.milestoneNodeOuter}>
                        <View style={styles.milestoneNodeInnerEmpty} />
                      </View>
                    )}
                  </View>
                </React.Fragment>
              ))}
              <View
                style={[
                  styles.milestoneProgressLine,
                  showMilestoneOnAccount &&
                    milestoneAllDone &&
                    styles.milestoneProgressLineFilled,
                  !showMilestoneOnAccount &&
                    legacyMilestoneCompleted >= 4 &&
                    styles.milestoneProgressLineFilled,
                ]}
              />
              <View style={styles.milestoneNodeWrap}>
                <View style={styles.milestoneGiftNode}>
                  <Icon name="gift" size={9} color="#FFA12E" />
                </View>
              </View>
            </View>
          </View>
        </View>
      </RenderIf>

      {/* 二维码展开Modal */}
      <Modal
        visible={showQrModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 1)',
              'rgba(255, 231, 186, 1)',
              'rgba(255, 211, 139, 1)',
            ]}
            style={styles.modalGradient}>
            <View style={styles.modalContent}>
              {/* Header */}
              <Text style={styles.modalHeader}>
                {qrCodeData?.memberId || 'Loading...'}
              </Text>
              <Text style={styles.modalSubtitle}>{t('qrCodeDesc')}</Text>

              {/* QR Code */}
              <TouchableOpacity
                style={styles.modalQrContainer}
                onPress={handleRefreshQr}
                activeOpacity={0.8}
                disabled={isRefreshingQr}>
                <QRCode
                  value={qrValue || 'loading...'}
                  size={250}
                  color={isRefreshingQr ? '#CCCCCC' : '#000000'}
                  backgroundColor="#FFFFFF"
                />
                {/* G Logo in center */}
                <View style={styles.qrLogoContainer}>
                  <View style={styles.qrLogoCircle}>
                    <G width={24} height={24} color="#FFFFFF" />
                  </View>
                </View>
                {/* Loading overlay */}
                {isRefreshingQr && (
                  <View style={styles.qrLoadingOverlay}>
                    <View style={styles.qrLoadingContent}>
                      <Text style={styles.qrLoadingText}>Refreshing...</Text>
                    </View>
                  </View>
                )}
              </TouchableOpacity>

              {/* Auto refresh timer */}
              <Text style={styles.autoRefreshText}>
                Auto refresh in ({formatCountdown(countdown)})
              </Text>

              {/* Action buttons: Refresh and Close */}
              <View style={styles.modalActionButtons}>
                {/* Refresh button */}
                <TouchableOpacity
                  onPress={handleRefreshQr}
                  style={styles.refreshButton}>
                  <Icon name="refresh-cw" size={24} color="#FF8200" />
                </TouchableOpacity>

                {/* Close button */}
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* About Your Points Modal - 显示 CMS 页面内容 */}
      <PointsInfoModal
        modalVisible={showPointsInfoModal}
        cmsPageTitle={cmsPageTitle}
        cmsPageLoading={cmsPageLoading}
        cmsPageError={cmsPageError}
        cmsPageContent={cmsPageContent}
        setModalVisible={setShowPointsInfoModal}
      />

      {/* Student Benefits 弹框：使用接口 student_data，遮罩与内容分离 */}
      <Modal
        visible={showStudentBenefitsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStudentBenefitsModal(false)}>
        <View style={styles.studentModalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFill}
            onPress={() => setShowStudentBenefitsModal(false)}
          />
          <View
            style={[
              styles.studentModalContent,
              {height: (windowHeight || 400) * 0.6},
            ]}>
            <Text style={styles.studentModalTitle}>
              {studentBenefitBlock?.title ?? 'Details of Student Benefits'}
            </Text>
            <View style={styles.studentModalDivider} />
            <ScrollView
              style={styles.studentModalScroll}
              contentContainerStyle={styles.studentModalScrollContent}
              showsVerticalScrollIndicator={true}
              bounces={true}>
              {studentData != null ? (
                <View style={styles.studentModalQuotaWrap}>
                  <Text style={styles.studentModalQuotaText}>
                    Your Student Discount Allowance for this month is{' '}
                    <Text style={styles.studentModalQuotaAmount}>
                      {numberFormat(
                        'IDR',
                        studentData?.remaining_quota ?? 0,
                        ',',
                        2,
                      )}
                    </Text>
                  </Text>
                </View>
              ) : null}
              {studentBenefitBlock?.content ? (
                <View style={styles.studentModalList}>
                  <WebViewContent
                    htmlBlock={studentBenefitBlock.content}
                    title={studentBenefitBlock.title}
                    contentFontSize={15}
                  />
                </View>
              ) : null}
            </ScrollView>
            <TouchableOpacity
              style={styles.studentModalCloseButton}
              onPress={() => setShowStudentBenefitsModal(false)}
              activeOpacity={0.8}>
              <Text style={styles.studentModalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
});
LoyaltyCard.displayName = 'LoyaltyCard';

export default LoyaltyCard;
