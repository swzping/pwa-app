import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput as RNTextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors, InputUI} from '@app/styles';

const EmailVerificationField = ({
  value,
  onChange,
  error,
  onVerify,
  notVeritfy = false,
  verificationStatus,
  loading,
  isSubmitting,
  label,
  emailVerificationError,
  onEmailChange,
  showVerifiedSuccessMessage = true, // 初始化回填的已验证不展示文案，仅本会话内验证后展示
  textStyleProp = {},
  labelStyleProp = {},
  showInfoIcon = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    text => {
      onChange(text);
      // 当用户修改邮箱时，清除验证状态和错误
      if (onEmailChange) {
        onEmailChange();
      }
    },
    [onChange, onEmailChange],
  );

  const handleVerify = useCallback(() => {
    if (value && onVerify) {
      onVerify(value);
    }
  }, [value, onVerify]);

  // 检查邮箱格式错误
  const emailError = useMemo(() => {
    // 优先显示 emailVerificationError，否则显示 error?.message
    return (
      emailVerificationError ||
      error?.message ||
      (error && typeof error === 'string' ? error : null)
    );
  }, [error, emailVerificationError]);

  // 检查邮箱格式是否正确（用于决定是否显示验证按钮）
  const isValidEmailFormat = useMemo(() => {
    return (
      value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)
    );
  }, [value]);

  const hasValue = !!(value && value.trim().length > 0);
  const isVerified = verificationStatus === 'success';
  const displayError = emailError;
  const hasError = !!displayError;

  // 使用 InputUI 获取样式
  const inputContainerStyle = InputUI.getInputContainerStyle();
  const glowBackgroundStyle = InputUI.getGlowBackgroundStyle(
    isFocused,
    hasError,
  );
  const nativeInputVisual = InputUI.getNativeInputVisual({
    isFocused,
    hasValue,
    disabled: false,
    hasError,
  });

  return (
    <CustomView marginBottom={16}>
      {/* Label */}
      {label && (
        <CustomView marginBottom={8}>
          <Text style={[styles.label, labelStyleProp]}>{label}</Text>
        </CustomView>
      )}

      {/* Input with Verify Button - 按钮在输入框右侧，共享边框 */}
      <View style={[inputContainerStyle, styles.inputWrapper]}>
        {/* 光晕背景层 */}
        <View style={glowBackgroundStyle} />
        {/* 输入框和按钮容器 - 共享边框 */}
        <View
          style={[
            styles.inputRow,
            {
              borderWidth: nativeInputVisual.borderWidth,
              borderColor: nativeInputVisual.borderColor,
              borderRadius: nativeInputVisual.borderRadius,
              backgroundColor: nativeInputVisual.backgroundColor,
            },
          ]}>
          {/* 输入框本身 */}
          <RNTextInput
            style={[styles.emailInput, textStyleProp]}
            placeholder="Enter your Email address"
            placeholderTextColor={InputUI.placeholderColor}
            value={value || ''}
            onChangeText={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
            editable={true}
            textAlignVertical="center"
            contextMenuHidden={false}
          />

          {/* Verify Button - 集成在输入框内，只有邮箱格式正确且有内容时才显示 */}
          {!notVeritfy && isValidEmailFormat && hasValue && (
            <TouchableOpacity
              style={[
                styles.verifyButton,
                (isVerified || loading) && styles.verifyButtonDisabled,
                textStyleProp,
              ]}
              onPress={handleVerify}
              disabled={isVerified || loading}
              activeOpacity={0.7}>
              {loading ? (
                <ActivityIndicator size="small" color={Colors.PRIMARY} />
              ) : (
                <Text
                  style={[
                    styles.verifyButtonText,
                    isVerified && styles.verifyButtonTextDisabled,
                  ]}>
                  {isVerified ? '' : 'Verify'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Success Message - 仅本会话内完成验证时展示，初始化回填不展示 */}
      {isVerified && showVerifiedSuccessMessage && !displayError && (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={10} color="#FFFFFF" />
          </View>
          <Text style={styles.successText}>Email verification successful</Text>
        </View>
      )}

      {/* Error Message */}
      {displayError && !isVerified && (
        <View style={styles.errorContainer}>
          {showInfoIcon && (
            <Icon
              name="info"
              size={14}
              color="#E21A23"
              style={styles.errorIcon}
            />
          )}
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
    marginRight: -6,
    marginTop: 1,
  },
  errorText: {
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#E21A23',
    flex: 1,
    lineHeight: 16,
  },
});

export default EmailVerificationField;
