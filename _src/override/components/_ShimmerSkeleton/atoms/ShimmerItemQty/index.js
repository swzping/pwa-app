import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerItemQty = () => {
  return (
    <CustomView column>
      <CustomView width={60}>
        <Shimmer
          wrapperStyle={{
            borderRadius: 10,
            height: 30,
            width: '100%',
          }}
        />
      </CustomView>
    </CustomView>
  );
};

export default AtomShimmerItemQty;
