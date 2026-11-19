import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

/**
 * --------------------------------------------------------------- *
 * @constant GET_CUSTOMER_ORDERS
 * @summary 客户订单列表（Magento GraphQL）
 *
 * @notes
 * - filterGraphql 只负责把模板字符串中的换行/空白压缩成单行，不影响语义，
 *   因此外面的 GraphQL 可以随意换行缩进，方便阅读和 code review。
 * - 不要在模板字符串里写井号注释！换行会被 filterGraphql 压掉，
 *   井号之后的所有内容都会被当成注释导致查询损坏。
 * - 无需手写 __typename：Apollo Client 3 会自动补全（参考下方
 *   GET_OFFLINE_ORDER_LIST 的写法）。
 * --------------------------------------------------------------- *
 */
export const GET_CUSTOMER_ORDERS = gql(
  filterGraphql(`
    query GetCustomerOrders(
      $filter: CustomerOrdersFilterInput,
      $filters: OrderList,
      $pageSize: Int,
      $currentPage: Int
      ) {
      customer {
        id
        orders(filter: $filter, filters: $filters, pageSize: $pageSize, currentPage: $currentPage) {
          ...CustomerOrdersFragment
        }
      }
    }

    fragment CustomerOrdersFragment on CustomerOrders {
      items {
        order_number
        created_at
        shipping_method
        status
        payment_countdown
        dfi_display_status {
          code
          label
          color
          return_status
        }
        items {
          quantity_ordered
          product_url_key
        }
        total {
          discounts {
            label
            amount {
              currency
              value
            }
          }
          grand_total {
            currency
            value
          }
          student_discount {
            currency
            value
          }
          subtotal {
            currency
            value
          }
          total_shipping {
            currency
            value
          }
          total_tax {
            currency
            value
          }
          total_tp_discount {
            currency
            value
          }
        }
      }
      page_info {
        current_page
        total_pages
      }
      total_count
      total_pages
      current_page
    }
  `),
);

/**
 * --------------------------------------------------------------- *
 * @constant GET_OFFLINE_ORDER_LIST
 * @summary 线下门店（POS）订单列表
 * --------------------------------------------------------------- *
 */
export const GET_OFFLINE_ORDER_LIST = gql`
  query GetOfflineOrderList($input: OfflineOrderInput) {
    getOfflineOrderList(input: $input) {
      success
      code
      message
      data {
        page
        pageSize
        totalCount
        totalPage
        items {
          receiptNo
          storeName
          timestamp
          totalAmount
          orderStatus
          pdfUrl
        }
      }
    }
  }
`;
