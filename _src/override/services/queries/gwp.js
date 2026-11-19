import gql from 'graphql-tag';

export const GET_FREE_GIFT_RULES = gql`
  query getFreeGiftRules($cartId: String!) {
    freeGiftRules(cart_id: $cartId) {
      rule_id
      progress_bar
      notification_message
      missing_eligible_qty
      missing_eligible_amount
      is_eligible
      detail {
        event_time {
          from_date
          to_date
        }
        description
      }
      items {
        id
        name
        sku
        url_key
        stock_status
        stock_item {
          salable_qty
        }
        image {
          url
        }
      }
      __typename
    }
  }
`;

export const GET_ELIGIBLE_PRODUCTS_FOR_GWP = gql`
  query getEligibleProductsForGWP($pageSize: Int!, $currentPage: Int!) {
    eligibleProductsForGWP(page_size: $pageSize, current_page: $currentPage) {
      items {
        id
        name
        sku
        url_key
        stock_status
        stock_item {
          salable_qty
          __typename
        }
        image {
          url
          __typename
        }
        price_range {
          minimum_price {
            regular_price {
              currency
              value
            }
            final_price {
              currency
              value
            }
            discount {
              percent_off
            }
          }
        }
        __typename
      }
      current_page
      page_size
      total_count
      __typename
    }
  }
`;

export const GET_FREE_GIFTS_FOR_ORDER = gql`
  query getFreeGiftsForOrder($orderId: String!) {
    freeGiftsForOrder(order_id: $orderId) {
      id
      name
      sku
      url_key
      stock_status
      stock_item {
        salable_qty
      }
      image {
        url
      }
      __typename
    }
  }
`;
