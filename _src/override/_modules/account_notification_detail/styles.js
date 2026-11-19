import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';
import {normalize} from '@app/styles/mixins';

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    backgroundColor: Colors.WHITE,
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(24),
  },
  iconSection: {
    alignItems: 'center',
    marginBottom: normalize(24),
  },
  iconContainer: {
    width: normalize(80),
    height: normalize(80),
    borderRadius: normalize(8),
    backgroundColor: Colors.GRAY_DARK3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dateRangeContainer: {
    marginBottom: normalize(24),
  },
  titleText: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: normalize(12),
    lineHeight: normalize(26),
  },
  dateText: {
    fontSize: normalize(12),
    color: '#979797',
    marginBottom: normalize(24),
    lineHeight: normalize(18),
  },
  contentText: {
    fontSize: normalize(14),
    color: Colors.BLACK,
    lineHeight: normalize(22),
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
  },
});

export default styles;

