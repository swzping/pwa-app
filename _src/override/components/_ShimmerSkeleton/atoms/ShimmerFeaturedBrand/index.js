import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerFeaturedBrand = () => {
  return (
    <CustomView column horizontalCenter marginTop={20}>
      <CustomView width={'90%'}>
        <Shimmer
          wrapperStyle={{
            borderRadius: 5,
            height: 120,
            width: '100%',
          }}
        />
      </CustomView>
    </CustomView>
  );
};

export default AtomShimmerFeaturedBrand;
