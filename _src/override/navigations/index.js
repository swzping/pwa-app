import React, {useState, useMemo, useRef, useEffect} from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {navigationRef, getStatusBarColor} from '@app/helpers/Navigation';
import {useReactiveVar} from '@apollo/client';
import {rxAppMaintenance, rxUserTheme, rxUserToken} from '@app/services/cache';
import {createStackNavigator} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import {StackAuth} from '@app/navigations/_stack-auth';
import {StackApp} from '@app/navigations/_stack-app';
import EvoucherSelection from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/EvoucherSelectionPage';
import PointSelection from '@app/_modules/cart_checkout/atoms/BlockPaymentOthers/PointSelectionPage';
import {NavigatorContext} from '@app/helpers/Context';
import {onGoStore} from '@app/helpers/Version';
import {Provider as PaperProvider, ActivityIndicator} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {Colors} from '@app/styles/index';
import {modules} from '@root/swift.config';
import {Storage} from '@app/helpers/Storage';
import {DARK, LIGHT, linking} from '@app/helpers/Constants';
import SplashScreen from 'react-native-splash-screen';
import CustomLightTheme from '@app/styles/themes/light';
import AppLoader from '@app/components/Loader/index';
import AppSnackBar from '@app/components/SnackBar/index';
import Dialog from '@app/components/Dialog/index';
import useAppInitialize from '@app/hooks/_useAppInitialize';
import MaintenanceMode from '@app/_modules/maintenance_mode';
import useNavAppInitialize from '@app/hooks/_useNavAppInitialize';
import AnalyticsHelper from '@app/helpers/Analytics';
import StatusBarWithBackgroundColor from '@app/components/StatusBarWithBgColor';
import useDeepLink from '@app/hooks/useDeepLink';

export const Stack = createStackNavigator();

const AppNavigator = () => {
  useNavAppInitialize('index-nav');
  // const {updates, loadingUser, setUpdates} = useAppInitialize();
  const {updates, loadingUser} = useAppInitialize();
  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const [, setIsDarkTheme] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [statusBarColor, setStatusBarColor] = useState(Colors.WHITE);
  const getRxUserToken = useReactiveVar(rxUserToken);
  const userTheme = useReactiveVar(rxUserTheme);
  const getRxMaintenance = useReactiveVar(rxAppMaintenance);
  const routeNameRef = useRef();
  let theme;
  if (userTheme === DARK) {
    rxUserTheme(LIGHT);
    theme = CustomLightTheme;
  } else if (userTheme === LIGHT) {
    rxUserTheme(LIGHT);
    theme = CustomLightTheme;
  } else {
    theme = CustomLightTheme;
  }
  const {t} = useTranslation();
  useDeepLink();

  /**
   * ---------------------------------------------------- *
   * @function {useEffect}
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1500);
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      const themeLocal = await Storage.get(Storage.name.USER_THEME);
      if (themeLocal) {
        rxUserTheme(themeLocal);
      }
    };

    loadTheme();
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function {useMemo}
   * ---------------------------------------------------- *
   */
  const navigatorContext = useMemo(
    () => ({
      toggleTheme: () => {
        setIsDarkTheme(isDarkThemeNew => !isDarkThemeNew);
      },
      routeName,
    }),
    [routeName],
  );

  /**
   * ---------------------------------------------------- *
   * @function onNavigatorContainerStateChange
   * on navigator state change
   * ---------------------------------------------------- *
   */
  const onNavigatorContainerStateChange = () => {
    try {
      const previousRouteName = routeNameRef?.current;
      const currentRouteName =
        navigationRef?.current?.getCurrentRoute() === undefined
          ? ''
          : navigationRef?.current?.getCurrentRoute().name;
      AnalyticsHelper.eventLogScreen({previousRouteName, currentRouteName});

      // 添加路由切换日志
      console.log(`[Navigation] ➡️ Switched to Screen: ${currentRouteName}`);

      routeNameRef.current = currentRouteName;
      setRouteName(currentRouteName);
      setStatusBarColor(getStatusBarColor(currentRouteName));
    } catch (e) {
      console.log('[err] navigator container state change', e);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigatorReady
   * on navigator ready
   * ---------------------------------------------------- *
   */
  const onNavigatorReady = () => {
    try {
      const currentRouteName = navigationRef.current.getCurrentRoute().name;
      routeNameRef.current = currentRouteName;
      setRouteName(routeNameRef.current);
      setStatusBarColor(getStatusBarColor(currentRouteName));
    } catch (err) {
      console.log('[err] navigator on ready', err);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onScreenSwitchMain
   * @summary switch main screen between app | auth
   * ---------------------------------------------------- *
   */
  const onScreenSwitchMain = () => {
    return getRxUserToken === null ? StackAuth() : StackApp();
  };

  /**
   * ---------------------------------------------------- *
   * @returns {render}
   * ---------------------------------------------------- *
   */
  if (loadingUser) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator color={Colors.PRIMARY} size="large" />
        <Text style={{marginTop: 20}}>please wait...</Text>
      </SafeAreaView>
    );
  }
  return (
    <View style={{flex: 1}}>
      <PaperProvider theme={theme}>
        <NavigatorContext.Provider value={navigatorContext}>
          <NavigationContainer
            theme={theme}
            linking={linking}
            ref={navigationRef}
            onStateChange={onNavigatorContainerStateChange}
            onReady={onNavigatorReady}>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              {/* SCREEN MAIN */}
              {!getRxMaintenance && onScreenSwitchMain()}

              {/* SCREEN MAINTENANCE */}
              {getRxMaintenance && (
                <Stack.Screen
                  key={modules.maintenance_mode.name}
                  name={modules.maintenance_mode.name}
                  component={MaintenanceMode}
                />
              )}

              {/* EVOUCHER SELECTION SCREEN */}
              {!getRxMaintenance && getRxUserToken !== null && (
                <Stack.Screen
                  key="EvoucherSelection"
                  name="EvoucherSelection"
                  component={EvoucherSelection}
                />
              )}
              {/* POINT SELECTION SCREEN */}
              {!getRxMaintenance && getRxUserToken !== null && (
                <Stack.Screen
                  key="PointSelection"
                  name="PointSelection"
                  component={PointSelection}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </NavigatorContext.Provider>

        {/* FORCE UPDATE */}
        <Dialog
          visible={updates}
          message={t('label.newVersionFound')}
          // secondButtonLabel={t('label.cancel')}
          // onPressSecondButton={() => setUpdates(false)}
          buttonLabel={t('label.update')}
          onPressButton={() => onGoStore()}
        />
        <AppLoader />
        <AppSnackBar />
      </PaperProvider>
      <StatusBarWithBackgroundColor backgroundColor={statusBarColor} />
    </View>
  );
};

export default AppNavigator;
