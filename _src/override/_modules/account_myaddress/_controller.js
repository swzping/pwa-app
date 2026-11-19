import React from 'react';
import {modules} from '@root/swift.config';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account_myaddress/_view';

const AccountMyAddress = props => {
  if (!modules.account_myaddress.enable) {
    return null;
  }

  const {t} = useTranslation();
  /**
   * [props] set controller props
   * @return {object}
   */
  const controllerProps = {
    t,
  };
  return <Views {...props} {...controllerProps} />;
};

export default AccountMyAddress;
