import React from 'react';
import {TYPE_SHIMMER_FEATURED_BRAND} from '@app/helpers/Constants';
import CustomView from '@app/components/CustomView/index';
import BannerSlider from '@app/components/BannerSlider/index';
import RenderIf from '@app/components/RenderIf/index';
import ShimmerSkeleton from '@app/components/_ShimmerSkeleton';
import {Mixins} from '@app/styles';
import {Colors} from '@app/styles/index';

const FeaturedBrandViews = ({loading, brands, useTitle}) => {
  return (
    <CustomView
      backgroundColor={Colors.WHITE}
      style={{top: -3, paddingBottom: 0}}>
      <RenderIf condition={loading}>
        <ShimmerSkeleton type={TYPE_SHIMMER_FEATURED_BRAND} />
      </RenderIf>
      <RenderIf condition={!loading && brands.length > 0}>
        <BannerSlider
          autoplay={true}
          data={brands}
          clickable={true}
          section={'featured-brands'}
          title={useTitle && 'Featured Brands'}
          styleFrame={{
            width: Mixins.MAX_WIDTH,
            alignSelf: 'center',
            flex: 1,
          }}
        />
      </RenderIf>
    </CustomView>
  );
};

export default FeaturedBrandViews;
