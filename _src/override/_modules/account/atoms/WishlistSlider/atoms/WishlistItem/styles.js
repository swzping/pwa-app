import {Mixins} from '@app/styles';
import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  itemContainer: {
    width: Mixins.MAX_WIDTH - 65,
    marginBottom: 10,
    marginHorizontal: 5,
    paddingBottom: 10,
  },
  itemImage: {
    alignSelf: 'center',
    height: Mixins.MAX_HEIGHT * 0.3,
    width: Mixins.MAX_WIDTH * 0.6,
  },
});

export default styles;
