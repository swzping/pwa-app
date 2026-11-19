import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerCheckoutShippingMethod = () => {
  return (
    <CustomView paddingHorizontal={10} marginBottom={10}>
      <CustomView width={'100%'}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 25, width: '100%'}} />
      </CustomView>
      <CustomView width={'100%'} marginTop={10}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 25, width: '100%'}} />
      </CustomView>
      <CustomView width={'100%'} marginTop={10}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 25, width: '100%'}} />
      </CustomView>
    </CustomView>
  );
};

export default AtomShimmerCheckoutShippingMethod;
