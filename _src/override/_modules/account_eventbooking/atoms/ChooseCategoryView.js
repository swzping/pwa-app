import React, {useCallback, useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {ActivityIndicator, Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useQuery} from '@apollo/client';
import CustomView from '@root/_src/core/components/CustomView';
import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import NavBar from '@app/components/NavBar';
import {CTA_ACTION, CTA_ACTION_POPUP} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useSubmitLock} from '@app/hooks/useSubmitLock';
import * as Colors from '@app/styles/colors';

import {CLAIM_GUARDIAN_RUNCODE, EVENT_BOOKING_DETAIL} from '../services/schema';
import useOfflineBookingCountdown from '../useOfflineBookingCountdown';

import Countdown from './Countdown';
import CustomDialog from './CustomDialog';
import EventBookingBg from './EventBookingBg';
import RemainingQuota from './RemainingQuota';

const ChooseCategoryView = ({id}) => {
  const {t} = useTranslation();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState({
    title: '',
    subtitle: '',
  });

  const {
    data,
    refetch: refetchDetail,
    loading,
  } = useQuery(EVENT_BOOKING_DETAIL, {
    variables: {
      eventId: id,
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const detail = data?.eventBookingDetail || {};
  const categories = detail?.categories || [];
  const {remainingSeconds} = useOfflineBookingCountdown();

  const {onRefetchData: onQuotaRun} = useCustomMutation({
    schema: CLAIM_GUARDIAN_RUNCODE,
  });

  const handleRemainingQuota = useCallback(
    async item => {
      const {data: res} = await onQuotaRun({
        params: {
          input: {
            event_id: id,
            category_code: item.code,
          },
        },
        paramsOpt: {isReturn: true},
      });

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
    [id, onQuotaRun],
  );

  const {run: onRemainingQuota, loading: btnLoading} =
    useSubmitLock(handleRemainingQuota);

  const handleColseDialog = () => {
    setShowDialog(false);
    refetchDetail();
  };

  return (
    <>
      <SafeAreaView style={{flex: 1}} edges={['bottom']}>
        <LinearGradient
          colors={['#FFD38B', '#FFA12E']}
          locations={[0.0126, 0.8576]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={{...StyleSheet.absoluteFillObject}}
        />
        <EventBookingBg />
        <NavBar
          useBack
          center
          title={detail.name}
          stylesContainer={{backgroundColor: 'transparent'}}
        />
        {(loading || btnLoading) && (
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
        <ScrollView style={{flex: 1, paddingHorizontal: 16, marginBottom: 20}}>
          {/* remaining quota */}
          <RemainingQuota
            marginLeft={30}
            gap={8}
            label={t('account_eventbooking.title.remainingQuota')}
            data={categories}
            labelStyle={{
              fontWeight: '700',
              fontSize: 16,
              lineHeight: 22,
              color: '#a64b00',
            }}
            contentStyle={{
              backgroundColor: '#ff8200',
              borderColor: '#ff8200',
            }}
            textOneStyle={{
              color: '#ffe7ba',
            }}
            textTwoStyle={{
              color: Colors.WHITE,
            }}
          />
          {/* countdown */}
          <CustomView marginTop={30}>
            <Countdown
              eventType={'GUARDIAN_RUN'}
              remainingSeconds={remainingSeconds}
            />
          </CustomView>
          <CustomView
            marginTop={28}
            marginHorizontal={16}
            paddingHorizontal={16}
            paddingBottom={30}
            backgroundColor={Colors.WHITE}
            borderRadius={16}
            style={{gap: 20}}>
            <Text
              style={{
                marginTop: 20,
                fontWeight: '700',
                fontSize: 16,
                lineHeight: 22,
                color: Colors.PRIMARY,
              }}>
              {t('account_eventbooking.label.chooseyourCategory')}
            </Text>
            {categories.map((item, index) => (
              <Button
                key={index}
                style={{
                  width: '100%',
                  height: 40,
                  backgroundColor: Colors.PRIMARY,
                  borderRadius: 8,
                  justifyContent: 'center',
                }}
                labelStyle={{
                  marginHorizontal: 8,
                  marginVertical: 4,
                  color: Colors.WHITE,
                  fontSize: 14,
                  fontWeight: '700',
                  lineHeight: 22,
                  textTransform: 'none',
                }}
                disabled={btnLoading}
                onPress={() => {
                  onRemainingQuota(item);
                }}>
                {item.label}
              </Button>
            ))}
          </CustomView>
        </ScrollView>
      </SafeAreaView>

      <CustomDialog
        visible={showDialog}
        title={dialogMessage.title}
        subtitle={dialogMessage.subtitle}
        onClose={handleColseDialog}
      />
    </>
  );
};

export default ChooseCategoryView;
