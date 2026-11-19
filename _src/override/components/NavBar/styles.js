import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  frameNavbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  frameLogo: {
    width: '100%',
    left: 10,
    top: 2,
    resizeMode: 'contain',
  },
  frameSearch: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameBackButton: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '22%',
  },
  frameBackButtonLogo: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '5%',
    paddingLeft: 10,
  },
  frameRightChildren: {
    flexDirection: 'row',
  },
  frameRightChildrenLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '88%',
    paddingLeft: -5,
    paddingRight: 10,
  },
});

export default styles;
