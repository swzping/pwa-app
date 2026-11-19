import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const COLLECT_COUPON = gql(
  filterGraphql(`
    mutation collectCoupon($couponCode: String!) {
      collectCoupon(couponCode: $couponCode)
    }
  `),
);
