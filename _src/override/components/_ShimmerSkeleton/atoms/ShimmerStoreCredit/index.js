import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerStoreCredit = () => {
  const StoreCreditList = () => {
    return (
      <>
        <CustomView
          column
          paddingVertical={15}
          paddingHorizontal={20}
          marginBottom={5}>
          {/* First Row */}
          <CustomView row marginBottom={10}>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '75%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '40%'}} />
            </CustomView>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '80%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '75%'}} />
            </CustomView>
          </CustomView>
          {/* Second Row */}
          <CustomView row paddingVertical={10}>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '90%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '50%'}} />
            </CustomView>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '80%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '60%'}} />
            </CustomView>
          </CustomView>
          {/* Third Row */}
          <CustomView marginTop={12}>
            <Shimmer wrapperStyle={{height: 10, width: '60%'}} />
          </CustomView>
        </CustomView>
      </>
    );
  };

  return (
    <>
      <CustomView marginBottom={10}>
        <Shimmer wrapperStyle={{height: 100, width: '100%'}} />
      </CustomView>
      <StoreCreditList />
      <StoreCreditList />
    </>
  );
};

export default AtomShimmerStoreCredit;
