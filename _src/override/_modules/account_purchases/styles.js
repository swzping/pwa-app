import {StyleSheet} from 'react-native';

import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  tabBar: {
    borderBottomWidth: 4,
    borderBottomColor: '#e0e0e0',
    backgroundColor: Colors.WHITE,
    elevation: 0,
  },
  indicator: {
    backgroundColor: Colors.PRIMARY,
    height: 4,
    bottom: -4,
  },
  label: {
    color: Colors.PRIMARY,
  },
  container: {
    flex: 1,
  },
  detailsButton: {
    ...Mixins.padding(8, 8, 8, 8),
    ...Mixins.margin(0, 5, 0, 5),
    backgroundColor: Colors.PRIMARY,
    borderRadius: normalize(10),
  },
  orderDateText: {
    fontSize: normalize(11),
  },
  orderStatusText: {
    textTransform: 'uppercase',
    marginTop: normalize(5),
  },
  orderTabsWrapper: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#e0e0e0',
  },
  orderTabsItem: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  tabItemText: {
    color: '#212121',
    fontSize: normalize(14),
    paddingLeft: normalize(2),
    paddingRight: normalize(2),
  },
  tabItemActive: {
    position: 'absolute',
    bottom: -16,
    width: normalize(110),
  },
  offlineSortWrapper: {
    margin: normalize(8, 12),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  orderStoreName: {
    color: '#000',
    fontSize: normalize(18),
    marginBottom: normalize(8),
  },
  orderItemTotal: {
    position: 'relative',
    marginTop: normalize(10),
    flexDirection: 'row',
    width: '100%',
  },
  orderRightOutlined: {
    position: 'absolute',
    right: 0,
    top: normalize(5),
  },
  noDataWrapper: {
    marginTop: normalize(120),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: normalize(13),
    color: '#757575',
    textAlign: 'center',
    marginTop: normalize(10),
  },
});

export default styles;
