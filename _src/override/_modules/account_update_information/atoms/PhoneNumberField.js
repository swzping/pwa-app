import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import CountryCodePicker from '@app/_modules/auth_signin/atoms/CountryCodePicker';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors, InputUI} from '@app/styles';

const PhoneNumberField = ({
  value,
  onChange,
  error,
  label,
  onVerify,
  isVerified = false,
  disabled = false,
  notVeritfy = false,
  phoneVerificationError = null,
  onPhoneChange,
  countryCode: initialCountryCode = '+62',
  showVerifiedSuccessMessage = true, // 初始化回填的已验证不展示文案，仅本会话内验证后展示
  phoneVerificationLoading = false,
  phoneCodeStyleProp = {},
  textStyleProp = {},
  labelStyleProp = {},
  onCountryCodeChange,
  showInfoIcon = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [countryCode, setCountryCode] = useState(initialCountryCode);

  const hasValue = !!(value && value.trim().length > 0);
  const displayError = phoneVerificationError || error?.message;

  // 获取完整的电话号码（包含国家代码）
  const getFullPhoneNumber = () => {
    if (!value || !value.trim()) {
      return '';
    }
    return `${countryCode}${value}`;
  };

  // 只允许数字（可选首位 +），有特殊字符时不能点 Verify 且输入框下报错
  const fullPhone = getFullPhoneNumber();
  const withoutPlus = fullPhone.trim().replace(/^\+/, '');
  const isDigitsOnly = withoutPlus.length > 0 && /^\d+$/.test(withoutPlus);
  const hasInvalidChars = withoutPlus.length > 0 && !isDigitsOnly;
  const displayErrorResolved =
    displayError ||
    (hasInvalidChars ? 'Please enter a valid phone number' : null);
  const hasError = !!displayErrorResolved;

  // 包装 onChange，在修改电话号码时清除验证状态
  const handlePhoneChange = text => {
    onChange(text);
    if (onPhoneChange) {
      onPhoneChange();
    }
  };

  // 使用 InputUI 获取样式
  const inputContainerStyle = InputUI.getInputContainerStyle();
  const glowBackgroundStyle = InputUI.getGlowBackgroundStyle(
    isFocused,
    hasError,
  );
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
        <CustomView
          marginBottom={8}
          style={{flexDirection: 'row', alignItems: 'center'}}>
          {label.includes('*') ? (
            <>
              <Text style={styles.label}>{label.split('*')[0]}</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </>
          ) : (
            <Text style={[styles.label, labelStyleProp]}>{label}</Text>
          )}
        </CustomView>
      )}

      {/* Country Code and Phone Input Row */}
      <View style={styles.rowContainer}>
        {/* Country Code Selector */}
        <CountryCodePicker
          selectedCode={countryCode}
          onSelectCode={code => {
            onCountryCodeChange?.(code);
            setCountryCode(code);
          }}
          textStyleProp={phoneCodeStyleProp}
        />

        {/* Input with Verify Button - 按钮在输入框右侧，共享边框 */}
        <View style={[inputContainerStyle, styles.inputWrapper, {flex: 1}]}>
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
            <TextInput
              style={[styles.phoneInput, textStyleProp]}
              placeholder="Enter your Phone Number"
              placeholderTextColor={InputUI.placeholderColor}
              value={value}
              onChangeText={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              editable={!disabled}
              textAlignVertical="center"
              contextMenuHidden={false}
            />

            {/* Verify Button - 仅当为纯数字时显示，有特殊字符时直接隐藏 */}
            {!notVeritfy &&
              hasValue &&
              isDigitsOnly &&
              !isVerified &&
              !disabled && (
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    phoneVerificationLoading && styles.verifyButtonDisabled,
                    textStyleProp,
                  ]}
                  onPress={() => {
                    if (onVerify && !phoneVerificationLoading) {
                      const full = getFullPhoneNumber();
                      requestAnimationFrame(() => {
                        onVerify(full);
                      });
                    }
                  }}
                  disabled={phoneVerificationLoading}
                  activeOpacity={0.7}>
                  {phoneVerificationLoading ? (
                    <ActivityIndicator size="small" color={Colors.PRIMARY} />
                  ) : (
                    <Text style={styles.verifyButtonText}>Verify</Text>
                  )}
                </TouchableOpacity>
              )}
          </View>
        </View>
      </View>

      {/* Success Message - 仅本会话内完成验证时展示，初始化回填不展示 */}
      {isVerified && showVerifiedSuccessMessage && !displayErrorResolved && (
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Icon name="check" size={10} color="#FFFFFF" />
          </View>
          <Text style={styles.successText}>
            Phone number verification successful
          </Text>
        </View>
      )}

      {/* Error Message */}
      {displayErrorResolved && !isVerified && (
        <View style={styles.errorContainer}>
          {showInfoIcon && (
            <Icon
              name="info"
              size={14}
              color="#E21A23"
              style={styles.errorIcon}
            />
          )}
          <Text style={styles.errorText}>{displayErrorResolved}</Text>
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
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputWrapper: {
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  phoneInput: {
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

export default PhoneNumberField;
