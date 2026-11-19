import React from 'react';

import Views from '@app/_modules/webViewFullScreen/_view';

const WebViewFullScreenController = props => {
  const {route} = props || {};
  const {url, title, isNavBar = true} = route?.params || {};

  return <Views webViewUrl={url} title={title} isNavBar={isNavBar} />;
};

export default WebViewFullScreenController;
