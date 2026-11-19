import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    backgroundColor: Colors.WHITE,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: Colors.BLACK,
    marginRight: 6,
  },
  icon: {
    marginTop: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#EEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  adChip: {
    backgroundColor: '#FFE1C9',
  },
  chipText: {
    fontSize: 14,
    color: Colors.BLACK,
  },
  moreChip: {
    backgroundColor: '#EEE',
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;

