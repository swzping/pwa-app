import {StyleSheet} from 'react-native';
import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';
import {Typography} from '@app/styles/index';
import {IS_IOS} from '@app/helpers/Constants';

const styles = StyleSheet.create({
  cartItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: Colors.GRAY_MEDIUM,
    borderTopWidth: 0,
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(6),
  },
  mainContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: '#eee',
  },
  listContainer: {
    width: Mixins.MAX_WIDTH,
    marginTop: 0,
    paddingBottom: 5,
    maxHeight: 200,
  },
  paymentButtonContainer: {
    height: normalize(50),
    justifyContent: 'center',
    borderWidth: 0,
    borderRadius: 0,
  },
  paymentButtonContainerDisabled: {
    backgroundColor: Colors.GRAY_MEDIUM,
  },
  paymentButtonText: {
    color: Colors.WHITE,
    fontWeight: IS_IOS ? 'bold' : null,
    fontSize: 16,
    ...Typography.FONT_BOLD,
  },
  priceBlockContainer: {
    borderColor: Colors.GRAY_MEDIUM,
    borderTopWidth: 0.5,
    width: Mixins.MAX_WIDTH,
    paddingVertical: normalize(10),
    backgroundColor: Colors.WHITE,
  },
  priceBlockTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: normalize(25),
  },
  subTotalSubContainer: {
    borderColor: Colors.GRAY_LIGHT,
  },
  shadowBox: {
    borderTopWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    width: '100%',
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.2,
  },
  subtotal: {
    borderTopWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    marginHorizontal: 20,
  },
  chevroIcon: {
    // height: IS_IOS ? 24 : 22,
  },
  normalPriceItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },
  navbarTitleStyle: {...Typography.FONT_BOLD, fontWeight: 'bold'},
  containerStyle: {paddingBottom: 0},
  maskStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    top: 0,
    bottom: 50,
    left: 0,
    right: 0,
  },
  cartItemTitle: {
    fontSize: 14,
  },
  cartItemDetailText: {
    fontSize: 14,
  },
  priceInfoWrap: {
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
  },
  btnCheckVoucher: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: IS_IOS ? 10 : 8,
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: '#FFF0F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  errorText: {
    color: '#E41305',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    position: 'relative',
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});

export default styles;
