// /* eslint-disable no-undef */
import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';
import {MAX_WIDTH} from '@app/styles/mixins.new';

export const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: MAX_WIDTH * 0.9,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    flexDirection: 'column',
    padding: 20,
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '50%',
  },
  cancelButton: {
    borderColor: Colors.PRIMARY,
    borderWidth: 1,
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: Colors.PRIMARY,
  },
  cancelText: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
