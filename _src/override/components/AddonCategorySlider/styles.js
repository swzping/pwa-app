import {StyleSheet} from 'react-native';
import {Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  categoryImageContainer: {
    flex: 1,
    width: Mixins.MAIN_BANNER_WIDTH * 0.25,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingBottom: 8,
  },

  categoryImage: {
    height: normalize(56),
    width: normalize(56),
    borderRadius: normalize(10),
    alignSelf: 'center',
  },

  categoryTitle: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 10,
  },

  listContainer: {
    marginTop: 10,
    width: Mixins.MAIN_BANNER_WIDTH,
  },
});

export default styles;
