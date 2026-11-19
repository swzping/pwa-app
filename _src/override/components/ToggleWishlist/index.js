import React, {memo, useCallback, useEffect, useState} from 'react';
import {Colors} from '@app/styles';
import {useReactiveVar, useMutation} from '@apollo/client';
import {DARK} from '@app/helpers/Constants';
import {onSetDataWishlist} from '@app/hooks/wishlists/useWishlists';
import {onHandleError} from '@app/hooks/customer/useDataCustomer';
import {useTranslation} from 'react-i18next';
import {navigateTo} from '@app/helpers/Navigation';
import {modules} from '@root/swift.config';
import {
  rxUserTheme,
  rxAppSnackbar,
  rxUserToken,
  rxUserWIshlistItems,
  rxWishlistDataInformation,
} from '@app/services/cache';
import _ from 'lodash';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import wishlistSchema from '@app/hooks/wishlists/schema';
import AnalyticsHelper from '@app/helpers/Analytics';
import Heart from '@app/assets/svgs/Heart';
import HeartO from '@app/assets/svgs/HeartO';
import {trackAddToWishlist} from '@app/track';
import {useRoute} from '@react-navigation/native';

const isActiveWishlist = ({isPrimary, wishlistItemId, active, scheme}) => {
  if (isPrimary) {
    return Colors.WHITE;
  }
  if (wishlistItemId && active) {
    return Colors.PRIMARY;
  }
  if (active) {
    return Colors.PRIMARY;
  }
  if (scheme === DARK) {
    return Colors.GRAY_DARK;
  }
  return Colors.GRAY_MEDIUM;
};

const SCHEMA_WISHLIST_ADD = wishlistSchema().add;
const SCHEMA_WISHLIST_REMOVE = wishlistSchema().remove;

