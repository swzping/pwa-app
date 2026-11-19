import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerProductList = () => {
  const ProductItem = () => {
    return (
      <>
        <CustomView
          column
          paddingVertical={15}
          paddingHorizontal={20}
          verticalCenter
          horizontalCenter
          marginBottom={5}>
          {/* First Row */}
          <CustomView row marginBottom={10}>
            <CustomView marginRight={15} flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 200, width: '100%'}} />
              </CustomView>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '100%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '75%'}} />
            </CustomView>
            <CustomView flex>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 200, width: '100%'}} />
              </CustomView>
              <CustomView marginBottom={10}>
                <Shimmer wrapperStyle={{height: 10, width: '100%'}} />
              </CustomView>
              <Shimmer wrapperStyle={{height: 10, width: '75%'}} />
            </CustomView>
          </CustomView>
        </CustomView>
      </>
    );
  };

  return (
    <>
      <ProductItem />
      <ProductItem />
    </>
  );
};

export default AtomShimmerProductList;
