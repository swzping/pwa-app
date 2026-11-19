import {StyleSheet} from 'react-native';
import {isIOS} from '@app/styles/mixins.new';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 0,
    zIndex: 10,
  },
  scanWrap: {
    position: 'absolute',
    top: isIOS ? 2 : 60,
    zIndex: 10,
    width: '100%',
    height: 130,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  scanContent: {
    backgroundColor: '#F1D170',
    width: '70%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    position: 'relative',
  },
  scanTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  scanText: {
    fontSize: 12,
    color: 'black',
    marginTop: 6,
  },
  closeBtn: {
    position: 'absolute',
    paddingVertical: 6,
    paddingHorizontal: 10,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  triangle: {
    width: 0,
    height: 0,
    borderWidth: 10,
    borderColor: 'transparent',
    borderBottomColor: '#F1D170',
    position: 'absolute',
    right: 12,
    top: -20,
  },
});

export default styles;
