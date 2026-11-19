import {useMutation, useReactiveVar} from '@apollo/client';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import AnalyticsHelper, {EVENT_TOKEN} from '@app/helpers/Analytics';
import {
  TYPENAME_BUNDLE,
  TYPENAME_CONFIGURABLE,
  TYPENAME_VARIANT,
  TYPENAME_VIRTUAL,
} from '@app/helpers/Constants';
import {
  ADD_VARIANT_TO_CART,
  addBundleItemToCartOptimal,
  addConfigurableItemToCartOptimal,
  addSimpleItemToCartOptimal,
  addVirtualItemToCartOptimal,
} from '@app/hooks/carts/optimalSchema';
import {onHandleError} from '@app/hooks/customer/useDataCustomer';
import {
  rxAppSnackbar,
  rxCartId,
  rxCartQty,
  rxProductIdCartItemIdMap,
} from '@app/services/cache';

export const updateProductCartItemMap = cartItemsData => {
  const productIdCartItemIdMap = {};
  if (cartItemsData?.length > 0) {
    cartItemsData.forEach(cartItem => {
      const {
        id,
        product,
        quantity: qty,
        is_free_gift,
        configured_variant,
      } = cartItem;
      const key = is_free_gift
        ? `${product?.sku}_${is_free_gift}`
        : product?.sku;
      productIdCartItemIdMap[key] = {
        cart_item_id: id,
        quantity: qty,
      };
      // configurable（变体）商品：同时按具体变体 sku 记录一份，
      // 供 variant Buy Now 判断“当前选中的具体变体是否已在购物车”（父 sku key 保留兼容 simple/PDP）
      if (configured_variant?.sku) {
        productIdCartItemIdMap[configured_variant.sku] = {
          cart_item_id: id,
          quantity: qty,
        };
      }
    });
  }
  rxProductIdCartItemIdMap(productIdCartItemIdMap);
};

const AddToCartHook = () => {
  const {t} = useTranslation();
  const cartID = useReactiveVar(rxCartId);
  const [addSimple, {loading: addCartLoading}] = useMutation(
    addSimpleItemToCartOptimal,
  );
  const [addVirtual] = useMutation(addVirtualItemToCartOptimal);
  const [addConfigurable] = useMutation(addConfigurableItemToCartOptimal);
  const [addBundle] = useMutation(addBundleItemToCartOptimal);
  const [AddVariantToCart] = useMutation(ADD_VARIANT_TO_CART);

  /**
   * ---------------------------------------------------- *
   * @const setCartByResponse
   * @summary set cart by response for simple & configurable product
   * ---------------------------------------------------- *
   */
  const setCartByResponse = ({
    response,
    productType,
    analyticItem,
    quantity,
  }) => {
    if (productType === TYPENAME_BUNDLE || productType === TYPENAME_VIRTUAL) {
      let dataParams = null;
      if (productType === TYPENAME_BUNDLE) {
        dataParams = _.get(response, 'data.addBundleProductsToCart.cart');
      } else {
        dataParams = _.get(response, 'data.addVirtualProductsToCart.cart');
      }

      if (dataParams) {
        const cartCount = _.get(dataParams, 'total_quantity');
        if (typeof cartCount === 'number') {
          rxCartQty(cartCount);
        }
        updateProductCartItemMap(_.get(dataParams, 'items'));
        rxAppSnackbar({
          message: t('message.successProductAdded'),
        });

        /** add to cart analytic */
        const analyticPrice = parseInt(
          analyticItem?.itemPrice?.value || analyticItem?.itemPrice || '0',
        );
        const analyticItemId = analyticItem?.id?.toString() || '';
        AnalyticsHelper.eventAddItemCartGA({
          currency: analyticItem?.currency,
          value: analyticPrice,
          items: [
            {
              item_id: analyticItemId,
              price: analyticPrice,
            },
          ],
        });
      }
    } else {
      const dataParams = _.get(response, 'data.addProductsToCart.cart');
      const isSuccess = _.get(
        response,
        'data.addProductsToCart.toastr_message.status',
      );

      if (dataParams && isSuccess) {
        const cartCount = _.get(dataParams, 'total_quantity');
        if (typeof cartCount === 'number') {
          rxCartQty(cartCount);
        }
        updateProductCartItemMap(_.get(dataParams, 'items'));
        rxAppSnackbar({
          message: t('message.successProductAdded'),
        });

        /** add to cart analytic */
        const analyticPrice = parseInt(
          analyticItem?.itemPrice?.value || analyticItem?.itemPrice || '0',
        );
        const analyticItemId = analyticItem?.id?.toString() || '';
        AnalyticsHelper.eventAddItemCartGA({
          currency: analyticItem?.currency,
          value: analyticPrice,
          items: [
            {
              item_id: analyticItemId,
              price: analyticPrice,
            },
          ],
        });
      } else {
        const errors = _.get(response, 'data.addProductsToCart.user_errors');
        const toastr = _.get(response, 'data.addProductsToCart.toastr_message');
        // 失败时服务端依然回传了权威的购物车数据，同步一次角标，
        // 避免加购被拒后角标长期停在旧值
        const failedCartCount = _.get(dataParams, 'total_quantity');
        if (typeof failedCartCount === 'number') {
          rxCartQty(failedCartCount);
        }
        // onHandleError 只认写死的几条服务端文案，闪购限额这类
        // （code: INSUFFICIENT_STOCK / "Not enough items for sale"）不在名单里，
        // 会被静默丢弃 —— 用户点了加购既没提示、角标也不动，看起来像“没反应”。
        // 已知文案继续走 onHandleError 的定制处理，没人接管时用 toastr_message 兜底。
        const handled = onHandleError(errors?.[0] || {});
        if (!handled) {
          rxAppSnackbar({
            message:
              toastr?.message ||
              errors?.[0]?.message ||
              t('message.somethingWrong'),
            type: 'failed',
          });
        }
        updateProductCartItemMap(_.get(dataParams, 'items'));
      }
    }
  };

  const addToCart = async ({
    item,
    types,
    quantity,
    parentSku,
    selectedOptions,
    itemPrice,
    currency,
  }) => {
    AnalyticsHelper.trackAdjustEvent(EVENT_TOKEN.ADD_TO_CART);
    rxAppSnackbar({
      message: t('message.processAdding'),
    });

    if (!cartID) {
      return;
    }

    //get the sku of the product
    const skuProduct = _.get(item, 'sku');

    try {
      let response = null;
      if (types === TYPENAME_CONFIGURABLE) {
        response = await addConfigurable({
          variables: {
            cartId: cartID,
            cartItems: [
              {
                quantity,
                sku: skuProduct,
              },
            ],
          },
        });
      } else if (types === TYPENAME_BUNDLE) {
        response = await addBundle({
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
      } else if (types === TYPENAME_VIRTUAL) {
        response = await addVirtual({
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
      } else if (types === TYPENAME_VARIANT) {
        response = await AddVariantToCart({
          variables: {
            cartId: cartID,
            cartItem: {
              sku: parentSku,
              quantity,
              selected_options: selectedOptions,
            },
          },
        });
      } else {
        //simple product
        response = await addSimple({
          variables: {
            cartId: cartID,
            cartItems: [
              {
                quantity,
                sku: skuProduct,
              },
            ],
          },
        });
      }

      setCartByResponse({
        response,
        productType: types,
        analyticItem: {...item, itemPrice, currency},
        quantity,
      });

      return response;
    } catch (err) {
      onHandleError(err);
    }
  };

  return {
    addToCart,
    addCartLoading,
  };
};

export default AddToCartHook;
