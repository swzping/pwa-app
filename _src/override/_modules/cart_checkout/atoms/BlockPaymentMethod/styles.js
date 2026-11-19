import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  paymentItem: {
    flexDirection: 'row',
    marginHorizontal: 10,
    paddingVertical: 10,
  },
  itemContainer: {
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  headerBlockStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderColor: Colors.GRAY_SMOOTH,
  },
  headerBlockContentStyle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentGroupingText: {
    fontSize: 14,
  },
  paymentItemText: {
    paddingLeft: 10,
    fontSize: 14,
  },
});

export default styles;
