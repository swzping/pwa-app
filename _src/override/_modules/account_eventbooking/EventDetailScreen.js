import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import FontistoIcon from 'react-native-vector-icons/Fontisto';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {useFocusEffect} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {useQuery} from '@apollo/client';
import FastImage from '@d11/react-native-fast-image';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import I from '@app/assets/svgs/I';
import PageBuilder from '@app/components/Cms';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import {CTA_ACTION, CTA_ACTION_POPUP} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {Storage} from '@app/helpers/Storage';
import {buildLink} from '@app/helpers/Url';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {useSubmitLock} from '@app/hooks/useSubmitLock';
import {rxUserToken} from '@app/services/cache';
import * as Colors from '@app/styles/colors';
import {normalize} from '@app/styles/mixins';

import CopyCode from './atoms/CopyCode';
import Countdown from './atoms/Countdown';
import CustomDialog from './atoms/CustomDialog';
import RemainingQuota from './atoms/RemainingQuota';
import {getOfflineEventQueue} from './services/fetchAPI';
import {
  CLAIM_GUARDIAN_RUNCODE,
  EVENT_BOOKING_DETAIL,
  EVENT_BOOKING_ELIGIBILITY,
} from './services/schema';
import {formatIDDate, setOfflineWaitingRoomExpireTime} from './services/util';
import useOfflineBookingCountdown from './useOfflineBookingCountdown';

const RegisterButton = ({
  t,
  loading,
  eventBookingEligibility,
  categoryCount = 0,
  btnText,
  onEventBtnAction,
}) => {
  const {cta_state: ctaState = {}, existing_ticket: ticketInfo = {}} =
    eventBookingEligibility;

  const onRegisterNew = async () => {
    const memberId = await Storage.get(Storage.name.MEMBER_ID);
    const updatedUrl = buildLink(ticketInfo.register_url, {
      member: memberId,
      v_code: ticketInfo?.ticket_code,
    });
    navigateTo(
      modules.full_screen_web_view.enable,
      modules.full_screen_web_view.name,
      {
        url: updatedUrl,
        isNavBar: false,
      },
    );
  };

  const btnTextMap = {
    WORKSHOP: t('account_eventbooking.btn.register'),
    GUARDIAN_RUN: t('account_eventbooking.btn.chooseCategory'),
  };

  const haveSeeTickets =
    ctaState?.action === CTA_ACTION_POPUP.SHOW_ALREADY_HAS_TICKET_POPUP &&
    ['WORKSHOP', 'EXHIBITION'].includes(eventBookingEligibility.event_type);

  const buttonText = haveSeeTickets
    ? t('account_eventbooking.btn.seeTickets')
    : eventBookingEligibility.event_type === 'GUARDIAN_RUN' &&
      categoryCount === 1
    ? t('account_eventbooking.btn.claim')
    : btnTextMap[eventBookingEligibility.event_type] || btnTextMap.WORKSHOP;

  if (ctaState.action === CTA_ACTION.SHOW_EXISTING_GUARDIAN_RUN_CODE) {
    return (
      <CustomView
        horizontalCenter
        paddingVertical={normalize(12)}
        paddingHorizontal={normalize(12)}
        style={{
          ...styles.registerBtnBg,
          marginTop: normalize(224),
          marginBottom: normalize(26),
        }}>
        <CopyCode code={ticketInfo?.ticket_code} bgStyle={{zIndex: 10}} />

        <CustomView
          flex={1}
          height={normalize(40)}
          borderRadius={8}
          row
          horizontalCenter
          verticalCenter
          disabled={loading}
          onPress={onRegisterNew}
          style={{
            marginTop: normalize(6),
            ...styles.registerBtnContainer,
          }}>
          <CustomView row verticalCenter paddingHorizontal={normalize(20)}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: '#212121',
                fontSize: 14,
                fontWeight: '700',
                textTransform: 'none',
                textAlign: 'center',
              }}>
              {btnTextMap.WORKSHOP}
            </Text>
            <FeatherIcon
              name="chevron-right"
              size={16}
              color="#757575"
              style={{marginLeft: 4, marginTop: 2}}
            />
          </CustomView>
        </CustomView>
        <CustomView
          row
          horizontalCenter
          style={{width: '100%', marginTop: normalize(6)}}>
          <I
            width={normalize(16)}
            height={normalize(16)}
            color={Colors.WHITE}
          />
          <Text
            style={{
              fontSize: 12,
              marginLeft: 6,
              fontWeight: '500',
              color: '#FFF8E8',
            }}>
            {t('account_eventbooking.desc.notFinalTicket')}
          </Text>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <CustomView
      row
      horizontalCenter
      height={40}
      borderRadius={8}
      disabled={loading}
      onPress={onEventBtnAction}
      style={{
        ...styles.registerBtnContainer,
        marginTop: normalize(332),
        marginBottom: normalize(45),
      }}>
      <RenderIf condition={ctaState?.label}>
        <CustomView row verticalCenter paddingHorizontal={10}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: '#212121',
              fontSize: 14,
              fontWeight: '700',
              textTransform: 'none',
              textAlign: 'center',
            }}>
            {buttonText}
          </Text>
          <FeatherIcon
            name="chevron-right"
            size={16}
            color="#757575"
            style={{marginLeft: 4, marginTop: 2}}
          />
        </CustomView>
      </RenderIf>
    </CustomView>
  );
};

