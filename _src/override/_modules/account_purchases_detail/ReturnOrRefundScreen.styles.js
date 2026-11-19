import {StyleSheet} from 'react-native';

import {Colors} from '@app/styles';

import commonStyles from './common.style';

/**
 * Styles for ReturnOrRefundScreen (Views + SelectModal)
 */
const styles = StyleSheet.create({
  ...commonStyles,

  /* ---------- Form rows ---------- */
  fieldLabelMuted: {
    marginRight: 4,
    fontWeight: '700',
    fontSize: 14,
    color: '#bdbdbd',
  },
  fieldLabelGray: {
    marginRight: 4,
    fontWeight: '700',
    fontSize: 14,
    color: '#545453',
  },
  requiredMark: {
    fontFamily: 'Quicksand',
    fontWeight: '500',
    fontSize: 14,
    color: '#f04438',
  },
  attachmentHintText: {
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 16,
    color: '#9e9e9e',
  },
  selectValueText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#8f8d8a',
  },
  selectValueTextDisabled: {
    fontWeight: '400',
    fontSize: 14,
    color: '#bdbdbd',
  },
  chevronIcon: {
    marginLeft: 4,
    marginTop: 2,
  },
  refundToText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#212121',
  },
  totalRefundText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#ff8200',
  },
  tipsText: {
    flex: 1,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
    color: '#8f8d8a',
  },

  /* ---------- Inputs ---------- */
  otherReasonInput: {
    height: 'auto',
    minHeight: 44,
    marginTop: 14,
    marginHorizontal: 14,
    backgroundColor: '#fafafa',
    borderColor: '#f0efed',
    borderWidth: 1.3,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    lineHeight: 20,
    color: '#1b1a19',
  },
  notesInput: {
    height: 'auto',
    minHeight: 44,
    marginTop: 8,
    backgroundColor: '#fafafa',
    borderColor: '#f0efed',
    borderWidth: 1.3,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1b1a19',
  },

  /* ---------- Actions ---------- */
  actionsRow: {
    gap: 8,
  },
  actionButton: {
    justifyContent: 'center',
    alignSelf: 'center',
    flex: 1,
    height: 48,
    marginTop: 8,
    backgroundColor: Colors.PRIMARY,
  },
  actionButtonText: {
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    color: '#ffffff',
  },

  /* ---------- Select modal ---------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    position: 'relative',
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    color: '#000000',
  },
  modalCloseButton: {
    position: 'absolute',
    right: 16,
    top: 11,
  },
  modalListContainer: {
    paddingHorizontal: 14,
  },
  optionRadioButton: {
    marginRight: 6,
  },
  optionText: {
    fontWeight: '500',
    fontSize: 14,
    color: '#545453',
  },
  modalFooter: {
    height: 76,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#f0efed',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 12,
    padding: 14,
  },
  confirmButton: {
    height: 48,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: Colors.WHITE,
    fontWeight: '700',
    fontSize: 16,
  },
});

export default styles;
