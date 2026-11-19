import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Image, ImageBackground, TouchableOpacity, View} from 'react-native';

import {ActivityIndicator, TouchableRipple} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Icon from 'react-native-vector-icons/FontAwesome';

import FastImage from '@d11/react-native-fast-image';
import {modules} from '@root/swift.config';

import _ from 'lodash';
import {useTranslation} from 'react-i18next';

import ButtonRemoveItemFromCart from '@app/_modules/cart/atoms/ButtonRemoveItemFromCart/index';
import CustomInputQty from '@app/_modules/cart/atoms/CustomInputQty/index';
import styles from '@app/_modules/cart/styles';
import FlashSaleIcon from '@app/assets/svgs/FlashSaleIcon';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import ProductBadges from '@app/components/ProductBadges/index';
import RenderIf from '@app/components/RenderIf/index';
import Text from '@app/components/Text';
import ToggleWishlist from '@app/components/ToggleWishlist';
import {IN_STOCK, IS_IOS} from '@app/helpers/Constants';
import DateHelper from '@app/helpers/Date';
import {numberFormat, shortenText} from '@app/helpers/General';
import {Colors, Mixins} from '@app/styles';
import {Typography} from '@app/styles/index';
import {normalize} from '@app/styles/mixins';
import {MAX_WIDTH} from '@app/styles/mixins.new';

