import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';
import {MAX_WIDTH, normalize} from '@app/styles/mixins.new';

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: MAX_WIDTH * 0.85,
    backgroundColor: Colors.WHITE,
    borderRadius: normalize(8),
    padding: normalize(20),
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  titleText: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: '#333333',
    marginBottom: normalize(12),
    textAlign: 'center',
  },
  bodyText: {
    fontSize: normalize(14),
    color: '#333333',
    textAlign: 'center',
    marginBottom: normalize(16),
    lineHeight: normalize(20),
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: normalize(16),
  },
  button: {
    width: '100%',
    paddingVertical: normalize(14),
    borderRadius: normalize(8),
    backgroundColor: '#FF8200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: Colors.WHITE,
  },
});

