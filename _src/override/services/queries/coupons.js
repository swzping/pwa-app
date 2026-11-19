import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

export const GET_COUPONS = gql(
  filterGraphql(`
    query getCoupons(
      $pageSize: Int
      $currentPage: Int
    ) {
      coupons(
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
          is_claimed
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

export const GET_VOUCHER_BY_CODE = gql`
  query GetVoucherByCode($code: String!) {
    customerCoupons(filter: {code: {eq: $code}}, pageSize: 1) {
      items {
        uid
        code
        name
        description
        t_and_c
        image
        from_date
        to_date
        group
        status
        is_claimed
        should_claim
      }
    }
  }
`;
