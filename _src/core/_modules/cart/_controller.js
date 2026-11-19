import {useReactiveVar} from '@apollo/client';
import React, {useEffect} from 'react';

import {useRefetchCart} from '@app/hooks/useRefetchCart';
import {navigateTo} from '@app/helpers/Navigation';
import {rxUserType} from '@app/services/cache';
import useWishlists, {
  TYPES as WISHLIST_TYPES,
} from '@app/hooks/wishlists/useWishlists';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import {TYPE_BOOLEAN, PWA_CHECKOUT_PARAMETER} from '@app/helpers/Constants';
import {getParameterValue} from '@app/helpers/RemoteConfig';

import Views from '@app/_modules/cart/_view';
import {modules} from '@root/swift.config';

const Cart = () => {
  if (!modules.cart.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @summary collections constant for
   * this contorller
   * ---------------------------------------------------- *
   */
  const userType = useReactiveVar(rxUserType);
  const {refetch: setCartClientState} = useRefetchCart();

  /**
   * hooks cart items
   */
  const {
    data: items,
    setCart: getItems,
    compareLocal,
  } = useCarts({
    initialized: true,
    type: TYPES.ITEM,
  });

  /**
   * hooks cart prices
   */
  const {data: price, setCart: getPrice} = useCarts({
    initialized: true,
    type: TYPES.PRICE,
  });

  const {data} = useWishlists({
    initialized: true,
    type: WISHLIST_TYPES.INFORMATION,
  });

  // const {setCart} = useCarts({
  //   initialized: true,
  // });

  console.log(data);

  /**
   * ----------------------------------------- *
   * @dependency []
   * @summary component did mount
   * request cart data
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    getItems();
    getPrice();
    setCartClientState();
  }, []);

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail product
   * ---------------------------------------------------- *
   */
  const onNavigateToProductDetail = productUrlKey => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToShipping
   * @summary navigate to shpping page
   * ---------------------------------------------------- *
   */
  const onNavigateToShipping = async () => {
    const checkFirst = await compareLocal();
    if (checkFirst) {
      const getRemoteConfigPWACheckout = getParameterValue({
        parameter: PWA_CHECKOUT_PARAMETER,
        type: TYPE_BOOLEAN,
      });
      /**
       * go to pwa checkout
       */
      if (getRemoteConfigPWACheckout) {
        if (modules.cart_checkout_pwa.enable) {
          navigateTo(
            modules.cart_checkout_pwa.enable,
            modules.cart_checkout_pwa.name,
          );
          return;
        }
      }
      /**
       * go to normal checkout
       */
      if (modules.cart_guestcheckout.enable) {
        if (items?.length) {
          navigateTo(modules.cart_shipping.enable, modules.cart_shipping.name);
        }
      } else {
        if (userType === 'guest') {
          return navigateTo(
            modules.auth_signin.enable,
            modules.auth_signin.name,
          );
        }
        if (items?.length) {
          navigateTo(modules.cart_shipping.enable, modules.cart_shipping.name);
        }
      }
    }
  };

  return (
    <Views
      cartItems={items}
      cartPrices={price}
      onNavigateToProductDetail={onNavigateToProductDetail}
      onNavigateToShipping={onNavigateToShipping}
      userType={userType}
    />
  );
};

export default Cart;
