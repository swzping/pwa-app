import { StyleSheet } from 'react-native';

import { Colors, Mixins } from '@app/styles/index';
import { normalize } from '@app/styles/mixins';

const styles = StyleSheet.create({
  addToCartButtonContainer: {
    backgroundColor: Colors.PRIMARY,
  },

  bundleOptionItemContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  bundleOptionItemImage: {
    height: normalize(50),
    width: normalize(50),
    resizeMode: 'contain',
    borderColor: 'rgba(0,0,0, 0.7)',
    borderWidth: normalize(5),
    backgroundColor: 'grey',
    marginHorizontal: normalize(10),
  },

  mainContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  discountText: {
    position: 'absolute',
    top: 20,
    left: 18,
    zIndex: 3,
    fontWeight: 'bold',
    fontSize: normalize(23),
    color: Colors.RED,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  brandBy: {
    fontSize: 12,
    color: '#212121',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 13,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#212121',
  },
  complianceText: {
    fontSize: 12,
  },
  productImage: {
    width: Mixins.MAX_WIDTH,
    height: Mixins.MAX_HEIGHT * 0.5,
    resizeMode: 'contain',
  },
  videoContainer: {
    width: '100%',
    height: Mixins.MAX_HEIGHT * 0.5,
    backgroundColor: '#000',
  },
  sliderPaginationStyles: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  sliderPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginHorizontal: 0,
    top: -5,
    backgroundColor: Colors.PRIMARY,
  },
  sliderPaginationDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: Colors.GRAY_MEDIUM,
  },
  flashSaleCountdownWrapper: {
    width: Mixins.MAX_WIDTH,
    marginTop: normalize(-40),
    marginBottom: normalize(12),
  },
  freeGiftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    flex: 1,
    width: '100%',
  },
  freeGiftText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontStyle: 'normal',
  },
  freeGiftDetailedRules: {
    fontSize: 14,
    color: '#FF8200',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 7,
    backgroundColor: '#EFEBEB',
    borderRadius: 5,
  },
  progress: {
    height: 7,
    backgroundColor: '#FF8200',
    borderRadius: 5,
  },
  giftIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#e0e0e0',
    // borderWidth: 1,
    marginLeft: -15,
  },
  promoBannerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFEBD6',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 4,
    marginHorizontal: 20,
    marginBottom: 13,
  },
  promoBannerTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  bottomSheetBannerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 8,
    paddingTop: 14,
  },
  promoBannerText: {
    fontSize: 14,
    color: '#000',
  },
  promoBannerAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginHorizontal: 5,
  },
  viewAllContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 13,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF8200',
    marginRight: 5,
  },
  giftProductListContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  giftProductContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    marginRight: 15,
  },
  giftProductTopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 5,
    minHeight: 85,
  },
  giftProductImageContainer: {
    marginRight: 10,
  },
  giftProductImage: {
    width: 80,
    height: 80,
  },
  giftProductInfo: {
    flex: 1,
  },
  giftProductName: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    minHeight: 50,
  },
  giftPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 5,
    gap: 8,
  },
  giftPrice: {
    fontSize: 14,
    color: '#E21A23',
    fontWeight: 'bold',
  },
  giftOriginalPrice: {
    fontSize: 12,
    color: '#888',
    textDecorationLine: 'line-through',
  },
  giftTag: {
    backgroundColor: '#E21A23',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  giftTagOutOfStock: {
    backgroundColor: 'rgba(226, 26, 35, 0.5)',
    borderRadius: 3,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  giftTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  outStockImage: {
    width: 30,
    height: 12,
    resizeMode: 'contain',
  },
  stockInfoContainer: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  stockText: {
    fontSize: 11,
    color: '#888',
    marginRight: 10,
  },
  limitedStockText: {
    marginTop: 5,
  },
  // Pills row for stock and limited info
  stockInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoPill: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  infoPillText: {
    fontSize: 12,
    color: '#666',
  },
  // Event time pill
  eventTimePill: {
    backgroundColor: '#F3F3F3',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
  },
  eventTimePillText: {
    fontSize: 12,
    color: '#666',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -110 }, { translateY: -25 }],
    width: 220,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  productOutOfStockOverlay: {
    borderRadius: 100,
  },
  outOfStockText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 24,
    textAlign: 'center',
  },
  outOfStockColor: {
    color: '#E21A23',
  },
  disabledText: {
    color: '#BDBDBD',
  },
  disabledTextImg: {
    color: 'white',
  },
  textFontSize: {
    fontSize: 11,
  },
  // Bottom Sheet styles
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: '75%',
    maxHeight: '75%',
  },
  modalHeader: {
    alignItems: 'center',
    paddingVertical: 3,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
  },
  modalScrollView: {
    flex: 1,
    marginTop: 10,
  },
  modalScrollContent: {
    paddingBottom: 80,
  },
  scrollbarTrack: {
    position: 'absolute',
    right: 8,
    top: 80,
    bottom: 18,
    width: 10,
    alignItems: 'center',
    overflow: 'hidden',
  },
  scrollbarThumb: {
    position: 'absolute',
    right: 0,
    backgroundColor: '#D9D9D9',
    borderRadius: 3,
    opacity: 0.9,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomSheetTitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    flex: 1,
    color: '#000',
  },
  bottomSheetItemContainer: {
    flexDirection: 'column',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
    width: '97%',
    alignSelf: 'center',
  },
  bottomSheetItemTopRow: {
    flexDirection: 'row',
  },
  bottomSheetItemImage: {
    width: 80,
    height: 80,
    marginRight: 0,
  },
  bottomSheetItemImageWrap: {
    position: 'relative',
    marginRight: 16,
  },
  bottomSheetItemInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  eventTimeText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  // Loading styles
  progressLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftIconLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
  },
  fullWidthSeparator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 5,
    alignSelf: 'stretch',
    marginLeft: -20,
    marginRight: -20,
  },
});

export const descriptionStyle = StyleSheet.create({
  div: {
    paddingHorizontal: 12,
    paddingBottom: 30,
    fontSize: 14, //原12
  },
});

export default styles;
