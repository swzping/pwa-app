import React from 'react';
import {modules} from '@root/swift.config';
import {WebView} from 'react-native-webview';

/**
 * ---------------------------------------------------- *
 * @components Views
 * @summary this is expample views
 * ---------------------------------------------------- *
 */
const Views = ({pwaUrl, webviewRef}) => {
  if (!modules.cart_checkout_pwa.enable) {
    return null;
  }

  return <WebView ref={webviewRef} source={{uri: pwaUrl}} style={{flex: 1}} />;
};

Views.propTypes = {
  //   name: PropTypes.function /* @summary use for translation */,
};

export default Views;
