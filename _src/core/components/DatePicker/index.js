import DateTimePicker from '@react-native-community/datetimepicker';
import Text from '@app/components/Text';
import CustomView from '@app/components/CustomView';
import React, {useState} from 'react';
import DateHelper from '@app/helpers/Date';
import {DARK} from '@app/helpers/Constants';
import {Colors} from '@app/styles';
import {rxUserTheme} from '@app/services/cache';
import {useReactiveVar} from '@apollo/client';

const DatePicker = ({label = '', mode = 'date', callback}) => {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);
  const scheme = useReactiveVar(rxUserTheme);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    callback(DateHelper.convert(currentDate, '/', {reverse: true}));
  };

  return (
    <CustomView
      row
      spaceBetween
      width="100%"
      paddingHorizontal={10}
      paddingVertical={10}
      horizontalCenter
      verticalCenter>
      <Text>{label}</Text>
      <CustomView
        borderColor={scheme === DARK ? Colors.WHITE : Colors.BLACK}
        borderRadius={15}
        paddingVertical={5}
        paddingHorizontal={10}
        onPress={() => setShow(true)}>
        <Text>{DateHelper.convert(date, ' ', {useMonthString: true})}</Text>
      </CustomView>

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          display="default"
          onChange={onDateChange}
        />
      )}
    </CustomView>
  );
};

export default DatePicker;
