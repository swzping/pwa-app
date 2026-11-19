import {Picker} from '@react-native-picker/picker';
import React from 'react';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import {useReactiveVar} from '@apollo/client';
import {Colors} from '@app/styles';
import {rxUserTheme} from '@app/services/cache';

const CustomPicker = ({
  pickerData,
  selectedValue,
  setSelectedValue,
  enabled = true,
}) => {
  const scheme = useReactiveVar(rxUserTheme);

  return (
    <CustomView
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Text>{pickerData.name} : </Text>
      <Picker
        enabled={enabled}
        selectedValue={selectedValue}
        style={{
          height: 50,
          flex: 1,
          backgroundColor: scheme === 'dark' ? Colors.BLACK : Colors.WHITE,
          color: scheme === 'dark' ? Colors.WHITE : Colors.BLACK,
        }}
        itemStyle={{fontSize: 10}}
        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}>
        {pickerData.items.map(item => (
          <Picker.Item label={item.label} value={item.value} key={item.label} />
        ))}
      </Picker>
    </CustomView>
  );
};

export default CustomPicker;
