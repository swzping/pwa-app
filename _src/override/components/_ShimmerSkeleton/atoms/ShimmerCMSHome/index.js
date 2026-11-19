import React from 'react';
import CustomView from '@app/components/CustomView/index';
import Shimmer from '@app/components/_Shimmer/index';
import {View} from 'react-native';

const AtomShimmerCMSHome = () => {
  return (
    <View width={'100%'} style={{zIndex: -1, padding: 12}}>
      <Shimmer
        wrapperStyle={{
          borderRadius: 5,
          height: 200,
          width: '100%',
        }}
      />

      <CustomView row marginTop={20}>
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
    </View>
  );
};

export default AtomShimmerCMSHome;
