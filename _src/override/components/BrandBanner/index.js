import React from 'react';

import CustomView from '@app/components/CustomView/index';
import BrandBannerItem from '@app/components/BrandBanner/atoms/BrandBannerItem/index';

const BrandBanner = ({data}) => {
  const BrandBannerList = ({brandBannerData}) => {
    return brandBannerData.map((item, index) => {
      return <BrandBannerItem key={index + 1} item={item} />;
    });
  };

  /**
   * ----------------------------------------- *
   * @constant rendering
   * @summary load product hero
   * @return Sections
   * ----------------------------------------- *
   */
  return (
    <CustomView paddingVertical={10}>
      <BrandBannerList brandBannerData={data} />
    </CustomView>
  );
};

export default BrandBanner;
