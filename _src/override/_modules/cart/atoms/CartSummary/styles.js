import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: Colors.BLACK,
  },
  discount: {
    fontSize: 11,
  },
  discountWrap: {
    borderBottomWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },
  normalPriceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },
});

export default styles;
