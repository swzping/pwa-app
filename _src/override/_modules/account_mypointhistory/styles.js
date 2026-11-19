import {StyleSheet} from 'react-native';

import {Colors} from '@app/styles';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerImageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 260,
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContentNum: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerContentValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginRight: 2,
  },
  pointIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  warningIcon: {
    width: 20,
    height: 20,
  },
  headerContentText: {
    fontSize: 12,
    color: '#757575',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  tab: {
    alignItems: 'space-between',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: '#212121',
  },
  tabTextActive: {
    color: Colors.PRIMARY,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    height: 4,
    marginHorizontal: -16,
    backgroundColor: Colors.PRIMARY,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  pointContentCard: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderStyle: 'solid',
    borderColor: '#EEEEEE',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointDateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  f14: {
    fontSize: 14,
  },
  EXPIRE: {
    color: '#757575',
  },
  VALID: {
    color: '#46A147',
  },
  USED: {
    color: Colors.RED_LIGHT_2,
  },
  REVERSE_SEND: {
    color: Colors.RED_LIGHT_2,
  },
  REVERSE_DEDUCT: {
    color: Colors.RED_LIGHT_2,
  },
  pointNumContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginLeft: 8,
  },
  pointNumValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  pointText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    marginTop: 8,
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8E8',
    borderRadius: 12,
  },
  cardBodyItem: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  justifyContent: {
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 14,
    color: '#212121',
  },
  metaValue: {
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  noMore: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
  },
  noMoreTxt: {
    fontSize: 12,
    lineHeight: 16,
  },
});
