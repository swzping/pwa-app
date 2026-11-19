import {StyleSheet} from 'react-native';

import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

/**
 * Base styles for the reorder button, reused by the secondary (outline)
 * and main action button variants below.
 */
const reorderButtonText = {
  fontWeight: '700',
  fontSize: 16,
  textAlign: 'center',
  color: '#ffffff',
};

const reorderButtonContainer = {
  backgroundColor: Colors.PRIMARY,
  height: 48,
  justifyContent: 'center',
  alignSelf: 'center',
  width: '90%',
};

const styles = StyleSheet.create({
  bmLine: {
    borderBottomWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
  },
  blockHeaderText: {
    marginBottom: normalize(5),
  },
  orderStatusLine: {
    alignSelf: 'flex-start',
    marginTop: normalize(25),
  },
  orderStatusItemText: {
    flex: 1,
  },
  productItemsTitle: {
    marginBottom: normalize(5),
  },
  requestReturnButton: {
    borderColor: 'white',
    backgroundColor: 'white',
  },
  requestReturnButtonText: {
    color: 'red',
  },
  reorderButtonText,
  reorderButtonContainer,
  deliveryCard: {
    marginVertical: 24,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
  },
  deliveryTopBar: {
    height: 4,
    backgroundColor: '#F5F5DC',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
  },
  deliveryTitle: {
    fontWeight: '400',
    fontSize: 12,
    color: '#757575',
  },
  arrowIcon: {
    fontSize: normalize(16),
    color: '#000000',
    fontWeight: 'bold',
  },
  shippingAddressSection: {
    marginTop: 10,
  },
  shippingAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 8,
  },
  shippingAddressTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1b1a19',
  },
  shippingAddressText: {
    marginLeft: 24,
    fontWeight: '500',
    fontSize: 12,
    color: '#757575',
  },
  earnPointsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    alignSelf: 'stretch',
  },
  earnPointsTitle: {
    marginBottom: 10,
    color: Colors.PRIMARY,
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: 20,
  },
  earnPointsDesc: {
    color: Colors.PRIMARY,
    fontSize: normalize(12),
  },
  alertOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  /* --- Extracted from _view.js inline styles --- */
  safeArea: {
    flex: 1,
  },
  countdownContainer: {
    height: 28,
    backgroundColor: '#fff0ef',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownLabel: {
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
    color: '#cc2b1e',
  },
  countdownValue: {
    minWidth: 60,
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'left',
    color: '#cc2b1e',
  },
  arrowImage: {
    width: 20,
    height: 20,
  },
  locationImage: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  orderStatusLabel: {
    fontWeight: '700',
    fontSize: 16,
  },
  createdAtText: {
    fontWeight: '400',
    fontSize: 13,
    color: '#757575',
  },
  fieldLabel: {
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 16,
    color: '#757575',
  },
  fieldValue: {
    marginTop: 4,
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  bcaVaCard: {
    backgroundColor: '#fff8e8',
    borderColor: '#ffd38b',
    borderWidth: 1,
    borderRadius: 8,
    gap: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bcaVaNumber: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
  bcaCopyText: {
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
    color: '#ff8200',
  },
  bcaExpiresText: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#cc2b1e',
  },
  textLeft: {
    textAlign: 'left',
  },
  downloadInvoiceButton: {
    height: 32,
    backgroundColor: '#9c9c9c',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 2,
    paddingHorizontal: 12,
  },
  downloadInvoiceButtonText: {
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    color: '#ffffff',
  },
  itemOrderedText: {
    marginBottom: 9,
  },
  discountRow: {
    alignItems: 'center',
    marginTop: 5,
  },
  promoPill: {
    backgroundColor: '#FFF0E6',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    maxWidth: '65%',
  },
  promoPillText: {
    fontSize: 13,
    color: '#F96D01',
    fontWeight: 'bold',
  },
  promoAmountText: {
    fontSize: 14,
    color: '#F96D01',
  },
  studentDiscountPill: {
    backgroundColor: '#FFD38B',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  studentDiscountAmountText: {
    color: '#FF8200',
  },
  negativeAmountText: {
    color: 'red',
  },
  secondaryButtonText: {
    ...reorderButtonText,
    color: Colors.PRIMARY,
    padding: 0,
  },
  secondaryButtonTextDisabled: {
    fontWeight: '700',
    fontSize: 11,
    color: '#969696',
  },
  secondaryButtonContainer: {
    ...reorderButtonContainer,
    marginTop: 10,
    height: 32,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  secondaryButtonContainerDisabled: {
    backgroundColor: '#e5e5e5',
    borderWidth: 0,
  },
  mainButtonContainer: {
    ...reorderButtonContainer,
    marginTop: 8,
  },
  copyAlertBox: {
    width: 'auto',
    alignSelf: 'center',
  },
  copyAlertLabel: {
    flex: 0,
    flexShrink: 1,
  },
  /* --- Refund status card --- */
  refundCard: {
    minHeight: 106,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  refundCardHeader: {
    height: 44,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  refundIcon: {
    marginRight: 4,
  },
  refundCardTitle: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16,
    color: '#212121',
  },
  refundStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  refundStatusText: {
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
  },
  refundCardBody: {
    height: 62,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 2,
  },
  refundReasonText: {
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    color: '#212121',
  },
});

export default styles;
