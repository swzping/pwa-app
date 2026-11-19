import {StyleSheet} from 'react-native';
import * as Colors from '@app/styles/colors';

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  container2: {
    flex: 2,
  },
  container3: {
    flex: 3,
  },
  container4: {
    flex: 4,
  },
  container5: {
    flex: 5,
  },
  container6: {
    flex: 6,
  },
  container7: {
    flex: 7,
  },
  container8: {
    flex: 8,
  },
  container9: {
    flex: 9,
  },
  container10: {
    flex: 10,
  },

  flexRow: {
    flexDirection: 'row',
  },
  flexRowReserve: {
    flexDirection: 'row-reverse',
  },
  flexColumn: {
    flexDirection: 'column',
  },

  containerTopContent: {
    justifyContent: 'flex-start',
  },
  containerBetweenContent: {
    justifyContent: 'space-between',
  },
  containerCenterContent: {
    justifyContent: 'center',
  },
  containerEndContent: {
    justifyContent: 'flex-end',
  },

  alignCenterItems: {
    alignItems: 'center',
  },
  alignLeftItems: {
    alignItems: 'flex-start',
  },
  alignRightItems: {
    alignItems: 'flex-end',
  },

  textAlignLeft: {
    textAlign: 'left',
  },
  textAlignCenter: {
    textAlign: 'center',
  },
  textAlignRight: {
    textAlign: 'right',
  },

  alignSelfEnd: {
    alignSelf: 'flex-end',
  },
  alignSelfCenter: {
    alignSelf: 'center',
  },
  alignSelfStart: {
    alignSelf: 'flex-start',
  },

  paddingRegularHorizontal: {
    paddingLeft: 16,
    paddingRight: 16,
  },

  marginLeftAuto: {
    marginLeft: 'auto',
  },

  containerWhiteBackground: {
    backgroundColor: Colors.WHITE,
  },

  //Padding
  noPadding: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  noPaddingVertical: {
    paddingVertical: 0,
  },

  noPaddingHorizontal: {
    paddingLeft: 0,
    paddingRight: 0,
  },

  red: {
    borderWidth: 1,
    borderColor: 'red',
  },

  //Hide and Show
  show: {
    opacity: 1,
  },
  hide: {
    opacity: 0,
  },

  //Text Font Weight
  boldText: {
    fontWeight: '700',
  },
  semiBoldText: {
    fontWeight: '600',
  },
  noBoldText: {
    fontWeight: '500',
  },
  regularText: {
    fontWeight: '400',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  lineThroughText: {
    textDecorationLine: 'line-through',
  },

  //Text Font Size
  extraSmallText: {
    fontSize: 8,
  },
  smallerSize: {
    fontSize: 10,
  },
  smallText: {
    fontSize: 12,
  },

  normalText: {
    fontSize: 14,
  },
  extraNormalText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 18,
  },

  largeText: {
    fontSize: 20,
  },
  headerText: {
    fontSize: 24,
  },
  largeHeaderText: {
    fontSize: 28,
  },
  extraLargeHeaderText: {
    fontSize: 30,
  },
  extraLargeText: {
    fontSize: 30,
  },

  smallIconSize: {
    fontSize: 23,
  },
  normalIconSize: {
    fontSize: 25,
  },
  normalIconGifSize: {
    width: 25,
    height: 25,
  },
  normalHeaderIconSize: {},
});
