import React from 'react';
import { MD2Colors as Colors } from 'react-native-paper';
import { navigateTo } from '@app/helpers/Navigation';
import { modules } from '@root/swift.config';
import { rxAppSnackbar, rxUserToken } from '@root/_src/core/services/cache';
import { useReactiveVar } from '@apollo/client';
import CustomView from '@app/components/CustomView';
import IconFeather from 'react-native-vector-icons/Feather';
import styles from '@app/_modules/main_home/atoms/NavBarRight/styles';

const NavBarRightView = () => {
  const getRxUserToken = useReactiveVar(rxUserToken);
  /**
   * ---------------------------------------------------- *
   * @function {onNavigateTrackNotification}
   * @summary for navigate to notification page
   * ---------------------------------------------------- *
   */
  const onNavigateTrackNotification = () => {
    if (getRxUserToken === null) {
      rxAppSnackbar({ message: 'Please Login First' });
    } else {
      navigateTo(
        modules.account_notification.enable,
        modules.account_notification.name,
      );
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function {onNavigateTrackOrder}
   * @summary for navigate to track order page
   * ---------------------------------------------------- *
   */
  const onNavigateTrackOrder = () => {
    if (getRxUserToken === null) {
      rxAppSnackbar({ message: 'Please Login First' });
    } else {
      navigateTo(
        modules.account_trackorder.enable,
        modules.account_trackorder.name,
      );
    }
  };

  return (
    <CustomView style={styles.navbarRightFrame}>
      <CustomView style={styles.navbarRightIconFrame}>
        <IconFeather
          name="file-text"
          color={Colors.white}
          onPress={() => onNavigateTrackOrder()}
          size={18}
        />
      </CustomView>
      <CustomView style={styles.navbarRightIconFrame}>
        <IconFeather
          name="bell"
          color={Colors.white}
          onPress={() => onNavigateTrackNotification()}
          size={18}
        />
      </CustomView>
    </CustomView>
  );
};

export default NavBarRightView;
