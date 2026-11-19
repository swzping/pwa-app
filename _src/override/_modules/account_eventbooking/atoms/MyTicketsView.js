import React, {useState} from 'react';
import {ScrollView, StyleSheet, Text} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LocalSvg} from 'react-native-svg/css';

import {useReactiveVar} from '@apollo/client';

import {useTranslation} from 'react-i18next';

import CustomView from '@app/components/CustomView';
import NavBar from '@app/components/NavBar';
import {rxMyTickets} from '@app/services/cache';
import * as Colors from '@app/styles/colors';

import EventBookingBg from './EventBookingBg';
import TicketItem from './Ticket';
import TicketDetailModal from './TicketDetailModal';
import TicketDivider from './TicketDivider';

const MyTicketsView = () => {
  const {t} = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState(null);
  const tickets = useReactiveVar(rxMyTickets);

  const handleTicket = item => {
    setModalData(item);
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
    setModalData(null);
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
          title={t('account.title.eventBooking')}
          stylesContainer={{
            backgroundColor: 'transparent',
          }}
        />
        <ScrollView style={{flex: 1, paddingHorizontal: 16, marginBottom: 20}}>
          <CustomView
            marginTop={12}
            padding={16}
            paddingBottom={70}
            backgroundColor={Colors.WHITE}
            borderRadius={16}>
            <Text
              style={{
                marginBottom: 12,
                fontSize: 18,
                fontWeight: '700',
                color: Colors.PRIMARY,
              }}>
              {t('account_eventbooking.title.myTickets')}
            </Text>
            {/* Tickets List */}
            {tickets?.map((item, index) => (
              <TicketItem
                key={index}
                data={item}
                onPress={() => {
                  handleTicket(item);
                }}
                BgComponent={
                  <CustomView
                    flex={1}
                    row
                    style={{postion: 'absolute', top: -2}}>
                    <LocalSvg
                      asset={require('@app/assets/svg/ticket1.svg')}
                      style={{
                        widdth: 18,
                        height: 89,
                      }}
                    />
                    <TicketDivider />
                    <LocalSvg
                      asset={require('@app/assets/svg/ticket3.svg')}
                      style={{
                        widdth: 18,
                        height: 89,
                      }}
                    />
                  </CustomView>
                }
              />
            ))}
          </CustomView>
        </ScrollView>
      </SafeAreaView>
      <TicketDetailModal
        visible={modalVisible}
        data={modalData}
        onClose={handleClose}
      />
    </>
  );
};

export default MyTicketsView;
