import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { navigationRef } from '@app/helpers/Navigation';
import { useReactiveVar } from '@apollo/client';
import { rxAppMaintenance, rxUserTheme, rxUserToken } from '@app/services/cache';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { StackAuth } from '@app/navigations/_stack-auth';
import { StackApp } from '@app/navigations/_stack-app';
import { NavigatorContext } from '@app/helpers/Context';
import { onGoStore } from '@app/helpers/Version';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { Colors } from '@app/styles/index';
import { modules } from '@root/swift.config';
import { Storage } from '@app/helpers/Storage';

import CustomDarkTheme from '@app/styles/themes/dark';
import CustomLightTheme from '@app/styles/themes/light';
import AppLoader from '@app/components/Loader/index';
import AppSnackBar from '@app/components/SnackBar/index';
import Dialog from '@app/components/Dialog';
import useAppInitialize from '@root/_src/core/hooks/_useAppInitialize';
import MaintenanceMode from '@app/_modules/maintenance_mode';
import { DARK, LIGHT, linking } from '@app/helpers/Constants';
import SplashScreen from 'react-native-splash-screen';

// const routingInstrumentation = new Sentry.ReactNavigationV5Instrumentation();
export const Stack = createStackNavigator();

const AppNavigator = () => {
  const { updates, loadingUser } = useAppInitialize();

  /**
   * ---------------------------------------------------- *
   * @var {hooks}
   * ---------------------------------------------------- *
   */
  const [, setIsDarkTheme] = useState(false);
  const getRxUserToken = useReactiveVar(rxUserToken);
  const userTheme = useReactiveVar(rxUserTheme);
  const getRxMaintenance = useReactiveVar(rxAppMaintenance);
  const routeNameRef = useRef();
  let theme;
  if (userTheme === DARK) {
    rxUserTheme(DARK);
    theme = CustomDarkTheme;
  } else if (userTheme === LIGHT) {
    rxUserTheme(LIGHT);
    theme = CustomLightTheme;
  } else {
    theme = CustomLightTheme;
  }
  const { t } = useTranslation();

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
    }),
    [],
  );

  /**
   * ---------------------------------------------------- *
   * @function onNavigatorContainerStateChange
   * on navigator state change
   * ---------------------------------------------------- *
   */
  const onNavigatorContainerStateChange = () => {
    try {
      const currentRouteName =
        navigationRef?.current.getCurrentRoute() === undefined
          ? ''
          : navigationRef?.current.getCurrentRoute().name;

      routeNameRef.current = currentRouteName;
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
      routeNameRef.current = navigationRef.current.getCurrentRoute().name;
      // routingInstrumentation.registerNavigationContainer(navigationRef);
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
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.PRIMARY} size="large" />
        <Text style={{ marginTop: 20 }}>please wait...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <NavigatorContext.Provider value={navigatorContext}>
          <NavigationContainer
            theme={theme}
            linking={linking}
            ref={navigationRef}
            onStateChange={onNavigatorContainerStateChange}
            onReady={onNavigatorReady}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
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
            </Stack.Navigator>
          </NavigationContainer>
        </NavigatorContext.Provider>

        {/* FORCE UPDATE */}
        <Dialog
          visible={updates}
          message={t('label.newVersionFound')}
          secondButtonLabel={t('label.cancel')}
          leftTextonPressSecondButton={() => console.log('cancel')}
          buttonLabel={t('label.update')}
          onPressButton={() => onGoStore()}
        />
        <AppLoader />
        <AppSnackBar />
      </PaperProvider>
    </SafeAreaView>
  );
};

export default AppNavigator;
