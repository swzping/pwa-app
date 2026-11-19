import {StyleSheet} from 'react-native';
import {normalize} from '@app/styles/mixins';
import {IS_IOS} from '@app/helpers/Constants';

const styles = StyleSheet.create({
  headerImage: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: 50,
  },
  headerIcon: {
    width: normalize(40),
    height: normalize(40),
    borderRadius: 50,
    backgroundColor: '#F8EAE5',
  },
  br: {
    marginTop: 0,
    marginBottom: IS_IOS ? -38 : -42,
  },
});

export default styles;
