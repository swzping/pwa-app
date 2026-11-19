import {StyleSheet} from 'react-native';

import {Colors} from '@app/styles';

export default StyleSheet.create({
  sectionHeader: {
    paddingVertical: 14,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#FFE7BA',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  chipUnselected: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 42,
    fontSize: 13,
    color: Colors.BLACK,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,

  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 3,
    fontSize: 14,
    color: '#616161',
  },
  showMoreLink: {
    paddingVertical: 4,
  },
});
