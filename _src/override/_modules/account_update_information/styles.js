import {StyleSheet} from 'react-native';
import {normalize} from '@app/styles/mixins';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  saveButton: {
    alignSelf: 'center',
    marginVertical: normalize(50),
  },
  subContainer: {
    paddingTop: normalize(20),
  },
  labelBold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: -55,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignSelf: 'center',
  },
  centerButton: {
    marginTop: 10,
    marginBottom: 50,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.ALERT_SECONDARY,
    backgroundColor: Colors.ALERT_SECONDARY,
    width: '60%',
  },
});

export default styles;
