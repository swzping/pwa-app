import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerAccountName = () => {
  return (
    <>
      <CustomView marginBottom={10} width={'60%'}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 24, width: '100%'}} />
      </CustomView>
      <CustomView width={'70%'}>
        <Shimmer wrapperStyle={{borderRadius: 5, height: 18, width: '100%'}} />
      </CustomView>
    </>
  );
};

export default AtomShimmerAccountName;
