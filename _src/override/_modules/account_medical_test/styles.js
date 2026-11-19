import {StyleSheet} from 'react-native';
import {Colors} from '@app/styles';

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: Colors.PRIMARY,
    elevation: 0,
  },
  topContainer: {
    backgroundColor: Colors.PRIMARY,
    paddingBottom: 30,
  },
  bottomContainer: {
    paddingHorizontal: 22,
    paddingTop: 17,
  },
  iconSuccess: {
    marginTop: 80,
    marginBottom: 34,
  },
  iconData: {
    marginTop: 5,
    marginBottom: 15,
  },
  title: {
    marginHorizontal: 21,
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  titleResult: {
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors.WHITE,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 20,
    marginHorizontal: 45,
    marginBottom: 40,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.WHITE,
  },
  viewStoreWrapper: {
    borderColor: Colors.WHITE,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: 320,
    alignSelf: 'center',
  },
  viewStore: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.WHITE,
  },
  noData: {
    marginVertical: 40,
    fontStyle: 'italic',
    fontSize: 12,
  },
  testResult: {
    paddingLeft: 11,
  },
  testInfoContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#CCCCCC',
  },
  testItemWrapper: {
    marginTop: 0,
  },
  testItemWrapperWithDivider: {
    borderColor: '#CCCCCC',
    borderBottomWidth: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  testItemContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  testItemContentMergeTop: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  testItemContentMergeBottom: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  testItemTitle: {
    fontSize: 13,
  },
  testItemValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  testItemUnit: {
    fontSize: 11,
    paddingTop: 3,
  },
  testItemDes: {
    fontSize: 11,
    color: '#8F8F8F',
  },
  testNoted: {
    marginTop: 16,
    fontSize: 11,
    color: '#8F8F8F',
  },
});

export default styles;
