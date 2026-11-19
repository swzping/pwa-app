import {StyleSheet} from 'react-native';

import {MD2Colors} from 'react-native-paper';

/**
 * Common styles shared across purchase detail screens
 * (ReturnOrRefundScreen / RefundDetailScreen / ReturnRefundDetailScreen)
 */
const commonStyles = StyleSheet.create({
  /* ---------- Screen layout ---------- */
  container: {
    flex: 1,
  },
  navBarContainer: {
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    marginBottom: 24,
  },
  scrollViewNoMargin: {
    marginBottom: 0,
  },
  divider: {
    height: 2,
    backgroundColor: MD2Colors.grey200,
  },
  sectionBorder: {
    borderBottomWidth: 2,
    borderColor: MD2Colors.grey200,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1b1a19',
  },

  /* ---------- Warning banner ---------- */
  warningBanner: {
    backgroundColor: '#757575',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    padding: 16,
  },
  warningIcon: {
    margin: 2,
  },
  warningText: {
    flex: 1,
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
    color: '#ffffff',
  },

  /* ---------- Order information ---------- */
  orderStatusText: {
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'right',
    color: '#46a147',
    textTransform: 'capitalize',
  },
  orderInfoText: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#1b1a19',
  },
  orderInfoSubText: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
    color: '#545453',
  },

  /* ---------- Form fields ---------- */
  fieldLabel: {
    marginRight: 4,
    fontWeight: '700',
    fontSize: 14,
    color: '#212121',
  },
  fieldWrapper: {
    gap: 12,
  },
  selectBox: {
    width: '100%',
    minHeight: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingHorizontal: 14,
  },
  fieldValueText: {
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#545453',
  },

  /* ---------- Product item ---------- */
  productItemBorder: {
    borderBottomWidth: 1,
    borderColor: MD2Colors.grey200,
  },
  productItemNoBorder: {
    borderBottomWidth: 0,
  },
  productRow: {
    gap: 8,
  },
  productImage: {
    width: 56,
    height: 56,
  },
  productNameText: {
    flex: 1,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#1b1a19',
  },
  productMetaLabel: {
    fontWeight: '400',
    fontSize: 12,
    color: '#545453',
  },
  productMetaValue: {
    fontWeight: '600',
    fontSize: 12,
    color: '#1b1a19',
  },

  /* ---------- Media ---------- */
  mediaUploader: {
    marginTop: 0,
  },
  noteBox: {
    height: 72,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
  },
});

export default commonStyles;
