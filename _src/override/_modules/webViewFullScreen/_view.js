import React from 'react';
import {View} from 'react-native';
import {Linking} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';

import styles from '@app/_modules/webViewFullScreen/style.js';
import NavBar from '@app/components/NavBar';
import ErrorHandler from '@app/helpers/ErrorHandler';

const Views = ({webViewUrl, isNavBar = true, title = ''}) => {
  const insets = useSafeAreaInsets();
  const onMessage = async event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      const {type, url} = data;
      if (type === 'DOWNLOAD_PDF' && url) {
        const supported = await Linking.canOpenURL(url);
        supported && (await Linking.openURL(url));
      }
    } catch (err) {
      new ErrorHandler({
        source: 'PurchaseDetailScreen',
        err,
      }).initHandleError();
    }
  };

  const webView = webViewUrl ? (
    <WebView
      style={styles.webview}
      source={{uri: webViewUrl}}
      onMessage={onMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowFileAccess={true}
      originWhitelist={['*']}
    />
  ) : null;

  return (
    <View style={styles.container}>
      {isNavBar && <NavBar useBack={true} useWhite={true} title={title} />}
      {isNavBar ? (
        webView
      ) : (
        <View
          style={[
            styles.webviewSafeArea,
            {
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}>
          {webView}
        </View>
      )}
    </View>
  );
};

export default Views;
