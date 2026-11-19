import React, {useEffect, useState} from 'react';
import {useReactiveVar} from '@apollo/client';
import {useIsFocused} from '@react-navigation/native';
import {
  rxUserInformation,
  rxUserAddresses,
  rxAppSnackbar,
} from '@app/services/cache';
import useCustomMutation from '@app/hooks/useCustomMutation';
import {useRefetchAddress} from '@app/hooks/useRefetchAddress';
import {navigateTo} from '@app/helpers/Navigation';
import {DELETE_ADDRESS} from '@app/_modules/account/services/schema';

import Views from '@app/_modules/account_myaccount/_view';
import {useTranslation} from 'react-i18next';
import {modules} from '@root/swift.config';

const MyAccount = props => {
  if (!modules.account_myaccount.enable) {
    return null;
  }

  const {onRefetchData: deleteAddressHook} = useCustomMutation({
    schema: DELETE_ADDRESS,
  });
  const {refetch} = useRefetchAddress();

  const isFocused = useIsFocused();
  const accountInformation = useReactiveVar(rxUserInformation);
  const addressClientData = useReactiveVar(rxUserAddresses);
  const [addresses, setAddressData] = useState([]);
  const {t} = useTranslation();

  useEffect(() => {
    if (isFocused) {
      if (addressClientData) {
        setAddressData(addressClientData);
      }
    }
  }, [isFocused]);

  const onNavigateToAddAddress = () => {
    navigateTo(
      modules.account_address_add.enable,
      modules.account_address_add.name,
    );
  };
  const onNavigateToUpdateAddress = addressData => {
    navigateTo(
      modules.account_address_add.enable,
      modules.account_address_add.name,
      {
        addressData,
      },
    );
  };

  const onNavigateToUpdateAccountInformation = accountInformationData => {
    navigateTo(
      modules.account_update_information.enable,
      modules.account_update_information.name,
      {accountInformationData},
    );
  };

  const onDeleteAddress = async addressId => {
    try {
      const res = await deleteAddressHook({
        params: {
          id: addressId,
        },
        paramsOpt: {isReturn: true},
      });
      if (res) {
        rxAppSnackbar({message: 'Address deleted'});
        await refetch();
      }
    } catch (error) {
      rxAppSnackbar({message: 'Something went wrong'});
    }
  };

  /**
   * [props] set controller props
   * @return {object}
   */
  const controllerProps = {
    t,
    accountInformation,
    addresses,
    onNavigateToAddAddress,
    onNavigateToUpdateAddress,
    onNavigateToUpdateAccountInformation,
    onDeleteAddress,
  };

  return <Views {...props} {...controllerProps} />;
};

export default MyAccount;
