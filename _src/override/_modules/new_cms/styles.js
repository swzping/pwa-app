import {StyleSheet} from 'react-native';
import {normalize} from '@app/styles/mixins';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  cmsContentContainer: {
    paddingBottom: normalize(24),
  },
  htmlContentContainer: {
    paddingBottom: normalize(24),
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
