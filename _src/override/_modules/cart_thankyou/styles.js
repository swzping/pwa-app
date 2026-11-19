import {StyleSheet} from 'react-native';

import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.ORANGE_LIGHT,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
  navBgColor: {
    width: '100%',
    height: '100%',
  },
  purchaseSuccessfulLogo: {
    width: 100,
    height: 100,
    marginTop: 48,
  },
  purchaseSuccessfulTxt: {
    marginTop: 24,
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
  },
  orderNumber: {
    marginTop: 8,
    textAlign: 'center',
    color: '#757575',
    fontSize: 14,
  },
  action: {
    gap: 12,
    marginTop: 24,
  },
  viewOrderBtn: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: Colors.PRIMARY,
    boxSizing: 'border-box',
  },
  backHome: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.PRIMARY,

  },
  pointsEarned: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  pointsEarnedSummary: {
    fontSize: 12,
    color: '#212121',
  },
});

export default styles;
