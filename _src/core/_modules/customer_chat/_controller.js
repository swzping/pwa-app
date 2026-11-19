import React from 'react';

import Views from '@app/_modules/customer_chat/_view';

const CustomerChatController = props => {
  /**
   * [props] set controller props
   * @return {object}
   */
  const controllerProps = {};

  return <Views {...props} {...controllerProps} />;
};

export default CustomerChatController;
