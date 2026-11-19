import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Colors} from '@app/styles';

const RegistrationSuccessModal = ({visible, onOk}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onOk}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Image
              source={require('@app/assets/images/registerSuccess.png')}
              style={styles.successIcon}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>Registration successful</Text>

          {/* Message */}
          <Text style={styles.message}>
            Welcome to Guardian! Now explore thousands of offers from Guardian
            available for you!
          </Text>

          {/* OK Button */}
          <TouchableOpacity style={styles.okButton} onPress={onOk}>
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical:40
  },
  iconContainer: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: 130,
    height: 130,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing:0.5
  },
  message: {
    fontSize: 15,
    color: 'rgba(117, 117, 117, 1)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingVertical:5,
    paddingHorizontal:5,
    letterSpacing:0.5
  },
  okButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 130, 0, 1)',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default RegistrationSuccessModal;

