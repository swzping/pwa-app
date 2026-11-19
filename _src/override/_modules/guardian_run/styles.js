import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  containerScroll: {},
  internalServerErrorText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: '#EEE',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtn: {
    backgroundColor: '#FF9900',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  registerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  desc: {
    color: '#444',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  infoBlock: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: '#EEE',
    marginHorizontal: 8,
  },
  prizeTitle: {
    color: '#FF9900',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  prizeBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  prizeImg: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: '#DDD',
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prizeDesc: {
    color: '#444',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default styles;
