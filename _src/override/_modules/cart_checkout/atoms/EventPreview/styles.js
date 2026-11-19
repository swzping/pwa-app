import {StyleSheet} from 'react-native';

import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  container: {
    height: normalize(132),
    borderRadius: normalize(16),
    overflow: 'hidden',
  },
  fixed: {
    position: 'absolute',
    left: normalize(12),
    right: normalize(12),
    zIndex: 20,
    elevation: 20,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    height: normalize(40),
    marginHorizontal: normalize(14),
    marginTop: normalize(14),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  brand: {
    width: normalize(112),
    height: normalize(40),
    borderRadius: normalize(24),
    backgroundColor: '#FFFDFC',
    borderWidth: 1,
    borderColor: '#FF8C25',
    overflow: 'hidden',
  },
  copy: {
    flex: 1,
    marginLeft: normalize(10),
    paddingTop: normalize(1),
  },
  title: {
    color: '#57270D',
    fontSize: normalize(14),
    fontWeight: '500',
    lineHeight: normalize(19),
  },
  subtitle: {
    marginTop: normalize(1),
    color: '#6E6E6E',
    fontSize: normalize(12),
    fontWeight: '400',
    lineHeight: normalize(15),
  },
  closeButton: {
    width: normalize(28),
    height: normalize(28),
    alignItems: 'center',
    justifyContent: 'center',
  },
  close: {
    color: '#616161',
    fontSize: normalize(32),
    fontWeight: '300',
    lineHeight: normalize(29),
  },
  stats: {
    marginTop: normalize(10),
    marginHorizontal: normalize(14),
    height: normalize(52),
    flexDirection: 'row',
    gap: normalize(8),
  },
  stat: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDFC',
    borderRadius: normalize(7),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statLabel: {
    color: '#292929',
    fontSize: normalize(12),
    fontFamily: 'Gilroy-Medium',
    fontWeight: '400',
  },
  statValue: {
    marginTop: normalize(2),
    color: '#292929',
    fontSize: normalize(14),
    fontWeight: '700',
    fontFamily: 'Gilroy-SemiBold',
  },
});

export default styles;
