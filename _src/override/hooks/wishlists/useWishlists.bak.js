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
import {onHandleError} from '@app/hooks/customer/useDataCustomer';
import {USER_CUSTOMER} from '@app/helpers/Constants';
import {useTranslation} from 'react-i18next';

export const TYPES = {
  INFORMATION: 'INFORMATION',
  ITEM: 'ITEM',
};

const useWishlists = ({
  initialized = false,
  type = TYPES.ITEM,
  configErr = null,
}) => {
  const {
    data: fromNetwork,
    error,
    loading,
    onRefetchData: fetchItems,
    setSchemas,
  } = useSwitchQuery({
    withVariables: false,
    configErr,
  });

  const mount = useRef();
  const userType = useReactiveVar(rxUserType);
  const getWishlist = useReactiveVar(rxUserWIshlistItems);
  const getWishlistInfo = useReactiveVar(rxWishlistDataInformation);

  const {add, remove, get, getInformation} = wishlistSchema();

  const [addItem] = useMutation(add);
  const [removeItem] = useMutation(remove);
  const {t} = useTranslation();

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
              const id = item?.product?.id ?? item?.id;
              const sku = item?.product?.sku ?? item?.sku;
              const {
                name,
                thumbnail,
                url_key,
                price_range,
                small_image,
                image,
                type_id,
              } = item.product;
              wishlistState.push({
                wishlistId: item.id,
                productId: id,
                name: name,
                image: thumbnail?.url || small_image?.url || image?.url,
                url_key: url_key,
                type_id: type_id,
                price_range,
                sku: sku,
                __typename: 'WishlistItem',
              });
            });
            rxUserWIshlistItems(wishlistState);
          } else {
            const isAnArray = _.isArray(params);
            if (isAnArray) {
              rxUserWIshlistItems(params);
            } else {
              const id = params?.product?.id ?? params?.id;
              const sku = params?.product?.sku ?? params?.sku;
              const name = params?.product?.name ?? params?.name;
              const thumbnail = params?.product?.thumbnail ?? params?.thumbnail;
              const url_key = params?.product?.url_key ?? params?.url_key;
              const image = params?.product?.image ?? params?.image;
              const type_id = params?.product?.type_id ?? params?.type_id;
              const price_range =
                params?.product?.price_range ?? params?.price_range;
              const small_image =
                params?.product?.small_image ?? params?.small_image;
              const wishlistState =
                getWishlist && getWishlist.length > 0 ? [...getWishlist] : [];

              wishlistState.push({
                wishlistId: params.id,
                productId: id,
                name: name,
                image: thumbnail?.url || small_image?.url || image?.url,
                url_key: url_key,
                price:
                  price_range?.maximum_price?.final_price?.value ||
                  price_range?.maximum_price?.regular_price?.value,
                sku: sku,
                type_id: type_id,
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
    // const wishID = _.get(getWishlistInfo, 'id');
    if (userType === USER_CUSTOMER) {
      const wishID = 0;
      let backupWishlistState = [];
      if (getWishlist && getWishlist.length > 0) {
        backupWishlistState = [...getWishlist];
      }
      const sku = item?.product?.sku ?? item?.sku;

      try {
        await setWishlist(item);
        const variables = {
          wishlistId: wishID,
          wishlistItems: [{sku, quantity: 1}],
        };
        const response = await addItem({variables});
        const dataParams = _.get(response, 'data.addProductsToWishlist');
        const dataParamsFinal = dataParams ? dataParams : backupWishlistState;
        setWishlist(dataParamsFinal);
        rxAppSnackbar({message: t('label.productAddedWishlist')});
      } catch (err) {
        console.log('[err] add wishlist', err);
        await setWishlist(backupWishlistState);
        onHandleError(err);
      }
    }
  };

  const removeFromWishlist = async item => {
    const wishID = _.get(getWishlistInfo, 'id');
    const wishItemID = _.get(item, 'wishlistId');
    if (userType === 'customer' && wishID) {
      let wishs = [];
      let backupWishlistState = [];
      if (getWishlist && getWishlist.length > 0) {
        wishs = [...getWishlist];
        backupWishlistState = [...getWishlist];
      }
      const tempWishlists = _.filter(wishs, function (obj) {
        return obj.wishlistId !== wishItemID;
      });
      setWishlist(tempWishlists);
      try {
        const response = await removeItem({
          variables: {
            wishlistId: wishID,
            wishlistItemsIds: [wishItemID],
          },
        });
        const dataParams = _.get(response, 'data.removeProductsFromWishlist');
        const dataParamsFinal = dataParams ? dataParams : backupWishlistState;
        await setWishlist(dataParamsFinal);
        rxAppSnackbar({
          message: t('label.productRemoveWishlist'),
        });
      } catch (err) {
        await setWishlist(backupWishlistState);
        onHandleError(err);
      }
    }
  };

  useEffect(() => {
    const responseNetwork = _.get(fromNetwork, 'data.customer');
    if (type && responseNetwork) {
      setWishlist(responseNetwork);
    }
  }, [fromNetwork, type]);

  return {data, loading, error, addToWishlist, removeFromWishlist};
};

export default useWishlists;
