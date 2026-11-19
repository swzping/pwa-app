import React from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import NavBar from '@app/components/NavBar';
import styles from '@app/_modules/webViewShowHighlight/style.js';

const Views = ({webViewUrl}) => {
  return (
    <View style={styles.container}>
      <NavBar useBack={true} useWhite={true}/>
      {webViewUrl ? (
        <WebView source={{uri: webViewUrl}} style={styles.webview} />
      ) : null}
    </View>
  );
};

export default Views;
