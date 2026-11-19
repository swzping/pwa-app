import React from 'react';
import {ActivityIndicator,Modal, StyleSheet,TouchableOpacity, View} from 'react-native';

import Text from '@app/components/Text';
import {Colors} from '@app/styles';

const OfflineVoucherConfirmModal = ({visible, onCancel, onConfirm,loading}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.content}>
            <Text style={styles.dialogTitle}>
              Ready to redeem?
            </Text>
            <Text style={styles.dialogMessage}>
              Please show it to the store staff once you're ready. A one-time voucher code will be revealed.
            </Text>
          </View>
          <View style={styles.dialogButtonRow}>
            <TouchableOpacity
              style={styles.dialogCloseButton}
              disabled={loading}
              onPress={onConfirm}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                {loading && <ActivityIndicator color="#ccc" size="small" style={{ marginRight: 8 }} />}
                <Text style={styles.dialogCloseButtonText}>Continue</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dialogBackButton}
              onPress={onCancel}
              disabled={loading}>
              <Text style={styles.dialogBackButtonText}>Not now</Text>
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
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 0,
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
    color: '#444444',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  dialogButtonRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    paddingTop: 12,
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
    fontSize: 14,
    fontWeight: '700',
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

export default OfflineVoucherConfirmModal;
