import React, {useState} from 'react';
import {ActivityIndicator,StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors, InputUI} from '@app/styles';

const EmailField = ({
  value,
  onChange,
  error,
  label,
  onVerify,
  isVerified = false,
  disabled = false,
  emailVerificationError = null,
  onEmailChange,
  requireEmailVerification = false, // 是否需要邮箱验证
  emailVerificationLoading = false, // 邮箱验证 loading 状态
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasBlurred, setHasBlurred] = useState(false); // 是否已经失焦过

  const hasValue = !!(value && value.trim().length > 0);

  // 验证邮箱格式
  const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const isValidEmail = hasValue && emailPattern.test(value);

  // 优先显示 emailVerificationError，否则显示 error?.message（只在失焦后且不在输入时显示）
  const displayError = emailVerificationError || (!isFocused && hasBlurred && error?.message ? error.message : null);
  const hasError = !!displayError;

  // 包装 onChange，在修改邮箱时清除验证状态
  const handleEmailChange = (text) => {
    onChange(text);
    if (onEmailChange) {
      onEmailChange();
    }
  };

  // 处理失焦事件
  const handleBlur = () => {
    setIsFocused(false);
    setHasBlurred(true); // 标记已经失焦过
    if (onBlur) {
      onBlur();
    }
  };

  // 使用 InputUI 获取样式
  const inputContainerStyle = InputUI.getInputContainerStyle();
  const glowBackgroundStyle = InputUI.getGlowBackgroundStyle(isFocused, hasError);
  const nativeInputVisual = InputUI.getNativeInputVisual({
    isFocused,
    hasValue,
    disabled,
    hasError,
  });

  return (
    <CustomView marginBottom={16}>
      {/* Label */}
      {label && (
        <CustomView marginBottom={8}>
          <Text style={styles.label}>{label}</Text>
        </CustomView>
      )}

      {/* Input with Verify Button - 按钮在输入框右侧，共享边框 */}
      <View style={[inputContainerStyle, styles.inputWrapper]}>
        {/* 光晕背景层 */}
        <View style={glowBackgroundStyle} />
        {/* 输入框和按钮容器 - 共享边框 */}
        <View style={[styles.inputRow, {
          borderWidth: nativeInputVisual.borderWidth,
          borderColor: nativeInputVisual.borderColor,
          borderRadius: nativeInputVisual.borderRadius,
          backgroundColor: nativeInputVisual.backgroundColor,
        }]}>
          {/* 输入框本身 */}
          <TextInput
            style={[
              styles.emailInput,
              !requireEmailVerification && styles.emailInputNoVerify,
            ]}
            placeholder="Enter your Email address"
            placeholderTextColor={InputUI.placeholderColor}
            value={value}
            onChangeText={handleEmailChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            editable={!disabled}
            textAlignVertical="center"
          />

          {/* Verify Button - 只有需要验证、有内容且邮箱格式正确时才显示 */}
          {requireEmailVerification && isValidEmail && (
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (isVerified || disabled || emailVerificationLoading) && styles.verifyButtonDisabled,
              ]}
              onPress={() => onVerify && onVerify(value)}
              disabled={isVerified || disabled || emailVerificationLoading}>
              {emailVerificationLoading ? (
                <ActivityIndicator size="small" color={Colors.PRIMARY || '#FF8200'} />
              ) : (
              <Text
                style={[
                  styles.verifyButtonText,
                  (isVerified || disabled) && styles.verifyButtonTextDisabled,
                ]}>
                {isVerified ? '' : 'Verify'}
              </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Success Message - 只有需要验证时才显示 */}
      {requireEmailVerification && isVerified && !displayError && (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={10} color="#FFFFFF" />
          </View>
          <Text style={styles.successText}>Email verification successful</Text>
        </View>
      )}

      {/* Error Message - 显示验证错误或表单验证错误 */}
      {displayError && (
        <View style={styles.errorContainer}>
          <Icon name="info" size={14} color="#E21A23" style={styles.errorIcon} />
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  inputWrapper: {
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emailInput: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 12,
    fontSize: 16,
    color: '#333333',
    backgroundColor: 'transparent',
  },
  emailInputNoVerify: {
    paddingRight: 16, // 不需要验证时，右侧 padding 更大
  },
  verifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  verifyButtonDisabled: {
    backgroundColor: 'transparent',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PRIMARY || '#FF8200',
  },
  verifyButtonTextDisabled: {
    color: '#999999',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  successIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  successText: {
    fontSize: 12,
    color: '#4CAF50',
    flex: 1,
    lineHeight: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  errorIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#E21A23',
    flex: 1,
    lineHeight: 16,
  },
});

export default EmailField;

