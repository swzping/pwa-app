import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const ACCOUNT_TRACK_ORDER = gql(
  filterGraphql(`
  query getTrackingOrder(
    $email:String$order_id:String
  ) {
    ordersFilter(
      filters: {
        email: $email
        ids: {
          eq: $order_id
        }
      }
    ) {
      data{
        id
        order_number
        status
        status_label
        detail{
          payment{
            method
            additional_information
            payment_additional_info{
              method_title
              __typename
            }
            __typename
          }
          __typename
          shipping_methods{
            shipping_description
            shipping_detail{
              track_number
              trackorder_type
              data_detail
              __typename
            }
            __typename
          }
          shipping_address{
            firstname
            lastname
            city
            street
            postcode
            region
            __typename
          }
          items{
            name
            __typename
          }
          __typename
        }
        grand_total
        __typename
      }
      __typename
    }
  }
`),
);
export const GET_FLOATING_BANNER = gql(
  filterGraphql(`
    query getFloatingBanner($identifiers: [String]!) {
        cmsBlocks(identifiers: $identifiers) {
            items {
                content
                identifier
            }
        }
    }
`),
);

export const GET_TRACKING_ORDER = gql(
  filterGraphql(`
    query getTrackingOrder($email: String, $order_id: String) {
        ordersFilter(filters: { email: $email, ids: { eq: $order_id } }) {
            data {
                id
                order_number
                status
                status_label
                detail {
                    payment {
                        method
                        additional_information
                        payment_additional_info {
                            method_title
                            __typename
                        }
                        __typename
                    }
                    __typename
                    shipping_methods {
                        shipping_description
                        shipping_detail {
                            track_number
                            trackorder_type
                            data_detail
                            __typename
                        }
                        __typename
                    }
                    shipping_address {
                        firstname
                        lastname
                        city
                        street
                        postcode
                        region
                        __typename
                    }
                    items {
                        name
                        __typename
                    }
                    __typename
                }
                grand_total
                __typename
            }
        }
    }
`),
);
