import {StyleSheet} from 'react-native';

import {Colors, Mixins} from '@app/styles';

const styles = StyleSheet.create({
  bannerFrame: {
    width: Mixins.MAX_WIDTH,
    alignSelf: 'center',
  },
  buttonFilter: {
    position: 'absolute',
    bottom: 20,
    left: '35%',
    right: '35%',
    zIndex: 1,
    shadowColor: Colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.36,
    shadowRadius: 6.68,
    elevation: 4,
  },
  chipSelected: {
    backgroundColor: '#FFE7BA',
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
  chipUnselected: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
  },
});

export default styles;
