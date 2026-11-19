import React, {useState} from 'react';
import {View, StyleSheet, TextInput} from 'react-native';
import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import Icon from 'react-native-vector-icons/Feather';
import {InputUI} from '@app/styles';
import CountryCodePicker from './CountryCodePicker';

const PhoneNumberField = ({
  value,
  onChange,
  onBlur,
  error,
  label,
  disabled = false,
  countryCode,
  onCountryCodeChange,
  onValidationChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = !!(value && value.trim().length > 0);
  const displayError = error?.message;
  const hasError = !!displayError;

  // 验证并设置手机号：允许输入任何字符，但只有纯数字且不超过15位才有效
  const handlePhoneNumberChange = text => {
    // 限制最多20位
    const limitedText = text.slice(0, 20);
    onChange(limitedText);

    // 如果长度为0，显示"必须输入"错误
    if (limitedText.length === 0) {
      if (onValidationChange) {
        onValidationChange({message: 'Phone number is required.'});
      }
      return;
    }

    // 实时验证
    const isNumeric = /^(8[1-9][0-9]{7,10})$/.test(limitedText);

    // 如果不符合规则显示错误
    if (!isNumeric) {
      if (onValidationChange) {
        // 如果超过15位，显示特定错误信息
        onValidationChange({message: 'Please enter a valid phone number.'});
      }
    } else {
      // 输入有效，清除所有错误（包括点击 Next 时设置的"必须输入"错误）
      if (onValidationChange) {
        onValidationChange(null);
      }
    }
  };

  // 处理失焦
  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
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
            <Text style={styles.label}>{label}</Text>
          )}
        </CustomView>
      )}

      {/* Input Container */}
      <View style={styles.inputRow}>
        {/* Country Code Selector */}
        {countryCode && (
          <CountryCodePicker
            selectedCode={countryCode}
            onSelectCode={onCountryCodeChange}
          />
        )}

        {/* Phone Number Input */}
        <View style={[inputContainerStyle, {flex: 1}]}>
          {/* 光晕背景层 */}
          <View style={glowBackgroundStyle} />
          {/* 输入框本身 */}
          <TextInput
            style={[styles.phoneInput, nativeInputVisual]}
            placeholder="Enter your Phone Number"
            placeholderTextColor={InputUI.placeholderColor}
            value={value}
            onChangeText={handlePhoneNumberChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            keyboardType="default"
            editable={!disabled}
            textAlignVertical="center"
            maxLength={20}
          />
        </View>
      </View>

      {/* Error Message */}
      {displayError && (
        <View style={styles.errorContainer}>
          <Icon
            name="info"
            size={14}
            color="#E21A23"
            style={styles.errorIcon}
          />
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
  requiredAsterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333333',
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

export default PhoneNumberField;
