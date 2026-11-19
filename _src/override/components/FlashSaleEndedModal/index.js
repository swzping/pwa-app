import React from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {styles} from './styles';

const FlashSaleEndedModal = ({visible, onClose, onRefresh}) => {
  const {t} = useTranslation();

  const handleOk = async () => {
    // 先执行刷新
    if (onRefresh) {
      await onRefresh();
    }
    // 然后关闭弹窗
    onClose();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={handleOk}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.titleText}>
            {t('flash_sale.ended_title', {
              defaultValue: 'Flash sales have ended',
            })}
          </Text>
          <Text style={styles.bodyText}>
            {t('flash_sale.ended_message', {
              defaultValue:
                'Current flash sales items will return to their original prices !',
            })}
          </Text>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.button}
            onPress={handleOk}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {t('flash_sale.ok_button', {defaultValue: 'OK'})}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FlashSaleEndedModal;

