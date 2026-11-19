import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerCustomerCare = () => {
  return (
    <>
      <CustomView width={'100%'} marginBottom={15}>
        <Shimmer wrapperStyle={{height: 150, width: '100%'}} />
      </CustomView>
      <CustomView width={'100%'} marginBottom={15}>
        <Shimmer wrapperStyle={{height: 150, width: '100%'}} />
      </CustomView>
      <CustomView width={'100%'} marginBottom={15}>
        <Shimmer wrapperStyle={{height: 150, width: '100%'}} />
      </CustomView>
    </>
  );
};

export default AtomShimmerCustomerCare;
