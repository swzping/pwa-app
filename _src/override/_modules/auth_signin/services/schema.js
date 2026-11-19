import gql from 'graphql-tag';

export const LOGIN = gql`
  mutation SignIn($email: String!, $password: String!) {
    generateCustomerTokenCustom(
      username: $email
      password: $password
      source: "app"
    ) {
      token
      status
      message
      next_step
      lr_data {
        profile {
          email
          firstname
          lastname
          gender
          dob
          phone_number
          __typename
        }
        access_token
        refresh_token
        expires_in
        __typename
      }
      customer_data {
        id
        firstname
        lastname
        email
        phonenumber
        gender
        date_of_birth
      }
      __typename
    }
  }
`;

export const REQUEST_PHONE_OTP = gql`
  mutation requestPhoneOTP($phoneId: String!, $method: String!) {
    requestPhoneOTP(phoneId: $phoneId, method: $method) {
      success
      message
    }
  }
`;

export const BIND_PHONE_NUMBER = gql`
  mutation bindPhoneNumber(
    $phoneId: String!
    $method: String!
    $access_token: String!
  ) {
    bindPhoneNumber(
      phoneId: $phoneId
      method: $method
      access_token: $access_token
    ) {
      success
      message
    }
  }
`;

export const VERIFY_PHONE_OTP = gql`
  mutation verifyPhoneOTP($phoneId: String!, $otp: String!, $prev_step: String) {
    verifyPhoneOTP(phoneId: $phoneId, otp: $otp, prev_step: $prev_step) {
      token
      status
      message
      next_step
      lr_data {
        profile {
          email
          firstname
          lastname
          gender
          dob
          phone_number
        }
        access_token
        refresh_token
        expires_in
      }
      customer_data {
        id
        firstname
        lastname
        customer_email
        phonenumber
        gender
        date_of_birth
      }
    }
  }
`;

/** V2: 个人信息页更改手机号 - 发送 OTP（可选 access_token） */
export const BIND_PHONE_NUMBER_V2 = gql`
  mutation bindPhoneNumberV2(
    $phoneId: String!
    $method: String!
    $access_token: String
  ) {
    bindPhoneNumberV2(
      phoneId: $phoneId
      method: $method
      access_token: $access_token
    ) {
      success
      message
    }
  }
`;

/** V2: 个人信息页更改手机号 - 验证 OTP，成功后 Magento 与 LR 同步更新 */
export const VERIFY_PHONE_OTP_V2 = gql`
  mutation verifyPhoneOTPV2($phoneId: String!, $otp: String!) {
    verifyPhoneOTPV2(phoneId: $phoneId, otp: $otp) {
      status
      message
    }
  }
`;

/** V2: 个人信息页更改手机号 - 重新发送验证码 */
export const REQUEST_RESEND_PHONE_OTP_V2 = gql`
  mutation requestResendPhoneOTPV2($phoneId: String!, $method: String!) {
    requestResendPhoneOTPV2(phoneId: $phoneId, method: $method) {
      success
      message
    }
  }
`;

export const GET_CATEGORIES = gql(`
    query getCategories(
      $id: Int!
      $pageSize: Int!
      $currentPage: Int!
      $filters: ProductAttributeFilterInput!
      $sort: ProductAttributeSortInput
    ) {
      category(id: $id) {
        id
        ...CategoryFragment
      }
      products(
        pageSize: $pageSize
        currentPage: $currentPage
        filter: $filters
        sort: $sort
      ) {
        ...ProductsFragment
      }
    }
    fragment CategoryFragment on CategoryTree {
      id
      meta_title
      meta_keywords
      meta_description
      image
    }
    fragment ProductsFragment on Products {
      items {
        id
        categories {
          id
          name
          level
        }
        name
        price_range {
          maximum_price {
            regular_price {
              currency
              value
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
        sku
        special_price
        price {
          regularPrice {
            amount {
              currency
              value
            }
          }
        }
        small_image {
          url
        }
        stock_status
        type_id
        url_key
        url_suffix
        sale
        promo
      }
      page_info {
        total_pages
      }
      total_count
    }
  `);

export const GET_RECAPTCHAV3_CONFIG = gql`
  query RecaptchaV3Config {
    recaptchaV3Config {
      badge_position
      failure_message
      forms
      language_code
      minimum_score
      website_key
    }
  }
`;

// check phone number have password or not
export const PHONE_NUMBER_CHECK = gql`
  mutation PhoneNumberNextStep($phone: String!) {
    phoneNumberNextStep(phoneId: $phone) {
      status
      token
    }
  }
`;

export const LOGIN_BY_PHONE_AND_PASSWORD = gql`
    mutation loginByPhoneAndPassword(
        $phoneNumber: String!
        $password: String!
    ) {
        loginByPhoneAndPassword(
            phoneId: $phoneNumber
            password: $password
        ) {
            token
            status
            message
            next_step
            lr_data {
                profile {
                    email
                    firstname
                    lastname
                    gender
                    dob
                    phone_number
                    __typename
                }
                access_token
                refresh_token
                expires_in
                __typename
            }
            __typename
        }
    }
`;

export const ADD_PHONE_PASSWORD = gql`
    mutation addPhonePassword(
        $phone: String!
        $password: String!
        $accessToken: String!
        $prevStep: String
    ) {
        addPhonePassword(
            phoneId: $phone
            password: $password
            access_token: $accessToken
            prev_step: $prevStep
        ) {
            token
            status
            message
            next_step
            lr_data {
                profile {
                    email
                    firstname
                    lastname
                    gender
                    dob
                    phone_number
                    __typename
                }
                access_token
                refresh_token
                expires_in
                __typename
            }
            __typename
        }
    }
`;

export const REQUEST_RESET_PASSWORD = gql`
    mutation requestResetPassword($phoneNumber: String!) {
        requestResetPassword(phoneId: $phoneNumber) {
            message
            next_step
            status
            email
        }
    }
`;

export const REQUEST_FORGOT_PASSWORD_OTP = gql`
    mutation requestForgotPasswordOtp($phoneNumber: String!, $method: String!) {
        requestForgotPasswordOtp(phoneId: $phoneNumber, method: $method) {
            message
            success
        }
    }
`;

export const VERIFY_FORGOT_PASSWORD_OTP = gql`
    mutation verifyForgotPasswordOtp($phoneNumber: String!, $otp: String!) {
        verifyForgotPasswordOtp(phoneId: $phoneNumber, otp: $otp) {
            status
            message
            next_step
            lr_data {
                access_token
                refresh_token
                expires_in
                __typename
            }
            __typename
        }
    }
`;
