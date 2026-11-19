import React from 'react';

import Views from '@app/_modules/webViewShowHighlight/_view';

const HignlightVebViewController = url => {
  return <Views webViewUrl={url?.route?.params?.url} />;
};

export default HignlightVebViewController;
