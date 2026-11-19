import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';

const AtomShimmerCartList = () => {
  return (
    <>
      <CustomView row paddingHorizontal={20} marginTop={20}>
        <CustomView width={'35%'}>
          <Shimmer
            wrapperStyle={{borderRadius: 10, height: 120, width: '100%'}}
          />
        </CustomView>
        <CustomView width={'65%'} paddingLeft={10}>
          <Shimmer
            wrapperStyle={{borderRadius: 10, width: '100%', height: 20}}
          />
          <CustomView marginTop={10}>
            <Shimmer
              wrapperStyle={{borderRadius: 10, width: '100%', height: 20}}
            />
          </CustomView>
        </CustomView>
      </CustomView>
      <CustomView row paddingHorizontal={20} marginTop={20}>
        <CustomView width={'35%'}>
          <Shimmer
            wrapperStyle={{borderRadius: 10, height: 120, width: '100%'}}
          />
        </CustomView>
        <CustomView width={'65%'} paddingLeft={10}>
          <Shimmer
            wrapperStyle={{borderRadius: 10, width: '100%', height: 20}}
          />
          <CustomView marginTop={10}>
            <Shimmer
              wrapperStyle={{borderRadius: 10, width: '100%', height: 20}}
            />
          </CustomView>
        </CustomView>
      </CustomView>
      <CustomView row paddingHorizontal={20} marginTop={20}>
        <CustomView width={'35%'}>
          <Shimmer
            wrapperStyle={{borderRadius: 10, height: 120, width: '100%'}}
          />
        </CustomView>
        <CustomView width={'65%'} paddingLeft={10}>
          <Shimmer
            wrapperStyle={{borderRadius: 10, width: '100%', height: 20}}
          />
          <CustomView marginTop={10}>
            <Shimmer
              wrapperStyle={{borderRadius: 10, width: '100%', height: 20}}
            />
          </CustomView>
        </CustomView>
      </CustomView>
    </>
  );
};

export default AtomShimmerCartList;
