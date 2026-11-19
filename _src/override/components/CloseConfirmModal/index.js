import React from 'react';
import {Modal, View, TouchableOpacity, StyleSheet} from 'react-native';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

const CloseConfirmModal = ({visible, onCancel, onConfirm}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <Text style={styles.dialogTitle}>
            Are you sure you want to close?
          </Text>
          <Text style={styles.dialogMessage}>
            This page contains required information. If you close it, you will
            not be able to sign in successfully.
          </Text>
          <View style={styles.dialogButtonRow}>
            <TouchableOpacity
              style={styles.dialogCloseButton}
              onPress={onCancel}>
              <Text style={styles.dialogCloseButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogBackButton}
              onPress={onConfirm}>
              <Text style={styles.dialogBackButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  dialogButtonRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    justifyContent: 'space-between',
  },
  dialogCloseButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  dialogCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.PRIMARY || '#FF8200',
  },
  dialogBackButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY || '#FF8200',
    marginLeft: 6,
  },
  dialogBackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CloseConfirmModal;
