// import AnalyticsHelper from '@app/helpers/Analytics';
import {Colors} from '@app/styles';

import React from 'react';
import {useReactiveVar} from '@apollo/client';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import {rxUserTheme} from '@app/services/cache';

import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import useWishlists from '@app/hooks/wishlists/useWishlists';
const ToggleWishlist = ({
  item,
  productId,
  productName,
  productSku,
  productCurrency,
  productPrice,
  wishlistItemId = null,
  children,
  styleProp = {},
  iconSize = 25,
  callback = null,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  const {addToWishlist, removeFromWishlist} = useWishlists({
    initialized: false,
  });

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
    await addToWishlist(item);
    if (callback) {
      await callback();
    }
    // loadingStart();
    // try {
    //   await addToWishlistHook({
    //     variables: {
    //       productId: productId,
    //     },
    //   });
    //   onLogWishlistToAnalytics();
    //   await refetch();
    //   if (callback) {
    //     await callback();
    //   }
    // } catch (error) {
    //   // console.log(error);
    //   loadingStop();
    // }
  };

  /**
   * ---------------------------------------------------- *
   * @function onRemoveFromWishlist
   * @summary remove product to wishlist and refetch list
   * ---------------------------------------------------- *
   */
  const onRemoveFromWishlist = async () => {
    await removeFromWishlist(item);
    if (callback) {
      await callback();
    }
    // loadingStart();
    // try {
    //   await removeFromWishlistHook({
    //     variables: {
    //       wishlistItemId: wishlistItemId,
    //     },
    //   });
    //   onLogWishlistToAnalytics();
    //   await refetch();
    //   if (callback) {
    //     await callback();
    //   }
    // } catch (error) {
    //   // console.log(error);
    //   loadingStop();
    // }
  };

  return (
    <CustomView
      style={[styleProp]}
      onPress={wishlistItemId ? onRemoveFromWishlist : onAddToWishlist}>
      <RenderIf radius={25} padding border condition={!children}>
        <FontAwesomeIcons
          name={wishlistItemId ? 'heart' : 'heart-o'}
          size={iconSize}
          color={
            wishlistItemId
              ? Colors.PRIMARY
              : scheme === 'dark'
              ? Colors.GRAY_DARK
              : Colors.BLACK
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
