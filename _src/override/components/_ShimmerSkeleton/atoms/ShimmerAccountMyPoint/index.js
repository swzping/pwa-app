import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerAccountMyPoint = () => {
  return (
    <CustomView
      horizontalCenter
      verticalCenter
      marginTop={-30}
      width={'60%'}
      style={{alignSelf: 'center'}}>
      <Shimmer wrapperStyle={{height: 90, width: '100%'}} />
    </CustomView>
  );
};

export default AtomShimmerAccountMyPoint;
