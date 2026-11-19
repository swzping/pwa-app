import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const GET_ORDER_DETAIL = gql(
  filterGraphql(`
    query GetOrderDetail(
      $filter: CustomerOrdersFilterInput
    ) {
      customer {
        orders(filter: $filter) {
          ...CustomerOrdersFragment
          __typename
        }
        __typename
      }
    }
    fragment CustomerOrdersFragment on CustomerOrders {
      items {
        id
        status
        order_number
        grand_total
        shipping_address {
          city
          country_code
          firstname
          lastname
          postcode
          region
          street
          telephone
        }
        created_at
        __typename
      }
    }
  `),
);
