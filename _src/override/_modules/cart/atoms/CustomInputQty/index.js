import React, {useEffect, useRef,useState} from 'react';
import {TextInput} from 'react-native';

import {ActivityIndicator} from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';

import {useReactiveVar} from '@apollo/client';

import _ from 'lodash';

import styles from '@app/_modules/cart/atoms/CustomInputQty/styles';
import CommonDialog from '@app/components/CommonDialog/commonDialog';
import CustomView from '@app/components/CustomView';
import {DARK} from '@app/helpers/Constants';
import {startPerfTrace} from '@app/helpers/perf';
import useCarts from '@app/hooks/carts/useCarts';
import {rxAppSnackbar,rxUserTheme} from '@app/services/cache';
import {Colors} from '@app/styles';

/**
 * ----------------------------------------- *
 * CustomInputQuantity
 * it will be rendered only if
 * (modules.cart.atoms.update_item_qty_input.enable)
 * is true (enabled)
 * @param {initialQuantity, cartItemId}
 * ----------------------------------------- *
 */

let delayTimer;
const CustomInputQty = ({
  t,
  initialQuantity = 0,
  item,
  backgroundColor,
  colorIcon,
  colorText,
  style,
  styleInput,
  loadingChange = false,
  isInStock,
  getPrice = () => {},
  getDiscount = () => {},
}) => {
  const {updateQuantity, removeFromCart} = useCarts({
    initialized: false,
  });
  const maxQty = _.get(item, 'product.stock_item.max_sale_qty');

  const timeLimit = 500;
  const [loading] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [showdialog, setShowdialog] = useState(false);

  /**
   * ----------------------------------------- *
   * call color hooks fro theme (dark mode)
   * @return color, scheme
   * ----------------------------------------- *
   */
  const scheme = useReactiveVar(rxUserTheme);
  const color = scheme === DARK ? Colors.WHITE : Colors.BLACK;
  // const {t} = useTranslation();

  const mount = useRef();
  useEffect(() => {
    mount.current = true;
    if (mount.current) {
      setQuantity(initialQuantity);
    }
    return () => {
      mount.current = false;
    };
  }, []);

  useEffect(() => {
    if (mount.current) {
      setQuantity(initialQuantity);
    }
  }, [initialQuantity]);

  // const displayConfirmationDialog = () => {
  //   const title = t('cart.removeItem');
  //   const description = t('cart.removeConfirmation');
  //   const removeBtnLabel = t('cart.remove');
  //   const cancelBtnLabel = t('cart.cancel');
  //
  //   Alert.alert(title, description, [
  //     {
  //       text: removeBtnLabel,
  //       onPress: async () => {
  //         const res = await removeFromCart({item});
  //         if (res) {
  //           getPrice();
  //           getDiscount();
  //         }
  //       },
  //       style: 'default',
  //     },
  //     {
  //       text: cancelBtnLabel,
  //       onPress: () => {
  //         setQuantity(initialQuantity);
  //       },
  //       style: 'cancel',
  //     },
  //   ]);
  // };

  /**
   * ----------------------------------------- *
   * @function onCheckLimit
   * check input limit on
   * ----------------------------------------- *
   */
  const onCheckLimit = value => {
    const parsedQty = parseInt(value);
    if (!isNaN(parsedQty)) {
      // checking max qty (max_sale_qty > 0 才有上限，0 表示无限)
      if (maxQty > 0 && parsedQty > maxQty) {
        setQuantity(maxQty);
      } else {
        setQuantity(parsedQty);
      }
    } else {
      setQuantity('');
    }
  };

  /**
   * ----------------------------------------- *
   * @function onEndEditing
   * this function will be called when
   * we edit the qty of an item on cart page
   * ----------------------------------------- *
   */
  const onEndEditing = async () => {
    if (quantity === '' || quantity === initialQuantity) {
      setQuantity(initialQuantity);
      return;
    }

    if (quantity === 0) {
      setShowdialog(true);
      // displayConfirmationDialog();
      return;
    }

    if (quantity > 0) {
      // 开始 cartUpdateQtyItem trace
      const updateTrace = await startPerfTrace('cartUpdateQtyItem');
      const updateStartTime = Date.now();

      try {
        const res = await updateQuantity({
          item,
          qty: quantity,
        });
        if (res && res.ok) {
          getPrice();
          getDiscount();

          // 更新成功
          const duration = Date.now() - updateStartTime;
          updateTrace.putAttribute('product_sku', item?.product?.sku || '');
          updateTrace.putAttribute('product_id', item?.product?.id?.toString() || '');
          updateTrace.putAttribute('old_quantity', initialQuantity?.toString() || '0');
          updateTrace.putAttribute('new_quantity', quantity?.toString() || '0');
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'success');
          updateTrace.putAttribute('update_method', 'manual_input');
          updateTrace.stop();
        } else if (res && !res.ok) {
          // Revert to initial quantity on error
          setQuantity(initialQuantity);
          rxAppSnackbar({message: res.message});

          // 更新失败
          const duration = Date.now() - updateStartTime;
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'error');
          updateTrace.putAttribute('error_reason', res.message || 'update_failed');
          updateTrace.stop();
        }
      } catch (error) {
        // Revert to initial quantity on error
        setQuantity(initialQuantity);

        // 更新失败
        const duration = Date.now() - updateStartTime;
        updateTrace.putMetric('duration_ms', duration);
        updateTrace.putAttribute('status', 'error');
        updateTrace.putAttribute('error_reason', error?.message || 'unknown_error');
        updateTrace.stop();
      }
    }
  };

  /**
   * ----------------------------------------- *
   * @function onIncreaseQuantity
   * this function will be called when
   * we incrase the qty of an item on cart page
   * then will trigger onUpdateCartItem
   * function to run which will be update qty
   * item by one up (addition)
   * ----------------------------------------- *
   */
  const onIncreaseQuantity = async () => {
    console.log('maxQty=====', maxQty);
    console.log('quantity=====', quantity);
    clearTimeout(delayTimer);

    // Check if already at max quantity (max_sale_qty > 0 才有上限，0 表示无限)
    if (maxQty > 0 && quantity >= maxQty) {
      // Call API to get the actual error message from backend
      delayTimer = setTimeout(async () => {
        // 开始 cartUpdateQtyItem trace
        const updateTrace = await startPerfTrace('cartUpdateQtyItem');
        const updateStartTime = Date.now();

        try {
          const res = await updateQuantity({item, qty: quantity + 1});
          if (res && !res.ok) {
            rxAppSnackbar({message: res.message});

            // 更新失败
            const duration = Date.now() - updateStartTime;
            updateTrace.putMetric('duration_ms', duration);
            updateTrace.putAttribute('status', 'error');
            updateTrace.putAttribute('error_reason', res.message || 'max_quantity_reached');
            updateTrace.stop();
          } else {
            // 即使失败也算一个 trace
            const duration = Date.now() - updateStartTime;
            updateTrace.putMetric('duration_ms', duration);
            updateTrace.putAttribute('status', res?.ok ? 'success' : 'error');
            updateTrace.stop();
          }
        } catch (error) {
          const duration = Date.now() - updateStartTime;
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'error');
          updateTrace.putAttribute('error_reason', error?.message || 'unknown_error');
          updateTrace.stop();
        }
      }, timeLimit);
      return;
    }

    const qty = quantity + 1;
    setQuantity(qty);
    delayTimer = setTimeout(async () => {
      // 开始 cartUpdateQtyItem trace
      const updateTrace = await startPerfTrace('cartUpdateQtyItem');
      const updateStartTime = Date.now();

      try {
        const res = await updateQuantity({item, qty});
        if (res && res.ok) {
          getPrice();
          getDiscount();

          // 更新成功
          const duration = Date.now() - updateStartTime;
          updateTrace.putAttribute('product_sku', item?.product?.sku || '');
          updateTrace.putAttribute('product_id', item?.product?.id?.toString() || '');
          updateTrace.putAttribute('old_quantity', quantity?.toString() || '0');
          updateTrace.putAttribute('new_quantity', qty?.toString() || '0');
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'success');
          updateTrace.putAttribute('update_method', 'increase_button');
          updateTrace.stop();
        } else if (res && !res.ok) {
          // Revert to previous quantity on error
          setQuantity(quantity);
          rxAppSnackbar({message: res.message});

          // 更新失败
          const duration = Date.now() - updateStartTime;
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'error');
          updateTrace.putAttribute('error_reason', res.message || 'update_failed');
          updateTrace.stop();
        }
      } catch (error) {
        // Revert to previous quantity on error
        setQuantity(quantity);

        // 更新失败
        const duration = Date.now() - updateStartTime;
        updateTrace.putMetric('duration_ms', duration);
        updateTrace.putAttribute('status', 'error');
        updateTrace.putAttribute('error_reason', error?.message || 'unknown_error');
        updateTrace.stop();
      }
    }, timeLimit);
  };

  /**
   * ----------------------------------------- *
   * @function onDecreaseQuantity
   * this function will be called when
   * we incrase the qty of an item on cart page
   * then will trigger onUpdateCartItem
   * function to run which will be update qty
   * item by one down (substraction)
   * ----------------------------------------- *
   */
  const onDecreaseQuantity = async () => {
    clearTimeout(delayTimer);

    // Check if already at min quantity (1)
    if (quantity <= 1) {
      // Show dialog for removal or call API to get error message
      if (quantity === 1) {
        setShowdialog(true);
        return;
      } else {
        // Call API to get the actual error message from backend
        delayTimer = setTimeout(async () => {
          // 开始 cartUpdateQtyItem trace
          const updateTrace = await startPerfTrace('cartUpdateQtyItem');
          const updateStartTime = Date.now();

          try {
            const res = await updateQuantity({item, qty: quantity - 1});
            if (res && !res.ok) {
              rxAppSnackbar({message: res.message});

              // 更新失败
              const duration = Date.now() - updateStartTime;
              updateTrace.putMetric('duration_ms', duration);
              updateTrace.putAttribute('status', 'error');
              updateTrace.putAttribute('error_reason', res.message || 'min_quantity_reached');
              updateTrace.stop();
            } else {
              // 即使失败也算一个 trace
              const duration = Date.now() - updateStartTime;
              updateTrace.putMetric('duration_ms', duration);
              updateTrace.putAttribute('status', res?.ok ? 'success' : 'error');
              updateTrace.stop();
            }
          } catch (error) {
            const duration = Date.now() - updateStartTime;
            updateTrace.putMetric('duration_ms', duration);
            updateTrace.putAttribute('status', 'error');
            updateTrace.putAttribute('error_reason', error?.message || 'unknown_error');
            updateTrace.stop();
          }
        }, timeLimit);
        return;
      }
    }

    const qty = quantity - 1;
    setQuantity(qty);
    delayTimer = setTimeout(async () => {
      // 开始 cartUpdateQtyItem trace
      const updateTrace = await startPerfTrace('cartUpdateQtyItem');
      const updateStartTime = Date.now();

      try {
        const res = await updateQuantity({item, qty});
        if (res && res.ok) {
          getPrice();
          getDiscount();

          // 更新成功
          const duration = Date.now() - updateStartTime;
          updateTrace.putAttribute('product_sku', item?.product?.sku || '');
          updateTrace.putAttribute('product_id', item?.product?.id?.toString() || '');
          updateTrace.putAttribute('old_quantity', quantity?.toString() || '0');
          updateTrace.putAttribute('new_quantity', qty?.toString() || '0');
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'success');
          updateTrace.putAttribute('update_method', 'decrease_button');
          updateTrace.stop();
        } else if (res && !res.ok) {
          // Revert to previous quantity on error
          setQuantity(quantity);
          rxAppSnackbar({message: res.message});

          // 更新失败
          const duration = Date.now() - updateStartTime;
          updateTrace.putMetric('duration_ms', duration);
          updateTrace.putAttribute('status', 'error');
          updateTrace.putAttribute('error_reason', res.message || 'update_failed');
          updateTrace.stop();
        }
      } catch (error) {
        // Revert to previous quantity on error
        setQuantity(quantity);

        // 更新失败
        const duration = Date.now() - updateStartTime;
        updateTrace.putMetric('duration_ms', duration);
        updateTrace.putAttribute('status', 'error');
        updateTrace.putAttribute('error_reason', error?.message || 'unknown_error');
        updateTrace.stop();
      }
    }, timeLimit);
  };

  switch (loading) {
    case true:
      return <ActivityIndicator />;
    default:
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
              borderRightWidth: 1,
              borderColor: Colors.GRAY_LIGHT,
              height: 32,
              width: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={loadingChange || !isInStock ? false : onDecreaseQuantity}>
            <Icon
              name="minus"
              size={20}
              color={quantity > 0 ? Colors.PRIMARY : Colors.GRAY_DARK}
            />
          </CustomView>
          <TextInput
            value={quantity.toString()}
            keyboardType="number-pad"
            editable={true}
            onEndEditing={onEndEditing}
            onChangeText={onCheckLimit}
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
              opacity: maxQty > 0 && quantity >= maxQty ? 0.2 : 1,
              borderLeftWidth: 1,
              borderColor: Colors.GRAY_LIGHT,
              height: 32,
              width: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={
              loadingChange ||
              !isInStock ||
              (maxQty > 0 && quantity >= maxQty)
                ? () => {}
                : onIncreaseQuantity
            }>
            <Icon
              name="plus"
              size={20}
              color={
                !(maxQty > 0) || quantity < maxQty
                  ? Colors.PRIMARY
                  : Colors.GRAY_DARK
              }
            />
          </CustomView>
          <CommonDialog
            visible={showdialog}
            title={t('cart.removeItem')}
            description={t('cart.removeConfirmation')}
            leftText={t('cart.cancel')}
            rightText={t('cart.remove')}
            onCancel={() => {
              setShowdialog(false);
              setQuantity(initialQuantity);
            }}
            onOk={async () => {
              setShowdialog(false);

              // 开始 cartDeleteItem trace（从数量输入框删除）
              const deleteTrace = await startPerfTrace('cartDeleteItem');
              const deleteStartTime = Date.now();

              try {
                const res = await removeFromCart({item});
                if (res) {
                  getPrice();
                  getDiscount();
                  // 删除成功
                  const duration = Date.now() - deleteStartTime;
                  deleteTrace.putAttribute('product_sku', item?.product?.sku || '');
                  deleteTrace.putAttribute('product_id', item?.product?.id?.toString() || '');
                  deleteTrace.putAttribute('item_quantity', initialQuantity?.toString() || '0');
                  deleteTrace.putMetric('duration_ms', duration);
                  deleteTrace.putAttribute('status', 'success');
                  deleteTrace.putAttribute('delete_method', 'qty_zero');
                  deleteTrace.stop();
                } else {
                  // 删除失败
                  const duration = Date.now() - deleteStartTime;
                  deleteTrace.putMetric('duration_ms', duration);
                  deleteTrace.putAttribute('status', 'error');
                  deleteTrace.putAttribute('error_reason', 'delete_failed');
                  deleteTrace.stop();
                }
              } catch (error) {
                // 删除失败
                const duration = Date.now() - deleteStartTime;
                deleteTrace.putMetric('duration_ms', duration);
                deleteTrace.putAttribute('status', 'error');
                deleteTrace.putAttribute('error_reason', error?.message || 'unknown_error');
                deleteTrace.stop();
              }
            }}
          />
        </CustomView>
      );
  }
};

export default CustomInputQty;
