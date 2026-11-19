import {Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {StyleSheet} from 'react-native';

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
});

export default styles;
