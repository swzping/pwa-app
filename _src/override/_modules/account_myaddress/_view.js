import React from 'react';

import CustomView from '@app/components/CustomView/index';
import ListShippingAddress from '@app/components/ListShippingAddress/index';
import NavBar from '@app/components/NavBar/index';
import {TYPE_LIST_ADDRESS_ACCOUNT} from '@app/helpers/Constants';

const AccountMyAddressView = ({t}) => {
  return (
    <>
      <NavBar
        useWhite
        useBack
        center
        titleBold
        childrenRight={<CustomView width={'12%'} />}
        title={t('account_myaddress.title.savedAddress')}
      />
      <ListShippingAddress type={TYPE_LIST_ADDRESS_ACCOUNT} />
    </>
  );
};

export default AccountMyAddressView;
