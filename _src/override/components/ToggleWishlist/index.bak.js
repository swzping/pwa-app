// import AnalyticsHelper from '@app/helpers/Analytics';
import React, {useEffect, useState} from 'react';
import {Colors} from '@app/styles';
import {useReactiveVar} from '@apollo/client';
import {
  rxUserTheme,
  rxUserToken,
  rxAppSnackbar,
  rxUserType,
  rxUserWIshlistItems,
} from '@app/services/cache';
import _ from 'lodash';
import {
  BYPASS_ERROR_TOGGLE_WISHLIST,
  USER_CUSTOMER,
} from '@app/helpers/Constants';
import {DARK} from '@app/helpers/Constants';
import {useTranslation} from 'react-i18next';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import useWishlists from '@app/hooks/wishlists/useWishlists';

const ToggleWishlist = ({
  item,
  wishlistItemId = null,
  children,
  styleProp = {},
  iconSize = 25,
  callback = null,
  isPrimary,
  loadingChange = false,
}) => {
  const scheme = useReactiveVar(rxUserTheme);
  const userType = useReactiveVar(rxUserType);
  const getRxUserToken = useReactiveVar(rxUserToken);
  const userWishlistItems = useReactiveVar(rxUserWIshlistItems);
  const {t} = useTranslation();

  const {addToWishlist, removeFromWishlist} = useWishlists({
    initialized: false,
    configErr: {
      logSource: BYPASS_ERROR_TOGGLE_WISHLIST,
      isBypass: userType === USER_CUSTOMER ? false : true,
    },
  });
  const [active, setActive] = useState(false);
  const [itemProduct, setItemProduct] = useState({});

  useEffect(() => {
    const itemOnWishlist = _.find(userWishlistItems, {productId: item.id});
    if (itemOnWishlist) {
      setActive(true);
      const newItemProduct = {
        ...item,
        wishlistId: itemOnWishlist.wishlistId,
      };
      setItemProduct(newItemProduct);
    } else {
      setActive(false);
      setItemProduct(item);
    }
  }, [item, userWishlistItems]);

  /**
   * ---------------------------------------------------- *
   * @function onLogWishlistToAnalytics
   * @summary log add/remove wishlist item to analytics
   * @profiler {googleAnalytics} wishlist
   * ---------------------------------------------------- *
   */
  // const onLogWishlistToAnalytics = () => {
  //   const item = {
  //     item_name: productName,
  //     item_sku: productSku,
  //     value: productPrice,
  //     currency: productCurrency,
  //   };
  //   if (wishlistItemId) {
  //     AnalyticsHelper.eventAddItemWishlist({item});
  //   } else {
  //     AnalyticsHelper.eventRemoveItemWishlist({item});
  //   }
  // };

  /**
   * ---------------------------------------------------- *
   * @function onAddToWishlist
   * @summary add product to wishlist and refetch list
   * ---------------------------------------------------- *
   */
  const onAddToWishlist = async () => {
    if (getRxUserToken === null) {
      rxAppSnackbar({message: t('label.pleaseLoginFirst')});
    } else {
      await addToWishlist(itemProduct);
      if (callback) {
        await callback();
      }
      setActive(true);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onRemoveFromWishlist
   * @summary remove product to wishlist and refetch list
   * ---------------------------------------------------- *
   */
  const onRemoveFromWishlist = async () => {
    await removeFromWishlist(itemProduct);
    if (callback) {
      await callback();
    }
    setActive(false);
  };

  return (
    <CustomView
      style={[styleProp]}
      onPress={
        loadingChange ? false : active ? onRemoveFromWishlist : onAddToWishlist
      }>
      <RenderIf radius={25} padding border condition={!children}>
        <FontAwesomeIcons
          name={active ? 'heart' : 'heart-o'}
          size={iconSize}
          color={
            isPrimary
              ? Colors.WHITE
              : wishlistItemId && active
              ? Colors.PRIMARY
              : active
              ? Colors.PRIMARY
              : scheme === DARK
              ? Colors.GRAY_DARK
              : Colors.GRAY_MEDIUM
          }
        />
      </RenderIf>
      <RenderIf condition={children}>
        <CustomView>{children}</CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default ToggleWishlist;
