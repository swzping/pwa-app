import React from 'react';
import {useReactiveVar} from '@apollo/client';
import {Storage} from '@app/helpers/Storage';
import {modules} from '@root/swift.config';
import {USER_GUEST} from '@app/helpers/Constants';
import {navReset} from '@app/helpers/Navigation';
import {navigateTo} from '@app/helpers/Navigation';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account/_view';
import ViewLogin from '@app/_modules/auth_signin/_controller';

import {
  rxUserToken,
  rxUserType,
  rxUserAddresses,
  rxCartId,
  rxCartItems,
  rxUserWIshlistItems,
  rxUserInformation,
} from '@app/services/cache';

const Account = ({navigation}) => {
  if (!modules.account.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @summary collections constant for
   * this contorller
   * ---------------------------------------------------- *
   */
  const userData = useReactiveVar(rxUserInformation);
  const userType = useReactiveVar(rxUserType);
  const {t} = useTranslation();

  /**
   * ---------------------------------------------------- *
   * @function onLogOut
   * @summary clear all client and local storage
   * ---------------------------------------------------- *
   */
  const onLogOut = async () => {
    try {
      rxUserType(null);
      rxUserToken(null);
      rxCartItems(null);
      rxCartId(null);
      rxUserWIshlistItems(null);
      rxUserAddresses(null);
      await Storage.clear();
      navReset(modules.auth_landing.name, {withDispatch: true});
    } catch (err) {
      console.log('[err] logout', err);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onEditProfile
   * @summary navigate to edit profile
   * ---------------------------------------------------- *
   */
  const onEditProfile = () => {
    navigateTo(
      modules.account_update_information.enable,
      modules.account_update_information.name,
      {accountInformationData: userData},
    );
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateMenuPage
   * @param {object} item
   * @summary on navigate to each menu page
   * ---------------------------------------------------- *
   */
  const onNavigateMenuPage = item => {
    navigateTo(item.enable, item.moduleName);
  };

  if (userType === USER_GUEST) {
    return <ViewLogin />;
  }

  const controllerProps = {
    t,
    navigation,
    userData,
    onLogOut,
    onEditProfile,
    onNavigateMenuPage,
  };

  return <Views {...controllerProps} />;
};

export default Account;
