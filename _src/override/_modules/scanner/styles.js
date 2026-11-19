import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  backBtnWrap: {
    width: '100%',
    display: 'flex',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  scanBox: {
    width: '100%',
    height: 270,
  },
  scanBoxImg: {
    width: 270,
    height: 270,
  },
  scanTip: {
    backgroundColor: 'rgba(0,0,0, 0.5)',
    color: 'white',
    borderRadius: 4,
    padding: 10,
    marginTop: 20,
    alignItems: 'center',
  },
});

export default styles;
