import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerItemDiscount = () => {
  return (
    <CustomView column>
      <CustomView width={50} marginBottom={5}>
        <Shimmer
          wrapperStyle={{
            borderRadius: 10,
            height: 15,
            width: '100%',
          }}
        />
      </CustomView>
      <CustomView width={60} marginBottom={5}>
        <Shimmer
          wrapperStyle={{
            borderRadius: 10,
            height: 14,
            width: '100%',
          }}
        />
      </CustomView>
    </CustomView>
  );
};

export default AtomShimmerItemDiscount;
