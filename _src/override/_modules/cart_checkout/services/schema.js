import gql from 'graphql-tag';

import {filterGraphql} from '@app/services/helper';

export const GET_PAYMENT_GROUPING = gql(
  filterGraphql(`
    query getPaymentGrouping {
      storeConfig {
        payments_configuration
      }
    }
`),
);

export const CHECK_GIFT_CARD = gql(
  filterGraphql(`
    query getGiftCardBalance($giftCardCode:String!){
        giftCardAccount(input:{gift_card_code:$giftCardCode}){
            balance
            code
            expiration_date
            code 
        }
    }
`),
);

export const GET_APOTEK_LOCATION = gql(
  filterGraphql(`
    query getApotekLocation{
        CustomLocationStore {
            loc_id
            loc_code
            loc_name
            loc_street
            loc_city
            loc_telephone
        }
    }
  `),
);

export const SET_APOTEK_LOCATION = gql`
  mutation setApotekLocation(
    $cartId: String!
    $loc_code: String!
    $store_address: String!
  ) {
    setStoreLocation(
      input: {
        cart_id: $cartId
        loc_code: $loc_code
        store_address: $store_address
      }
    ) {
      cart {
        shipping_addresses {
          firstname
          lastname
          street
          city
          telephone
          region {
            code
            label
          }
          country {
            code
            label
          }
          available_shipping_methods {
            amount {
              currency
              value
            }
            amount_before_discount {
              currency
              value
            }
            available
            carrier_code
            carrier_title
            error_message
            method_code
            method_title
            shipping_promo_name
            price_excl_tax {
              value
              currency
            }
          }
          selected_shipping_method {
            amount {
              value
              currency
            }
            amount_before_discount {
              value
              currency
            }
            carrier_code
            carrier_title
            method_code
            method_title
          }
        }
        billing_address {
          city
          company
          country {
            code
            label
          }
          firstname
          lastname
          postcode
          region {
            code
            label
          }
          street
          telephone
        }
      }
    }
  }
`;

export const UPDATE_POINTS_IN_CART = gql`
  mutation UpdatePointsInCart($cartId: String!, $points: Int!) {
    updatePointsInCart(cart_id: $cartId, points: $points) {
      success
      message
      applied_points
    }
  }
`;
