import {gql} from '@apollo/client';

export const addSimpleItemToCartOptimal = gql`
  mutation AddProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
        items {
          id
          quantity
          is_free_gift
          product {
            id
            sku
          }
        }
      }
      toastr_message {
        status
        message
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const addBundleItemToCartOptimal = gql`
  mutation addBundleProductsToCart($input: AddBundleProductsToCartInput) {
    addBundleProductsToCart(input: $input) {
      cart {
        total_quantity
      }
    }
  }
`;

export const addConfigurableItemToCartOptimal = gql`
  mutation AddProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
      }
      toastr_message {
        status
        message
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const addVirtualItemToCartOptimal = gql`
  mutation addVirtualProductsToCart($input: AddVirtualProductsToCartInput) {
    addVirtualProductsToCart(input: $input) {
      cart {
        id
        total_quantity
      }
    }
  }
`;

export const ADD_VARIANT_TO_CART = gql`
  mutation AddVariantToCart($cartId: String!, $cartItem: CartItemInput!) {
    addProductsToCart(cartId: $cartId, cartItems: [$cartItem]) {
      cart {
        id
        total_quantity
        items {
          id
          uid
          quantity
          product {
            sku
            name
            is_flash_sale
            special_from_date
            special_to_date
          }
          ... on ConfigurableCartItem {
            configurable_options {
              configurable_product_option_uid
              configurable_product_option_value_uid
              option_label
              value_label
            }
            configured_variant {
              uid
              sku
              name
              is_flash_sale
              special_from_date
              special_to_date
              stock_status
              small_image {
                url
              }
              stock_item {
                salable_qty
                is_in_stock
              }
            }
          }
        }
      }
      toastr_message {
        status
        message
      }
      user_errors {
        code
        message
      }
    }
  }
`;
