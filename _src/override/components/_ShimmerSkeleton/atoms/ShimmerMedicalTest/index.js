import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerMedicalTest = () => {
  return (
    <>
      <CustomView marginTop={20}>
        <CustomView marginBottom={10} marginLeft={'5%'} marginRight={'15%'}>
          <Shimmer wrapperStyle={{height: 10, width: '100%'}} />
        </CustomView>
        <CustomView marginBottom={10} marginHorizontal={'5%'}>
          <Shimmer wrapperStyle={{height: 10, width: '100%'}} />
        </CustomView>
        <CustomView marginBottom={10} marginLeft={'5%'} marginRight={'15%'}>
          <Shimmer wrapperStyle={{height: 10, width: '100%'}} />
        </CustomView>
        <CustomView marginBottom={10} marginHorizontal={'5%'}>
          <Shimmer wrapperStyle={{height: 10, width: '100%'}} />
        </CustomView>
      </CustomView>
    </>
  );
};

export default AtomShimmerMedicalTest;
