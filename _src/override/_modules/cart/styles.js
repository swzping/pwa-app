import {StyleSheet} from 'react-native';

import {IS_IOS} from '@app/helpers/Constants';
import {Colors, Mixins} from '@app/styles';
import {Typography} from '@app/styles/index';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  cartDelete: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  cartItemActionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    width: 30,
    height: 30,
    borderRadius: 20,
  },

  cartItemTitle: {
    fontSize: 14,
    marginBottom: 10,
  },

  cartItemDetailText: {
    fontSize: 14,
    marginBottom: 10,
  },
  // text aligned to the far right for bottom rows or extra fields
  cartItemRightText: {
    alignSelf: 'flex-end',
    textAlign: 'right',
    fontSize: 14,
  },

  cartItemDetailTextDiscount: {
    fontSize: 13,
    marginBottom: 10,
    color: Colors.PRIMARY,
  },

  cartItemDiscountPromo: {
    fontSize: 12,
    marginTop: 5,
    marginBottom: 10,
    fontWeight: 'bold',
  },

  cartItemPromoWrapper: {
    backgroundColor: Colors.RED_LIGHT_1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    width: 85,
    height: 19,
    position: 'absolute',
    bottom: 0,
  },

  cartItemPromo: {
    fontSize: 8,
    color: Colors.WHITE,
    fontWeight: 'bold',
  },

  cartItemImage: {
    height: normalize(100),
    width: Mixins.MAX_WIDTH * 0.3,
    resizeMode: 'contain',
  },

  checkOutButtonContainer: {
    backgroundColor: Colors.PRIMARY,
    height: 48,
    justifyContent: 'center',
    borderWidth: 0,
    borderRadius: 0,
    width: '90%',
  },

  checkOutButtonText: {
    color: Colors.WHITE,
    fontWeight: IS_IOS ? 'bold' : null,
    fontSize: 16,
    ...Typography.FONT_BOLD,
  },

  listContainer: {
    width: Mixins.MAX_WIDTH,
    marginTop: 10,
  },

  subTotalSubContainer: {
    borderTopWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    backgroundColor: Colors.WHITE,
    shadowColor: '#ccc',
    opacity: 1,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.3,
    elevation: 3,
  },

  subtotal: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },

  wishlistIcon: {
    borderRadius: normalize(25),
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    padding: normalize(5),
    width: 30,
    height: 30,
    marginRight: 15,
    marginBottom: 10,
  },
  navbarTitleStyle: {fontSize: 14, ...Typography.FONT_BOLD},
  navbarStylesContainer: {
    backgroundColor: Colors.GRAY_DARK3,
    borderBottomColor: Colors.GRAY_DARK4,
    borderBottomWidth: 1,
  },
  navbarStylesContainerEdit: {
    borderBottomColor: Colors.GRAY_DARK4,
    borderBottomWidth: 1,
  },
  itemsHeaderTitle: {
    marginLeft: 20,
    marginTop: 15,
  },
  // ---- GWP block ----
  gwpContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  // status banner
  gwpStatusBanner: {
    backgroundColor: '#FFEEDB',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  gwpStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gwpStatusLeft: { flex: 1 },
  gwpPill: {
    backgroundColor: '#FF8A2B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gwpPillText: {
    color: '#fff',
    fontWeight: '400',
    marginLeft: 6,
  },
  gwpStatusText: {
    color: '#333',
    fontSize: 14,
  },
  gwpStatusHighlight: {
    color: '#FF8A2B',
  },
  gwpChevronRight: {
    marginLeft: 10,
  },
  // success banner

  gwpSuccessBanner: {
    backgroundColor: '#E8F7EC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  gwpSuccessTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#46A147',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  gwpSuccessText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  gwpHeaderTitle: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
    color: '#757575',
  },
  gwpCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    position: 'relative',
  },
  gwpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gwpImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 10,
  },
  gwpName: {
    color: '#000',
    fontSize: 15,
  },
  gwpGiftTag: {
    backgroundColor: '#E21A23',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  gwpGiftTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  gwpDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: 8,
  },
  gwpCheckBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#46A147',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gwpFooter: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#EEEEEE',
  },
  gwpFooterText: {
    color: '#212121',
    marginRight: 4,
  },
  oosHeaderWrapper: {
    backgroundColor: '#dc3545',
  },
  oosHeaderTitle: {
    marginLeft: 15,
    marginVertical: 10,
    color: Colors.WHITE,
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  chevroIcon: {
    // height: IS_IOS ? 24 : 22,
    height: 20,
  },
  priceInfoWrap: {
    flexDirection: 'column',
    opacity: 1,
  },
  tipContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 12,
    backgroundColor: '#FBE4E2',
    shadowColor: '#ccc',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 1,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  tipText: {
    flex: 1,
    marginLeft: 15,
    fontWeight: 500,
    fontSize: 16,
    color: '#CC2B1E',
  },
  tipPadding: {
    paddingBottom: 12,
    shadowColor: '#000',
    opacity: 1,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    elevation: 2,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  outOfStockContainer: {
    paddingVertical: 6,
  },
  outOfStockText: {
    color: Colors.WHITE,
    fontSize: 12,
    fontWeight: '400',
  },
});

export default styles;