const ToggleWishlist = ({
  item,
  wishlistItemId = null,
  children,
  styleProp = {},
  iconSize = 26,
  callback = null,
  isPrimary,
  loadingChange = false,
}) => {
  const route = useRoute();
  const scheme = useReactiveVar(rxUserTheme);
  const userWishlistItems = useReactiveVar(rxUserWIshlistItems);
  const userToken = useReactiveVar(rxUserToken);
  const isCustomer = !!userToken;
  const [active, setActive] = useState(false);
  const [itemProduct, setItemProduct] = useState({});
  const [addItemToWishlist] = useMutation(SCHEMA_WISHLIST_ADD);
  const [removeItemToWishlist] = useMutation(SCHEMA_WISHLIST_REMOVE);
  const {t} = useTranslation();

  /**
   * ---------------------------------------------------- *
   * @const {onSetItemProduct}
   * @summary description
   * ---------------------------------------------------- *
   */
  const onSetItemProduct = useCallback(productItem => {
    setItemProduct(productItem);
  }, []);

  /**
   * ---------------------------------------------------- *
   * @dependency [item, userWishlistItems]
   * @summary depDesc
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    const itemOnWishlist = _.find(userWishlistItems, {productId: item?.id});
    if (!itemOnWishlist) {
      setActive(false);
      onSetItemProduct(item);
    } else {
      setActive(true);
      onSetItemProduct({
        ...item,
        wishlistId: itemOnWishlist.wishlistId,
      });
    }
  }, [userWishlistItems]);

  /**
   * ---------------------------------------------------- *
   * @const {onRemoveFromWishlist}
   * @summary remove from wishlist
   * ---------------------------------------------------- *
   */
  const onRemoveFromWishlist = async () => {
    const getWishlist = rxUserWIshlistItems();
    const getWishlistInfo = rxWishlistDataInformation();
    const wishID = _.get(getWishlistInfo, 'id');
    const wishItemID = _.get(itemProduct, 'wishlistId');
    if (isCustomer && wishID) {
      let wishs = [];
      let backupWishlistState = [];
      if (getWishlist && getWishlist.length > 0) {
        wishs = [...getWishlist];
        backupWishlistState = [...getWishlist];
      }
      const tempWishlists = _.filter(wishs, function (obj) {
        return obj.wishlistId !== wishItemID;
      });
      onSetDataWishlist(tempWishlists);
      try {
        const response = await removeItemToWishlist({
          variables: {
            wishlistId: wishID,
            wishlistItemsIds: [wishItemID],
          },
        });
        const dataParams = _.get(response, 'data.removeProductsFromWishlist');
        const dataParamsFinal = dataParams ? dataParams : backupWishlistState;
        await onSetDataWishlist(dataParamsFinal);
        rxAppSnackbar({
          message: t('label.productRemoveWishlist'),
        });
      } catch (err) {
        console.log('[err] remove wishlist', err);
        await onSetDataWishlist(backupWishlistState);
        onHandleError(err);
      }
    }

    if (callback) {
      callback();
    }
  };

  /**
   * ---------------------------------------------------- *
   * @const {onAddToWishlist}
   * @summary add to wishlist
   * ---------------------------------------------------- *
   */
  const onAddToWishlist = async () => {
    if (isCustomer) {
      const wishID = 0;
      let backupWishlistState = [];
      const getWishlist = rxUserWIshlistItems();
      if (getWishlist && getWishlist.length > 0) {
        backupWishlistState = [...getWishlist];
      }
      const sku = item?.product?.sku ?? item?.sku;

      try {
        await onSetDataWishlist(item);
        const variables = {
          wishlistId: wishID,
          wishlistItems: [{sku, quantity: 1}],
        };
        const response = await addItemToWishlist({variables});
        const dataParams = _.get(response, 'data.addProductsToWishlist');
        const dataParamsFinal = dataParams ? dataParams : backupWishlistState;
        await onSetDataWishlist(dataParamsFinal);

        /**
         * For Analytic
         * PLP : item?.price?.regularPrice?.amount
         * PDP : item?.price_range?.maximum_price?.regular_price
         */
        AnalyticsHelper.eventAddItemWishlistGA({
          currency:
            item?.price?.regularPrice?.amount?.currency ??
            item?.price_range?.maximum_price?.regular_price?.currency,
          value: parseInt(
            item?.price?.regularPrice?.amount?.value ??
              item?.price_range?.maximum_price?.regular_price?.value,
          ),
          items: [
            {
              item_id: item?.id?.toString(),
              item_name: item?.name,
            },
          ],
        });
        rxAppSnackbar({message: t('label.productAddedWishlist')});

        trackAddToWishlist({
          location_name: route.name,
          sku_name: item.name,
          sku_id: item.sku,
         });
      } catch (err) {
        console.log('[err] add wishlist', err);
        await onSetDataWishlist(backupWishlistState);
        onHandleError(err);
      }
    } else {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    }
    if (callback) {
      callback();
    }
  };
  const iconStyleProps = {
    color: isActiveWishlist({
      isPrimary,
      wishlistItemId,
      active,
      scheme,
    }),
    width: iconSize,
    height: iconSize,
  };
  return (
    <CustomView
      style={[styleProp]}
      onPress={
        loadingChange ? false : active ? onRemoveFromWishlist : onAddToWishlist
      }>
      <RenderIf radius={25} padding border condition={!children}>
        {/* <FontAwesomeIcons
          name={active ? 'heart' : 'heart-o'}
          size={iconSize}
          color={isActiveWishlist({isPrimary, wishlistItemId, active, scheme})}
        /> */}
        {active ? (
          <Heart {...iconStyleProps} />
        ) : (
          <HeartO {...iconStyleProps} />
        )}
      </RenderIf>
      <RenderIf condition={children}>
        <CustomView>{children}</CustomView>
      </RenderIf>
    </CustomView>
  );
};

export default memo(ToggleWishlist, (prev, next) => {
  return false;
});
