import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  btnGenerate: {
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    width: '50%',
  },
  btnCopy: {
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.PRIMARY,
    width: '50%',
  },
});

export default styles;
