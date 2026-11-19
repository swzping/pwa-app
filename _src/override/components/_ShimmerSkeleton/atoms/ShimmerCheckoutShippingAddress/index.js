import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerCheckoutShippingAddress = () => {
  return (
    <CustomView>
      <CustomView width={'70%'}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 25, width: '100%'}} />
      </CustomView>
      <CustomView width={'60%'} marginTop={10}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 25, width: '100%'}} />
      </CustomView>
      <CustomView width={'80%'} marginTop={10}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 25, width: '100%'}} />
      </CustomView>
    </CustomView>
  );
};

export default AtomShimmerCheckoutShippingAddress;
