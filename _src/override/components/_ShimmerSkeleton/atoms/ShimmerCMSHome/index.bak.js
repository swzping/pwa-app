import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerCMSHome = () => {
  return (
    <CustomView horizontalCenter column marginTop={20} marginBottom={40}>
      <CustomView width={'95%'}>
        <Shimmer
          wrapperStyle={{
            borderRadius: 5,
            height: 190,
            width: '100%',
          }}
        />
      </CustomView>
      <CustomView row marginTop={40}>
        <CustomView width={'15%'} marginHorizontal={10}>
          <Shimmer
            wrapperStyle={{
              borderRadius: 5,
              height: 55,
              width: '100%',
            }}
          />
          <Shimmer
            wrapperStyle={{
              marginTop: 5,
              borderRadius: 5,
              height: 20,
              width: '100%',
            }}
          />
        </CustomView>
        <CustomView width={'15%'} marginHorizontal={10}>
          <Shimmer
            wrapperStyle={{
              borderRadius: 5,
              height: 55,
              width: '100%',
            }}
          />
          <Shimmer
            wrapperStyle={{
              marginTop: 5,
              borderRadius: 5,
              height: 20,
              width: '100%',
            }}
          />
        </CustomView>
        <CustomView width={'15%'} marginHorizontal={10}>
          <Shimmer
            wrapperStyle={{
              borderRadius: 5,
              height: 55,
              width: '100%',
            }}
          />
          <Shimmer
            wrapperStyle={{
              marginTop: 5,
              borderRadius: 5,
              height: 20,
              width: '100%',
            }}
          />
        </CustomView>
        <CustomView width={'15%'} marginHorizontal={10}>
          <Shimmer
            wrapperStyle={{
              borderRadius: 5,
              height: 55,
              width: '100%',
            }}
          />
          <Shimmer
            wrapperStyle={{
              marginTop: 5,
              borderRadius: 5,
              height: 20,
              width: '100%',
            }}
          />
        </CustomView>
        <CustomView width={'15%'} marginHorizontal={10}>
          <Shimmer
            wrapperStyle={{
              borderRadius: 5,
              height: 55,
              width: '100%',
            }}
          />
          <Shimmer
            wrapperStyle={{
              marginTop: 5,
              borderRadius: 5,
              height: 20,
              width: '100%',
            }}
          />
        </CustomView>
      </CustomView>
    </CustomView>
  );
};

export default AtomShimmerCMSHome;
