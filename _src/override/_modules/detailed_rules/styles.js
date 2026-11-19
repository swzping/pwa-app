import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default styles;
