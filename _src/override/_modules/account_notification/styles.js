import {StyleSheet} from 'react-native';
import {normalize} from '@app/styles/mixins';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  navBarNoBorder: {
    borderBottomWidth: 0,
  },
  tabContainerWrapper: {
    backgroundColor: Colors.WHITE,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    minHeight: normalize(48),
    paddingVertical: normalize(0),
    paddingHorizontal: normalize(12),
    marginTop: normalize(-12),
    paddingBottom: 0,
    borderBottomWidth: 4,
    width: '100%',
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  tabItem: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(12),
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: normalize(48),
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    marginRight: normalize(24),
    marginBottom: -4,
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: Colors.PRIMARY,
  },
  tabText: {
    fontSize: normalize(14),
    lineHeight: normalize(20),
    color: Colors.GRAY_DARK2,
    fontWeight: 'normal',
  },
  activeTabText: {
    color: Colors.PRIMARY,
    fontWeight: 700,
    lineHeight: normalize(20),
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(8),
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
    minHeight: normalize(90),
  },
  unreadNotificationItem: {
    backgroundColor: '#FFFCF4',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: normalize(12),
    flexShrink: 0,
  },
  unreadDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: Colors.RED_LIGHT_1,
    marginRight: normalize(8),
  },
  unreadDotPlaceholder: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: normalize(65),
    height: normalize(65),
    borderRadius: normalize(4),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    marginRight: normalize(12),
    minWidth: 0,
  },
  titleText: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: normalize(4),
    lineHeight: normalize(20),
  },
  unreadTitleText: {
    color: Colors.BLACK,
    fontWeight: 'bold',
  },
  readTitleText: {
    color: Colors.GRAY_DARK2,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: normalize(12),
    color: Colors.GRAY_DARK2,
    marginBottom: normalize(4),
    lineHeight: normalize(18),
  },
  dateText: {
    fontSize: normalize(11),
    color: Colors.GRAY_DARK2,
    marginTop: normalize(2),
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(40),
    paddingTop: normalize(80),
  },
  emptyIcon: {
    marginTop: normalize(-160),
  },
  emptyText: {
    fontSize: normalize(14),
    color: Colors.GRAY_MEDIUM,
    marginTop: normalize(16),
  },
  footerContainer: {
    paddingVertical: normalize(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: normalize(12),
    color: Colors.GRAY_DARK2,
  },
});

export default styles;
