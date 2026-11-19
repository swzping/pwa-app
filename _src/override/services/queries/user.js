import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

export const GET_USER_DATA = gql(
  filterGraphql(`
  query customer {
    customer {
      phonenumber
      whatsapp_number
      firstname
      lastname
      group_id
      gender
      date_of_birth
      hobbies {
           category
           selectedOptions
       }
      addresses {
        id
        region {
          region
          region_code
          region_id
        }
        country_code
        country_id
        firstname
        lastname
        street
        company
        telephone
        postcode
        city
        vat_id
        default_billing
        default_shipping
        custom_attributes {
          attribute_code
          value
        }
      }
      default_shipping
      customer_email
      is_subscribed
      store_credit {
        enabled
        current_balance {
          value
          currency
        }
      }
    }
  }
`),
);

export const GET_USER_WISHLIST = gql(
  filterGraphql(`
  query customer {
    customer {
      wishlist {
        id
        items_count
        items {
          __typename
          id
          added_at
          product {
            id
            offers {
              id
              rule_code
              name
              description
              image
              promotion_type
            }
            type_id
            name
            sku
            price_range {
              maximum_price {
                regular_price {
                  currency
                  value
                }
                final_price {
                  currency
                  value
                }
                discount {
                  amount_off
                  percent_off
                }
              }
            }
            price_tiers {
              final_price {
                value
                currency
              }
              discount {
                amount_off
                percent_off
              }
              quantity
            }
            thumbnail {
              url
              label
            }
            url_key
          }
        }
      }
    }
  }
`),
);

export const GET_USER_STORE_CREDIT = gql(
  filterGraphql(`
  query customerRewardPoints{
    customerRewardPoints {
      balance
      balanceCurrency
      formatedBalanceCurrency
    }
  }
`),
);

export const GET_USER_SETTINGS = gql(
  filterGraphql(`
  query {
    customer {
      is_subscribed
    }
  }
`),
);

export const UPDATE_USER_SETTINGS = gql(
  filterGraphql(`
  mutation updateCustomer($input: CustomerInput!){
    updateCustomer(input: $input) {
      customer {
        is_subscribed
      }
      message
      status
    }
  }  
  `),
);

export const SUBSCRIBER_INFO = gql(
  filterGraphql(`
  mutation postSubscriberInfo($userToken: String, $userDevice: String) {
    subscriberInfo(
      input: {
        userToken: $userToken,
        device: $userDevice,
    }) {
      userToken
      device
      status
    }
  }
  `),
);

export const GET_LOYALTY_CARD_DATA = gql(
  filterGraphql(`
  query GetLoyaltyCardData {
    customer {
      firstname
      lastname
      phonenumber
      qr_code {
        memberId
        expireTime
      }
      student_data {
        is_student_pass
        student_quota
        remaining_quota
        quota_message
      }
    }
    storeConfig {
      cms_homepage_identifer
    }
    cmsBlocks(identifiers: ["student_benefit_content"]) {
      items {
        title
        content
      }
    }
  }
  `),
);
