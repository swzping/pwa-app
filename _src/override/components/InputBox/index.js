import React from 'react';
import {TextInput} from 'react-native';

import {Colors} from '@app/styles';

const InputBox = ({
  value,
  onChangeText,
  style,
  multilines = false,
  placeholder = null,
  height = 40,
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      multiline={multilines}
      placeholder={placeholder}
      style={{
        backgroundColor: Colors.WHITE,
        height: height,
        paddingHorizontal: 10,
        ...style,
      }}
    />
  );
};

export default InputBox;