const EventDetailScreen = ({route}) => {
  const {t} = useTranslation();
  const {storeConfig} = useStoreConfig({useInitData: true});

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isFirstMount = useRef(true);
  const refreshed = useRef(false);
  const [eventListLoading, setEventListLoading] = useState(false);

  const userToken = useReactiveVar(rxUserToken);
  const isLoggedIn = userToken !== null;

  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const [bannerSize, setBannerSize] = useState(null);

  useEffect(() => {
    if (storeConfig?.waiting_room_expire_time) {
      fetchQueueStatusInfo(); // 初始化时查询一次排队队列状态
    }
  }, [storeConfig?.waiting_room_expire_time]);

  // 如果用户未登录，跳转到登录页
  useEffect(() => {
    if (!isLoggedIn) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    }
  }, [isLoggedIn]);

  const fetchQueueStatusInfo = async () => {
    try {
      setEventListLoading(true);
      const {data: resQueue} = await getOfflineEventQueue();
      await setOfflineWaitingRoomExpireTime(
        storeConfig?.waiting_room_expire_time,
      );
      if (resQueue?.admitted === false && resQueue?.ahead >= 1) {
        onWaitingRoom();
      }
    } catch (error) {
      console.error('查询失败:', error.message);
    } finally {
      setEventListLoading(false);
    }
  };

  const {
    data,
    refetch: refetchEventDetail,
    loading: eventDetailLoading,
  } = useQuery(EVENT_BOOKING_DETAIL, {
    variables: {
      eventId: route.params.id,
    },
    fetchPolicy: 'cache-and-network',
  });
  const detail = data?.eventBookingDetail || {};
  const categories = detail?.categories || [];
  const eventInfo = [
    {
      title: 'Gate Opens',
      label: 'Event Time',
      value: formatIDDate(detail.gate_open_time),
      icon: <Ionicons name="time" size={12} color={Colors.PRIMARY} />,
    },
    {
      title: 'Istora Senayan',
      label: 'Event Address',
      value: detail.location,
      icon: (
        <FontistoIcon name="map-marker-alt" size={12} color={Colors.PRIMARY} />
      ),
    },
  ];

  const {
    data: eligibilityData,
    loading: eligibilityLoading,
    refetch: refetchEligibility,
  } = useQuery(EVENT_BOOKING_ELIGIBILITY, {
    variables: {
      eventId: route.params.id,
    },
    fetchPolicy: 'network-only',
  });
  const eventBookingEligibility =
    eligibilityData?.eventBookingEligibility || {};

  const {onRefetchData: onQuotaRun} = useCustomMutation({
    schema: CLAIM_GUARDIAN_RUNCODE,
  });

  useEffect(() => {
    const bannerUrl = detail.banner_url;
    if (!bannerUrl) {
      setBannerSize(null);
      return undefined;
    }
    setBannerSize(null);
    let isCurrent = true;
    Image.getSize(bannerUrl, (width, height) => {
      if (isCurrent) {
        setBannerSize({width, height});
      }
    });
    return () => {
      isCurrent = false;
    };
  }, [detail.banner_url]);

  const bannerHeight = bannerSize
    ? Math.ceil((screenWidth / bannerSize.width) * bannerSize.height)
    : null;

  const handleSingleQuota = useCallback(
    async item => {
      const response = await onQuotaRun({
        params: {
          input: {
            event_id: route.params.id,
            category_code: item.code,
          },
        },
        paramsOpt: {isReturn: true},
      });

      if (response instanceof Error) {
        setDialogMessage({
          title: t('message.somethingWrong'),
          subtitle: response.message,
        });
        setShowDialog(true);
        return;
      }

      const {data: res} = response;
      const claimGuardianRunCode = res?.claimGuardianRunCode || {};

      if (!claimGuardianRunCode.cta_state?.action) {
        return;
      }

      if (CTA_ACTION_POPUP[claimGuardianRunCode.cta_state.action]) {
        setDialogMessage({
          title: claimGuardianRunCode.message?.title,
          subtitle: claimGuardianRunCode.message?.body,
        });
        setShowDialog(true);
        return;
      }

      if (
        CTA_ACTION[claimGuardianRunCode.cta_state.action] ===
        CTA_ACTION.SHOW_EXISTING_GUARDIAN_RUN_CODE
      ) {
        const modalInfo = {
          title: claimGuardianRunCode.message?.title,
          subTitle: claimGuardianRunCode.message?.body,
          btnName: claimGuardianRunCode.cta_state?.label,
          createdTime: claimGuardianRunCode.ticket?.created_at,
          time: claimGuardianRunCode.ticket?.code_timeout_hours,
          code: claimGuardianRunCode.ticket?.ticket_code,
          registerUrl: claimGuardianRunCode.ticket?.register_url,
        };

        navigateTo(modules.event_config.enable, modules.event_config.name, {
          modalName: 'CongratulationOne',
          contentProps: {
            modalInfo,
          },
        });
      }
    },
    [onQuotaRun, route.params.id, t],
  );

  const {remainingSeconds} = useOfflineBookingCountdown({
    enabled: eventBookingEligibility.event_type === 'GUARDIAN_RUN',
    eventId: route.params.id,
    durationSeconds: storeConfig?.dfi_event_booking_category_selection_timeout,
  });
  const handleEventBtnAction = async () => {
    try {
      const {data: res} = await refetchEligibility();
      const {cta_state: ctaState = {}} = res?.eventBookingEligibility || {};

      if (ctaState.action === CTA_ACTION_POPUP.SHOW_ALREADY_HAS_TICKET_POPUP) {
        navigateTo(modules.event_config.enable, modules.event_config.name, {
          modalName: 'MyTickets',
        });
        return;
      }

      if (ctaState.action && CTA_ACTION_POPUP[ctaState.action]) {
        setDialogMessage({
          title: ctaState.message?.title,
          subtitle: ctaState.message?.body,
        });
        setShowDialog(true);
        return;
      }

      if (
        ctaState.action === CTA_ACTION.CLAIM_GUARDIAN_RUN &&
        eventBookingEligibility.event_type === 'GUARDIAN_RUN' &&
        categories.length === 1
      ) {
        await handleSingleQuota(categories[0]);
        return;
      }

      let modalName = {
        [CTA_ACTION.OPEN_REGISTRATION_FORM]: 'Register',
        [CTA_ACTION.CLAIM_GUARDIAN_RUN]: 'ChooseCategory',
      };

      navigateTo(modules.event_config.enable, modules.event_config.name, {
        modalName: modalName[ctaState.action],
        contentProps: {
          id: route.params.id,
          eventName: detail.name,
        },
      });
    } catch (error) {}
  };

  const {run: onEventBtnAction, loading: btnLoading} =
    useSubmitLock(handleEventBtnAction);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchEventDetail(), refetchEligibility()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchEventDetail, refetchEligibility]);

  useFocusEffect(
    useCallback(() => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      if (refreshed.current) {
        return;
      }

      refreshed.current = true;
      handleRefresh();

      return () => {
        refreshed.current = false;
      };
    }, [handleRefresh]),
  );

  const onWaitingRoom = () => {
    navigateTo(modules.event_config.enable, modules.event_config.name, {
      modalName: 'WaitingRoom',
    });
  };

  if (eventListLoading) {
    return (
      <CustomView
        flex={1}
        verticalCenter
        horizontalCenter
        backgroundColor="rgba(255,255,255,0.5)"
        pointerEvents="auto"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 998,
        }}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </CustomView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}} edges={[]}>
      {(eventDetailLoading || eligibilityLoading || btnLoading) && (
        <CustomView
          flex={1}
          verticalCenter
          horizontalCenter
          backgroundColor="rgba(255,255,255,0.5)"
          pointerEvents="auto"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          }}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </CustomView>
      )}
      <ScrollView
        style={{flex: 1}}
        contentContainerStyle={{flexGrow: 1}}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.PRIMARY]}
            tintColor={Colors.PRIMARY}
          />
        }>
        <View
          style={{
            flexGrow: 1,
            minHeight: Math.max(screenHeight, bannerHeight || 0),
          }}>
          <NavBar
            useBack
            center
            title={
              eventBookingEligibility.event_type === 'GUARDIAN_RUN'
                ? t('account_eventbooking.title.remainingQuota')
                : ''
            }
            stylesContainer={{
              backgroundColor: 'transparent',
              zIndex: 9,
            }}
          />
          {detail?.banner_url && bannerSize ? (
            <FastImage
              source={{
                uri: detail.banner_url,
                priority: FastImage.priority.high,
                cache: FastImage.cacheControl.immutable,
              }}
              style={[
                styles.pageBackground,
                {width: screenWidth, height: bannerHeight},
              ]}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : null}
          <CustomView marginTop={16} paddingBottom={60}>
            <CustomView
              paddingHorizontal={12}
              style={{marginBottom: normalize(12)}}>
              {/* event quota */}
              <RenderIf
                condition={
                  eventBookingEligibility.event_type === 'GUARDIAN_RUN'
                }>
                <RemainingQuota
                  labelStyle={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: Colors.PRIMARY,
                    lineHeight: 24,
                    textAlign: 'center',
                  }}
                  data={categories}
                />
              </RenderIf>
              <RenderIf
                condition={
                  eventBookingEligibility.event_type !== 'GUARDIAN_RUN'
                }>
                <RemainingQuota
                  label={t('account_eventbooking.title.remainingQuota')}
                  type="two"
                  data={detail.remaining_quota}
                />
              </RenderIf>

              {/* register button */}
              <CustomView row verticalCenter>
                <RenderIf
                  condition={[
                    'GUARDIAN_RUN',
                    'WORKSHOP',
                    'EXHIBITION',
                  ].includes(eventBookingEligibility.event_type)}>
                  <RegisterButton
                    t={t}
                    loading={eligibilityLoading || btnLoading}
                    eventBookingEligibility={eventBookingEligibility}
                    categoryCount={categories.length}
                    onEventBtnAction={onEventBtnAction}
                  />
                </RenderIf>
              </CustomView>

              {/* countdown */}
              <Countdown
                eventType={eventBookingEligibility.event_type}
                remainingSeconds={remainingSeconds}
              />
              {/* event time & address */}
              <CustomView
                row
                spaceBetween
                marginTop={normalize(16)}
                padding={normalize(10)}
                borderRadius={16}
                backgroundColor="#FDE8D5"
                style={{gap: 8}}>
                {eventInfo.map((item, index) => (
                  <CustomView
                    key={index}
                    flex={1}
                    horizontalCenter
                    height={normalize(70)}
                    backgroundColor="#FFF8E8"
                    borderRadius={8}>
                    <CustomView
                      horizontalCenter
                      style={{padding: 4, paddingTop: 10}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '700',
                          fontFamily: 'SF Pro',
                          color: '#212121',
                          lineHeight: 22,
                        }}>
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '500',
                          fontFamily: 'SF Pro',
                          color: '#616161',
                        }}>
                        {item.value}
                      </Text>
                      <CustomView
                        row
                        horizontalCenter
                        verticalCenter
                        style={{gap: 4}}>
                        {item.icon}
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '510',
                            fontFamily: 'SF Pro',
                            color: '#616161',
                            lineHeight: 16,
                          }}>
                          {item.label}
                        </Text>
                      </CustomView>
                    </CustomView>
                  </CustomView>
                ))}
              </CustomView>
            </CustomView>

            {/* hot code, insert html here */}
            {detail.app_blocks?.map((item, index) => {
              if (!item?.content?.block_json_content) {
                return null;
              }
              return (
                <PageBuilder
                  key={index}
                  noPadding
                  noBorderRadius
                  htmlStr={item.content.block_json_content}
                  useFlashList={false}
                />
              );
            })}
          </CustomView>
        </View>
      </ScrollView>
      {/* dialog */}
      <CustomDialog
        visible={showDialog}
        title={dialogMessage?.title}
        subtitle={dialogMessage?.subtitle}
        onClose={() => {
          setDialogMessage(null);
          setShowDialog(false);
        }}
      />
    </SafeAreaView>
  );
};

export default EventDetailScreen;

const styles = StyleSheet.create({
  registerBtnBg: {
    width: normalize(252),
    mainHeight: normalize(108),
    backgroundColor: 'rgba(166, 75, 0, 0.75)',
    borderRadius: 8,
    gap: 10,
  },
  registerBtnContainer: {
    padding: normalize(10),
    borderRadius: 8,
    backgroundColor: '#FFF8E8',
  },
  pageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
