import {StyleSheet} from 'react-native';
import {Mixins} from '@app/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  svgMargin: {
    ...Mixins.margin(0, 2, 0, 2),
  },
});

export default styles;
