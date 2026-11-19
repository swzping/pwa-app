import {useReactiveVar} from '@apollo/client';
import React from 'react';
import {rxUserType, rxUserWIshlistItems} from '@app/services/cache';
import {navigateTo} from '@app/helpers/Navigation';
import {useTranslation} from 'react-i18next';

import Views from '@app/_modules/account_wishlist/_view';
import {modules} from '@root/swift.config';
import useWishlists from '@app/hooks/wishlists/useWishlists';
import ViewLogin from '@app/_modules/auth_signin/_controller';
import {USER_GUEST} from '@app/helpers/Constants';

const Wishlist = () => {
  if (!modules.account_wishlist.enable) {
    return null;
  }
  const {removeFromWishlist} = useWishlists({
    initialized: false,
  });
  const userType = useReactiveVar(rxUserType);
  const wishlist = useReactiveVar(rxUserWIshlistItems);
  const {t} = useTranslation();

  const onPressCart = () => {
    navigateTo(modules.cart.enable, modules.cart.name);
  };
  const onPressRemove = async item => {
    await removeFromWishlist(item);
  };

  if (userType === USER_GUEST) {
    return <ViewLogin />;
  }

  return (
    <Views
      t={t}
      userType={userType}
      wishlist={wishlist}
      onPressCart={onPressCart}
      onPressRemove={onPressRemove}
    />
  );
};

export default Wishlist;
