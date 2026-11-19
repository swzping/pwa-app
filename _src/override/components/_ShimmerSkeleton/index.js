import React from 'react';
import {
  TYPE_SHIMMER_CART_ITEMS,
  TYPE_SHIMMER_CART_LIST,
  TYPE_SHIMMER_ACCOUNT_NAME,
  TYPE_SHIMMER_ACCOUNT_MYPOINT,
  TYPE_SHIMMER_ITEM_QTY,
  TYPE_SHIMMER_ITEM_DISCOUNT,
  TYPE_SHIMMER_FEATURED_BRAND,
  TYPE_SHIMMER_CMS_HOME,
  TYPE_SHIMMER_CUSTOMER_CARE,
  TYPE_SHIMMER_REWARD_POINT,
  TYPE_SHIMMER_STORE_CREDIT,
  TYPE_SHIMMER_PURCHASES,
  TYPE_SHIMMER_CATEGORY_LIST,
  TYPE_SHIMMER_PLP,
  TYPE_SHIMMER_PRODUCT,
  TYPE_SHIMMER_PRODUCTS,
  TYPE_SHIMMER_FOOTER,
  TYPE_SHIMMER_BLOG_DETAIL,
  TYPE_SHIMMER_CMS_PAGE,
  TYPE_SHIMMER_MEDICAL_TEST,
  TYPE_SHIMMER_MILESTONE,
} from '@app/helpers/Constants';
import AtomShimmerCartItem from '@app/components/_ShimmerSkeleton/atoms/ShimmerCartItem/index';
import AtomShimmerCartList from '@app/components/_ShimmerSkeleton/atoms/ShimmerCartList/index';
import AtomShimmerAccountName from '@app/components/_ShimmerSkeleton/atoms/ShimmerAccountName/index';
import AtomShimmerAccountMyPoint from '@app/components/_ShimmerSkeleton/atoms/ShimmerAccountMyPoint/index';
import AtomShimmerItemQty from '@app/components/_ShimmerSkeleton/atoms/ShimmerItemQty/index';
import AtomShimmerItemDiscount from '@app/components/_ShimmerSkeleton/atoms/ShimmerItemDiscount/index';
import AtomShimmerFeaturedBrand from '@app/components/_ShimmerSkeleton/atoms/ShimmerFeaturedBrand/index';
import AtomShimmerCMSHome from '@app/components/_ShimmerSkeleton/atoms/ShimmerCMSHome/index';
import AtomShimmerCustomerCare from '@app/components/_ShimmerSkeleton/atoms/ShimmerCustomerCare/index';
import AtomShimmerRewardPoint from '@app/components/_ShimmerSkeleton/atoms/ShimmerRewardPoint/index';
import AtomShimmerStoreCredit from '@app/components/_ShimmerSkeleton/atoms/ShimmerStoreCredit/index';
import AtomShimmerPurchases from '@app/components/_ShimmerSkeleton/atoms/ShimmerPurchases/index';
import AtomShimmerProductList from '@app/components/_ShimmerSkeleton/atoms/ShimmerProductList/index';
import AtomShimmerProduct from '@app/components/_ShimmerSkeleton/atoms/ShimmerProduct/index';
import AtomShimmerProducts from '@app/components/_ShimmerSkeleton/atoms/ShimmerProducts/index';
import AtomShimmerMainCategory from '@app/components/_ShimmerSkeleton/atoms/ShimmerMainCategory/index';
import AtomShimmerFooter from '@app/components/_ShimmerSkeleton/atoms/ShimmerFooter/index';
import AtomShimmerBlogDetail from '@app/components/_ShimmerSkeleton/atoms/ShimmerBlogDetail/index';
import AtomShimmerCmsPage from '@app/components/_ShimmerSkeleton/atoms/ShimmerCmsPage/index';
import AtomShimmerMedicalTest from '@app/components/_ShimmerSkeleton/atoms/ShimmerMedicalTest/index';
import AtomShimmerMilestone from '@app/components/_ShimmerSkeleton/atoms/ShimmerMilestone/index';

const ShimmerSkeleton = ({type, ...props}) => {
  if (type === TYPE_SHIMMER_CART_ITEMS) {
    return <AtomShimmerCartItem />;
  }
  if (type === TYPE_SHIMMER_CART_LIST) {
    return <AtomShimmerCartList />;
  }
  if (type === TYPE_SHIMMER_ACCOUNT_NAME) {
    return <AtomShimmerAccountName />;
  }
  if (type === TYPE_SHIMMER_ACCOUNT_MYPOINT) {
    return <AtomShimmerAccountMyPoint />;
  }
  if (type === TYPE_SHIMMER_ITEM_QTY) {
    return <AtomShimmerItemQty />;
  }
  if (type === TYPE_SHIMMER_ITEM_DISCOUNT) {
    return <AtomShimmerItemDiscount />;
  }
  if (type === TYPE_SHIMMER_FEATURED_BRAND) {
    return <AtomShimmerFeaturedBrand />;
  }
  if (type === TYPE_SHIMMER_CMS_HOME) {
    return <AtomShimmerCMSHome />;
  }
  if (type === TYPE_SHIMMER_CUSTOMER_CARE) {
    return <AtomShimmerCustomerCare />;
  }
  if (type === TYPE_SHIMMER_REWARD_POINT) {
    return <AtomShimmerRewardPoint />;
  }
  if (type === TYPE_SHIMMER_STORE_CREDIT) {
    return <AtomShimmerStoreCredit />;
  }
  if (type === TYPE_SHIMMER_PURCHASES) {
    return <AtomShimmerPurchases />;
  }
  if (type === TYPE_SHIMMER_CATEGORY_LIST) {
    return <AtomShimmerMainCategory />;
  }
  if (type === TYPE_SHIMMER_PLP) {
    return <AtomShimmerProductList />;
  }
  if (type === TYPE_SHIMMER_PRODUCT) {
    return <AtomShimmerProduct {...props} />;
  }
  if (type === TYPE_SHIMMER_PRODUCTS) {
    return <AtomShimmerProducts {...props} />;
  }
  if (type === TYPE_SHIMMER_FOOTER) {
    return <AtomShimmerFooter />;
  }
  if (type === TYPE_SHIMMER_BLOG_DETAIL) {
    return <AtomShimmerBlogDetail />;
  }
  if (type === TYPE_SHIMMER_CMS_PAGE) {
    return <AtomShimmerCmsPage />;
  }
  if (type === TYPE_SHIMMER_MEDICAL_TEST) {
    return <AtomShimmerMedicalTest />;
  }
  if (type === TYPE_SHIMMER_MILESTONE) {
    return <AtomShimmerMilestone />;
  }
  return null;
};

export default ShimmerSkeleton;
