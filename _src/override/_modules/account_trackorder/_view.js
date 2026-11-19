import React, {useMemo} from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import Svg, {Line} from 'react-native-svg';
import {Colors} from '@app/styles';

import NavBar from '@app/components/NavBar';
import Text from '@app/components/Text';
import AtomRightCart from '@app/_modules/product_list/atoms/RightCart/index';
import {normalize} from '@app/styles/mixins';

const TrackOrderScreen = ({
  loading,
  dataOrder,
  onPressCart,
  orderId,
  orderStatus,
  trackingData,
  orderInfo,
  navigation,
}) => {
  const theOrderData = useMemo(() => {
    const orderData = dataOrder?.data?.[0];
    const orderDetail = orderData?.detail?.[0];
    const recipientName = orderDetail?.shipping_address
      ? `${orderDetail.shipping_address.firstname || ''} ${
          orderDetail.shipping_address.lastname || ''
        }`.trim()
      : 'Unknown';

    const recipientAddress = orderDetail?.shipping_address
      ? `${orderDetail.shipping_address.street?.join(', ') || ''}, ${
          orderDetail.shipping_address.city || ''
        }, ${orderDetail.shipping_address.region || ''} ${
          orderDetail.shipping_address.postcode || ''
        }`
          .replace(/,\s*,/g, ',')
          .replace(/,\s*$/, '')
          .trim()
      : 'Address not available';

    let currentStatus = orderStatus || '';
    if (trackingData && trackingData.length > 0) {
      currentStatus = trackingData[0].progress_bar_message || orderStatus || '';
    }

    const baseData = {
      id: orderId
        ? `#${orderId}`
        : orderData?.order_number
        ? `#${orderData.order_number}`
        : '',
      requestCode: orderId
        ? `#${orderId}`
        : orderData?.order_number
        ? `#${orderData.order_number}`
        : '',
      recipient: recipientName,
      address: recipientAddress,
      status: currentStatus,
      trackingEvents: trackingData || [],
    };

    const combinedTrackingEvents = [...(baseData.trackingEvents || [])];

    let finalCurrentStatus = currentStatus;
    if (combinedTrackingEvents.length > 0) {
      finalCurrentStatus =
        combinedTrackingEvents[0].progress_bar_message || currentStatus;
    }

    const filteredTrackingEvents = combinedTrackingEvents.filter(
      event => event.progress_bar_message === finalCurrentStatus,
    );

    return {
      ...baseData,
      status: finalCurrentStatus,
      trackingEvents: filteredTrackingEvents,
    };
  }, [orderId, orderStatus, trackingData, orderInfo, dataOrder]);

  const stages = ['Item Picked Up', 'In Transit', 'Delivered'];
  const currentStatus = theOrderData.status;
  const currentIndex = Math.max(
    0,
    stages.findIndex(s => s === currentStatus),
  );

  const trackingEvents = theOrderData.trackingEvents || [];

  const eventsOrdered = [...trackingEvents];

  const getTimelineIcon = (stage, isCurrent, isDone) => {
    const iconStyle = {
      width: 38,
      height: 38,
    };

    switch (stage) {
      case 'Item Picked Up':
        return isCurrent ? (
          <Image
            source={require('@app/assets/images/ReadyCurrentMobile.png')}
            style={iconStyle}
          />
        ) : isDone ? (
          <Image
            source={require('@app/assets/images/ReadyDoneMobile.png')}
            style={iconStyle}
          />
        ) : (
          <Image
            source={require('@app/assets/images/ReadyCurrentMobile.png')}
            style={iconStyle}
          />
        );
      case 'In Transit':
        return isCurrent ? (
          <Image
            source={require('@app/assets/images/onTheRoadCurrentMobile.png')}
            style={iconStyle}
          />
        ) : isDone ? (
          <Image
            source={require('@app/assets/images/onTheRoadDoneMobile.png')}
            style={iconStyle}
          />
        ) : (
          <Image
            source={require('@app/assets/images/onTheRoadReadyMobile.png')}
            style={iconStyle}
          />
        );
      case 'Delivered':
        return isCurrent ? (
          <Image
            source={require('@app/assets/images/deliveredDoneMobile.png')}
            style={iconStyle}
          />
        ) : isDone ? (
          <Image
            source={require('@app/assets/images/deliveredDoneMobile.png')}
            style={iconStyle}
          />
        ) : (
          <Image
            source={require('@app/assets/images/deliveredReadyMobile.png')}
            style={iconStyle}
          />
        );
      default:
        return (
          <Image
            source={require('@app/assets/images/ReadyCurrentMobile.png')}
            style={iconStyle}
          />
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <NavBar
          useWhite
          useBack
          title={orderStatus || ''}
          childrenRight={<AtomRightCart onPressCart={onPressCart} />}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavBar
        useWhite
        useBack
        title={theOrderData.status}
        childrenRight={<AtomRightCart onPressCart={onPressCart} />}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.shippedSection}>
          <View style={styles.sectionTitle}>
            <Image
              source={require('@app/assets/images/locationIcon.png')}
              style={{
                width: 20,
                height: 20,
              }}
            />
            <Text style={styles.sectionTitleText}>SHIPPED TO</Text>
          </View>
          <Text style={styles.recipientName}>{theOrderData.recipient}</Text>
          <Text style={styles.address}>{theOrderData.address}</Text>
        </View>

        <View style={styles.timelineSection}>
          <View style={styles.timelineContainer}>
            {stages.map((stage, index) => {
              const isCurrent = index === currentIndex;
              const isDone = index < currentIndex;
              const iconStyle = [
                styles.timelineIcon,
                isCurrent
                  ? styles.timelineIconActive
                  : isDone
                  ? styles.timelineIconCompleted
                  : styles.timelineIconPending,
              ];
              const textStyle = [
                styles.timelineText,
                isCurrent || isDone
                  ? styles.timelineTextActive
                  : styles.timelineTextPending,
              ];

              return (
                <React.Fragment key={stage}>
                  <View style={styles.timelineItem}>
                    <View style={iconStyle}>
                      {getTimelineIcon(stage, isCurrent, isDone)}
                    </View>
                    <Text style={textStyle}>{stage}</Text>
                  </View>
                  {index < stages.length - 1 && (
                    <View style={styles.timelineLineOut}>
                      <View
                        style={[
                          styles.timelineLineIn,
                          index < currentIndex
                            ? styles.timelineLineInDone
                            : styles.timelineLineInPending,
                        ]}
                      />
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        <View style={styles.contactCard}>
          <View style={styles.contactCardContent}>
            <View style={styles.guardianLogo}>
              <Image
                source={require('@app/assets/images/contactIcon.png')}
                style={styles.contactIconImage}
              />
              <Text style={styles.guardianText}>Guardian</Text>
            </View>
            <Text style={styles.requestCode}>
              Request Code: {theOrderData.requestCode}
            </Text>
            <Text style={styles.requestCode}>
              Shipping company:{orderInfo?.plName}
            </Text>
          </View>
        </View>

        <View style={styles.eventsList}>
          {eventsOrdered.map((event, index) => {
            const isGuardianLocation =
              theOrderData.status === 'Item Picked UP' &&
              index === eventsOrdered.length - 1;
            const isFirstEvent = index === 0;

            return (
              <View key={index} style={styles.eventItem}>
                <View
                  style={[
                    styles.eventDotGroup,
                    index === eventsOrdered.length - 1 &&
                      styles.eventDotGroupLast,
                  ]}>
                  {isGuardianLocation ? (
                    <View>
                      <Image
                        source={require('@app/assets/images/locationIcon.png')}
                        style={{width: 20, height: 20}}
                      />
                    </View>
                  ) : isFirstEvent ? (
                    <View
                      style={[
                        styles.outerCircle,
                        isFirstEvent && styles.outerCircleActive,
                        isFirstEvent && styles.outerCircleFirst,
                      ]}>
                      <View
                        style={[
                          styles.innerCircle,
                          isFirstEvent && styles.innerCircleActive,
                        ]}
                      />
                    </View>
                  ) : (
                    <View style={styles.innerCircleNoSelect} />
                  )}
                  {index !== eventsOrdered.length - 1 && (
                    <Svg height="95" width="2" style={styles.eventDotLineSvg}>
                      <Line
                        x1="1"
                        y1="5"
                        x2="1"
                        y2="90"
                        stroke="#BDBDBD"
                        strokeWidth="1.5"
                        strokeDasharray="5,8"
                      />
                    </Svg>
                  )}
                </View>
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventType}>{event.type}</Text>
                  </View>
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                  <Text style={styles.eventTime}>{event.datetime}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: normalize(16),
    color: Colors.GRAY,
  },
  shippedSection: {
    backgroundColor: '#F5F5F5',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: normalize(12),
    fontWeight: 'bold',
    color: '#1B1A19',
    paddingLeft: 10,
  },
  recipientName: {
    fontSize: normalize(10),
    color: '#757575',
    marginBottom: 5,
    paddingLeft: 30,
  },
  address: {
    fontSize: normalize(10),
    color: '#757575',
    lineHeight: normalize(15),
    paddingLeft: 30,
  },
  timelineSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    height: 100,
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
    zIndex: 10,
  },
  timelineIcon: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    zIndex: 10,
  },
  timelineIconActive: {},
  timelineIconCompleted: {},
  timelineIconPending: {},
  timelineIconText: {},
  timelineText: {
    fontSize: normalize(12),
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: normalize(-20),
  },
  timelineTextActive: {
    color: '#FF8200',
    fontWeight: '500',
  },
  timelineTextPending: {
    color: '#999999',
  },
  timelineLineOut: {
    flex: 1,
    height: 10,
    backgroundColor: '#E0E0E0',
    position: 'relative',
    marginHorizontal: -35,
    zIndex: 1,
  },
  timelineLineIn: {
    height: 4,
    backgroundColor: '#FF8200',
    width: Platform.OS === 'ios' ? '78%' : '70%',
    position: 'absolute',
    marginLeft: Platform.OS === 'ios' ? '8.5%' : '14%',
    marginTop: 3,
    borderRadius: 4,
  },
  timelineLineInDone: {
    backgroundColor: '#FF8200',
  },
  timelineLineInPending: {
    backgroundColor: '#CCCCCC',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 35,
    paddingRight: 35,
  },
  contactCardContent: {
    gap: 10,
    backgroundColor: '#F5F5F5',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 4,
  },
  guardianLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIconImage: {
    width: 25,
    height: 25,
    marginRight: 8,
  },
  guardianText: {
    fontSize: normalize(12),
    fontWeight: 400,
    color: '#1B1A19',
    fontStyle: 'normal',
    fontFamily: 'Noto Sans',
  },
  requestCode: {
    fontSize: normalize(12),
    color: '#1B1A19',
    fontWeight: 400,
  },
  eventsList: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 35,
    paddingRight: 35,
  },
  eventItem: {
    flexDirection: 'row',
  },
  eventDotGroup: {
    alignItems: 'center',
    marginRight: 15,
    width: 20,
  },
  eventDotGroupLast: {},
  outerCircle: {
    width: 12,
    height: 12,
    borderRadius: 50,
    borderWidth: 12,
    borderColor: '#FDEEDF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
  },
  outerCircleActive: {},
  outerCircleFirst: {
    marginTop: 0,
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
  },
  innerCircleActive: {
    backgroundColor: Colors.PRIMARY,
  },
  innerCircleNoSelect: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#BDBDBD',
    alignSelf: 'center',
    marginTop: 6,
  },
  eventDotLine: {
    width: 2,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginTop: 5,
  },
  eventDotLineSvg: {
    marginTop: 5,
    alignSelf: 'center',
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    marginBottom: 5,
  },
  eventType: {
    fontSize: normalize(14),
    fontWeight: 700,
    color: '#1B1A19',
  },
  eventDescription: {
    fontSize: normalize(12),
    color: '#757575',
    lineHeight: normalize(18),
    fontWeight: 500,
    marginBottom: 5,
  },
  eventTime: {
    fontSize: normalize(12),
    fontWeight: 500,
    color: '#757575',
  },
};

export default TrackOrderScreen;
