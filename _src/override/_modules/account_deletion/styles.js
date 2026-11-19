import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 10,
    backgroundColor: Colors.GRAY_LIGHT,
    padding: 20,
    borderRadius: 8,
  },
  flatList: {
    flex: 1,
    padding: 20,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    backgroundColor: Colors.ALERT_SECONDARY,
  },
  itemContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    width: '100%',
  },
  centerButton: {
    marginTop: 10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.ALERT_SECONDARY,
    backgroundColor: Colors.ALERT_SECONDARY,
    width: '60%',
  },
});

export default styles;
