import {useEffect, useMemo, useRef} from 'react';
import {useReactiveVar, useMutation, useApolloClient} from '@apollo/client';
import {
  rxCartId,
  rxCartDataAddress,
  rxCartDataItem,
  rxCartDataPrice,
  rxUserWIshlistItems,
  rxUserType,
  rxAppSnackbar,
} from '@app/services/cache';
import cartSchema from '@app/hooks/carts/schema';
import useSwitchQuery from '@app/hooks/useSwitchQuery';
import _ from 'lodash';
import wishlistHelpers from '@app/hooks/carts/wishlistHelpers';
import {
  TYPENAME_BUNDLE,
  TYPENAME_CONFIGURABLE,
  TYPENAME_VIRTUAL,
} from '@app/helpers/Constants';

export const TYPES = {
  ITEM: 'ITEM',
  ADDRESS: 'ADDRESS',
  PRICE: 'PRICE',
};

const useCarts = ({initialized = false, type}) => {
  const client = useApolloClient();
  const {
    data: fromNetwork,
    error,
    loading,
    queryVariables,
    onRefetchData: fetchItems,
    setSchemas,
    setQueryVariables,
  } = useSwitchQuery({
    withVariables: true,
  });

  const mount = useRef();

  const cartID = useReactiveVar(rxCartId);
  const wishlists = useReactiveVar(rxUserWIshlistItems);
  const userType = useReactiveVar(rxUserType);

  const {
    getItems,
    getAddress,
    getPrice,
    addSimpleItemToCart,
    addConfigurableItemToCart,
    addBundleItemToCart,
    addVirtualItemToCart,
    removeItemOnCart,
    updateItemOnCart,
  } = cartSchema();

  const [addSimple] = useMutation(addSimpleItemToCart);
  const [addVirtual] = useMutation(addVirtualItemToCart);
  const [addConfigurable] = useMutation(addConfigurableItemToCart);
  const [addBundle] = useMutation(addBundleItemToCart);

  const [removeItem] = useMutation(removeItemOnCart);

  const [updateQty] = useMutation(updateItemOnCart);

  useEffect(() => {
    if (mount) {
      mount.current = true;
      if (mount.current) {
        setQueryVariables({
          cartID,
        });

        switch (type) {
          case TYPES.ITEM:
            setSchemas(getItems);
            break;
          case TYPES.ADDRESS:
            setSchemas(getAddress);
            break;
          case TYPES.PRICE:
            setSchemas(getPrice);
            break;
          default:
            setSchemas(getItems);
            break;
        }

        if (initialized) {
          setCart();
        }
      }
    }

    return () => (mount.current = false);
  }, []);

  const getCartItems = useReactiveVar(rxCartDataItem);
  const getCartAddress = useReactiveVar(rxCartDataAddress);
  const getCartPrice = useReactiveVar(rxCartDataPrice);

  const data = useMemo(() => {
    switch (type) {
      case TYPES.ITEM:
        const appendWishlist = wishlistHelpers({
          carts: getCartItems,
          userType,
          wishlists,
        });
        return appendWishlist;
      case TYPES.ADDRESS:
        return getCartAddress;
      case TYPES.PRICE:
        return getCartPrice;
      default:
        return getCartItems;
    }
  }, [
    type,
    fromNetwork,
    getCartPrice,
    getCartItems,
    getCartAddress,
    wishlists,
  ]);

  const setCart = async params => {
    if (params) {
      switch (type) {
        case TYPES.ITEM:
          const cartItems = _.get(params, 'items');
          if (cartItems) {
            rxCartDataItem(cartItems);
          }
          break;
        case TYPES.ADDRESS:
          let dataAddress = {shipping_addresses: null, billing_address: null};
          const shippingAddress = _.get(params, 'shipping_addresses');
          const billingAddress = _.get(params, 'billing_address');
          if (shippingAddress) {
            dataAddress.shipping_addresses = shippingAddress;
          }
          if (billingAddress) {
            dataAddress.billing_address = billingAddress;
          }
          rxCartDataAddress(dataAddress);
          break;
        case TYPES.PRICE:
          const dataPrice = _.get(params, 'prices');
          if (dataPrice) {
            rxCartDataPrice(dataPrice);
          }
          break;
        default:
          const cartItem = _.get(params, 'items');
          const cartPrice = _.get(params, 'prices');
          if (cartItem) {
            rxCartDataItem(cartItem);
          }
          if (cartPrice) {
            rxCartDataPrice(cartPrice);
          }
          break;
      }
    } else {
      await fetchItems({params: queryVariables});
    }
  };

  /**
   * Add to cart function
   * @param {object, string, number} product product to be added, its type and quantity
   * @param {function} callback function to be called from view
   */
  const addToCart = async (
    {item, types, quantity, parentSku, selectedOptions},
    callback,
  ) => {
    if (cartID) {
      //get the sku of the product
      const skuProduct = _.get(item, 'sku');
      // get the cart items from reactive variable
      const carts = getCartItems && getCartItems.length > 0 ? getCartItems : [];
      // add the quantity if selected product already in cart
      const existedItem = _.map(carts, function (cart) {
        return cart.product.sku === skuProduct
          ? {...cart, quantity: cart.quantity + quantity}
          : cart;
      });

      //check if product is in cart
      const isExist = _.find(carts, function (obj) {
        return obj.product.sku === skuProduct;
      });

      // if existed
      const tempItem = isExist
        ? existedItem
        : [...carts, {product: item, quantity, id: skuProduct}];

      // set to reactive var before mutation
      setCart({items: tempItem});
      rxAppSnackbar({
        message: 'Product added to cart',
      });

      // run the callback if exist
      if (callback) {
        await callback();
      }

      try {
        if (types === TYPENAME_CONFIGURABLE) {
          const response = await addConfigurable({
            variables: {
              input: {
                cart_id: cartID,
                cart_items: [
                  {
                    parent_sku: parentSku,
                    data: {
                      quantity,
                      sku: skuProduct,
                    },
                  },
                ],
              },
            },
          });
          const dataParams = _.get(
            response,
            'data.addItemConfigurableCart.cart',
          );
          if (dataParams) {
            setCart(dataParams);
          }
        } else if (types === TYPENAME_BUNDLE) {
          const response = await addBundle({
            variables: {
              input: {
                cart_id: cartID,
                cart_items: [
                  {
                    bundle_options: selectedOptions,
                    data: {
                      quantity,
                      sku: skuProduct,
                    },
                  },
                ],
              },
            },
          });
          const dataParams = _.get(
            response,
            'data.addItemConfigurableCart.cart',
          );
          if (dataParams) {
            setCart(dataParams);
          }
        } else if (types === TYPENAME_VIRTUAL) {
          const response = await addVirtual({
            variables: {
              input: {
                cart_id: cartID,
                cart_items: [
                  {
                    customizable_options: [],
                    data: {
                      quantity,
                      sku: skuProduct,
                    },
                  },
                ],
              },
            },
          });
          const dataParams = _.get(
            response,
            'data.addVirtualProductsToCart.cart',
          );
          if (dataParams) {
            setCart(dataParams);
          }
        } else {
          //simple product
          const response = await addSimple({
            variables: {
              input: {
                cart_id: cartID,
                cart_items: [
                  {
                    data: {
                      quantity,
                      sku: skuProduct,
                    },
                  },
                ],
              },
            },
          });

          const dataParams = _.get(
            response,
            'data.addSimpleProductsToCart.cart',
          );
          if (dataParams) {
            setCart(dataParams);
          }
        }
      } catch (err) {
        rxAppSnackbar({
          message: 'Something went wrong, please try again',
        });
      }
    }
  };

  const removeFromCart = async ({item}) => {
    if (cartID) {
      const carts = getCartItems && getCartItems.length > 0 ? getCartItems : [];
      const itemToBeRemoved = _.filter(carts, function (obj) {
        return obj.product.sku !== item.product.sku;
      });

      setCart({items: itemToBeRemoved});
      rxAppSnackbar({
        message: 'Product removed',
      });

      try {
        await removeItem({
          variables: {
            input: {
              cart_id: cartID,
              cart_item_id: item.id,
            },
          },
        });

        // const dataParams = _.get(response, 'data.removeItemFromCart.cart');

        // setCart(dataParams);
      } catch (err) {
        rxAppSnackbar({
          message: 'Something went wrong',
        });
      }
    }
  };

  const updateQuantity = async ({item, qty}) => {
    if (cartID) {
      try {
        const carts =
          getCartItems && getCartItems.length > 0 ? getCartItems : [];
        const tempCart = _.map(carts, function (obj) {
          if (obj.id === item.id) {
            return {...obj, quantity: qty};
          } else {
            return obj;
          }
        });

        //reactive var
        setCart({items: tempCart});

        rxAppSnackbar({
          message: 'Product quantity updated',
        });
        await updateQty({
          variables: {
            input: {
              cart_id: cartID,
              cart_items: [
                {
                  cart_item_id: item.id,
                  quantity: qty,
                },
              ],
            },
          },
        });
        // const dataParams = _.get(response, 'data.updateCartItems.cart');

        //reactive var
        // setCart(dataParams);
      } catch (err) {
        rxAppSnackbar({
          message: 'Something went wrong',
        });
      }
    }
  };

  const compareLocal = async () => {
    const res = await client.query({
      variables: queryVariables,
      query: getPrice,
    });
    const priceRemote = _.get(
      res,
      'data.cart.prices.subtotal_excluding_tax.value',
    );
    const priceLocal = _.get(getCartPrice, 'subtotal_excluding_tax.value');
    if (priceLocal === priceRemote) {
      return true;
    } else {
      rxAppSnackbar({
        message: 'Ada barang yang tidak bisa diproses',
      });
      setCart();
      return false;
    }
  };

  useEffect(() => {
    const response = _.get(fromNetwork, 'data.cart');
    if (response) {
      setCart(response);
    }
  }, [fromNetwork, type]);

  return {
    data,
    error,
    loading,
    setCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    compareLocal,
  };
};

export default useCarts;
