import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerRewardPoint = () => {
  const RewardPointList = () => {
    return (
      <>
        <CustomView
          column
          paddingVertical={15}
          paddingHorizontal={20}
          marginBottom={5}>
          {/* First Row */}
          <CustomView marginBottom={10}>
            <CustomView marginBottom={10}>
              <Shimmer wrapperStyle={{height: 10, width: '50%'}} />
            </CustomView>
            <Shimmer wrapperStyle={{height: 10, width: '30%'}} />
          </CustomView>
          {/* Second Row */}
          <CustomView row paddingVertical={20}>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '50%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '40%'}} />
            </CustomView>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '40%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '40%'}} />
            </CustomView>
          </CustomView>
          {/* Third Row */}
          <CustomView row marginTop={8} marginBottom={25}>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '70%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '70%'}} />
            </CustomView>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '70%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '60%'}} />
            </CustomView>
          </CustomView>
          {/* Fourth Row */}
          <CustomView>
            <Shimmer wrapperStyle={{height: 10, width: '80%'}} />
          </CustomView>
        </CustomView>
      </>
    );
  };

  return (
    <>
      <CustomView marginBottom={15}>
        <Shimmer wrapperStyle={{height: 117, width: '100%'}} />
      </CustomView>
      <RewardPointList />
      <RewardPointList />
    </>
  );
};

export default AtomShimmerRewardPoint;
