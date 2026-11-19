import React from 'react';
import {StyleSheet} from 'react-native';

import {Picker} from '@react-native-picker/picker';

import CustomView from '@app/components/CustomView';
import Text from '@app/components/Text';
import {Colors, Mixins} from '@app/styles';

const styles = StyleSheet.create({
  framePicker: {
    height: 30,
    width: 40,
    color: Colors.BLACK,
  },
});

const CustomPicker = ({
  pickerData,
  selectedValue,
  setSelectedValue,
  enabled = true,
  placeholder,
  styleContainer,
  itemStyle,
  pickerStyle,
}) => {
  return (
    <CustomView style={[styleContainer, {flexDirection: 'row'}]}>
      <Text
        numberOfLines={1}
        style={{paddingLeft: 10, width: Mixins.MAX_WIDTH / 3}}>
        {selectedValue !== ''
          ? pickerData?.items?.[selectedValue]?.label
          : placeholder}
      </Text>
      <Picker
        enabled={enabled}
        selectedValue={selectedValue}
        mode="dropdown"
        style={[styles.framePicker, pickerStyle]}
        itemStyle={[{fontSize: 10}, itemStyle]}
        onValueChange={itemValue => setSelectedValue(itemValue)}>
        <Picker.Item label={placeholder} value="" />
        {pickerData?.items?.map((item, index) => {
          return (
            <Picker.Item label={item.label} value={index} key={item.label} />
          );
        })}
      </Picker>
    </CustomView>
  );
};

export default CustomPicker;
