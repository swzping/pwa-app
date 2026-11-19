import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';
import Swiper from '@app/components/Swiper';
import {Colors} from '@app/styles/index';

const defaultItems = Array.from({length: 3}).fill(null);

const AtomShimmerProducts = ({
  items = defaultItems,
  settings = {},
  flatListContainerStyle,
  flatListContentContainerStyle,
}) => {
  const {dots = false, slidesPerView = 2.4, spaceBetween = 12} = settings;

  const ProductItem = () => {
    return (
      <>
        <CustomView
          column
          borderRadius={8}
          border={0.5}
          borderColor={Colors.GRAY_SMOOTH3}
          paddingTop={0}
          marginBottom={10}
          backgroundColor={Colors.WHITE}>
          <CustomView padding={10}>
            <Shimmer
              wrapperStyle={{width: '100%', height: 'auto', aspectRatio: 1}}
            />
          </CustomView>
          <CustomView padding={10}>
            <CustomView marginBottom={5}>
              <Shimmer wrapperStyle={{height: 18, width: '95%'}} />
            </CustomView>
            <CustomView marginBottom={5}>
              <Shimmer wrapperStyle={{height: 18, width: '90%'}} />
            </CustomView>
            <CustomView marginBottom={5}>
              <Shimmer wrapperStyle={{height: 18, width: '70%'}} />
            </CustomView>
            <CustomView marginBottom={5}>
              <Shimmer wrapperStyle={{height: 18, width: '85%'}} />
            </CustomView>
          </CustomView>
        </CustomView>
      </>
    );
  };

  return (
    <>
      <Swiper
        dots={dots}
        slidesPerView={slidesPerView}
        spaceBetween={spaceBetween}
        flatListConfigs={{
          windowSize: 3,
          maxToRenderPerBatch: 3,
          initialNumToRender: 3,
          removeClippedSubviews: true,
        }}
        flatListContainerStyle={flatListContainerStyle}
        flatListContentContainerStyle={flatListContentContainerStyle}>
        {items.map((child, index) => (
          <ProductItem key={index} />
        ))}
      </Swiper>
    </>
  );
};

export default AtomShimmerProducts;
