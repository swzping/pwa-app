/* eslint-disable no-undef */
import {StyleSheet} from 'react-native';
import {Colors, Mixins} from '@app/styles';

const sliderHeight = {
  height: Mixins.MAX_WIDTH - 220,
};

export default styles = StyleSheet.create({
  loaderView: {
    justifyContent: 'center',
    alignItems: 'center',
    ...sliderHeight,
  },
  sliderFrame: {
    ...Mixins.padding(0, 0, 0, 0),
  },
  featuredBrandsContainer: {
    width: Mixins.MAX_WIDTH * 0.9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  sliderPaginationStyles: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 5,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  sliderPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    marginHorizontal: 0,
    top: -5,
    backgroundColor: Colors.PRIMARY,
  },
  sliderPaginationDotInactive: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: Colors.GRAY_MEDIUM,
  },
  imageLoader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
