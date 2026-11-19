import React, {useEffect, useRef,useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {Path, Svg, SvgUri} from 'react-native-svg';
import Icon from 'react-native-vector-icons/Ionicons';

import {useNavigation} from '@react-navigation/native';

import FastImage from '@d11/react-native-fast-image';
import {modules, tabsApp} from '@root/swift.config';

import styles from '@app/_modules/account_milestone/styles';
import GuardianWordmark from '@app/assets/svgs/GuardianWordmark';
import RectangleGamificationList from '@app/assets/svgs/RectangleGamificationList';
import TaskListTabBg from '@app/assets/svgs/TaskListTabBg';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import Text from '@app/components/Text';
import {BRAND, TYPE_SHIMMER_MILESTONE} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';

const GAMIFICATION_TOP_BG = require('@app/assets/images/GamificationTOpBg.png');
const GAMIFICATION_POPUP = require('@app/assets/images/GamificationPopUp.png');
// const GAMIFICATION_VOUCHERS = require('@app/assets/images/gamifactionVouchers.png');
const GAMIFICATION_CONGRATS = require('@app/assets/images/gamificationCongratulations.png');
const GAMIFICATION_HAS_ADDED_ON = require('@app/assets/images/gamificationHasAddOn.png');
const GAMIFICATION_GO_GET_IT = require('@app/assets/images/gamificationGoGetIt.png');
const GAMIFICATION_HAPPY = require('@app/assets/images/gamifacationHappy.png');
const GAMIFICATION_SHARE = require('@app/assets/images/gamificationShare.png');
const GAMIFICATION_SHARE_STEP = require('@app/assets/images/gamificationShareStep.png');
const SHARE_STEP_IMAGE_SOURCE = Image.resolveAssetSource(GAMIFICATION_SHARE_STEP);
const SHARE_STEP_ASPECT_RATIO =
  SHARE_STEP_IMAGE_SOURCE?.width && SHARE_STEP_IMAGE_SOURCE?.height
    ? SHARE_STEP_IMAGE_SOURCE.width / SHARE_STEP_IMAGE_SOURCE.height
    : 0.58;

const {width: screenWidth} = Dimensions.get('window');
const PROGRESS_BANNER_HEIGHT = screenWidth * 0.4 * 0.9;

const GiftIcon = ({size = 17, color = '#FFF8E8'}) => (
  <Svg width={size} height={size} viewBox="0 0 17 17" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.4 2.88C14.22 1.26 12.87 0 11.16 0C10.0745 0 9.17532 0.702919 8.37745 1.38241C8.21536 1.52045 7.9794 1.52697 7.81269 1.39455C7.00755 0.75501 6.09105 0 5.04 0C3.33 0 1.98 1.26 1.8 2.88C0.81 3.24 0 4.23 0 5.4V6.75C0 7.38 0.36 7.83 0.9 8.01V14.4C0.9 15.39 1.71 16.2 2.7 16.2H13.5C14.49 16.2 15.3 15.39 15.3 14.4V8.01C15.84 7.83 16.2 7.29 16.2 6.75V5.4C16.2 4.23 15.39 3.24 14.4 2.88ZM13.5 4.5C14.04 4.5 14.4 4.86 14.4 5.4V5.85C14.4 6.09853 14.1985 6.3 13.95 6.3H9.45C9.20147 6.3 9 6.09853 9 5.85V4.95C9 4.70147 9.20147 4.5 9.45 4.5H13.5ZM11.16 1.8C11.6011 1.8 12.1023 2.04023 12.3692 2.42258C12.4571 2.54851 12.3514 2.7 12.1978 2.7H9.87265C9.71338 2.7 9.6164 2.54314 9.71698 2.41965C9.93213 2.15551 10.3687 1.8 11.16 1.8ZM5.04 1.8C5.83074 1.8 6.26739 2.1554 6.48272 2.41953C6.5834 2.54302 6.48643 2.7 6.3271 2.7H4.00217C3.84859 2.7 3.74292 2.54851 3.83082 2.42258C4.09769 2.04023 4.59888 1.8 5.04 1.8ZM1.8 5.4C1.8 4.86 2.16 4.5 2.7 4.5H6.75C6.99853 4.5 7.2 4.70147 7.2 4.95V5.85C7.2 6.09853 6.99853 6.3 6.75 6.3H2.25C2.00147 6.3 1.8 6.09853 1.8 5.85V5.4ZM13.5 13.95C13.5 14.1985 13.2985 14.4 13.05 14.4H3.15C2.90147 14.4 2.7 14.1985 2.7 13.95V8.55C2.7 8.30147 2.90147 8.1 3.15 8.1H13.05C13.2985 8.1 13.5 8.30147 13.5 8.55V13.95Z"
      fill={color}
    />
  </Svg>
);

const AccountMilestoneView = ({
  t,
  progress = 0,
  tasks = [],
  bannerUrl = '',
  goodsLogoList = [],
  isRewardClaimed = false,
  loading = false,
  claiming = false,
  onRefetch,
  onClaimVoucher = async () => false,
  getIconName = () => 'ellipse-outline',
}) => {
  const isRemoteIcon = (icon) =>
    typeof icon === 'string' && /^https?:\/\//i.test(icon);
  const isSvgIcon = (icon) =>
    typeof icon === 'string' && /\.svg(\?|$)/i.test(icon);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const happyScale = useRef(new Animated.Value(0.2)).current;
  const happyTranslateY = useRef(new Animated.Value(40)).current;
  const happyRotate = useRef(new Animated.Value(0)).current;
  const taskCount = tasks.length;
  const doneTasks = tasks.filter(task => task.status === 'done').length;
  // 圆点数 = 任务数 - 1，最后一档为礼物（总点数含礼物 = 任务数，不重复多一个圆点）
  const barNodeCount = taskCount > 0 ? taskCount - 1 : 0;
  const allTasksDone = taskCount > 0 && doneTasks === taskCount;
  const nodeFillSteps = allTasksDone
    ? barNodeCount
    : Math.min(doneTasks, barNodeCount);
  const milestoneIndices =
    barNodeCount > 0 ? Array.from({length: barNodeCount}, (_, i) => i) : [];
  const resolvedProgressBannerUri =
    (typeof bannerUrl === 'string' && bannerUrl.trim()) ||
    (goodsLogoList?.length > 0 && goodsLogoList[0]
      ? String(goodsLogoList[0]).trim()
      : '');
  const isProgressBannerSvg =
    !!resolvedProgressBannerUri &&
    /\.svg(\?|$)/i.test(resolvedProgressBannerUri);
  const progressBannerSvgWidth = Math.max(0, screenWidth - 64);
  const isClaimEnabled = Number(progress) >= 100 && !isRewardClaimed;

  const handleGoToMyCoupon = () => {
    setShowClaimModal(false);
    // 避免 modal fade 过程中立即 navigate 导致卡顿/跳转失败
    requestAnimationFrame(() => {
      setTimeout(() => {
        navigateTo(modules.account_mycoupon.enable, modules.account_mycoupon.name);
      }, 50);
    });
  };

  const handleClaimPress = async () => {
    if (!isClaimEnabled || claiming) {return;}
    const success = await onClaimVoucher();
    if (success) {
      setShowClaimModal(true);
    }
  };

  const dismissShareModal = (goHomeAfter) => {
    setShowShareModal(false);
    if (goHomeAfter) {
      navigateTo(tabsApp.enable, tabsApp.name);
    }
  };

  const handleTaskPress = (item) => {
    if (item.status === 'done') {return;}
    const taskType = String(item.taskType || '').trim().toLowerCase();
    switch (taskType) {
      case 'register':
        navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
        return;
      case 'completeprofile':
        navigateTo(
          modules.account_update_information.enable,
          modules.account_update_information.name,
        );
        return;
      case 'shoppingfirst':
        navigateTo(
          modules.product_list.enable,
          modules.product_list.name,
          {
            type: BRAND,
            category_url: 'promotions',
            categoryName: 'Promotions',
          },
        );
        return;
      case 'claimvoucher':
        navigateTo(modules.coupon_list.enable, modules.coupon_list.name);
        return;
      case 'shareproduct':
        setShowShareModal(true);
        return;
      default:
        navigateTo(tabsApp.enable, tabsApp.name);
        return;
    }
  };

  useEffect(() => {
    if (showClaimModal) {
      happyScale.setValue(0.2);
      happyTranslateY.setValue(40);
      happyRotate.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(happyScale, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.spring(happyTranslateY, {
            toValue: 0,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(happyRotate, {
            toValue: 1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(happyRotate, {
            toValue: -1,
            duration: 80,
            useNativeDriver: true,
          }),
          Animated.timing(happyRotate, {
            toValue: 0,
            duration: 80,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      happyScale.setValue(0.2);
      happyTranslateY.setValue(40);
      happyRotate.setValue(0);
    }
  }, [showClaimModal, happyScale, happyTranslateY, happyRotate]);

  const rotateDeg = happyRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-6deg', '0deg', '6deg'],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 背景层：顶部图 + 下方渐变 */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <FastImage
          source={GAMIFICATION_TOP_BG}
          style={styles.topBgImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={['rgba(255, 161, 46, 1)', 'rgba(255, 231, 186, 1)']}
          style={styles.gradientFill}
        />
      </View>
      <TouchableOpacity
        style={[styles.backButton, {top: insets.top + 12}]}
        activeOpacity={0.7}
        onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={35}/>
      </TouchableOpacity>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <ShimmerSkeleton type={TYPE_SHIMMER_MILESTONE} />
        ) : (
          <>
        {/* 顶部标题和描述 */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Milestone</Text>
          <Text style={styles.headerDesc}>
            Complete tasks to earn points and unlock exclusive rewards.
          </Text>
        </View>

        {/* Your Progress 卡片 */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Your Progress</Text>
            <TouchableOpacity
              style={[
                styles.progressClaimButton,
                isClaimEnabled && styles.progressClaimButtonEnabled,
              ]}
              activeOpacity={isClaimEnabled && !claiming ? 0.75 : 1}
              disabled={!isClaimEnabled || claiming}
              onPress={handleClaimPress}
            >
              {claiming ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.progressClaim}>Claim</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.productCard}>
            {resolvedProgressBannerUri ? (
              isProgressBannerSvg ? (
                <SvgUri
                  uri={resolvedProgressBannerUri}
                  width={progressBannerSvgWidth}
                  height={PROGRESS_BANNER_HEIGHT}
                  style={styles.productImagePlaceholder}
                />
              ) : (
                <FastImage
                  source={{uri: resolvedProgressBannerUri}}
                  style={styles.productImagePlaceholder}
                  resizeMode={FastImage.resizeMode.contain}
                />
              )
            ) : (
              <View style={styles.productImagePlaceholder} />
            )}
          </View>

          {/* 进度条：与 MyAccount LoyaltyCard 一致的结构与 UI */}
          <View style={styles.milestoneBarWrapper}>
            <View style={styles.milestoneProgressWrap}>
              {milestoneIndices.map(index => (
                <React.Fragment key={index}>
                  <View
                    style={[
                      styles.milestoneProgressLine,
                      index === 0 && styles.milestoneProgressLineStart,
                      index < nodeFillSteps &&
                        styles.milestoneProgressLineFilled,
                    ]}
                  />
                  <View style={styles.milestoneNodeWrap}>
                    {index < nodeFillSteps ? (
                      <View style={[styles.milestoneNode, styles.milestoneNodeFilled]} />
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
                  allTasksDone && styles.milestoneProgressLineFilled,
                ]}
              />
              <View style={styles.milestoneNodeWrap}>
                {allTasksDone ? (
                  <View style={styles.milestoneGiftNodeCompleted}>
                    <GiftIcon size={14} color="#FFF8E8" />
                  </View>
                ) : (
                  <View style={styles.milestoneGiftNode}>
                    <GiftIcon size={19} color="#FFA12E" />
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.progressFooterRow}>
            <Text style={styles.progressFooterText}>
              Complete All Tasks to Unlock Your Rewards
            </Text>
            {/* <Text style={styles.progressPercentText}>{progress}%</Text> */}
          </View>
        </View>

        {/* Task 列表 */}
        <View style={styles.taskSection}>
          <View style={styles.taskTabWrap} pointerEvents="none">
            <TaskListTabBg />
            <View style={styles.taskTabTextWrap}>
              <GuardianWordmark />
            </View>
          </View>
          <RectangleGamificationList
            style={[StyleSheet.absoluteFill, styles.taskBodyBg]}
          />
          <View style={styles.taskSectionContent}>
            <View style={styles.taskHeaderRow}>
              <Text style={styles.taskTitle}>Your Tasks</Text>
            </View>

            {tasks.map(item => {
              const isDone = item.status === 'done';
              const shouldUseRemoteIcon = isRemoteIcon(item.icon);
              const shouldUseSvgIcon = isSvgIcon(item.icon);
              return (
                <View key={item.id} style={styles.taskRow}>
                  <View style={styles.taskLeft}>
                    <View style={styles.taskIconPlaceholder}>
                      {shouldUseRemoteIcon && shouldUseSvgIcon ? (
                        <SvgUri
                          uri={item.icon}
                          width={28}
                          height={28}
                        />
                      ) : shouldUseRemoteIcon ? (
                        <FastImage
                          source={{uri: item.icon}}
                          style={styles.taskIconImage}
                          resizeMode={FastImage.resizeMode.contain}
                        />
                      ) : (
                        <Icon
                          name={getIconName(item.icon)}
                          size={28}
                          color="#FF8200"
                        />
                      )}
                    </View>
                    <Text style={styles.taskText}>{item.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.taskActionButton,
                      isDone && styles.taskActionButtonDone,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleTaskPress(item)}>
                    <Text
                      style={[
                        styles.taskActionText,
                        isDone && styles.taskActionTextDone,
                      ]}>
                      {isDone ? 'Done' : 'Go To'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
          </>
        )}
      </ScrollView>

      <Modal
        visible={showClaimModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClaimModal(false)}>
        <View style={styles.claimModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowClaimModal(false)}
          />
          <View style={styles.claimPopupWrap}>
            <Animated.View
              style={[
                styles.claimPopupHappyWrap,
                {
                  transform: [
                    {translateY: happyTranslateY},
                    {scale: happyScale},
                    {rotate: rotateDeg},
                  ],
                },
              ]}>
              <FastImage
                source={GAMIFICATION_HAPPY}
                style={styles.claimPopupHappyImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            </Animated.View>
            <FastImage
              source={GAMIFICATION_POPUP}
              style={styles.claimPopupImage}
              resizeMode={FastImage.resizeMode.contain}
            />
            <View style={styles.claimPopupContent} pointerEvents="box-none">
              <View style={styles.claimPopupVouchersWrap}>
                {/* <FastImage
                  source={GAMIFICATION_VOUCHERS}
                  style={styles.claimPopupVouchersImage}
                  resizeMode={FastImage.resizeMode.contain}
                /> */}
              </View>
              <View style={styles.claimPopupTitleWrap}>
                <FastImage
                  source={GAMIFICATION_CONGRATS}
                  style={styles.claimPopupTitleImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.claimPopupSubtitleRow}>
                <FastImage
                  source={GAMIFICATION_HAS_ADDED_ON}
                  style={styles.claimPopupSubtitleImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
                <Text style={styles.claimPopupSubtitleText}>
                  You have received the voucher!
                </Text>
              </View>
              <TouchableOpacity
                style={styles.claimPopupButtonWrap}
                activeOpacity={0.85}
                onPress={handleGoToMyCoupon}>
                <FastImage
                  source={GAMIFICATION_GO_GET_IT}
                  style={styles.claimPopupButtonImage}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => dismissShareModal(false)}>
        <View style={styles.shareModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => dismissShareModal(false)}
          />
          <View style={styles.sharePopupWrap}>
            <FastImage
              source={GAMIFICATION_SHARE}
              style={styles.sharePopupImage}
              resizeMode={FastImage.resizeMode.stretch}
            />
            <View style={styles.shareStepContent} pointerEvents="box-none">
              <ScrollView
                style={styles.shareScroll}
                contentContainerStyle={styles.shareScrollContent}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.shareTitle}>Tutorial:</Text>
                <Text style={styles.shareSubtitle}>
                  How to share Guardian Products to your friends ?
                </Text>
                <View
                  style={[
                    styles.shareStepImageWrap,
                    {aspectRatio: SHARE_STEP_ASPECT_RATIO},
                  ]}>
                  <FastImage
                    source={GAMIFICATION_SHARE_STEP}
                    style={styles.shareStepImage}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <View style={styles.shareBottomActions}>
                    <TouchableOpacity
                      style={styles.shareGoToButton}
                      activeOpacity={0.85}
                      onPress={() => dismissShareModal(true)}>
                      <Text style={styles.shareGoToText}>Go To</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() => dismissShareModal(false)}>
                      <Text style={styles.shareSkipText}>Skip for now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
              <TouchableOpacity
                style={styles.shareClose}
                activeOpacity={0.8}
                onPress={() => dismissShareModal(false)}>
                <Icon name="close" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountMilestoneView;

