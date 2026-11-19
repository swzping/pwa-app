import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: Colors.WHITE,
  },
  title: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  list: {
    backgroundColor: '#FAFAFA',
    padding:12,
    paddingVertical:12,
    borderRadius:8
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    width: '48%',
  },
  rankWrapper: {
    alignItems: 'center',
    marginRight: 12,
  },
  brandRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.GRAY_LIGHT3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crownOnly: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondCrown: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdCrown: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    color: Colors.BLACK,
  },
  brandLogoContainer: {
    width: 100,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },
});

export default styles;

