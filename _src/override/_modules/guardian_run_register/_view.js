import React from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import NavBar from '@app/components/NavBar';
import styles from '@app/_modules/guardian_run_register/style.js';

const Views = ({webViewUrl}) => {
  return (
    <View style={styles.container}>
      <NavBar useBack={true} title={'Guardian Run'} useWhite={true} />
      {webViewUrl ? (
        <WebView source={{uri: webViewUrl}} style={styles.webview} />
      ) : null}
    </View>
  );
};

export default Views;
