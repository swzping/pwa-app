import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {Colors} from '@app/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const EmailVerificationRequiredModal = ({
  visible,
  onClose,
  onSendVerificationCode,
  onConfirmVerification,
  loading = false,
}) => {
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const inputRefs = useRef([]);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // 重置状态
      setStep('email');
      setEmail('');
      setCode(['', '', '', '', '', '']);
      setError(null);
    }
  }, [visible]);

  // 错误消息自动消失逻辑
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) {clearTimeout(errorTimeoutRef.current);}
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    return () => {
      if (errorTimeoutRef.current) {clearTimeout(errorTimeoutRef.current);}
    };
  }, [error]);

  // 当切换到验证码步骤时，聚焦第一个输入框
  useEffect(() => {
    if (step === 'code' && visible) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, visible]);

  const handleEmailChange = (text) => {
    setEmail(text);
    setError(null);
  };

  const handleEmailConfirm = async () => {
    // 验证邮箱格式
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email || !email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    if (onSendVerificationCode) {
      try {
        await onSendVerificationCode(email.trim());
        // 发送成功后，切换到验证码步骤
        setStep('code');
      } catch (err) {
        setError(err.message || 'Failed to send verification code');
      }
    }
  };

  const handleCodeChange = (text, index) => {
    // 只允许数字
    const numericText = text.replace(/[^0-9]/g, '');

    if (numericText.length > 1) {
      // 如果粘贴了多个字符，填充所有输入框
      const newCode = [...code];
      for (let i = 0; i < 6 && i < numericText.length; i++) {
        newCode[i] = numericText[i];
      }
      setCode(newCode);

      // 聚焦到最后一个已填充的输入框
      const lastFilledIndex = Math.min(5, numericText.length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      // 单个字符输入
      const newCode = [...code];
      newCode[index] = numericText;
      setCode(newCode);

      // 自动聚焦到下一个输入框
      if (numericText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    // 如果按退格键且当前输入框为空，聚焦到上一个输入框
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeConfirm = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete verification code');
      return;
    }

    setError(null);
    if (onConfirmVerification) {
      try {
        await onConfirmVerification(verificationCode);
      } catch (err) {
        setError(err.message || 'Incorrect verification code');
      }
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Title */}
          <Text style={styles.title}>Email verification</Text>

          {step === 'email' ? (
            <>
              {/* Instruction for Email Step */}
              <Text style={styles.instruction}>
                In order to proceed with your order, you need to add your email first !
              </Text>

              {/* Email Input Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email*</Text>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="Enter your email"
                  placeholderTextColor="#999999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {error && (
                  <View style={styles.errorContainer}>
                    <Icon name="information" size={14} color="#E21A23" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={handleEmailConfirm}
                disabled={loading}>
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Sending...' : 'Confirm'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Instruction for Code Step */}
              <Text style={styles.instruction}>
                We have sent you a one-time password (Verification code) by email.
              </Text>

              {/* Code Input Fields */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                      index === code.findIndex(d => d === '') && styles.codeInputActive,
                    ]}
                    value={digit}
                    onChangeText={text => handleCodeChange(text, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                  />
                ))}
              </View>

              {/* Error Message - 显示在底部 */}
              {error && (
                <View style={styles.errorContainer}>
                  <Icon name="information" size={14} color="#E21A23" style={styles.errorIcon} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  (!isCodeComplete || loading) && styles.confirmButtonDisabled,
                ]}
                onPress={handleCodeConfirm}
                disabled={!isCodeComplete || loading}>
                <Text
                  style={[
                    styles.confirmButtonText,
                    (!isCodeComplete || loading) && styles.confirmButtonTextDisabled,
                  ]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.footerCloseButton} onPress={onClose}>
            <Text style={styles.footerCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 8,
    marginBottom: 12,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#E21A23',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  codeInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  codeInputFilled: {
    borderColor: Colors.PRIMARY || '#FF8200',
    borderWidth: 2,
  },
  codeInputActive: {
    borderColor: Colors.PRIMARY || '#FF8200',
    borderWidth: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#E21A23',
    flex: 1,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#999999',
  },
  footerCloseButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.PRIMARY || '#FF8200',
  },
  footerCloseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.PRIMARY || '#FF8200',
  },
});

export default EmailVerificationRequiredModal;
