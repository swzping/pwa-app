import React, {useEffect, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/AntDesign';

import {useRoute} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

// import Cart from '@app/assets/svgs/Cart';
import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import CustomView from '@app/components/CustomView/index';
import Show from '@app/components/Show/index';
import Text from '@app/components/Text';
import {OUT_OF_STOCK, TYPENAME_CONFIGURABLE} from '@app/helpers/Constants';
import {USER_GUEST} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import {startPerfTrace} from '@app/helpers/perf';
import addToCartHook from '@app/hooks/carts/addToCart';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import {
  rxAppSnackbar,
  rxProductIdCartItemIdMap,
  rxUserType,
} from '@app/services/cache';
import {Colors, Mixins} from '@app/styles';
import {trackAddToCart} from '@app/track';

let delayTimer;
const timeLimit = 500;
const getDefaultAddToCartQty = product => {
  const minSaleQty = Number(_.get(product, 'stock_item.min_sale_qty'));
  return minSaleQty > 1 ? minSaleQty : 1;
};

const ButtonAddToCart = ({
  item,
  type,
  parentSku,
  selectedOptions,
  selectedVariant,
  disabled,
  itemPrice,
  currency,
  onQuantityChange,
  onNotifyMe,
  onAddToCartByVariant,
  onBuyNowByVariant,
}) => {
  const route = useRoute();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const minQty = 0;
  const maxQty = _.get(item, 'stock_item.max_sale_qty');

  const [quantity, setQuantity] = useState(0);
  const buyNowInProgressRef = useRef(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const getRxProductIdCartItemIdMap = useReactiveVar(rxProductIdCartItemIdMap);
  const [cartItemId, setCartItemId] = useState(null);
  const {updateQuantity} = useCarts({
    initialized: false,
    type: TYPES.INFO,
  });

  const {addToCart: addItemToCart} = addToCartHook();

  const getRxUserType = useReactiveVar(rxUserType);
  const isOOSProduct = item?.stock_status === OUT_OF_STOCK;
  const isVariantOOS = selectedVariant?.product?.stock_status === OUT_OF_STOCK;
  const isVariantFlashSale = selectedVariant?.product?.is_flash_sale === 1;
  const isFlashSale = item?.is_flash_sale === 1;

  // configurable PDP 底部要按「当前选中的具体变体 sku」反查购物车已购数量，
  // 而不是父 sku：同一父商品的不同变体各自是独立购物车行，父 sku 作为 map key
  // 会被后写入的变体覆盖、不可靠（见 updateProductCartItemMap 的双 key 记录）。
  const effectiveSku =
    type === TYPENAME_CONFIGURABLE
      ? selectedVariant?.product?.sku || item?.sku
      : item?.sku;

  useEffect(() => {
    if (!_.isEmpty(getRxProductIdCartItemIdMap[effectiveSku])) {
      setQuantity(getRxProductIdCartItemIdMap[effectiveSku]?.quantity);
      setCartItemId(getRxProductIdCartItemIdMap[effectiveSku]?.cart_item_id);
    } else {
      setQuantity(0);
      setCartItemId(null);
    }
  }, [getRxProductIdCartItemIdMap, effectiveSku]);

  /**
   * ---------------------------------------------------- *
   * @function onIncreaseQuantity
   * @summary for add +1 quantity product
   * ---------------------------------------------------- *
   */
  const onIncreaseQuantity = async () => {
    clearTimeout(delayTimer);

    // Check if already at max quantity (max_sale_qty > 0 才有上限，0 表示无限)
    if (maxQty > 0 && quantity >= maxQty) {
      // Still call onQuantityChange to handle loading state
      if (onQuantityChange) {
        onQuantityChange(quantity + 1, true, false);
      }
      // Call API to get the actual error message from backend
      delayTimer = setTimeout(async () => {
        if (cartItemId) {
          const result = await updateQuantity({
            item: {id: cartItemId},
            qty: quantity + 1,
          });
          if (result && !result.ok) {
            rxAppSnackbar({message: result.message});
          }
        }
        // Call onQuantityChange again to stop loading
        if (onQuantityChange) {
          onQuantityChange(quantity + 1, false, false);
        }
      }, timeLimit);
      return;
    }

    const itemFinal =
      type === TYPENAME_CONFIGURABLE ? selectedVariant?.product : item;
    let newQty = 0;
    if (!cartItemId) {
      newQty = getDefaultAddToCartQty(itemFinal);
    } else if (quantity !== '') {
      newQty = parseInt(quantity) + 1;
    } else {
      newQty = minQty;
    }
    setQuantity(newQty);
    if (onQuantityChange) {
      onQuantityChange(newQty, true, false);
    }
    delayTimer = setTimeout(async () => {
      if (!cartItemId) {
        await addItemToCart({
          item: itemFinal,
          quantity: newQty,
          types: type,
          parentSku,
          selectedOptions,
          itemPrice,
          currency,
        });

        trackAddToCart({
          location_name: route.name,
          sku_name: item.name,
          sku_id: item.sku,
          sku_current_price: itemPrice,
        });
      } else {
        const result = await updateQuantity({
          item: {id: cartItemId},
          qty: newQty,
        });
        if (!result.ok) {
          // Revert to previous quantity on error
          setQuantity(quantity);
          rxAppSnackbar({message: result.message});
          return;
        }
      }
      if (onQuantityChange) {
        onQuantityChange(newQty, false, false);
      }
    }, timeLimit);
  };

  /**
   * ---------------------------------------------------- *
   * @function decreaseQuantity
   * @summary for add -1 quantity product
   * ---------------------------------------------------- *
   */
  const onDecreaseQuantity = async () => {
    clearTimeout(delayTimer);

    // Check if already at min quantity (0)
    if (quantity <= 0) {
      // Still call onQuantityChange to handle loading state
      if (onQuantityChange) {
        onQuantityChange(quantity - 1, true, true);
      }
      // Call API to get the actual error message from backend
      delayTimer = setTimeout(async () => {
        if (cartItemId) {
          const result = await updateQuantity({
            item: {id: cartItemId},
            qty: quantity - 1,
          });
          if (result && !result.ok) {
            rxAppSnackbar({message: result.message});
          }
        }
        // Call onQuantityChange again to stop loading
        if (onQuantityChange) {
          onQuantityChange(quantity - 1, false, true);
        }
      }, timeLimit);
      return;
    }

    if (quantity !== '' && parseInt(quantity) >= 1) {
      const newQty = parseInt(quantity) - 1;
      setQuantity(newQty);
      if (onQuantityChange) {
        onQuantityChange(newQty, true, true);
      }
      delayTimer = setTimeout(async () => {
        if (cartItemId) {
          const result = await updateQuantity({
            item: {id: cartItemId},
            qty: newQty,
          });
          if (!result.ok) {
            // Revert to previous quantity on error
            setQuantity(quantity);
            rxAppSnackbar({message: result.message});
            return;
          }
        }
        if (onQuantityChange) {
          onQuantityChange(newQty, false, true);
        }
      }, timeLimit);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onAddToCart
   * @summary add item to cart
   * ---------------------------------------------------- *
   */
  const onAddToCart = async () => {
    // 开始 pdpAdd2Cart trace
    const addCartTrace = await startPerfTrace('pdpAdd2Cart');
    const addCartStartTime = Date.now();

    try {
      if (!modules.guest_add_to_cart.enable && getRxUserType === USER_GUEST) {
        const duration = Date.now() - addCartStartTime;
        addCartTrace.putMetric('duration_ms', duration);
        addCartTrace.putAttribute('status', 'guest_blocked');
        addCartTrace.stop();
        navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
        return false;
      }

      const itemFinal =
        type === TYPENAME_CONFIGURABLE ? selectedVariant?.product : item;
      const defaultQty = getDefaultAddToCartQty(itemFinal);

      if (onQuantityChange) {
        onQuantityChange(defaultQty, true, false);
      }

      const res = await addItemToCart({
        item: itemFinal,
        quantity: defaultQty,
        types: type,
        parentSku,
        selectedOptions,
        itemPrice,
        currency,
      });

      if (res?.data?.addProductsToCart?.user_errors?.length) {
        return false;
      }

      if (onQuantityChange) {
        onQuantityChange(defaultQty, false, false);
      }

      // 添加成功
      const duration = Date.now() - addCartStartTime;
      addCartTrace.putAttribute(
        'product_sku',
        itemFinal?.sku || item?.sku || '',
      );
      addCartTrace.putAttribute(
        'product_id',
        itemFinal?.id?.toString() || item?.id?.toString() || '',
      );
      addCartTrace.putMetric('duration_ms', duration);
      addCartTrace.putAttribute('status', 'success');
      addCartTrace.stop();
      return true;
    } catch (error) {
      // 添加失败
      const duration = Date.now() - addCartStartTime;
      addCartTrace.putMetric('duration_ms', duration);
      addCartTrace.putAttribute('status', 'error');
      addCartTrace.putAttribute(
        'error_reason',
        error?.message || 'unknown_error',
      );
      addCartTrace.stop();
      return false;
    }
  };

  const goCheckout = () => {
    navigateTo(modules.cart_checkout.enable, modules.cart_checkout.name);
  };

  /**
   * ---------------------------------------------------- *
   * @function onBuyNow
   * @summary 立即购买：先把当前产品加入购物车，再跳转结账页
   * 期望行为：
   * - cart = 0，点 Buy now(A) → 购物车 = [A]
   * - cart = 2，点 Buy now(A) → 购物车 = [item1, item2, A]
   * （addItemToCart 内部会对已存在的商品做数量合并）
   * ---------------------------------------------------- *
   */
  const onBuyNow = async () => {
    if (isOOSProduct) {
      onNotifyMe();
      return;
    }
    // 防重复点击：加购进行中直接忽略
    if (buyNowInProgressRef.current) {
      return;
    }
    buyNowInProgressRef.current = true;
    try {
      // 判断当前商品是否已在购物车：
      // 用购物车 map（rxProductIdCartItemIdMap），而非 quantity state——
      // quantity 会被步进器本地修改，不能反映真实购物车状态。
      const itemSku = item?.sku;
      const isInCart = !_.isEmpty(getRxProductIdCartItemIdMap[itemSku]);

      if (!isInCart) {
        // 未加购：先加购，加购期间按钮显示 loading
        setBuyNowLoading(true);
        const added = await onAddToCart();
        if (!added) {
          // 加购失败（含 guest 拦截已跳登录），不进入结账页
          return;
        }
      }
      goCheckout();
    } finally {
      buyNowInProgressRef.current = false;
      setBuyNowLoading(false);
    }
  };

  /**
   * ---------------------------------------------------- *
   * @function onPressActionButton
   * @summary function for pressing action button
   * ---------------------------------------------------- *
   */
  const onPressActionButton = () => {
    onBuyNow();
  };

  // 选中变体已在购物车（有数量且有 cartItemId）时，底部左侧改为数量步进器，
  // 右侧仍保留 Buy now / Flash Buy Now；未加购时维持原「Add to cart + Buy now」。
  const isVariantInCart = quantity > 0 && Boolean(cartItemId);

  if (type === TYPENAME_CONFIGURABLE) {
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 72 + insets.bottom,
          width: Mixins.MAX_WIDTH,
        }}>
        <CustomView
          row
          height={48}
          backgroundColor={Colors.WHITE}
          style={{
            position: 'absolute',
            bottom: 10 + insets.bottom,
            width: Mixins.MAX_WIDTH,
          }}>
          {isVariantInCart ? (
            <CustomView
              horizontalCenter
              verticalCenter
              flex
              style={{
                borderWidth: 1,
                borderColor: Colors.GRAY_LIGHT,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
              }}>
              <CustomView row flex>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  flexNumber={2}
                  borderColor={Colors.GRAY_LIGHT}
                  onPress={onDecreaseQuantity}>
                  <Icon
                    name="minus"
                    size={20}
                    color={quantity > 0 ? Colors.PRIMARY : Colors.GRAY_DARK}
                  />
                </CustomView>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  flexNumber={3}
                  style={{borderRightWidth: 1, borderLeftWidth: 1}}
                  borderColor={Colors.GRAY_LIGHT}>
                  <Text style={{fontSize: 18}}>{quantity}</Text>
                </CustomView>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  flexNumber={2}
                  borderColor={Colors.GRAY_LIGHT}
                  onPress={
                    maxQty > 0 && quantity >= maxQty
                      ? () => {}
                      : onIncreaseQuantity
                  }>
                  <Icon
                    name="plus"
                    size={20}
                    style={{
                      opacity: maxQty > 0 && quantity >= maxQty ? 0.2 : 1,
                    }}
                    color={
                      !(maxQty > 0) || quantity < maxQty
                        ? Colors.PRIMARY
                        : Colors.GRAY_DARK
                    }
                  />
                </CustomView>
              </CustomView>
            </CustomView>
          ) : (
            <Show when={!isVariantOOS}>
              <CustomView
                onPress={disabled ? false : onAddToCartByVariant}
                flex
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: Colors.PRIMARY,
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginHorizontal: 10,
                }}>
                <Text xlarge bold color={Colors.PRIMARY}>
                  Add to cart
                </Text>
              </CustomView>
            </Show>
          )}

          <CustomView
            onPress={
              disabled ? false : isVariantOOS ? onNotifyMe : onBuyNowByVariant
            }
            horizontalCenter
            verticalCenter
            flex
            backgroundColor={
              disabled ? Colors.PRIMARY_DISABLED : Colors.PRIMARY
            }
            style={{
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: Colors.PRIMARY,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 10,
            }}>
            <Show when={isVariantOOS}>
              <Text xlarge bold color={Colors.WHITE}>
                {t('notifyMe')}
              </Text>
            </Show>
            <Show when={!isVariantOOS}>
              <CustomView
                flex
                style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text xlarge bold color={Colors.WHITE}>
                  {isVariantFlashSale ? 'Flash Buy Now' : 'Buy now'}
                </Text>
              </CustomView>
            </Show>
          </CustomView>
        </CustomView>
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        height: 72 + insets.bottom,
        width: Mixins.MAX_WIDTH,
      }}>
      <CustomView
        row
        height={48}
        backgroundColor={Colors.WHITE}
        style={{
          position: 'absolute',
          bottom: 10 + insets.bottom,
          width: Mixins.MAX_WIDTH,
        }}>
        <Show when={!isOOSProduct}>
          <Show when={quantity === 0}>
            <CustomView
              onPress={onAddToCart}
              flex
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: Colors.PRIMARY,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
              }}>
              <Text xlarge bold color={Colors.PRIMARY}>
                Add to cart
              </Text>
            </CustomView>
          </Show>

          <Show when={quantity > 0}>
            <CustomView
              horizontalCenter
              verticalCenter
              flex
              // width={Mixins.MAX_WIDTH * 0.6}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: Colors.GRAY_LIGHT,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 10,
              }}>
              <CustomView row flex>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  flexNumber={2}
                  borderColor={Colors.GRAY_LIGHT}
                  onPress={onDecreaseQuantity}
                  // style={{
                  //   borderTopWidth: 1,
                  //   borderBottomWidth: 1,
                  //   borderLeftWidth: 1,
                  // }}
                >
                  <Icon
                    name="minus"
                    size={20}
                    style={{borderRadius: 10}}
                    color={quantity > 0 ? Colors.PRIMARY : Colors.GRAY_DARK}
                  />
                  {/*<FontAwesomeIcons*/}
                  {/*  name={'minus'}*/}
                  {/*  size={20}*/}
                  {/*  style={{borderRadius: 10}}*/}
                  {/*  color={*/}
                  {/*    quantity > minQty ? Colors.PRIMARY : Colors.GRAY_MEDIUM*/}
                  {/*  }*/}
                  {/*/>*/}
                </CustomView>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  flexNumber={3}
                  // border={1}
                  style={{borderRightWidth: 1, borderLeftWidth: 1}}
                  borderColor={Colors.GRAY_LIGHT}>
                  <Text style={{fontSize: 18}}>{quantity}</Text>
                </CustomView>
                <CustomView
                  flex
                  horizontalCenter
                  verticalCenter
                  flexNumber={2}
                  borderColor={Colors.GRAY_LIGHT}
                  onPress={
                    maxQty > 0 && quantity >= maxQty
                      ? () => {}
                      : onIncreaseQuantity
                  }
                  // style={{
                  //   borderTopWidth: 1,
                  //   borderBottomWidth: 1,
                  //   borderRightWidth: 1,
                  // }}
                >
                  <Icon
                    name="plus"
                    size={20}
                    style={{
                      opacity: maxQty > 0 && quantity >= maxQty ? 0.2 : 1,
                    }}
                    color={
                      !(maxQty > 0) || quantity < maxQty
                        ? Colors.PRIMARY
                        : Colors.GRAY_DARK
                    }
                  />
                  {/*<FontAwesomeIcons*/}
                  {/*  name={'plus'}*/}
                  {/*  size={20}*/}
                  {/*  color={*/}
                  {/*    !maxQty || (maxQty && quantity < maxQty)*/}
                  {/*      ? Colors.PRIMARY*/}
                  {/*      : Colors.GRAY_MEDIUM*/}
                  {/*  }*/}
                  {/*/>*/}
                </CustomView>
              </CustomView>
            </CustomView>
          </Show>
        </Show>

        <CustomView
          onPress={disabled || buyNowLoading ? false : onPressActionButton}
          horizontalCenter
          verticalCenter
          flex
          // width={!isOOSProduct ? Mixins.MAX_WIDTH * 0.4 : Mixins.MAX_WIDTH}
          backgroundColor={disabled ? Colors.PRIMARY_DISABLED : Colors.PRIMARY}
          style={{
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: Colors.PRIMARY,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 10,
          }}>
          <Show when={isOOSProduct}>
            <Text xlarge bold color={Colors.WHITE}>
              {t('notifyMe')}
            </Text>
          </Show>
          <Show when={!isOOSProduct}>
            {/*<CustomView row>*/}
            {/*  <CustomView verticalCenter marginRight={10}>*/}
            {/*    <Cart />*/}
            {/*  </CustomView>*/}
            {/*  <Text xlarge bold color={Colors.WHITE}>*/}
            {/*    {t('add')}*/}
            {/*  </Text>*/}
            {/*</CustomView>*/}

            <CustomView
              flex
              row
              style={{alignItems: 'center', justifyContent: 'center'}}>
              {buyNowLoading && (
                <ActivityIndicator
                  style={{marginRight: 2}}
                  size="small"
                  color={Colors.WHITE}
                />
              )}
              <Text xlarge bold color={Colors.WHITE}>
                {isFlashSale ? 'Flash Buy Now' : 'Buy now'}
              </Text>
            </CustomView>
          </Show>
        </CustomView>
      </CustomView>
    </View>
  );
};

export default ButtonAddToCart;
