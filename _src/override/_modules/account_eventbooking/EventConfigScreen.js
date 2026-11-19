import React from 'react';

import ChooseCategoryView from './atoms/ChooseCategoryView';
import CongratulationOneView from './atoms/CongratulationOneView';
import CongratulationTwoView from './atoms/CongratulationTwoView';
import MyTicketsView from './atoms/MyTicketsView';
import RegisterView from './atoms/RegisterView';
import WaitingRoomView from './atoms/WaitingRoomView';

const MODAL_COMPONENTS = {
  MyTickets: MyTicketsView,
  Register: RegisterView,
  ChooseCategory: ChooseCategoryView,
  CongratulationOne: CongratulationOneView,
  CongratulationTwo: CongratulationTwoView,
  WaitingRoom: WaitingRoomView,
};

const EventConfigScreen = ({route}) => {
  const {modalName, contentProps = {}} = route.params;

  if (!modalName) {
    return null;
  }

  const ModalComponent = MODAL_COMPONENTS[modalName];
  if (!ModalComponent) {
    return null;
  }

  return <ModalComponent {...contentProps} />;
};

export default EventConfigScreen;
