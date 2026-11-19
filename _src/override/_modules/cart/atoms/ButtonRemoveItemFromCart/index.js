import React, {useState} from 'react';
import {Text} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import useCarts from '@app/hooks/carts/useCarts';
import CustomView from '@app/components/CustomView';
import {useTranslation} from 'react-i18next';
import CommonDialog from '@app/components/CommonDialog/commonDialog';
import {startPerfTrace} from '@app/helpers/perf';

const ButtonRemoveItemFromCart = ({
  children,
  item,
  propStyle = {},
  loadingChange = false,
  getPrice = () => {},
}) => {
  const [loading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const {removeFromCart} = useCarts({
    initialized: false,
  });

  const {t} = useTranslation();

  /**
   * ----------------------------------------- *
   * @function onRemoveCartItem
   * @summary remove item on cart
   * ----------------------------------------- *
   */
  const onRemoveCartItem = async () => {
    // const res = await removeFromCart({item});
    // if (res) {
    //   getPrice();
    // }

    // const title = t('cart.removeItem');
    // const description = t('cart.removeConfirmation');
    // const removeBtnLabel = t('cart.remove');
    // const cancelBtnLabel = t('cart.cancel');
    //
    // Alert.alert(title, description, [
    //   {
    //     text: removeBtnLabel,
    //     onPress: async () => {
    //       const res = await removeFromCart({item});
    //       if (res) {
    //         getPrice();
    //       }
    //     },
    //     style: 'default',
    //   },
    //   {
    //     text: cancelBtnLabel,
    //     onPress: () => {},
    //     style: 'cancel',
    //   },
    // ]);
    setShowAlert(true);
  };

  if (loading) {
    return <ActivityIndicator />;
  }
  return (
    <CustomView
      onPress={loadingChange ? false : onRemoveCartItem}
      style={propStyle}>
      {children ? (
        children
      ) : (
        <Text>{t('cart.button_remove_item_from_cart.view.delete')}</Text>
      )}
      {/*<Dialog*/}
      {/*  visible={showAlert}*/}
      {/*  message={t('label.newVersionFound')}*/}
      {/*  secondButtonLabel={t('label.cancel')}*/}
      {/*  onPressSecondButton={() => console.log('cancel')}*/}
      {/*  buttonLabel={t('label.update')}*/}
      {/*  onPressButton={() => onGoStore()}*/}
      {/*/>*/}
      <CommonDialog
        visible={showAlert}
        title={t('cart.removeItem')}
        description={t('cart.removeConfirmation')}
        leftText={t('cart.cancel')}
        rightText={t('cart.remove')}
        onCancel={() => {
          setShowAlert(false);
        }}
        onOk={async () => {
          setShowAlert(false);
          
          // 开始 cartDeleteItem trace
          const deleteTrace = await startPerfTrace('cartDeleteItem');
          const deleteStartTime = Date.now();
          
          try {
            const res = await removeFromCart({item});
            if (res) {
              getPrice();
              
              // 删除成功
              const duration = Date.now() - deleteStartTime;
              deleteTrace.putAttribute('product_sku', item?.product?.sku || '');
              deleteTrace.putAttribute('product_id', item?.product?.id?.toString() || '');
              deleteTrace.putAttribute('item_quantity', item?.quantity?.toString() || '0');
              deleteTrace.putMetric('duration_ms', duration);
              deleteTrace.putAttribute('status', 'success');
              deleteTrace.putAttribute('delete_method', 'remove_button');
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
};

export default ButtonRemoveItemFromCart;
