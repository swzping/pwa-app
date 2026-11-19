import {useEffect, useMemo, useState} from 'react';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {loadingStop} from '@app/helpers/General';
import {
  rxWishlistDataInformation,
  rxUserWIshlistItems,
} from '@app/services/cache';
import {GET_USER_WISHLIST} from '@app/services/queries/user';

export function useRefetchWishlist() {
  const [userDataParams, setUserDataParams] = useState(null);
  const {onRefetchData: loadUserData, data: userData} = useCustomQuery({
    schema: GET_USER_WISHLIST,
    opts: {fetchPolicy: 'network-only'},
  });

  /**
   * ---------------------------------------------------- *
   * @dependency [userDataParams, userData]
   * @summary set wishlist data to useMemo const
   * ---------------------------------------------------- *
   */
  const userDataState = useMemo(() => {
    if (userDataParams) {
      return userDataParams;
    }
    if (userData?.data) {
      return userData.data;
    }
    return null;
  }, [userDataParams, userData]);

  /**
   * ---------------------------------------------------- *
   * @function refetch
   * @param Object wishlist
   * @summary set data to local state or get from remote
   * ---------------------------------------------------- *
   */
  const refetch = async userDataParam => {
    if (userDataParam) {
      setUserDataParams(userDataParam);
    } else {
      try {
        await loadUserData({params: null});
      } catch (error) {
        throw new Error(error);
      }
    }
  };

  /**
   * ---------------------------------------------------- *
   * @dependency [userDataState]
   * @summary populate wishlist item and set to reactive
   * ---------------------------------------------------- *
   */
  useEffect(() => {
    if (userDataState && userDataState?.customer?.wishlist) {
      const wishID = userDataState?.customer?.wishlist.id;
      const wishlist = userDataState?.customer?.wishlist?.items;
      const wishlistState = [];
      wishlist?.map(item => {
        const {id, type_id, name, sku, thumbnail, url_key, price_range} =
          item.product;

        wishlistState.push({
          wishlistId: item.id,
          productId: id,
          type_id: type_id,
          name: name,
          sku: sku,
          image: thumbnail.url,
          url_key: url_key,
          price_range,
          offers: item?.product?.offers,
          __typename: 'WishlistItem',
        });
      });

      rxWishlistDataInformation({id: wishID});
      rxUserWIshlistItems(wishlistState);
      loadingStop();
    }
  }, [userDataState]);

  return {refetch};
}
