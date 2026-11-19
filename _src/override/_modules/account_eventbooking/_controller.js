import {useCallback, useEffect, useRef, useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';

import {modules} from '@root/swift.config';

import {useTranslation} from 'react-i18next';

import {navigateTo} from '@app/helpers/Navigation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxMyTickets} from '@app/services/cache';

import {getOfflineEventQueue} from './services/fetchAPI';
import {EVENT_BOOKING_LIST, MY_EVENT_TICKETS} from './services/schema';
const useEventBooking = () => {
  const {t} = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const [eventListLoading, setEventListLoading] = useState(false);

  const [modalData, setModalData] = useState(null);

  const isFirstMount = useRef(true);
  const refreshed = useRef(false);
  const hasCheckedQueue = useRef(false);

  const {
    data: ticketsData,
    loading: ticketsLoading,
    onRefetchData: refreshTickets,
  } = useCustomQuery({
    schema: MY_EVENT_TICKETS,
    useInitData: true,
    opts: {fetchPolicy: 'network-only'},
  });
  const tickets = ticketsData?.data?.myEventTickets?.tickets || [];

  const {
    data: eventsData,
    loading: eventsLoading,
    onRefetchData: refreshEvents,
  } = useCustomQuery({
    schema: EVENT_BOOKING_LIST,
    useInitData: true,
    opts: {fetchPolicy: 'network-only'},
  });
  const events = eventsData?.data?.eventBookingList?.events || [];

  const sections = [
    {type: 'tickets', data: tickets},
    {type: 'events', data: events},
  ];

  const onViewMore = () => {
    navigateTo(modules.event_config.enable, modules.event_config.name, {
      modalName: 'MyTickets',
    });
  };

  const onEventIncomingItem = item => {
    navigateTo(modules.event_detail.enable, modules.event_detail.name, {
      id: item.id,
    });
  };
  const onWaitingRoom = () => {
    navigateTo(modules.event_config.enable, modules.event_config.name, {
      modalName: 'WaitingRoom',
    });
  };
  const onTicketItem = item => {
    setModalData(item);
    setModalVisible(true);
  };

  const onCloseModal = () => {
    setModalVisible(false);
    setModalData(null);
  };

  useEffect(() => {
    if (hasCheckedQueue.current) {
      return;
    }
    hasCheckedQueue.current = true;
    fetchQueueStatusInfo(); // 初始化时查询一次排队队列状态
  }, []);

  const fetchQueueStatusInfo = async () => {
    try {
      setEventListLoading(true);
      const {data: resQueue} = await getOfflineEventQueue();
      if (resQueue?.admitted === false && resQueue?.ahead >= 1) {
        onWaitingRoom();
      }
    } catch (error) {
      console.error('查询失败:', error.message);
    } finally {
      setEventListLoading(false);
    }
  };

  useEffect(() => {
    if (!ticketsLoading && tickets.length) {
      rxMyTickets(tickets);
    }
  }, [tickets, ticketsLoading]);

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
      refreshTickets({});
      refreshEvents({});

      return () => {
        refreshed.current = false;
      };
    }, []),
  );

  return {
    t,
    sections,
    ticketsLoading,
    eventsLoading,
    eventListLoading,
    modalVisible,
    modalData,
    onViewMore,
    onEventIncomingItem,
    onTicketItem,
    onCloseModal,
    onWaitingRoom,
  };
};

export default useEventBooking;
