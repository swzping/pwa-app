import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {normalize} from '@app/styles/mixins';
import {Colors, Mixins} from '@app/styles';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';

import Icon from 'react-native-vector-icons/Ionicons';
import CustomView from '@app/components/CustomView';
import SearchBar from '@app/components/AddonSearchBar';

const AtomNavBar = () => {
  const NavIcon = ({name, onPress}) => {
    return (
      <Icon
        name={name}
        size={normalize(25)}
        color={Colors.PRIMARY}
        style={styles.navIcon}
        onPress={onPress}
      />
    );
  };

  return (
    <CustomView
      row
      horizontalCenter
      spaceAround
      height={50}
      width={Mixins.MAX_WIDTH}
      style={{...Mixins.boxShadow('#f2f2f2', 5)}}>
      <Image
        source={require('@app/assets/images/swift-logo.png')}
        style={styles.logoImage}
      />
      <SearchBar />
      <CustomView row marginHorizontal={10}>
        <NavIcon
          name="ios-receipt-outline"
          onPress={() =>
            navigateTo(
              modules.account_trackorder.enable,
              modules.account_trackorder.name,
            )
          }
        />
        <NavIcon
          name="ios-cart"
          onPress={() => navigateTo(modules.cart.enable, modules.cart.name)}
        />
        <NavIcon
          name="ios-notifications-outline"
          onPress={() =>
            navigateTo(
              modules.account_notification.enable,
              modules.account_notification.name,
            )
          }
        />
      </CustomView>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  logoImage: {
    resizeMode: 'contain',
    height: normalize(30),
  },

  navIcon: {
    marginHorizontal: normalize(10),
  },
});

export default AtomNavBar;
