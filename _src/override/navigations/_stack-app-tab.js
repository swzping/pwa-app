import React from 'react';
import {Text} from 'react-native-paper';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {modules} from '@root/swift.config';
import {Colors} from '@app/styles';
import {navigateTo} from '@app/helpers/Navigation';
import {useTranslation} from 'react-i18next';
import {rxCartQty} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';

// import useNavAppInitialize from '@app/hooks/_useNavAppInitialize';
import MainHome from '@app/_modules/main_home';
import MainCategories from '@app/_modules/main_categories/index';
import Cart from '@app/_modules/cart';
// import Wishlist from '@app/_modules/account_wishlist';
import ThankYouPage from '@app/_modules/cart_thankyou';
import Account from '@app/_modules/account';
import StoreLocator from '@app/_modules/store_locator';
import HomeIcon from '@app/assets/svgs/HomeV2';
import CategoryIcon from '@app/assets/svgs/CategoryV2';
import AccountIcon from '@app/assets/svgs/AccountV2';
import ShoppingCart from '@app/assets/svgs/CartV2';
import LocationIcon from '@app/assets/svgs/LocatorIconV2';
import ShageBadge from '@app/components/ShakeBadge';
import {trackBottomMenuClick} from '@app/track';

const Tab = createBottomTabNavigator();

const StackAppTab = () => {
  /**
   * ---------------------------------------------------- *
   * @function useNavAppInitialize
   * @summary this use for initialize top of stack app
   * ---------------------------------------------------- *
   */
  // useNavAppInitialize();
  const {t} = useTranslation();
  const tabBarOptions = {
    showLabel: true,
    keyboardHidesTabBar: true,
  };

  const getRxCartQty = useReactiveVar(rxCartQty);

  return (
    <Tab.Navigator
      tabBarOptions={tabBarOptions}
      screenOptions={{headerShown: false}}>
      <Tab.Screen
        name={modules.main_home.name}
        key={modules.main_home.name}
        component={MainHome}
        listeners={() => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Do something with the `navigation` object
            navigateTo(modules.main_home.enable, modules.main_home.name);
            trackBottomMenuClick({menu_name: modules.main_home.name});
          },
        })}
        options={{
          lazy: true,
          tabBarLabel: ({focused}) => (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: focused ? Colors.PRIMARY : Colors.GRAY_DARK,
                fontSize: 10,
              }}>
              {t('home')}
            </Text>
          ),
          tabBarIcon: ({focused}) => (
            <HomeIcon color={focused ? Colors.PRIMARY : Colors.GRAY_DARK} />
          ),
        }}
      />
      <Tab.Screen
        name={modules.main_categories.name}
        key={modules.main_categories.name}
        component={MainCategories}
        listeners={() => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Do something with the `navigation` object
            navigateTo(
              modules.main_categories.enable,
              modules.main_categories.name,
            );
            trackBottomMenuClick({menu_name: modules.main_categories.name});
          },
        })}
        options={{
          lazy: true,
          tabBarLabel: ({focused}) => (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: focused ? Colors.PRIMARY : Colors.GRAY_DARK,
                fontSize: 10,
              }}>
              {t('category')}
            </Text>
          ),
          tabBarIcon: ({focused}) => (
            <CategoryIcon color={focused ? Colors.PRIMARY : Colors.GRAY_DARK} />
          ),
        }}
      />
      <Tab.Screen
        name={modules.cart.name}
        key={modules.cart.name}
        component={Cart}
        listeners={() => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Do something with the `navigation` object
            navigateTo(modules.cart.enable, modules.cart.name);
            trackBottomMenuClick({menu_name: modules.cart.name});
          },
        })}
        options={{
          lazy: true,
          tabBarLabel: ({focused}) => (
            <>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: focused ? Colors.PRIMARY : Colors.GRAY_DARK,
                  fontSize: 10,
                }}>
                {t('cartIcon')}
              </Text>
              <ShageBadge
                color={Colors.RED}
                number={getRxCartQty}
                textColor={Colors.WHITE}
                textSize={10}
                size={20}
                topPosition={5}
                rightPosition={15}
              />
            </>
          ),
          tabBarIcon: ({focused}) => (
            <>
              <ShoppingCart
                color={focused ? Colors.PRIMARY : Colors.GRAY_DARK}
              />
            </>
          ),
        }}
      />
      <Tab.Screen
        name={modules.store_locator.name}
        key={modules.store_locator.name}
        component={StoreLocator}
        listeners={() => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Do something with the `navigation` object
            navigateTo(
              modules.store_locator.enable,
              modules.store_locator.name,
            );
            trackBottomMenuClick({menu_name: modules.store_locator.name});
          },
        })}
        options={{
          lazy: true,
          tabBarLabel: ({focused}) => (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: focused ? Colors.PRIMARY : Colors.GRAY_DARK,
                fontSize: 10,
              }}>
              {t('storeLocator')}
            </Text>
          ),
          tabBarIcon: ({focused}) => (
            <LocationIcon color={focused ? Colors.PRIMARY : Colors.GRAY_DARK} />
          ),
        }}
      />
      <Tab.Screen
        name={modules.account.name}
        key={modules.account.name}
        component={Account}
        listeners={() => ({
          tabPress: e => {
            // Prevent default action
            e.preventDefault();

            // Do something with the `navigation` object
            navigateTo(modules.account.enable, modules.account.name);
            trackBottomMenuClick({menu_name: modules.account.name});
          },
        })}
        options={{
          lazy: true,
          tabBarLabel: ({focused}) => (
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: focused ? Colors.PRIMARY : Colors.GRAY_DARK,
                fontSize: 10,
              }}>
              {t('myAccount')}
            </Text>
          ),
          tabBarIcon: ({focused}) => (
            <AccountIcon color={focused ? Colors.PRIMARY : Colors.GRAY_DARK} />
          ),
        }}
      />
      {/* <Tab.Screen
        name={modules.cart_thankyou.name}
        key={modules.cart_thankyou.name}
        component={ThankYouPage}
        options={{ tabBarButton: () => null }}
      /> */}
    </Tab.Navigator>
  );
};

export default StackAppTab;
