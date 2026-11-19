import {StyleSheet} from 'react-native';
import {
  FONT_BOLD,
  FONT_MEDIUM,
  FONT_REGULAR,
  FONT_SIZE_20,
  FONT_SIZE_16,
} from '@app/styles/typography';

const styles = StyleSheet.create({
  titleText: {
    ...FONT_BOLD,
    fontSize: FONT_SIZE_20,
  },
  titleChild: {
    ...FONT_MEDIUM,
    fontSize: FONT_SIZE_16,
    textTransform: 'uppercase',
  },
  listChild: {
    ...FONT_REGULAR,
  },
});

export default styles;
