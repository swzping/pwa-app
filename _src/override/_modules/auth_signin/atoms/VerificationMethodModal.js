import React from 'react';
import {Modal, View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Text from '@app/components/Text';
import IconFeather from 'react-native-vector-icons/Feather';

const VerificationMethodModal = ({visible, onClose, onSelectWhatsApp, onSelectSMS, loading, smsDisabled}) => {
  const isSmsDisabled = !!smsDisabled;
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}>
            <IconFeather name="x" size={24} color="#333333" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Choose a verification method</Text>

          {/* Description */}
          <Text style={styles.description}>
            We need to verify your identity with one of the following method.
          </Text>

          {/* WhatsApp Option */}
          <TouchableOpacity
            style={[styles.optionRow, loading && styles.optionRowDisabled]}
            onPress={onSelectWhatsApp}
            disabled={loading}>
            <View style={styles.optionIconContainer}>
              <Image 
                source={require('@app/assets/images/whatsappVerify.png')}
                style={styles.optionIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.optionText}>WhatsApp</Text>
            <IconFeather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          {/* Text Message Option - 根据 login_radius_sms_enabled 禁用时置灰 */}
          <TouchableOpacity
            style={[
              styles.optionRow,
              (loading || isSmsDisabled) && styles.optionRowDisabled,
            ]}
            onPress={isSmsDisabled ? undefined : onSelectSMS}
            disabled={loading || isSmsDisabled}
            activeOpacity={isSmsDisabled ? 1 : 0.7}>
            <View style={styles.optionIconContainer}>
              <Image 
                source={require('@app/assets/images/cmsMessageVerify.png')}
                style={[styles.optionIcon, isSmsDisabled && styles.optionIconDisabled]}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.optionText, isSmsDisabled && styles.optionTextDisabled]}>Text Message</Text>
            <IconFeather name="chevron-right" size={20} color={isSmsDisabled ? '#AAAAAA' : '#CCCCCC'} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    // 卡片背景与圆角
    backgroundColor: 'rgba(245, 245, 245, 1)',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  optionTextDisabled: {
    color: '#999999',
  },
  optionIconDisabled: {
    opacity: 0.5,
  },
  optionRowDisabled: {
    opacity: 0.5,
  },
});

export default VerificationMethodModal;

