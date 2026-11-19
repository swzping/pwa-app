import {StyleSheet} from 'react-native';

import {Colors,Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  itemContainerPDP: {
    flex: 0.5,
    width: Mixins.MAX_WIDTH * 0.5,
    alignItems: 'center',
    marginBottom: normalize(10),
    marginHorizontal: normalize(5),
    paddingBottom: 10,
  },
  itemContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  itemImage: {
    height: normalize(150),
    width: '100%',
  },
  itemContainerForHomepage: {
    width: '100%',
  },
  discountText: {
    position: 'absolute',
    top: 8,
    left: 5,
    zIndex: 3,
    fontWeight: 'bold',
    fontSize: normalize(12),
    color: Colors.RED,
  },
});

export default styles;
