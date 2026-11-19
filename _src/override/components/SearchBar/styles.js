import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  frameSearchbar: {
    borderWidth: 1,
    borderRadius: 20,
    width: '100%',
    height: 40,
    borderColor: Colors.WHITE,
    backgroundColor: Colors.WHITE,
    alignSelf: 'center',
    padding: 0,
    margin: 2,
  },
  frameSearchInput: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingRight: 10,
  },
  frameSearchText: {
    color: Colors.BLACK,
    paddingLeft: 5,
    paddingRight: 5,
    flex: 1,
    height: 40,
    fontSize: 12,
  },
  frameSearchUserSearchWrapper: {
    backgroundColor: Colors.GRAY_SMOOTH2,
    borderRadius: 20,
  },
  frameSearchTextUseSearch: {
    color: Colors.BLACK,
    height: 40,
    fontSize: 12,
  },
  modalContainer: {
    backgroundColor: Colors.WHITE,
    flex: 1,
  },
});

export default styles;
