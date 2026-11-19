import {StyleSheet} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {FONT_FAMILY_REGULAR} from '@app/styles/typography';

const styles = StyleSheet.create({
  childrenContainer: {
    borderTopWidth: 0,
    borderBottomLeftRadius: normalize(15),
    borderBottomRightRadius: normalize(15),
  },

  childrenItemContainer: {
    marginHorizontal: normalize(30),
    paddingVertical: normalize(10),
    borderColor: Colors.GRAY_MEDIUM,
  },

  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: Mixins.MAX_WIDTH - 40,
    paddingHorizontal: normalize(15),
  },

  headerImage: {
    width: normalize(80),
    height: normalize(80),
    marginHorizontal: normalize(15),
  },

  listContainer: {},

  listText: {
    fontWeight: 'bold',
  },

  vesMenuText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },

  vesMenuChildText: {
    width: Mixins.MAX_WIDTH * 0.85,
  },

  vesMenuWrapper: {
    alignSelf: 'stretch',
    paddingVertical: 5,
  },

  vesMenuNameWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoryList: {
    borderColor: '#eee',
    borderBottomWidth: 1,
    paddingTop: 5,
    paddingBottom: 5,
  },
  categoryListTitle: {
    color: '#000',
    fontSize: 12,
    fontFamily: FONT_FAMILY_REGULAR,
  },
  categoryListItem: {
    paddingTop: 4,
    paddingBottom: 4,
    fontSize: 12,
  },
});

export default styles;
