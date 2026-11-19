import React from 'react';
import {StyleSheet} from 'react-native';

import CustomView from '@app/components/CustomView';
import RadioButton from '@app/components/RadioButton';
import Text from '@app/components/Text';
import {Colors} from '@app/styles';

const GenderField = ({
  value,
  onChange,
  error,
  options = [],
  label = 'Gender',
}) => {
  // 只有在从接口获取到数据后才渲染选项
  const genderOptions = options.length > 0 ? options : [];

  return (
    <CustomView marginTop={10} marginBottom={10}>
      {label && label.includes('*') ? (
        <Text style={styles.label}>
          {label.split('*')[0]}
          <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
      {genderOptions.length > 0 && (
        <CustomView row>
          {genderOptions.map(option => (
            <CustomView
              key={option.value}
              row
              horizontalCenter
              style={styles.radioOption}>
              <RadioButton
                selected={String(value) === String(option.value)}
                onPress={() => onChange(option.value)}
                activeColor={Colors.PRIMARY || '#FF8200'}
                size={20}
              />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </CustomView>
          ))}
        </CustomView>
      )}
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </CustomView>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  radioOption: {
    marginRight: 24,
  },
  radioLabel: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 4,
  },
  requiredAsterisk: {
    color: '#FF0000',
  },
});

export default GenderField;
