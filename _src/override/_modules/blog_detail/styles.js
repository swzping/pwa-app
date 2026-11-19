import {StyleSheet} from 'react-native';

import {Mixins} from '@app/styles';

const styles = StyleSheet.create({
  blogImageContainer: {
    width: Mixins.MAX_WIDTH - 40,
    height: Mixins.MAX_HEIGHT * 0.3,
  },
});

export default styles;
