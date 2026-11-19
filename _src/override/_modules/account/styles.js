import {StyleSheet} from 'react-native';

import {Colors, Mixins} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  barContainer: {
    borderColor: Colors.GRAY_MEDIUM,
    borderBottomWidth: 1,
  },
  customerIconContainer: {
    backgroundColor: '#D8AF7B',
    height: normalize(50),
    width: normalize(50),
    borderRadius: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    marginVertical: normalize(20),
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingModal: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    height: Mixins.MAX_HEIGHT,
    width: Mixins.MAX_WIDTH,
  },
  loadingModalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    height: 120,
    width: 120,
    borderRadius: 10,
  },
  modalMedicalContainer: {
    padding: 20,
  },
  modalMedicalContent: {
    marginBottom: 20,
  },
  modalMedicalCheckbox: {
    marginRight: 10,
  },
  modalMedicalText: {
    fontSize: 15,
  },
  modalMedicalTextAgreeWrapper: {
    marginLeft: 10,
  },
  modalMedicalTextAgree: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 9,
  },
  menuCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'nowrap',
    width: '100%',
  },
  menuCard: {
    width: (Mixins.MAX_WIDTH - 60) / 4,
    minWidth: (Mixins.MAX_WIDTH - 60) / 4,
    maxWidth: (Mixins.MAX_WIDTH - 60) / 4,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 0,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuCardText: {
    fontSize: 11,
    color: 'rgba(33, 33, 33, 1)',
    textAlign: 'center',
    fontWeight: '400',
    marginTop: 8,
  },
  separator: {
    height: 4,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    marginVertical: 10,
    marginHorizontal: -30,
  },
  sectionCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
});

export default styles;
