import gql from 'graphql-tag';

export const REGISTER = gql`
  mutation CreateAccount(
    $email: String!
    $firstname: String!
    $lastname: String!
    $phonenumber: String
    $is_subscribed: Boolean
    $gender: Int
    $date_of_birth: String
    $access_token: String
    $request_channel: String
  ) {
    createCustomerCustom(
      input: {
        email: $email
        firstname: $firstname
        lastname: $lastname
        phonenumber: $phonenumber
        is_subscribed: $is_subscribed
        gender: $gender
        date_of_birth: $date_of_birth
        access_token: $access_token
        request_channel: $request_channel
      }
    ) {
      customer {
        id
      }
      status
      token
      message
    }
  }
`;

export const GET_GENDER_OPTIONS = gql`
  query getGenderOptions {
    customAttributeMetadata(
      attributes: [{attribute_code: "gender", entity_type: "1"}]
    ) {
      items {
        attribute_code
        attribute_options {
          value
          label
        }
      }
    }
  }
`;

export const REQUEST_OTP = gql`
  mutation requestOtpRegister($phonenumber: String!) {
    requestOtpRegister(phonenumber: $phonenumber) {
      info
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation checkOtpRegister($phonenumber: String!, $otp: String!) {
    checkOtpRegister(phonenumber: $phonenumber, otp: $otp) {
      is_valid_otp
    }
  }
`;

export const VERIFY_EMAIL = gql`
  mutation CheckEmailAvailability($email: String!, $accessToken: String!) {
    verifyEmail(input: {email: $email, accessToken: $accessToken}) {
      status
      message
    }
  }
`;

export const CONFIRM_EMAIL_VERIFICATION = gql`
  mutation EmailVerificationConfirm(
    $otp: String!
    $email: String!
    $isCheckoutVerify: Boolean
  ) {
    confirmEmailVerification(
      input: {otp: $otp, email: $email, is_checkout_verify: $isCheckoutVerify}
    ) {
      status
      message
    }
  }
`;

export const GET_CUSTOMER_HOBBIES = gql`
  query getCustomerHobbies {
    customerHobbies {
      items {
        category
        order
        options
      }
    }
  }
`;

export const COLLECT_CUSTOMER_HOBBIES = gql`
  mutation collectCustomerHobbies($hobbies: [CustomerHobbyInput]) {
    collectCustomerHobbies(input: {hobbies: $hobbies}) {
      status
      message
    }
  }
`;

export const UPDATE_CUSTOMER_PROFILE = gql`
  mutation SetCustomerInformation(
    $email: String!
    $firstname: String!
    $lastname: String!
    $phonenumber: String
    $gender: Int
    $date_of_birth: String
    $hobbies: [CustomerHobbyInput]
    $access_token: String
  ) {
    updateCustomerCustom(
      input: {
        email: $email
        firstname: $firstname
        lastname: $lastname
        phonenumber: $phonenumber
        gender: $gender
        date_of_birth: $date_of_birth
        hobbies: $hobbies
        access_token: $access_token
      }
    ) {
      customer {
        id
      }
      token
      status
      message
    }
  }
`;

export const REFRESH_ACCESS_TOKEN = gql`
  mutation RefreshAccessToken($refresh_token: String!) {
    refreshCustomerAccessToken(refresh_token: $refresh_token) {
      status
      message
      access_token
      refresh_token
      expires_in
      customer_token {
        token
      }
    }
  }
`;

export const GET_CUSTOMER_INFORMATION = gql`
  query GetCustomerInformation {
    customer {
      id
      ...AccountInformationPageFragment
      __typename
    }
  }

  fragment AccountInformationPageFragment on Customer {
    id
    firstname
    lastname
    customer_email
    phonenumber
    gender
    date_of_birth
    hobbies {
      category
      selectedOptions
    }
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
      uid
      image {
        label
        url
        __typename
      }
      url_key
      name
      price_range {
        maximum_price {
          final_price {
            currency
            value
            __typename
          }
          discount {
            amount_off
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
          uid
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
        variants {
          attributes {
            uid
            code
            value_index
            __typename
          }
          product {
            uid
            stock_status
            small_image {
              url
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
`;
