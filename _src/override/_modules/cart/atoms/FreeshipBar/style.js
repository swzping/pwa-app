import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  barWrap: {
    display: 'flex',
    flexDirection: 'row',
    height: 48,
    alignItems: 'center',
    borderColor: '#eee',
    borderWidth: 1,
    marginHorizontal: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  icon: {
    width: 24,
    height: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  right: {
    flex: 1,
    overflow: 'hidden',
  },
  text: {
    fontSize: 12,
  },
  orangeText: {
    fontSize: 12,
    color: '#FF8200',
  },
  barBack: {
    backgroundColor: '#e5e5e5',
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    overflow: 'hidden',
  },
  process: {
    backgroundColor: '#FF8200',
    width: 0,
    height: 4,
    borderRadius: 2,
  },
  processDone: {
    backgroundColor: '#46A147',
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  checkback: {
    backgroundColor: '#46A147',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});

export default styles;
