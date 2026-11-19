import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

export const GET_COUPON_WALLET = gql(
  filterGraphql(`
    query getCouponWallet(
      $pageSize: Int
      $currentPage: Int
      $status: String
      $code: String
    ) {
      customerCoupons(
        filter: {
          status: { eq: $status }
          code: { like: $code }
        }
        pageSize: $pageSize
        currentPage: $currentPage
      ) {
        items {
          code
          name
          t_and_c
          image
          description
          from_date
          to_date
          group
          status
          uid
          __typename
        }
        totalCount
        pageSize
        currentPage
        __typename
      }
    }
  `),
);

export const GET_OFFLINE_VOUCHERS = gql(
  filterGraphql(`
    query getOfflineVouchers(
      $pageSize: Int
      $currentPage: Int
      $status: String
    ) {
      offlineVouchers(
        pageSize: $pageSize
        currentPage: $currentPage
        filter: {
          status: $status
        }
      ) {
        items {
          uid
          code
          name
          t_and_c
          image
          description
          from_date
          to_date
          group
          is_claimed
          status
          __typename
        }
        totalCount
        pageSize
        currentPage
        __typename
      }
    }
  `),
);

export const GET_OFFLINE_VOUCHER = gql(
  filterGraphql(`
    query getOfflineVoucher($uid: ID!) {
      offlineVoucher(uid: $uid) {
        uid
        code
        name
        t_and_c
        image
        description
        from_date
        to_date
        group
        is_claimed
        status
        __typename
      }
    }
  `),
);

export const REDEEM_OFFLINE_VOUCHER = gql(
  filterGraphql(`
    mutation RedeemOfflineVoucher($uid: ID!) {
      redeemOfflineVoucher(uid: $uid) {
        uid
        code
        name
        t_and_c
        image
        description
        from_date
        to_date
        group
        is_claimed
        status
      }
    }
  `),
);
