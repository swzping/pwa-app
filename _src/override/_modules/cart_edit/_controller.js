import React, {useState, useEffect} from 'react';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import {useReactiveVar} from '@apollo/client';
import {navigateTo} from '@app/helpers/Navigation';
import {rxUserType, rxUserWIshlistItems} from '@app/services/cache';
import {useTranslation} from 'react-i18next';
import {USER_GUEST} from '@app/helpers/Constants';
import {modules} from '@root/swift.config';

import Views from '@app/_modules/cart_edit/_view';

const CartDetail = () => {
  if (!modules.cart_edit.enable) {
    return null;
  }

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @summary collections constant for
   * this contorller
   * ---------------------------------------------------- *
   */
  const getRxUserType = useReactiveVar(rxUserType);
  const getRxUserWishlist = useReactiveVar(rxUserWIshlistItems);
  const {t} = useTranslation();
  const [edit, setEdit] = useState(false);
  const [expand, setExpand] = useState(false);
  const [expandDiscount, setExpandDiscount] = useState(false);
  const [totalDiscount, setTotalDiscount] = useState(0);

  /**
   * hooks cart items
   */
  const {
    data: items,
    compareLocal,
    isEmptyCart,
  } = useCarts({
    initialized: false,
    type: TYPES.ITEM,
  });

  /**
   * hooks cart prices
   */
  const {data: price} = useCarts({
    initialized: false,
    type: TYPES.PRICE,
  });

  useEffect(() => {
    if (price && price?.discounts) {
      let tmpTotal = 0;
      for (let i = 0; i < price.discounts.length; i++) {
        tmpTotal += price.discounts[i].amount.value;
      }
      setTotalDiscount(tmpTotal);
    }
  }, [price]);

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToProductDetail
   * @summary navigate to product detail product
   * ---------------------------------------------------- *
   */
  const onNavigateToProductDetail = ({productUrlKey, productSku}) => {
    navigateTo(modules.product_detail.enable, modules.product_detail.name, {
      productUrlKey,
      productSku,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onNavigateToCheckout
   * @summary navigate to checkout page
   * ---------------------------------------------------- *
   */
  const onNavigateToCheckout = async () => {
    const checkFirst = await compareLocal();
    if (checkFirst) {
      if (getRxUserType === USER_GUEST) {
        navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
        return;
      }
      if (items?.length) {
        navigateTo(modules.cart_checkout.enable, modules.cart_checkout.name);
        return;
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressEdit
   * @summary for edit product item
   * ---------------------------------------------------- *
   */
  const onPressEdit = () => setEdit(!edit);

  /**
   * ---------------------------------------------------- *
   * @function onPressExpand
   * @summary for expand price
   * ---------------------------------------------------- *
   */
  const onPressExpand = () => setExpand(!expand);

  /**
   * ---------------------------------------------------- *
   * @function onPressExpandDiscount
   * @summary for expand Discount
   * ---------------------------------------------------- *
   */
  const onPressExpandDiscount = () => setExpandDiscount(!expandDiscount);

  /**
   * ---------------------------------------------------- *
   * @constant controllerProps
   * @return {object}
   * ---------------------------------------------------- *
   */
  const controllerProps = {
    t,
    edit,
    expand,
    expandDiscount,
    totalDiscount,
    isEmptyCart,
    cartItems: items,
    cartPrices: price,
    useType: getRxUserType,
    userWishlist: getRxUserWishlist,
    setExpandDiscount,
    onNavigateToProductDetail,
    onNavigateToCheckout,
    onPressEdit,
    onPressExpand,
    onPressExpandDiscount,
  };

  return <Views {...controllerProps} />;
};

export default CartDetail;
