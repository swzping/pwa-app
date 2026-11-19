import React from 'react';
import {View, Text, Modal, TouchableOpacity} from 'react-native';
import {styles} from './styles';

const CommonDialog = ({
  visible,
  title,
  description,
  leftText,
  rightText,
  onCancel,
  onOk,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={() => onCancel()}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.bodyText}>{description}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                onCancel();
              }}>
              <Text style={styles.cancelText}>{leftText}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => {
                onOk();
              }}>
              <Text style={styles.deleteText}>{rightText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CommonDialog;
