import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Colors} from '@app/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Alert from '@app/components/Alert';

const OVERLAY_Z_INDEX = 9999; // 低于全局 toast(99999)，使 toast 能显示在弹框之上

const EmailVerification = ({
  visible,
  email,
  onClose,
  onConfirm,
  onResend,
  loading = false,
  outerAlert,
  useOverlayInsteadOfModal = false, // 个人信息页传 true，弹框用覆盖层渲染，不挡 toast
}) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendCountdown, setResendCountdown] = useState(30); // 30秒倒计时
  const inputRefs = useRef([]);
  const errorTimeoutRef = useRef(null);
  const successTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // 重置状态
      setCode(['', '', '', '', '', '']);
      setError(null);
      setResendCountdown(30); // 重置倒计时
      // 不写死成功提示（成功/失败文案由后端返回）
      setSuccessMessage(null);
      // 聚焦第一个输入框
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [visible]);

  // Resend 倒计时效果
  useEffect(() => {
    if (visible && resendCountdown > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [visible, resendCountdown]);

  // 错误消息自动消失逻辑
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 3000);
    }
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, [error]);

  // 成功消息自动消失逻辑
  useEffect(() => {
    if (successMessage) {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, [successMessage]);

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

  const handleConfirm = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      try {
        await onConfirm(verificationCode);
      } catch (err) {
        // 不再在弹框内显示错误，统一使用全局 toast（由 controller 处理）
        // setError 已移除，错误会通过 controller 的 rxAppSnackbar 显示
      }
    }
  };

  const isCodeComplete = code.every(digit => digit !== '');

  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.overlay}>
        {/* 弹框最外层顶部提示：用于显示父层 alert（比如 resend/token 过期等） */}
        {outerAlert?.message ? (
          <View style={styles.outerAlert} pointerEvents="box-none">
            <Alert type={outerAlert?.type} message={outerAlert?.message} />
          </View>
        ) : null}

        {successMessage && (
          <View style={styles.successAlert}>
            <View style={styles.successIconContainer}>
              <Icon name="check" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}
        {error && (
          <View style={styles.errorAlert}>
            <Icon name="information" size={20} color="#FFFFFF" style={{marginRight: 10}} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.modalContainer}>
          {/* Title */}
          <Text style={styles.title}>Email verification</Text>

          {/* Instruction */}
          <Text style={styles.instruction}>
            Please enter the verification code sent to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
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
              />
            ))}
          </View>

          {/* Resend */}
          <TouchableOpacity
            style={styles.resendButton}
            onPress={async () => {
              if (resendCountdown === 0 && onResend) {
                try {
                  // onResend 如果失败必须 throw，错误由父组件（controller）通过 toast 处理
                  await onResend();
                  // 重置倒计时
                  setResendCountdown(30);
                  // 不再在弹框内显示成功提示，统一使用全局 toast
                } catch (err) {
                  // 错误由父组件（controller）通过 toast 处理
                }
              }
            }}
            disabled={loading || resendCountdown > 0}>
            <Text
              style={[
                styles.resendText,
                resendCountdown > 0 && styles.resendTextDisabled,
              ]}>
              {resendCountdown > 0 ? `RESEND (${resendCountdown}s)` : 'RESEND'}
            </Text>
          </TouchableOpacity>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[
              styles.confirmButton,
              !isCodeComplete && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!isCodeComplete || loading}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {loading && (
                <ActivityIndicator
                  size="small"
                  color={Colors.WHITE || '#FFFFFF'}
                  style={{marginRight: 8}}
                />
              )}
              <Text
                style={[
                  styles.confirmButtonText,
                  !isCodeComplete && styles.confirmButtonTextDisabled,
                ]}>
                Confirm
              </Text>
            </View>
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity style={styles.footerCloseButton} onPress={onClose}>
            <Text style={styles.footerCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
  );

  if (!visible) return null;

  if (useOverlayInsteadOfModal) {
    return (
      <View style={[styles.overlayRoot, {zIndex: OVERLAY_Z_INDEX, elevation: OVERLAY_Z_INDEX}]}>
        {content}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      {content}
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayRoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerAlert: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 10,
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
  emailText: {
    fontWeight: '600',
    color: '#000000',
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
  resendButton: {
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: Colors.PRIMARY || '#FF8200',
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#999999',
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
  successAlert: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#424242',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  successIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#424242', // 统一黑底
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  successText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    lineHeight: 20,
  },
  errorAlert: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#424242',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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

export default EmailVerification;

