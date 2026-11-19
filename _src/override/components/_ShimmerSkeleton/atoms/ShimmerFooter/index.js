import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerFooter = () => {
  const ShimmerMenu = () => {
    return (
      <CustomView column horizontalCenter marginBottom={30}>
        <CustomView width={'40%'} marginBottom={30}>
          <Shimmer wrapperStyle={{height: 22, width: '100%'}} />
        </CustomView>
        <CustomView width={'30%'} marginBottom={15}>
          <Shimmer wrapperStyle={{height: 18, width: '100%'}} />
        </CustomView>
        <CustomView width={'45%'} marginBottom={15}>
          <Shimmer wrapperStyle={{height: 18, width: '100%'}} />
        </CustomView>
        <CustomView width={'32%'} marginBottom={15}>
          <Shimmer wrapperStyle={{height: 18, width: '100%'}} />
        </CustomView>
        <CustomView width={'40%'} marginBottom={15}>
          <Shimmer wrapperStyle={{height: 18, width: '100%'}} />
        </CustomView>
        <CustomView width={'25%'} marginBottom={15}>
          <Shimmer wrapperStyle={{height: 18, width: '100%'}} />
        </CustomView>
        <CustomView width={'36%'} marginBottom={15}>
          <Shimmer wrapperStyle={{height: 18, width: '100%'}} />
        </CustomView>
      </CustomView>
    );
  };
  const ShimmerSocialMedia = () => {
    return (
      <CustomView column horizontalCenter marginBottom={30}>
        <CustomView width={'40%'} marginBottom={30}>
          <Shimmer wrapperStyle={{height: 22, width: '100%'}} />
        </CustomView>
        <CustomView row verticalCenter width={'100%'} marginBottom={15}>
          <CustomView marginHorizontal={5}>
            <Shimmer wrapperStyle={{height: 40, width: 40, borderRadius: 50}} />
          </CustomView>
          <CustomView marginHorizontal={5}>
            <Shimmer wrapperStyle={{height: 40, width: 40, borderRadius: 50}} />
          </CustomView>
          <CustomView marginHorizontal={5}>
            <Shimmer wrapperStyle={{height: 40, width: 40, borderRadius: 50}} />
          </CustomView>
          <CustomView marginHorizontal={5}>
            <Shimmer wrapperStyle={{height: 40, width: 40, borderRadius: 50}} />
          </CustomView>
          <CustomView marginHorizontal={5}>
            <Shimmer wrapperStyle={{height: 40, width: 40, borderRadius: 50}} />
          </CustomView>
        </CustomView>
      </CustomView>
    );
  };
  return (
    <>
      <ShimmerMenu />
      <ShimmerMenu />
      <ShimmerSocialMedia />
    </>
  );
};

export default AtomShimmerFooter;
