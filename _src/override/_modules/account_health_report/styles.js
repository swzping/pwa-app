import {StyleSheet} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(10),
    paddingLeft:normalize(22),
    height: normalize(110),
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'relative',
    marginRight: normalize(12),
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: normalize(65),
    height: normalize(65),
  },
  unreadDot: {
    position: 'absolute',
    left: normalize(-16),
    top: normalize(27.5),
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: Colors.RED,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
    paddingRight: normalize(8),
  },
  title: {
    marginBottom: normalize(-4),
    fontSize: normalize(13),
  },
  detailsContainer: {
    marginTop: normalize(8),
    marginBottom: normalize(6),
  },
  detailText: {
    marginBottom: normalize(-4),
  },
  detailText1:{
    marginBottom: normalize(0),
  },
  timeText: {
    marginTop: normalize(4),
  },
  arrowContainer: {
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: normalize(24),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: normalize(50),
    paddingHorizontal: normalize(24),
    marginTop:normalize(-100)
  },
  emptyIllustration: {
    marginBottom: normalize(16),
    width: '100%',
  },
  emptyMessage: {
    textAlign: 'center',
  },
  footerContainer: {
    paddingVertical: normalize(20),
    alignItems: 'center',
  },
});

export default styles;

