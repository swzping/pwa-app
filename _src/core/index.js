import React from 'react';

import {ApolloProvider} from '@apollo/client';

import {
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import 'react-native-gesture-handler';
import '@app/configs/i18n';
import '@app/configs/global';

import AppNavigator from '@app/navigations';
import client from '@app/services/api';

const Core = () => {
  return (
   <GestureHandlerRootView style={{flex: 1}}>
      <ApolloProvider client={client}>
        <BottomSheetModalProvider>
          <AppNavigator />
        </BottomSheetModalProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
};

export default Core;
