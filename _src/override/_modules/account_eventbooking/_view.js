import React from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {ActivityIndicator} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';

import Shimmer from '@app/components/_Shimmer';
import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import RenderIf from '@app/components/RenderIf';
import * as Colors from '@app/styles/colors';

import EventBookingBg from './atoms/EventBookingBg';
import EventBookingBoxBg from './atoms/EventBookingBoxBg';
import TicketItem from './atoms/Ticket';
import TicketDetailModal from './atoms/TicketDetailModal';
import TicketDivider from './atoms/TicketDivider';

const MyTickets = ({t, data, loading, onViewMore, onPress}) => {
  const showEmpty = !loading && !data.length;
  const showData = !loading && data.length;

  return (
    <CustomView
      height={152}
      marginTop={24}
      paddingTop={16}
      paddingBottom={8}
      backgroundColor={Colors.WHITE}
      borderRadius={16}
      style={{overflow: 'hidden'}}>
      <CustomView row spaceBetween paddingHorizontal={16}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: Colors.PRIMARY,
          }}>
          {t('account_eventbooking.title.myTickets')}
        </Text>
        {data.length ? (
          <TouchableOpacity onPress={onViewMore}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: Colors.PRIMARY,
              }}>
              {t('account_eventbooking.btn.viewMore')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </CustomView>
      <RenderIf condition={loading}>
        <CustomView marginLeft={18} marginTop={14}>
          <Shimmer wrapperStyle={{width: 210, height: 82, borderRadius: 8}} />
        </CustomView>
      </RenderIf>
      <RenderIf condition={showEmpty}>
        <CustomView marginTop={36} horizontalCenter>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: Colors.PRIMARY,
            }}>
            {t('account_eventbooking.desc.noEvent')}
          </Text>
        </CustomView>
      </RenderIf>
      <RenderIf condition={showData}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            marginTop: 14,
            paddingLeft: 12,
            paddingRight: 12,
          }}>
          {data.map(item => (
            <TicketItem
              key={item.ticket_id?.toString() || `ticket-${Math.random()}`}
              width={210}
              titleStyle={{fontSize: 10, color: Colors.BLACK}}
              codeAlign="center"
              data={item}
              onPress={() => {
                onPress({...item});
              }}
              BgComponent={
                <CustomView
                  flex={1}
                  row
                  style={{position: 'absolute', top: -6}}>
                  <LocalSvg
                    asset={require('@app/assets/svg/ticket1.svg')}
                    style={{
                      width: 18,
                      height: 89,
                    }}
                  />
                  <TicketDivider />
                  <LocalSvg
                    asset={require('@app/assets/svg/ticket3.svg')}
                    style={{
                      width: 18,
                      height: 89,
                    }}
                  />
                </CustomView>
              }
            />
          ))}
        </ScrollView>
      </RenderIf>
    </CustomView>
  );
};

const EventItem = ({item, onEventIncomingItem}) => {
  return (
    <CustomView
      horizontalCenter
      width="50%"
      paddingHorizontal={12}
      onPress={() => onEventIncomingItem(item)}>
      <View
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: 138 / 104,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: Colors.PRIMARY,
          backgroundColor: Colors.WHITE,
          overflow: 'hidden',
        }}>
        <Image
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            resizeMode: 'cover',
          }}
          source={{uri: item.tile_banner_url}}
        />
      </View>
      <Text
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: '700',
          color: Colors.PRIMARY,
          lineHeight: 22,
        }}>
        {item.name}
      </Text>
    </CustomView>
  );
};

const EmptyEventIncoming = ({t}) => {
  return (
    <CustomView marginTop={84} horizontalCenter paddingHorizontal={16}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '700',
          color: Colors.PRIMARY,
        }}>
        {t('account_eventbooking.desc.noEvent')}
      </Text>
    </CustomView>
  );
};

const EventIncoming = ({t, data, loading, onEventIncomingItem}) => {
  return (
    <CustomView
      marginTop={24}
      paddingVertical={16}
      backgroundColor={Colors.WHITE}
      borderRadius={16}
      style={{flex: 1, minHeight: 480}}>
      <EventBookingBoxBg />
      <View
        style={{
          position: 'absolute',
          right: 12,
          top: -24,
          width: 86,
          height: 86,
        }}>
        <LocalSvg
          asset={require('@app/assets/svg/eventBooking.svg')}
          style={{width: '100%', height: '100%'}}
        />
      </View>
      <Text
        style={{
          marginHorizontal: 16,
          fontSize: 18,
          fontWeight: '700',
          color: Colors.PRIMARY,
        }}>
        {t('account_eventbooking.title.eventIncoming')}
      </Text>
      <FlatList
        style={{flex: 1, marginTop: 24, paddingBottom: 80}}
        data={data}
        renderItem={({item, index}) => (
          <EventItem
            key={item.id || `event-item-${index}`}
            item={item}
            onEventIncomingItem={onEventIncomingItem}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <CustomView row marginTop={24}>
              {[1, 2].map(item => (
                <CustomView
                  key={item}
                  horizontalCenter
                  width="50%"
                  paddingHorizontal={12}>
                  <View
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: 138 / 104,
                      borderRadius: 14,
                      overflow: 'hidden',
                    }}>
                    <Shimmer
                      wrapperStyle={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                      }}
                    />
                  </View>
                </CustomView>
              ))}
            </CustomView>
          ) : (
            <EmptyEventIncoming t={t} />
          )
        }
        keyExtractor={(item, index) => item.id || `event-${index}`}
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginTop: 16,
          paddingHorizontal: 8,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 16, paddingHorizontal: 8}}
      />
    </CustomView>
  );
};

const EventBookingView = ({
  t,
  sections,
  ticketsLoading,
  eventsLoading,
  eventListLoading,
  modalVisible,
  modalData,
  onViewMore,
  loadMoreEvents,
  onEventIncomingItem,
  onTicketItem,
  onCloseModal,
}) => {
  const renderSection = ({item}) => {
    if (item.type === 'tickets') {
      return (
        <MyTickets
          t={t}
          data={item.data}
          loading={ticketsLoading}
          onViewMore={onViewMore}
          onPress={onTicketItem}
        />
      );
    }
    if (item.type === 'events') {
      return (
        <EventIncoming
          t={t}
          data={item.data}
          loading={eventsLoading}
          onEventIncomingItem={onEventIncomingItem}
        />
      );
    }
    return null;
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
          title={t('account.title.eventBooking')}
          stylesContainer={{
            backgroundColor: 'transparent',
          }}
        />
        <FlatList
          data={sections}
          keyExtractor={item => item.type}
          renderItem={renderSection}
          onEndReached={loadMoreEvents}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 32}}
        />
      </SafeAreaView>
      <TicketDetailModal
        visible={modalVisible}
        data={modalData}
        onClose={onCloseModal}
      />
    </>
  );
};

export default EventBookingView;
