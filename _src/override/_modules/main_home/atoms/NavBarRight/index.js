import React from 'react';
import {navigateTo} from '@app/helpers/Navigation';
import {Colors} from '@app/styles';
import {modules} from '@root/swift.config';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import Circle from '@app/components/Circle';
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '@app/_modules/main_home/atoms/NavBarRight/styles';

const NavBarRightView = ({onNavigateWishlist, cartCount}) => {
  /**
   * ---------------------------------------------------- *
   * @function {onNavigateToStoreLocator}
   * @summary for navigate to store locator page
   * ---------------------------------------------------- *
   */
  const onNavigateToStoreLocator = () => {
    navigateTo(modules.store_locator.enable, modules.store_locator.name);
  };

  /**
   * ---------------------------------------------------- *
   * @function {onNavigateToCart}
   * @summary for navigate to cart page
   * ---------------------------------------------------- *
   */
  const onNavigateToCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };

  return (
    <CustomView style={styles.navbarRightFrame}>
      <CustomView
        backgroundColor={Colors.WHITE}
        style={[styles.navbarRightIconFrame, styles.navbarRightIcon]}>
        <IconMaterialIcons
          name="place"
          color={Colors.PRIMARY}
          onPress={() => onNavigateToStoreLocator()}
          size={22}
        />
      </CustomView>
      <CustomView
        backgroundColor={Colors.PRIMARY}
        style={[styles.navbarRightIconFrame, styles.navbarRightIcon]}>
        <IconFeather
          name="heart"
          color={Colors.WHITE}
          onPress={onNavigateWishlist}
          size={22}
        />
      </CustomView>
      <CustomView
        style={[styles.navbarRightIconFrame, styles.navbarRightCartIcon]}>
        <IconFeather
          name="shopping-cart"
          color={Colors.PRIMARY}
          onPress={() => onNavigateToCart()}
          size={22}
        />
        <RenderIf condition={cartCount > 0}>
          <Circle
            color={Colors.RED_LIGHT_2}
            number={cartCount}
            textColor={Colors.WHITE}
            textSize={10}
            size={18}
            topPosition={0}
            rightPosition={0}
          />
        </RenderIf>
      </CustomView>
    </CustomView>
  );
};

export default NavBarRightView;
