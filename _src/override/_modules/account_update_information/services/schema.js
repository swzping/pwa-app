import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';

export const UPDATE_ACCOUNT_INFORMATION = gql(
  filterGraphql(`
  mutation SetCustomerInformation(
    $firstname: String
    $lastname: String
    $phonenumber: String
    $gender: Int
    $password: String
  ) {
    updateCustomerCustom(
      input: {
        firstname: $firstname
        lastname: $lastname
        phonenumber: $phonenumber
        gender: $gender
        password: $password
      }
    ) {
      customer {
        id
        ...AccountInformationPageFragment
        __typename
      }
      __typename
    }
  }

  fragment AccountInformationPageFragment on Customer {
    id
    firstname
    lastname
    email
    phonenumber
    whatsapp_number
    wishlists {
      id
      items_count
      sharing_code
      items_v2 {
        items {
          id
          ...WishlistItemFragment
          __typename
        }
        __typename
      }
      __typename
    }
    __typename
  }

  fragment WishlistItemFragment on WishlistItemInterface {
    id
    product {
      id
      image {
        label
        url
        __typename
      }
      name
      price_range {
        maximum_price {
          final_price {
            currency
            value
            __typename
          }
          __typename
        }
        __typename
      }
      sku
      stock_status
      ... on ConfigurableProduct {
        configurable_options {
          id
          attribute_code
          attribute_id
          attribute_id_v2
          label
          values {
            uid
            default_label
            label
            store_label
            use_default_value
            value_index
            swatch_data {
              ... on ImageSwatchData {
                thumbnail
                __typename
              }
              value
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    ... on ConfigurableWishlistItem {
      configurable_options {
        id
        option_label
        value_id
        value_label
        __typename
      }
      __typename
    }
    __typename
  }
`),
);

export const UPDATE_PASSWORD = gql(
  filterGraphql(`
  mutation ChangeCustomerPassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    changeCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      id
      email
      __typename
    }
  }
`),
);

export const SEND_EMAIL_VERIFICATION = gql`
  mutation sendEmailVerification($email: String!) {
    sendEmailVerification(email: $email) {
      message
      status
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation verifyEmail($email: String!, $code: String!) {
    verifyEmail(email: $email, code: $code) {
      message
      status
      is_verified
    }
  }
`;
