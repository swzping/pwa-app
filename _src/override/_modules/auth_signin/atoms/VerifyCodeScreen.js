import React, {useState, useEffect, useRef} from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import Text from '@app/components/Text';
import NavBar from '@app/components/NavBar/index';
import {Colors} from '@app/styles';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const VerifyCodeScreen = ({
  phoneNumber,
  verificationMethod,
  onConfirm,
  onResend,
  loading,
  onBack,
}) => {
  const [codes, setCodes] = useState(['', '', '', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState(30); // 30秒倒计时
  const [error, setError] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false); // 本地确认 loading 状态
  const [isVerificationFailed, setIsVerificationFailed] = useState(false); // 验证失败状态
  const [isExpired, setIsExpired] = useState(false); // 验证码过期状态
  const [isResending, setIsResending] = useState(false); // resend loading 状态
  const inputRefs = useRef([]);
  const countdownIntervalRef = useRef(null);
  const expiryTimeoutRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  // 格式化电话号码显示（移除国家代码，只显示后几位）
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // 移除 +62 或其他国家代码
    const cleaned = phone.replace(/^\+62/, '').replace(/^62/, '');
    return cleaned;
  };

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

  // Resend 倒计时效果
  useEffect(() => {
    if (resendCountdown > 0) {
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
  }, [resendCountdown]);

  // OTP 过期倒计时（5分钟后清空输入并禁用按钮）
  useEffect(() => {
    // 组件挂载时启动5分钟定时器
    expiryTimeoutRef.current = setTimeout(() => {
      // 5分钟后清空输入框并标记为过期
      setCodes(['', '', '', '', '', '']);
      setIsExpired(true);
    }, 300000); // 5分钟 = 300000毫秒

    return () => {
      if (expiryTimeoutRef.current) {
        clearTimeout(expiryTimeoutRef.current);
      }
    };
  }, []); // 只在组件挂载时执行一次

  const handleCodeChange = (text, index) => {
    // 只允许数字
    const numericText = text.replace(/[^0-9]/g, '');
    
    // 当用户修改输入时，清除错误状态并恢复按钮
    if (error || isVerificationFailed) {
      setError(null);
      setIsVerificationFailed(false);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    }
    
    if (numericText.length > 1) {
      // 如果粘贴了多个字符，填充所有输入框
      const newCodes = [...codes];
      const digits = numericText.slice(0, 6).split('');
      digits.forEach((digit, i) => {
        if (i < 6) {
          newCodes[i] = digit;
        }
      });
      setCodes(newCodes);
      
      // 聚焦到最后一个已填充的输入框
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      if (inputRefs.current[lastFilledIndex]) {
        inputRefs.current[lastFilledIndex].focus();
      }
    } else {
      // 单个字符输入
      const newCodes = [...codes];
      newCodes[index] = numericText;
      setCodes(newCodes);

      // 自动聚焦到下一个输入框
      if (numericText && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
    const code = codes.join('');
    if (code.length === 6 && !loading && !isConfirming && !isVerificationFailed) {
      setIsConfirming(true);
      try {
        await onConfirm(code);
      } catch (err) {
        setError('Incorrect verification code');
        setIsVerificationFailed(true); // 标记验证失败，禁用按钮
        setIsConfirming(false);
      }
    }
  };

  const handleResend = async () => {
    if (resendCountdown === 0) {
      setIsResending(true); // 开始 resend，显示 loading
      try {
        // 先调用 onResend（如果失败会抛出错误）
        if (onResend) {
          await onResend();
        }
        
        // 如果成功，重置状态
        setResendCountdown(30); // 30秒倒计时
        setCodes(['', '', '', '', '', '']); // 清空输入框
        setIsExpired(false); // 重置过期状态
        setIsVerificationFailed(false); // 重置验证失败状态
        setError(null); // 清除错误
        
        // 清除旧的定时器并重新启动5分钟过期定时器
        if (expiryTimeoutRef.current) {
          clearTimeout(expiryTimeoutRef.current);
        }
        expiryTimeoutRef.current = setTimeout(() => {
          // 5分钟后清空输入框并标记为过期
          setCodes(['', '', '', '', '', '']);
          setIsExpired(true);
        }, 300000); // 5分钟 = 300000毫秒
      } catch (err) {
        // 如果 resend 失败，不重置状态（错误由父组件通过 alert 显示）
        console.error('Resend failed:', err);
      } finally {
        setIsResending(false); // 结束 resend，隐藏 loading
      }
    }
  };

  const isCodeComplete = codes.every(code => code !== '') && codes.join('').length === 6;

  return (
    <View style={styles.container}>
      <NavBar
        useBack
        useWhite
        titleBold
        title="Verify account"
        useBackPress={onBack}
      />

      {error && (
        <View style={styles.errorAlert}>
          <Icon name="information" size={20} color="#FFFFFF" style={{marginRight: 10}} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.content}>
        {/* Instruction Text */}
        {verificationMethod === 'email' ? (
          <>
            <Text style={styles.instructionText}>
              We have sent you a one-time password (Verification code) by email.
            </Text>
            <Text style={styles.instructionText2}>
              Enter the verification code sent to
            </Text>
            <Text style={styles.phoneNumber}>{phoneNumber}</Text>
          </>
        ) : (
          <>
        <Text style={styles.instructionText}>
          We have sent you a one-time password (Verification code) by{' '}
          {verificationMethod === 'whatsapp' ? 'WhatsApp' : 'SMS'}.
        </Text>
        <Text style={styles.instructionText2}>
          Enter the verification code sent to
        </Text>
        <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
          </>
        )}

        {/* Code Input Fields */}
        <View style={styles.codeContainer}>
          {codes.map((code, index) => (
            <View key={index} style={[styles.codeInputContainer, code && styles.codeInputFilled]}>
            <TextInput
              ref={ref => (inputRefs.current[index] = ref)}
                style={styles.codeInput}
              value={code}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
              {!code && focusedIndex === index && <View style={styles.dashLine} />}
            </View>
          ))}
        </View>

        {/* Expiry Message */}
        {isExpired && (
          <View style={styles.expiryMessageContainer}>
            <Icon name="alert-circle" size={16} color="#E21A23" style={styles.expiryIcon} />
            <Text style={styles.expiryMessage}>
              Verification code expired. Please request a new code.
            </Text>
          </View>
        )}

        {/* Resend Code */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendCountdown > 0 || isResending}
          style={styles.resendContainer}>
          <View style={styles.resendContent}>
            <Text
              style={[
                styles.resendText,
                (resendCountdown > 0 || isResending) && styles.resendTextDisabled,
              ]}>
              {resendCountdown > 0 ? `RESEND (${resendCountdown}s)` : 'RESEND'}
            </Text>
            {isResending && (
              <ActivityIndicator size="small" color={Colors.PRIMARY || '#FF8200'} style={{marginLeft: 8}} />
            )}
          </View>
        </TouchableOpacity>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!isCodeComplete || loading || isConfirming || isVerificationFailed || isExpired) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!isCodeComplete || loading || isConfirming || isVerificationFailed || isExpired}>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            {(loading || isConfirming) && (
              <ActivityIndicator color="#FFFFFF" size="small" style={{marginRight: 8}} />
            )}
          <Text style={styles.confirmButtonText}>Confirm</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  instructionText2: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeInputContainer: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: '#FFD4A3',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    zIndex: 2,
  },
  codeInputFilled: {
    borderColor: '#FF8200',
    backgroundColor: '#FFF8F0',
  },
  dashLine: {
    position: 'absolute',
    bottom: 12,
    width: 14,
    height: 2,
    backgroundColor: '#1B1A19',
    zIndex: 1,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  resendContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: Colors.PRIMARY || '#FF8200',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorAlert: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#424242',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 1000,
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
  expiryMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  expiryIcon: {
    marginRight: 6,
  },
  expiryMessage: {
    fontSize: 13,
    color: '#E21A23',
    lineHeight: 20,
  },
});

export default VerifyCodeScreen;

