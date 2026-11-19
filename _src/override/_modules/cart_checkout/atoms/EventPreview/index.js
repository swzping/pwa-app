import React, {useEffect, useRef, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';

import {useQuery} from '@apollo/client';

import {EVENT_BOOKING_DETAIL} from '@app/_modules/account_eventbooking/services/schema';
import {formatThousands} from '@app/_modules/account_eventbooking/services/util';
import RenderIf from '@app/components/RenderIf';
import useStoreConfig from '@app/hooks/useStoreConfig';
import {normalize} from '@app/styles/mixins';

import styles from './styles';

const EventPreview = ({isPageReady = false, isShow = false}) => {
  const [visible, setVisible] = useState(true);
  const [eventDetailError, setEventDetailError] = useState(false);
  const hasRetriedRef = useRef(false);
  const insets = useSafeAreaInsets();
  const {storeConfig} = useStoreConfig({useInitData: true});
  const run_event_id =
    storeConfig?.dfi_event_booking_checkout_guardian_run_event_id;
  const eventId = String(run_event_id ?? '').trim();
  const hasValidEventId = eventId.length > 0;

  const {
    data,
    refetch: refetchEventDetail,
    loading: eventDetailLoading,
    error: eventDetailQueryError,
  } = useQuery(EVENT_BOOKING_DETAIL, {
    variables: {
      eventId,
    },
    fetchPolicy: 'cache-and-network',
    skip: !hasValidEventId,
  });

  useEffect(() => {
    if (!hasValidEventId || eventDetailLoading || !eventDetailQueryError) {
      return undefined;
    }

    if (hasRetriedRef.current) {
      setEventDetailError(true);
      return undefined;
    }

    hasRetriedRef.current = true;

    const retryEventDetail = async () => {
      try {
        await refetchEventDetail();
        setEventDetailError(false);
      } catch (error) {
        setEventDetailError(true);
      }
    };
    retryEventDetail();
    return undefined;
  }, [
    eventDetailLoading,
    eventDetailQueryError,
    eventId,
    hasValidEventId,
    refetchEventDetail,
  ]);

  useEffect(() => {
    if (isShow) {
      setVisible(false);
    }
  }, [isShow]);

  const detail = data?.eventBookingDetail || {};
  const categories = detail?.categories || [];
  const hasEventDetailError = Boolean(
    eventDetailQueryError || eventDetailError,
  );
  const shouldRender =
    isPageReady &&
    hasValidEventId &&
    !isShow &&
    !hasEventDetailError &&
    categories.length > 0;

  if (!visible) {
    return null;
  }

  return (
    <RenderIf condition={shouldRender}>
      <View
        style={[
          styles.container,
          styles.fixed,
          {top: insets.top + normalize(56) + normalize(12)},
        ]}>
        <LocalSvg
          asset={require('@app/assets/svg/eventPreviewBackground.svg')}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={styles.background}
        />

        <View style={styles.header}>
          <View style={styles.brand}>
            <LocalSvg
              asset={require('@app/assets/svg/eventPreviewBrand.svg')}
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            />
          </View>
          <View style={styles.copy}>
            <Text numberOfLines={1} style={styles.title}>
              Event Preview
            </Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              Limited slots available
            </Text>
          </View>
          <TouchableOpacity
            accessibilityLabel="Close event preview"
            hitSlop={normalize(6)}
            onPress={() => setVisible(false)}
            style={styles.closeButton}>
            <Text style={styles.close}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          {categories.map(category => (
            <View key={category.code || category.label} style={styles.stat}>
              <Text style={styles.statLabel}>{category.label}:</Text>
              <Text style={styles.statValue}>
                {formatThousands(category.remaining_quota)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </RenderIf>
  );
};

export default EventPreview;
