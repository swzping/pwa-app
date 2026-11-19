import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/Feather';

import {useReactiveVar} from '@apollo/client';

import {useTranslation} from 'react-i18next';

import CheckBox from '@app/_modules/product_list/atoms/Checkbox';
import I from '@app/assets/svgs/I';
import Button from '@app/components/Button';
import CustomView from '@app/components/CustomView';
import {DARK} from '@app/helpers/Constants';
import useCustomMutation from '@app/hooks/useCustomMutation';
import useCustomQuery from '@app/hooks/useCustomQuery';
import {rxAppSnackbar, rxUserTheme} from '@app/services/cache';
import {Colors} from '@app/styles';

import {FREE_GIFT_OPTIONS, SWAP_FREE_GIFT} from '../services/schema';
import {useSelection} from '../services/useSelection';

const InputQty = ({
  initialQuantity = 0,
  backgroundColor,
  colorText,
  style,
  styleInput,
  loadingChange = false,
  isInStock,
  maxQty,
  onChange,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const scheme = useReactiveVar(rxUserTheme);
  const color = scheme === DARK ? Colors.WHITE : Colors.BLACK;
  const onDecreaseQuantity = () => {
    if (quantity <= 0) {
      return;
    }
    setQuantity(quantity - 1);
    onChange && onChange(quantity - 1);
  };

  const onIncreaseQuantity = () => {
    setQuantity(quantity + 1);
    onChange && onChange(quantity + 1);
  };

  const handleChange = value => {
    const parsedQty = parseInt(value);
    let qty = '';
    if (!isNaN(parsedQty)) {
      if (maxQty && parsedQty > maxQty) {
        qty = maxQty;
      } else {
        qty = parsedQty;
      }
    }
    setQuantity(qty);
    onChange && onChange(qty);
  };

  return (
    <CustomView
      style={[
        styles.customInputQty,
        {opacity: loadingChange ? 0.4 : 1},
        {
          borderRadius: 5,
          borderWidth: 1,
          borderColor: Colors.GRAY_LIGHT,
          overflow: 'hidden',
        },
        style,
      ]}>
      <CustomView
        style={{
          opacity: quantity <= 0 ? 0.2 : 1,
          borderRightWidth: 1,
          borderColor: Colors.GRAY_LIGHT,
          height: 32,
          width: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={loadingChange || !isInStock ? false : onDecreaseQuantity}>
        <Icon name="minus" size={20} color={Colors.PRIMARY} />
      </CustomView>
      <TextInput
        value={quantity.toString()}
        keyboardType="number-pad"
        editable={true}
        onChangeText={handleChange}
        style={[
          styles.quantityInput,
          {
            backgroundColor: backgroundColor,
            borderRadius: 10,
            height: 30,
            paddingVertical: 0,
            textAlign: 'center',
            color: colorText || color,
            borderColor: color,
          },
          styleInput,
        ]}
      />
      <CustomView
        style={{
          opacity: !(maxQty && quantity < maxQty) ? 0.2 : 1,
          borderLeftWidth: 1,
          borderColor: Colors.GRAY_LIGHT,
          height: 32,
          width: 32,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={
          loadingChange || !isInStock || !(maxQty && quantity < maxQty)
            ? () => {}
            : onIncreaseQuantity
        }>
        <Icon name="plus" size={20} color={Colors.PRIMARY} />
      </CustomView>
    </CustomView>
  );
};

const ProductItem = ({
  t,
  item,
  selected,
  initialQuantity,
  onChangeCheckBox,
  onChangeQuantity,
}) => {
  return (
    <CustomView
      row
      marginTop={12}
      paddingHorizontal={16}
      borderColor={Colors.GRAY_MEDIUM}
      style={styles.productItem}>
      <CheckBox
        uncheckedColor={'#969696'}
        checkedColor={Colors.PRIMARY}
        onPress={() => onChangeCheckBox(!selected)}
        checkedSize={18}
        size={18}
        radius={2}
        selected={selected}
        style={styles.containerCheck}
      />
      <Image style={styles.giftImage} source={{uri: item.image_url}} />
      <CustomView flex={1} spaceBetween style={styles.info}>
        <Text style={styles.productName}>{item.name}</Text>
        <CustomView row horizontalCenter spaceBetween widht="100%" height={32}>
          <Text style={styles.freeGift}>Free Gift</Text>
          {/* need rewrite custom input qty component */}
          {selected && (
            <InputQty
              key={`${item.sku}-${item.reserved_qty}`}
              t={t}
              item={item}
              maxQty={item.allowed_qty}
              initialQuantity={initialQuantity}
              isInStock={item.is_in_stock}
              onChange={quantity => {
                onChangeQuantity(quantity);
              }}
            />
          )}
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

const GiftSelectionModal = ({visible, data, onClose, onSuccess}) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  const {t} = useTranslation();

  const [disabled, setDisabled] = useState(true);

  const {
    data: giftData,
    loading: giftDataLoading,
    onRefetchData: getGiftData,
  } = useCustomQuery({
    schema: FREE_GIFT_OPTIONS,
    opts: {fetchPolicy: 'network-only'},
  });

  const freeGiftOptions = giftData?.data?.freeGiftOptions || {};

  const maxTotal = freeGiftOptions.max_select || 0;

  const {selectedMap, toggle, total, reset} = useSelection({
    maxTotal,
  });

  const {onRefetchData: swapFreeGift, loading: freeGiftLoading} =
    useCustomMutation({
      schema: SWAP_FREE_GIFT,
    });

  const initSelectedMap = useCallback(() => {
    if (!freeGiftOptions.items) {
      return;
    }

    const initialMap = {};

    freeGiftOptions.items.forEach(item => {
      if (item.reserved_qty > 0) {
        initialMap[item.sku] = item.reserved_qty;
      }
    });

    reset(initialMap);
  }, [freeGiftOptions.items, reset]);

  const handleConfirm = async () => {
    const selections = Object.keys(selectedMap).map(key => ({
      sku: key,
      qty: selectedMap[key],
    }));

    const {data: swapData} = await swapFreeGift({
      params: {
        input: {
          cart_id: data.cartId,
          item_id: data.itemId,
          selections,
        },
      },
      paramsOpt: {isReturn: true},
    });

    onClose();

    if (swapData?.swapFreeGift?.success) {
      rxAppSnackbar({type: 'success', message: swapData.swapFreeGift.message});
      onSuccess && onSuccess();
    }
  };

  const handleCancel = () => {
    initSelectedMap();
    onClose();
  };

  useEffect(() => {
    if (visible) {
      getGiftData({
        params: {
          input: {cart_id: data.cartId, item_id: data.itemId},
        },
      });
    }
  }, [visible]);

  useEffect(() => {
    initSelectedMap();
  }, [giftData]);

  useEffect(() => {
    if (total === maxTotal) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [total, maxTotal]);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.pointsModalOverlay}>
        <View style={styles.pointsModalContent}>
          {/* header */}
          <CustomView
            row
            padding={20}
            onPress={freeGiftLoading ? undefined : handleCancel}
            style={styles.closeIcon}>
            <Icon name="x" size={24} color="#000000" />
          </CustomView>
          {/* content */}
          <CustomView flex={1}>
            <CustomView row style={styles.methodExpress}>
              <I width={20} height={20} color={Colors.PRIMARY} />
              <Text style={styles.giftSelectionTips}>
                {t('cart.giftSelectionTips', {
                  maxSelect: maxTotal,
                })}
              </Text>
            </CustomView>
            <FlatList
              style={{flex: 1}}
              contentContainerStyle={
                freeGiftOptions.items?.length > 0
                  ? {paddingBottom: 60}
                  : styles.emptyListContent
              }
              data={freeGiftOptions.items}
              keyExtractor={(item, index) => item?.id?.toString() || index}
              renderItem={({item}) => {
                return (
                  <ProductItem
                    t={t}
                    item={item}
                    selected={selectedMap[item.sku] > 0}
                    initialQuantity={selectedMap[item.sku]}
                    onChangeCheckBox={selected => {
                      toggle({
                        selected,
                        key: item.sku,
                        quantity: selected ? 1 : 0,
                      });
                    }}
                    onChangeQuantity={quantity => {
                      toggle({selected: true, key: item.sku, quantity});
                    }}
                  />
                );
              }}
              ListEmptyComponent={
                giftDataLoading ? (
                  <ActivityIndicator size="large" color={Colors.PRIMARY} />
                ) : null
              }
            />
            <CustomView paddingVertical={12}>
              <Button
                onPress={handleConfirm}
                disabled={disabled || freeGiftLoading}
                loading={freeGiftLoading}
                loadingColor={Colors.WHITE}
                label={
                  !disabled
                    ? t('cart_checkout.btn.confirm')
                    : t('cart.freeItemConfirmBefore', {
                        selectedNum: total,
                        maxSelect: freeGiftOptions.max_select,
                      })
                }
                borderRadius={8}
                width="100%"
                textStyleProp={styles.label}
                styleProp={[
                  styles.primaryButton,
                  (disabled || freeGiftLoading) && {
                    backgroundColor: Colors.GRAY_DARK,
                  },
                ]}
              />
            </CustomView>
          </CustomView>
        </View>
      </View>
    </Modal>
  );
};

export default GiftSelectionModal;

const styles = StyleSheet.create({
  pointsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  pointsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: '100%',
    height: '70%',
    overflow: 'hidden',
  },
  closeIcon: {
    width: 'fit-width',
    justifyContent: 'flex-end',
  },
  productItem: {
    height: 106,
  },
  methodExpress: {
    height: 44,
    backgroundColor: '#fff8e8',
    borderRadius: 8,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 6,
    padding: 12,
  },
  giftSelectionTips: {
    fontFamily: 'Noto Sans',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
    color: '#ff8200',
  },
  giftImage: {
    width: 100,
    height: 100,
    marginLeft: 10,
    borderRadius: 8,
  },
  info: {
    paddingLeft: 24,
    height: 106,
    flexShrink: 0,
  },
  productName: {
    fontFamily: 'Noto Sans',
    fontWeight: '500',
    fontSize: 14,
    color: '#000000',
  },
  freeGift: {
    fontFamily: 'Noto Sans',
    fontWeight: '400',
    fontSize: 14,
    color: '#000000',
  },
  containerCheck: {
    marginTop: 10,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#ff8200',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  label: {
    fontFamily: 'Noto Sans',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
  },
  customInputQty: {
    flexDirection: 'row',
    width: 123,
    justifyContent: 'space-between',
    height: 32,
    alignItems: 'center',
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
});