const VariantSelector = ({optionLabel, onChangeVariant}) => {
  if (!onChangeVariant) {
    return (
      <Text
        style={{
          fontWeight: '700',
          fontSize: 12,
          color: Colors.GRAY_DARK,
        }}
        numberOfLines={1}
        ellipsizeMode="tail">
        {optionLabel}
      </Text>
    );
  }

  return (
    <TouchableRipple
      style={{
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.PRIMARY,
        borderRadius: 24,
        height: 24,
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onChangeVariant}>
      <CustomView row>
        <Text
          style={{
            fontWeight: '700',
            fontSize: 12,
            color: Colors.PRIMARY,
          }}
          numberOfLines={1}
          ellipsizeMode="tail">
          {optionLabel}
        </Text>

        <Image
          source={require('@app/assets/images/arrow_down.png')}
          style={{
            width: 16,
            height: 16,
            marginLeft: 2,
          }}
        />
      </CustomView>
    </TouchableRipple>
  );
};

const ListCart = ({
  item,
  customFinalPrice,
  itemDiscount,
  onNavigateToProductDetail,
  edit,
  useDelete,
  useGiftChange,
  wishlistId,
  getPrice,
  isViewOnly = false,
  showQtyOnly = false,
  showQtyLine = false,
  onChange,
  onChangeVariant,
}) => {
  const isFreeGift = !!_.get(item, 'is_free_gift');
  // 与 is_free_gift 独立的另一个赠品类型：游戏化任务奖励商品
  const isGamificationFreeGift =
    _.get(item, 'is_gamification_free_gift') === true;
  // if (isFreeGift) {
  //   return null;
  // }

  const [editQty, setEditQty] = useState(false);
  const {t} = useTranslation();

  const url =
    _.get(item, 'product.url_key') ||
    _.get(item, 'url_key') ||
    _.get(item, 'product_url_key');
  const image = useMemo(() => {
    return (
      _.get(item, 'configured_variant.small_image.url') ||
      _.get(item, 'product.small_image.url') ||
      _.get(item, 'thumbnail.url')
    );
  }, [item]);
  const name = _.get(item, 'product.name') || _.get(item, 'product_name');
  const quantity = _.get(item, 'quantity') || _.get(item, 'quantity_ordered');
  // 优先使用 final_price（已包含折扣的实际价格）
  const finalPrice = _.get(
    item,
    'product.price_range.maximum_price.final_price.value',
  );
  const price =
    customFinalPrice ||
    (finalPrice != null ? finalPrice : null) ||
    _.get(item, 'prices.price.value') ||
    _.get(item, 'product_sale_price.value') ||
    _.get(item, 'custom_price.row_total.value') ||
    0;

  const currencyItem =
    _.get(item, 'prices.price.currency') ||
    _.get(item, 'custom_price.row_total.currency') ||
    'IDR';

  const loadingPerItem = !!(item.edit || item.hide);

  const id = _.get(item, 'id');
  const productID = _.get(item, 'product.id');
  // 订单详情的 item 是扁平结构，sku 在 product_sku 上（既非 product.sku 也非顶层 sku），
  // 补上兜底以便跳 PDP 时能带上正确的 productSku 去按 sku 预选变体。
  const sku =
    _.get(item, 'product.sku') ||
    _.get(item, 'sku') ||
    _.get(item, 'product_sku');
  const isProductStockStatus =
    _.get(item, 'configured_variant.stock_status') ||
    _.get(item, 'product.stock_status') ||
    _.get(item, 'stock_status');

  let IS_STOCK_ENABLE = isProductStockStatus === IN_STOCK;

  const IS_BUNDLE_PRODUCT = _.get(item, '__typename') === 'BundleCartItem';
  const isVariant = item.__typename === 'ConfigurableCartItem';

  const availStock = _.get(item, 'product.stock_item.salable_qty');
  let IS_LESS_STOCK =
    IS_STOCK_ENABLE && availStock < quantity && !IS_BUNDLE_PRODUCT;

  if (isViewOnly) {
    IS_STOCK_ENABLE = true;
    IS_LESS_STOCK = false;
  }

  // 闪购信息可能挂在三个位置：普通商品挂在 item.product 上；变体（configurable）
  // 商品的闪购属性既可能在被选中的具体子变体 configured_variant 上，也可能挂在
  // 父级 product 上（取决于后台把闪购配在父级还是子 sku）；订单详情则用
  // is_flash_sale_item 标记。三者都要判断，且不同查询里后台可能返回 1 或 true，
  // 因此统一做真值归一，否则 FS 变体商品在购物车/迷你购物车/结算/订单页不显示倒计时与角标。
  const isFlashSaleFlag = value =>
    value === 1 || value === true || value === '1';
  const isFlashSale =
    isFlashSaleFlag(_.get(item, 'product.is_flash_sale')) ||
    isFlashSaleFlag(_.get(item, 'configured_variant.is_flash_sale')) ||
    isFlashSaleFlag(_.get(item, 'is_flash_sale_item'));

  const rawSpecialToDate =
    _.get(item, 'configured_variant.special_to_date') ||
    _.get(item, 'product.special_to_date') ||
    _.get(item, 'special_to_date');
  const specialToDate = useMemo(() => {
    if (!rawSpecialToDate) {
      return null;
    }
    return DateHelper.convertUTCToIndonesia(rawSpecialToDate);
  }, [rawSpecialToDate]);

  const optionLabel = isVariant
    ? IS_STOCK_ENABLE
      ? item.configurable_options
          ?.map(option => option.value_label)
          ?.filter(Boolean)
          ?.join(', ')
      : t('cart.changeOtherVariant')
    : '';

  const normalizeDateValue = value => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'string') {
      const normalized = value.includes(' ') ? value.replace(' ', 'T') : value;
      const parsed = new Date(normalized);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };

  const normalizedEndDate = useMemo(
    () => normalizeDateValue(specialToDate),
    [specialToDate],
  );

  const getRemainingMs = dateValue => {
    if (!dateValue) {
      return null;
    }
    const indonesiaTimeNow = DateHelper.getIndonesiaTimeNow();
    return Math.max(dateValue.getTime() - indonesiaTimeNow.getTime(), 0);
  };

  const [remainingMs, setRemainingMs] = useState(() =>
    getRemainingMs(normalizedEndDate),
  );
  const countdownIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isFlashSale || !normalizedEndDate) {
      setRemainingMs(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      return;
    }

    const updateRemaining = () => {
      if (!mountedRef.current) {
        return;
      }
      const nextRemaining = getRemainingMs(normalizedEndDate);
      setRemainingMs(nextRemaining);
      if (nextRemaining === 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };

    updateRemaining();
    countdownIntervalRef.current = setInterval(updateRemaining, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, [isFlashSale, normalizedEndDate]);

  const formattedCountdown = useMemo(() => {
    if (remainingMs == null || remainingMs === 0) {
      return null;
    }
    const totalSeconds = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hours} : ${minutes} : ${seconds}`;
  }, [remainingMs]);

  const isFlashSaleActive = isFlashSale && formattedCountdown !== null;

  let displayPrice = price;
  let displayItemDiscount = itemDiscount;

  if (isFlashSale) {
    if (isFlashSaleActive) {
      displayPrice = price;
      displayItemDiscount = itemDiscount;
    } else {
      const flashSaleRegularPrice = _.get(
        item,
        'product.price_range.maximum_price.regular_price.value',
      );

      const calculatedRegularPrice =
        flashSaleRegularPrice != null
          ? flashSaleRegularPrice
          : itemDiscount > 0
          ? price + itemDiscount
          : price;

      displayPrice = calculatedRegularPrice;
      displayItemDiscount = 0;
    }
  }

  const displayCurrency = currencyItem;

  const onPressEditQty = () => {
    setEditQty(!editQty);
  };

  return (
    <CustomView
      row
      flex
      width={'100%'}
      // paddingHorizontal={isFreeGift ? 40 : 20}
      marginVertical={15}
      style={[
        styles.cartItemContainer,
        {
          // gamification 赠品不应用 is_free_gift 的缩进样式
          paddingLeft: isFreeGift && !isGamificationFreeGift ? 40 : 20,
          paddingRight: 20,
        },
      ]}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          flex: 1,
        }}
        onPress={() =>
          loadingPerItem || !IS_STOCK_ENABLE || showQtyLine
            ? false
            : onNavigateToProductDetail({
                ...item,
                productUrlKey: url,
                productSku: sku,
                // 购物车里的 configurable 变体项，顶层 item.uid 是 quote item 的 uid，
                // 而 PDP getDefaultVariant 是按 variants[].product.uid 匹配变体来预选规格的。
                // 必须传 configured_variant.uid（变体产品 uid），否则从购物车进详情页不会
                // 勾选到购物车里那条对应的规格（如 Black 200ml）。
                uid: _.get(item, 'configured_variant.uid') || item.uid,
              })
        }>
        <CustomView
          horizontalStart
          width={Mixins.MAX_WIDTH * 0.33}
          style={
            ([{opacity: !IS_STOCK_ENABLE ? 0.4 : 1}], {position: 'relative'})
          }>
          {image ? (
            <ImageBackground
              key={url}
              style={styles.cartItemImage}
              backgroundColor={Colors.WHITE}
              source={{
                uri: image,
                priority: FastImage.priority.normal,
              }}
              resizeMode={FastImage.resizeMode.contain}>
              <RenderIf
                condition={isFlashSale && (isFlashSaleActive || isViewOnly)}>
                <CustomView
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 8,
                    zIndex: 2,
                  }}>
                  <FlashSaleIcon width={32} height={32} />
                </CustomView>
              </RenderIf>
              <RenderIf condition={item?.product?.promo}>
                <CustomView style={[styles.cartItemPromoWrapper]}>
                  <Text style={[styles.cartItemPromo]}>
                    {shortenText(item?.product?.promo ?? '', 20)}
                  </Text>
                </CustomView>
              </RenderIf>
              <RenderIf condition={!IS_STOCK_ENABLE}>
                <CustomView style={styles.outOfStockOverlay}>
                  <CustomView
                    backgroundColor={'rgba(0,0,0,0.5)'}
                    paddingHorizontal={12}
                    borderRadius={12}
                    style={styles.outOfStockContainer}>
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  </CustomView>
                </CustomView>
              </RenderIf>
            </ImageBackground>
          ) : (
            <CustomView style={{position: 'relative'}}>
              <CustomView
                width={Mixins.MAX_WIDTH * 0.3}
                height={150}
                backgroundColor={Colors.GRAY_LIGHT}
              />
              <RenderIf condition={!IS_STOCK_ENABLE}>
                <CustomView style={styles.outOfStockOverlay}>
                  <CustomView
                    backgroundColor={'rgba(0,0,0,0.5)'}
                    paddingHorizontal={12}
                    borderRadius={12}
                    style={styles.outOfStockContainer}>
                    <Text style={styles.outOfStockText}>Out of Stock</Text>
                  </CustomView>
                </CustomView>
              </RenderIf>
            </CustomView>
          )}
        </CustomView>
        <CustomView flexNumber={3}>
          <CustomView style={{opacity: !IS_STOCK_ENABLE ? 0.4 : 1}}>
            <Text style={{marginBottom: IS_IOS ? 8 : 5, fontSize: 14}}>
              {name}
            </Text>
          </CustomView>
          <RenderIf condition={isVariant}>
            <VariantSelector
              optionLabel={optionLabel}
              onChangeVariant={onChangeVariant}
            />
          </RenderIf>
          <CustomView style={{opacity: !IS_STOCK_ENABLE ? 0.4 : 1}}>
            <RenderIf condition={item.customizable_options?.length > 0}>
              {item.customizable_options?.map((option, indexOpt) => (
                <CustomView row marginBottom={5} key={indexOpt}>
                  <Text bold style={styles.cartItemDetailText}>
                    {option.label}
                  </Text>
                  {option.values.map((value, index) => (
                    <Text key={index} bold style={styles.cartItemDetailText}>
                      {`: ${value.label}`}
                    </Text>
                  ))}
                </CustomView>
              ))}
            </RenderIf>
            <RenderIf condition={item.bundle_options?.length > 0}>
              {item.bundle_options?.map((bundle, index) => (
                <CustomView
                  key={index}
                  marginBottom={5}
                  width={Mixins.MAX_WIDTH / 3}>
                  <Text bold style={styles.cartItemDetailText}>
                    {bundle.label}:
                  </Text>
                  {bundle.values.map((value, indexVal) => (
                    <Text key={indexVal} bold style={styles.cartItemDetailText}>
                      {`${value.label || value.product_name} + ${numberFormat(
                        value.price.currency || 'IDR',
                        value.price.value || value.price,
                        ',',
                        2,
                      )}`}
                    </Text>
                  ))}
                </CustomView>
              ))}
            </RenderIf>
            <RenderIf condition={!showQtyOnly && !!displayPrice}>
              {!isFreeGift ? (
                <Text bold style={{fontSize: 14}}>
                  {numberFormat(displayCurrency, displayPrice, ',', 2)}
                </Text>
              ) : (
                <Text bold style={{fontSize: 14}}>
                  Qty x {quantity}
                </Text>
              )}
            </RenderIf>
            <RenderIf condition={showQtyLine}>
              {!isFreeGift ? (
                <Text style={styles.cartItemRightText}>x{quantity}</Text>
              ) : (
                <Text bold style={{fontSize: 14}}>
                  Qty x {quantity}
                </Text>
              )}
            </RenderIf>
            <RenderIf condition={displayItemDiscount > 0 && !isViewOnly}>
              <CustomView row marginTop={0}>
                <Text lineThrough small_12 color={Colors.GRAY_SMOOTH5}>
                  {numberFormat(
                    displayCurrency,
                    (displayPrice + displayItemDiscount)?.toFixed(2),
                    ',',
                    2,
                  )}
                </Text>
                <View
                  style={{
                    height: 14,
                    backgroundColor: Colors.RED_LIGHT_1,
                    borderRadius: 2,
                    marginLeft: 5,
                  }}>
                  <Text
                    xsmall
                    color={Colors.WHITE}
                    center
                    bold
                    style={{paddingRight: 5, paddingLeft: 5}}>
                    -{' '}
                    {Math.round(
                      (displayItemDiscount * 100) /
                        (price + displayItemDiscount) ?? 0,
                    )?.toFixed(0)}
                    %
                  </Text>
                </View>
              </CustomView>
            </RenderIf>

            {!isFreeGift && <ProductBadges item={item?.validOffers} />}
            <CustomView row spaceBetween marginTop={10} width={100}>
              {!isViewOnly &&
                modules.cart.atoms.update_item_qty_input.enable && (
                  <>
                    {!isFreeGift && !isGamificationFreeGift ? (
                      <CustomInputQty
                        t={t}
                        initialQuantity={quantity}
                        cartItemId={id}
                        item={item}
                        backgroundColor={Colors.WHITE}
                        colorText={Colors.BLACK}
                        colorIcon={Colors.GRAY_DARK}
                        styleInput={{padding: IS_IOS ? 10 : 8}}
                        loadingChange={loadingPerItem}
                        isInStock={IS_STOCK_ENABLE}
                        getPrice={getPrice}
                      />
                    ) : (
                      <Text bold style={{fontSize: 14}}>
                        Qty x {quantity}
                      </Text>
                    )}
                  </>
                )}
            </CustomView>
            <RenderIf condition={isFlashSaleActive}>
              <CustomView
                marginTop={isViewOnly && !item?.validOffers?.length ? -28 : 8}>
                <Text style={{color: '#FF8200', fontSize: 14}}>
                  Ends in {formattedCountdown}
                </Text>
              </CustomView>
            </RenderIf>
          </CustomView>
          <RenderIf condition={IS_LESS_STOCK}>
            <Text
              style={{
                color: 'red',
                fontSize: 14,
                fontWeight: IS_IOS ? 'bold' : null,
                ...Typography.FONT_BOLD,
              }}>
              {`${t('cart.lessStock')} ${availStock}`}
            </Text>
          </RenderIf>
          <View
            style={{
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: Mixins.MAX_WIDTH * 0.55,
              // gamification 赠品不应用 is_free_gift 的缩进样式
              paddingRight: isFreeGift && !isGamificationFreeGift ? 15 : 0,
            }}>
            {showQtyOnly ? (
              <></>
            ) : (
              <>
                <RenderIf condition={!isFreeGift}>
                  <Text style={{fontSize: 14}}>Item Total</Text>
                  <Text primary bold style={{fontSize: 14}}>
                    {numberFormat(
                      displayCurrency,
                      displayPrice * quantity,
                      ',',
                      2,
                    )}
                  </Text>
                </RenderIf>
                <RenderIf condition={isFreeGift && !showQtyLine}>
                  <Text style={{fontSize: 14}}>Free Gift</Text>
                  <RenderIf
                    condition={useGiftChange && !isGamificationFreeGift}>
                    <Button
                      onPress={onChange}
                      label={'Change'}
                      borderRadius={999}
                      width={'fit-width'}
                      textStyleProp={{
                        padding: 0,
                        fontWeight: '600',
                        fontSize: 10,
                        lineHeight: 12,
                        textAlign: 'center',
                        color: Colors.PRIMARY,
                      }}
                      styleProp={{
                        height: 20,
                        backgroundColor: '#ffe7ba',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingHorizontal: 8,
                      }}
                    />
                  </RenderIf>
                </RenderIf>
                <RenderIf condition={isFreeGift && showQtyLine}>
                  <Text style={{fontSize: 14}}>Item Total</Text>
                  <Text primary bold style={{fontSize: 14}}>
                    Free Gift
                  </Text>
                </RenderIf>
              </>
            )}
          </View>
        </CustomView>
      </TouchableOpacity>
      <RenderIf condition={useDelete && !isGamificationFreeGift}>
        <ButtonRemoveItemFromCart
          item={item}
          propStyle={styles.cartDelete}
          loadingChange={loadingPerItem}
          getPrice={getPrice}>
          {loadingPerItem ? (
            <ActivityIndicator color={Colors.PRIMARY} size={16} />
          ) : (
            <Image
              source={require('@app/assets/images/cart_product_delete.png')}
              style={{width: 24, height: 24}}
            />
          )}
        </ButtonRemoveItemFromCart>
      </RenderIf>
      <RenderIf condition={edit && !isGamificationFreeGift}>
        <CustomView
          style={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
          <CustomView
            backgroundColor={editQty ? Colors.WHITE : Colors.PRIMARY}
            borderColor={Colors.PRIMARY}
            border={1}
            width={30}
            height={30}
            horizontalCenter
            verticalCenter
            borderRadius={20}
            marginBottom={10}
            onPress={loadingPerItem ? false : onPressEditQty}>
            <Icon
              name="pencil"
              size={15}
              color={editQty ? Colors.PRIMARY : Colors.WHITE}
            />
          </CustomView>
          <ToggleWishlist
            item={item}
            productId={productID}
            wishlistItemId={wishlistId}
            productName={name}
            productSku={sku}
            productPrice={displayPrice}
            productCurrency={displayCurrency}
            styleProp={styles.wishlistIcon}
            iconSize={normalize(15)}
            isPrimary
            loadingChange={loadingPerItem}
          />
          <ButtonRemoveItemFromCart
            item={item}
            propStyle={styles.cartItemActionIcon}
            loadingChange={loadingPerItem}
            getPrice={getPrice}>
            <EvilIcons
              style={{alignItems: 'flex-start', justifyContent: 'flex-start'}}
              name="trash"
              size={normalize(25)}
              color={Colors.WHITE}
            />
          </ButtonRemoveItemFromCart>
        </CustomView>
      </RenderIf>
      <View style={{border: MAX_WIDTH, color: Colors.GRAY_LIGHT}} />
    </CustomView>
  );
};

export default ListCart;
