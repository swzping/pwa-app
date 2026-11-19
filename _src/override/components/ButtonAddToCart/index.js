import React, {useEffect, useState} from 'react';
import {StyleSheet, TextInput} from 'react-native';

import {ActivityIndicator, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';

import {useRoute} from '@react-navigation/native';

import {useReactiveVar} from '@apollo/client';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import Cart from '@app/assets/svgs/CartV2';
import CustomView from '@app/components/CustomView';
import RenderIf from '@app/components/RenderIf';
import Text from '@app/components/Text';
import {
  SIMPLE,
  TYPENAME_CONFIGURABLE,
  USER_GUEST,
} from '@app/helpers/Constants';
import {navigateTo} from '@app/helpers/Navigation';
import addToCartHook from '@app/hooks/carts/addToCart';
import useCarts, {TYPES} from '@app/hooks/carts/useCarts';
import {
  rxAppSnackbar,
  rxProductIdCartItemIdMap,
  rxUserType,
} from '@app/services/cache';
import {Colors} from '@app/styles';
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
  parent_sku,
  selectedOptions,
  styleProp = {},
  textStyleProp = {},
  loading = false,
  isWishlistSlider = false,
  itemPrice,
  currency,
  qtyButtonHeight = 32,
  label,
  onOpenVariantPopup,
}) => {
  const route = useRoute();
  const {t} = useTranslation();
  const [quantity, setQuantity] = useState(0);
  const [btnLoading, setBtnLoading] = useState(false);
  const {addToCart: addItemToCart, addCartLoading} = addToCartHook();
  const getRxUserType = useReactiveVar(rxUserType);
  const minQty = 1;
  const maxQty = _.get(item, 'stock_item.max_sale_qty');
  const getRxProductIdCartItemIdMap = useReactiveVar(rxProductIdCartItemIdMap);
  const [cartItemId, setCartItemId] = useState(null);
  const {updateQuantity, updateCartLoading} = useCarts({
    initialized: false,
    type: TYPES.INFO,
  });
  const [textInputQuantity, setTextInputQuantity] = useState(0);
  useEffect(() => {
    return setTextInputQuantity(quantity);
  }, [quantity]);
  useEffect(() => {
    const itemSku = item.sku;
    if (__DEV__) {
      // TEMP DIAG (remove after investigation)
      console.log(
        '[ATC-DIAG]',
        JSON.stringify({
          sku: itemSku,
          vps: item?.variant_parent_sku,
          typename: item?.__typename,
          type_id: item?.type_id,
          propType: type,
          hit: !_.isEmpty(getRxProductIdCartItemIdMap[itemSku]),
          keys: Object.keys(getRxProductIdCartItemIdMap),
        }),
      );
    }
    if (!_.isEmpty(getRxProductIdCartItemIdMap[itemSku])) {
      setQuantity(getRxProductIdCartItemIdMap[itemSku]?.quantity);
      setCartItemId(getRxProductIdCartItemIdMap[itemSku]?.cart_item_id);
    } else {
      setQuantity(0);
      setCartItemId(null);
    }
    // item.sku 必须作为依赖：FlashList 复用 cell 组件实例渲染新商品时 state 不会重置，
    // 缺少该依赖会导致 quantity/cartItemId 残留上一个商品的加购状态
  }, [getRxProductIdCartItemIdMap, item.sku]);
  useEffect(() => {
    // setBtnLoading(addCartLoading || updateCartLoading);
    setBtnLoading(false);
  }, [addCartLoading, updateCartLoading]);

  // 变体商品（父 configurable 或子 SKU）的按钮语义是「先选规格再加购」
  // （无 onOpenVariantPopup 时则跳 PDP 选择），文案统一用 Add to Cart；
  // 闪购列表 / 闪购卡片中的商品不分 simple 与变体，一律 Add to Cart；
  // 只有普通列表里的 simple 商品保留原来的简写 "Add"。
  // 闪购标记在不同 query 下可能是 1 / '1' / true，统一做真值归一。
  const isFlashSaleItem =
    item?.is_flash_sale === 1 ||
    item?.is_flash_sale === '1' ||
    item?.is_flash_sale === true;
  const isVariantItem =
    Boolean(item?.variant_parent_sku) || type === TYPENAME_CONFIGURABLE;
  const addButtonLabel =
    label ||
    (isFlashSaleItem || isVariantItem ? t('label.addToCart') : t('add'));

  const addToCart = async () => {
    if (!modules.guest_add_to_cart.enable && getRxUserType === USER_GUEST) {
      navigateTo(modules.auth_signin.enable, modules.auth_signin.name);
    } else if (item.type_id !== SIMPLE) {
      navigateTo(modules.product_detail.enable, modules.product_detail.name, {
        productUrlKey: item.url_key,
        productSku: item.sku,
      });
    } else {
      const defaultQty = getDefaultAddToCartQty(item);
      setQuantity(defaultQty);
      await addItemToCart({
        item,
        quantity: defaultQty,
        types: type,
        parentSku: parent_sku,
        selectedOptions,
        itemPrice,
        currency,
      });
    }
    trackAddToCart({
      location_name: route.name,
      sku_name: item.name,
      sku_id: item.sku,
      sku_current_price: itemPrice,
    });
  };

  /**
   * ---------------------------------------------------- *
   * @function onIncreaseQuantity
   * @summary for add +1 quantity product in modal
   * ---------------------------------------------------- *
   */
  const onIncreaseQuantity = async () => {
    clearTimeout(delayTimer);

    // Check if already at max quantity (max_sale_qty > 0 才有上限，0 表示无限)
    if (maxQty > 0 && quantity >= maxQty) {
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
      }, timeLimit);
      return;
    }

    let newQty = 0;
    if (quantity !== '') {
      newQty = parseInt(quantity) + 1;
    } else {
      newQty = minQty;
    }
    setQuantity(newQty);
    delayTimer = setTimeout(async () => {
      const result = await updateQuantity({
        item: {id: cartItemId},
        qty: newQty,
      });
      if (result && !result.ok) {
        // Revert to previous quantity on error
        setQuantity(quantity);
        rxAppSnackbar({message: result.message});
      }
    }, timeLimit);
  };

  /**
   * ---------------------------------------------------- *
   * @function decreaseQuantity
   * @summary for add -1 quantity product in modal
   * ---------------------------------------------------- *
   */
  const onDecreaseQuantity = async () => {
    clearTimeout(delayTimer);

    // Check if already at min quantity (0)
    if (quantity <= 0) {
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
      }, timeLimit);
      return;
    }

    if (quantity !== '' && parseInt(quantity) >= 1) {
      const newQty = parseInt(quantity) - 1;
      setQuantity(newQty);
      delayTimer = setTimeout(async () => {
        const result = await updateQuantity({
          item: {id: cartItemId},
          qty: newQty,
        });
        if (result && !result.ok) {
          // Revert to previous quantity on error
          setQuantity(quantity);
          rxAppSnackbar({message: result.message});
        }
      }, timeLimit);
    }
  };

  const onCheckLimit = value => {
    const parsedQty = parseInt(value);
    if (!isNaN(parsedQty)) {
      // checking max qty
      if (maxQty > 0 && parsedQty > maxQty) {
        setTextInputQuantity(maxQty);
      } else {
        setTextInputQuantity(parsedQty);
      }
    } else {
      setTextInputQuantity('');
    }
  };
  const onEndEditing = async () => {
    let newQty = textInputQuantity;
    if (!newQty || newQty === '' || newQty <= 0) {
      newQty = 1;
      setTextInputQuantity(1);
    }
    if (newQty === quantity) {
      return;
    }
    setQuantity(newQty);

    const result = await updateQuantity({item: {id: cartItemId}, qty: newQty});

    if (result && !result.ok) {
      // Revert to previous quantity on error
      setQuantity(quantity);
      setTextInputQuantity(quantity);
      rxAppSnackbar({message: result.message});
    }
  };

  // 变体商品（含闪购子 SKU）已在购物车时，要和 simple 一样落到下方 quantity > 0
  // 的计数器分支，否则这里提前 return 会让卡片永远停在 "Add"，压根读不到
  // rxProductIdCartItemIdMap 里的已购数量。
  // 计数器加减依赖 cartItemId（onIncrease/onDecreaseQuantity 里是 if (cartItemId)，
  // 拿不到 id 时静默无反应），所以 quantity 和 id 都齐备才算"可计数"。
  const isVariantInCart = quantity > 0 && Boolean(cartItemId);

  if (
    (item?.variant_parent_sku || type === TYPENAME_CONFIGURABLE) &&
    !isVariantInCart
  ) {
    return (
      <CustomView horizontalCenter verticalCenter style={{width: '100%'}}>
        <CustomView
          row
          onPress={onOpenVariantPopup}
          borderColor={Colors.BLACK}
          borderRadius={4}
          horizontalCenter
          verticalCenter
          marginVertical={10}
          width={'100%'}
          backgroundColor={Colors.PRIMARY}
          style={[{borderColor: Colors.BLACK}, styleProp]}>
          <RenderIf condition={loading}>
            <ActivityIndicator
              style={{
                padding: 5,
              }}
            />
          </RenderIf>
          <RenderIf condition={!loading}>
            <CustomView row>
              <CustomView verticalCenter>
                <Cart color={Colors.WHITE} width={22} height={22} />
              </CustomView>
              <Text
                center
                color={Colors.WHITE}
                style={[styles.textStyle, textStyleProp]}>
                {addButtonLabel}
              </Text>
            </CustomView>
          </RenderIf>
        </CustomView>
      </CustomView>
    );
  }

  return (
    <CustomView horizontalCenter verticalCenter style={{width: '100%'}}>
      <RenderIf condition={btnLoading}>
        <Button
          mode={'outline'}
          loading
          uppercase={false}
          style={{
            width: '100%',
            height: qtyButtonHeight,
            marginTop: 10,
            marginBottom: 10,
          }}
          labelStyle={{fontSize: 12}}
          color={Colors.PRIMARY}>
          {t('loading')}
        </Button>
      </RenderIf>
      <RenderIf condition={!btnLoading}>
        <RenderIf condition={!isWishlistSlider && quantity > 0}>
          <CustomView
            row
            horizontalCenter
            verticalCenter
            spaceBetween
            backgroundColor={Colors.WHITE}
            height={qtyButtonHeight}
            marginVertical={10}
            width={'100%'}>
            <CustomView
              horizontalCenter
              verticalCenter
              height="100%"
              flex
              flexNumber={1}
              borderColor={Colors.GRAY_LIGHT}
              style={{
                maxHeight: qtyButtonHeight,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderBottomWidth: 1,
                borderTopLeftRadius: 4,
                borderBottomLeftRadius: 4,
              }}
              onPress={() => {
                onDecreaseQuantity();
              }}>
              <Icon
                name="minus"
                size={20}
                color={quantity > 0 ? Colors.PRIMARY : Colors.GRAY_DARK}
              />
            </CustomView>

            <CustomView
              horizontalCenter
              verticalCenter
              // flex
              flexNumber={2}
              border={1}
              borderColor={Colors.GRAY_LIGHT}
              style={{
                height: qtyButtonHeight,
                maxHeight: qtyButtonHeight,
                // maxWidth: 80,
              }}>
              <TextInput
                style={{
                  padding: 0,
                  color: Colors.BLACK,
                  width: '100%',
                  textAlign: 'center',
                  fontSize: 12,
                }}
                value={textInputQuantity.toString()}
                editable={true}
                onEndEditing={onEndEditing}
                onChangeText={onCheckLimit}
                keyboardType="number-pad"
              />
            </CustomView>

            <CustomView
              verticalCenter
              horizontalCenter
              flex
              flexNumber={1}
              height="100%"
              borderColor={Colors.GRAY_LIGHT}
              style={{
                maxHeight: qtyButtonHeight,
                borderTopWidth: 1,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderTopRightRadius: 4,
                borderBottomRightRadius: 4,
              }}
              onPress={
                maxQty > 0 && quantity >= maxQty ? () => {} : onIncreaseQuantity
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
        </RenderIf>
        <RenderIf condition={quantity === 0}>
          <CustomView
            row
            onPress={addToCart}
            borderColor={Colors.BLACK}
            borderRadius={4}
            horizontalCenter
            verticalCenter
            marginVertical={10}
            width={'100%'}
            backgroundColor={Colors.PRIMARY}
            style={[{borderColor: Colors.BLACK}, styleProp]}>
            <RenderIf condition={loading}>
              <ActivityIndicator
                style={{
                  padding: 5,
                }}
              />
            </RenderIf>
            <RenderIf condition={!loading}>
              <CustomView row>
                <CustomView verticalCenter>
                  <Cart color={Colors.WHITE} width={22} height={22} />
                </CustomView>
                <Text
                  center
                  color={Colors.WHITE}
                  style={[styles.textStyle, textStyleProp]}>
                  {addButtonLabel}
                </Text>
              </CustomView>
            </RenderIf>
          </CustomView>
        </RenderIf>
      </RenderIf>
    </CustomView>
  );
};

const styles = StyleSheet.create({
  textStyle: {
    padding: 10,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ButtonAddToCart;
