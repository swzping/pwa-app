import {useEffect, useMemo, useRef} from 'react';
import {useReactiveVar, useMutation} from '@apollo/client';
import {
  rxUserWIshlistItems,
  rxUserType,
  rxWishlistDataInformation,
  rxAppSnackbar,
} from '@app/services/cache';
import wishlistSchema from '@app/hooks/wishlists/schema';
import useSwitchQuery from '@app/hooks/useSwitchQuery';
import _ from 'lodash';

export const TYPES = {
  INFORMATION: 'INFORMATION',
  ITEM: 'ITEM',
};

const useWishlists = ({initialized = false, type = TYPES.ITEM}) => {
  const mount = useRef();
  const {
    data: fromNetwork,
    error,
    loading,
    onRefetchData: fetchItems,
    setSchemas,
  } = useSwitchQuery({
    withVariables: false,
  });

  const userType = useReactiveVar(rxUserType);
  const getWishlist = useReactiveVar(rxUserWIshlistItems);
  const getWishlistInfo = useReactiveVar(rxWishlistDataInformation);

  const {add, remove, get, getInformation} = wishlistSchema();

  const [addItem] = useMutation(add);
  const [removeItem] = useMutation(remove);

  useEffect(() => {
    if (mount) {
      mount.current = true;
      if (mount.current) {
        switch (type) {
          case TYPES.ITEM:
            setSchemas(get);
            break;
          case TYPES.INFORMATION:
            setSchemas(getInformation);
            break;
          default:
            setSchemas(get);
            break;
        }

        if (initialized === true) {
          setWishlist();
        }
      }
    }

    return () => (mount.current = false);
  }, []);

  const data = useMemo(() => {
    switch (type) {
      case TYPES.ITEM:
        return getWishlist;
      case TYPES.INFORMATION:
        return getWishlistInfo;
      default:
        return getWishlist;
    }
  }, [fromNetwork, getWishlist, getWishlistInfo, type]);

  const setWishlist = async params => {
    if (params) {
      switch (type) {
        case TYPES.ITEM:
          const wishlistItems = _.get(params, 'wishlist.items_v2.items');
          if (wishlistItems) {
            const wishlistState = [];
            wishlistItems?.map(item => {
              const {id, name, thumbnail, url_key, price_range} = item.product;
              wishlistState.push({
                wishlistId: item.id,
                productId: id,
                name: name,
                image: thumbnail.url,
                url_key: url_key,
                price: price_range.maximum_price.final_price.value,
                __typename: 'WishlistItem',
              });
            });
            rxUserWIshlistItems(wishlistState);
          } else {
            const isAnArray = _.isArray(params);
            if (isAnArray) {
              rxUserWIshlistItems(params);
            } else {
              const wishlistState =
                getWishlist && getWishlist.length > 0 ? [...getWishlist] : [];
              const {id, name, thumbnail, url_key, price_range} =
                params.product;
              wishlistState.push({
                wishlistId: params.id,
                productId: id,
                name: name,
                image: thumbnail.url,
                url_key: url_key,
                price: price_range.maximum_price.final_price.value,
                __typename: 'WishlistItem',
              });

              rxUserWIshlistItems(wishlistState);
            }
          }
          break;
        case TYPES.INFORMATION:
          const wishlistInfo = _.get(params, 'wishlist');
          if (wishlistInfo) {
            rxWishlistDataInformation(wishlistInfo);
          }
          break;
        default:
          const wishlistItem = _.get(params, 'wishlist.items_v2.items');
          if (wishlistItem) {
            rxUserWIshlistItems(wishlistItem);
          }
          break;
      }
    } else {
      await fetchItems({params: null});
    }
  };

  const addToWishlist = async item => {
    const wishID = _.get(getWishlistInfo, 'id');
    if (userType === 'customer' && wishID) {
      const {sku} = item.product;
      try {
        await setWishlist(item);
        rxAppSnackbar({
          message: 'Product added to wishlist',
        });
        const response = await addItem({
          variables: {
            wishlistId: wishID,
            wishlistItems: [{sku, quantity: 1}],
          },
        });

        const dataParams = _.get(response, 'data.addProductsToWishlist');

        await setWishlist(dataParams);
      } catch (err) {
        rxAppSnackbar({
          message: 'Something went wrong',
        });
      }
    }
  };

  const removeFromWishlist = async item => {
    const wishID = _.get(getWishlistInfo, 'id');
    const wishItemID = _.get(item, 'wishlistId');
    if (userType === 'customer' && wishID) {
      const wishs =
        getWishlist && getWishlist.length > 0 ? [...getWishlist] : [];
      const tempWishlists = _.filter(wishs, function (obj) {
        return obj.wishlistId !== wishItemID;
      });
      setWishlist(tempWishlists);
      rxAppSnackbar({
        message: 'Product removed from wishlist',
      });
      try {
        const response = await removeItem({
          variables: {
            wishlistId: wishID,
            wishlistItemsIds: [wishItemID],
          },
        });
        const dataParams = _.get(response, 'data.removeProductsFromWishlist');
        await setWishlist(dataParams);
      } catch (err) {
        console.log(err);
        rxAppSnackbar({
          message: 'Something went wrong',
        });
      }
    }
  };

  useEffect(() => {
    const responseNetwork = _.get(fromNetwork, 'data.customer');
    if (responseNetwork) {
      setWishlist(responseNetwork);
    }
  }, [fromNetwork, type]);

  return {data, loading, error, addToWishlist, removeFromWishlist};
};

export default useWishlists;
