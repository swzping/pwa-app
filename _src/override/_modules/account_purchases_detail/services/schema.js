import {gql} from '@apollo/client';

import {print} from 'graphql';

import {filterGraphql} from '@app/services/helper';

export const GET_REORDER_CART = gql(
  filterGraphql(`
  mutation GetReorderData($orderId: String!) {
    reorder(input: {order_id: $orderId}) {
      cart_id
      __typename
    }
  }
`),
);
export const GET_REORDER_ITEMS_DATA_CART = gql(
  filterGraphql(`
    mutation ReorderItems($orderNumber: String!) {
      reorderItems(orderNumber: $orderNumber) {
        cart {
          id
          __typename
        }
        __typename
      }
    }
  `),
);
export const GET_PRODUCT_THUMBNAIL = gql(
  filterGraphql(`
  query GetProductThumbnailsByURLKey($urlKeys: [String!]!) {
    products(filter: {url_key: {in: $urlKeys}}) {
      items {
        id
        sku
        stock_status
        is_flash_sale
        thumbnail {
          label
          url
          __typename
        }
        url_key
        ... on ConfigurableProduct {
          variants {
            product {
              uid
              sku
              id
              is_flash_sale
              thumbnail {
                label
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
      __typename
    }
  }
`),
);

export const GET_CUSTOMER_ORDER = gql(
  filterGraphql(`
  query getCustomerOrder($filters: OrderList) {
    ordersFilter(filters: $filters) {
      data {
        id
        order_number
        grand_total
        status
        status_label
        detail {
          status
          state
          subtotal
          subtotal_incl_tax
          grand_total
          global_currency_code
          discount_amount
          items {
            name
            price
            qty_ordered
          }
          billing_address {
            firstname
            lastname
            email
            country_id
            city
            postcode
            region
            street
            telephone
          }

          shipping_address {
            firstname
            lastname
            email
            country_id
            city
            postcode
            region
            street
            telephone
          }
          shipping_methods {
            shipping_description
            track_number
            shipping_detail {
              data_detail
              __typename
            }
            __typename
          }
          payment {
            additional_information
            payment_additional_info {
              virtual_account
              due_date
              method_title
              transaction_id
              transaction_time
              __typename
            }
            additional_information
            shipping_amount
            shipping_captured
            __typename
          }
          coupon {
            is_use_coupon
            code
            rule_name
          }
          aw_rma {
            status
          }
          aw_store_credit {
            is_use_store_credit
            store_credit_amount
            store_credit_refunded
            store_credit_reimbursed
          }
        }
      }
    }
  }
`),
);

export const GET_FORM_DATA_RMA = gql(
  filterGraphql(`
  query getNewFormDataAwRma($email: String!, $order_number: String!) {
    getNewFormDataAwRma(email: $email, order_number: $order_number) {
      allowed_file_extensions
      custom_fields {
        id
        frontend_labels {
          store_id
          value
        }
        is_editable
        is_required
        name
        refers
        website_ids
        options {
          frontend_labels {
            store_id
            value
          }
          id
        }
      }
      items {
        is_returnable
        item_id
        name
        other_rma_request
        price
        qty_returnable
        sku
        image_url
        parent_item_id
        url_key
      }
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

const GetCustomerOrdersDetail = gql`
  query GetCustomerOrdersDetail(
    $filter: CustomerOrdersFilterInput
    $filters: OrderList
  ) {
    customer {
      id
      orders(filter: $filter, filters: $filters) {
        items {
          ...CustomerOrdersDetailFragment
        }
      }
    }
  }

  fragment CustomerOrdersDetailFragment on CustomerOrder {
    returns {
      items {
        uid
        number
        created_at
        display_status
        solution {
          code
          label
        }
        reason {
          label
        }
        reason_other_text
        order {
          number
        }
      }
      page_info {
        current_page
        page_size
        total_pages
      }
      total_count
    }
    payment_countdown
    dfi_display_status {
      code
      label
      color
      return_status
    }
    dfi_cancellation {
      canceled_by
      reason
      reason_note
      canceled_at
    }
    available_actions
    return_eligibility {
      can_return
      solutions
      reason_uids
      deadline
      message
    }
    promotions {
      amount {
        currency
        value
        __typename
      }
      label
      __typename
    }
    detail {
      payment {
        payment_additional_info {
          virtual_account
          due_date
          method_title
          transaction_id
          transaction_time
        }
      }
      discount_amount
      aw_giftcard {
        giftcard_amount
        __typename
      }
      aw_reward_points {
        reward_points_amount
        __typename
      }
      aw_store_credit {
        store_credit_amount
        __typename
      }
      __typename
    }
    comments {
      message
      timestamp
      __typename
    }
    billing_address {
      city
      country_code
      firstname
      lastname
      postcode
      region
      street
      telephone
      __typename
    }
    id
    invoices {
      id
      __typename
    }
    items {
      id
      is_gwp
      is_flash_sale_item
      product_name
      product_sale_price {
        currency
        value
        __typename
      }
      product_sku
      product_url_key
      selected_options {
        label
        value
        __typename
      }
      quantity_ordered
      returnable_quantity
      refundable_unit_price {
        value
        currency
      }
      entered_options {
        label
        value
        __typename
      }
      ... on BundleOrderItem {
        bundle_options {
          label
          values {
            product_name
            price {
              currency
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
    order_number
    created_at
    payment_methods {
      name
      type
      additional_data {
        name
        value
        __typename
      }
      __typename
    }
    shipments {
      id
      tracking {
        number
        __typename
      }
      __typename
    }
    shipping_address {
      city
      country_code
      firstname
      lastname
      postcode
      region
      street
      telephone
      __typename
    }
    shipping_method
    status
    total {
      discounts {
        label
        amount {
          currency
          value
          __typename
        }
        __typename
      }
      grand_total {
        currency
        value
        __typename
      }
      loyalty_points {
        point
        loyalty_points_total {
          currency
          value
        }
        __typename
      }
      student_discount {
        currency
        value
        __typename
      }
      subtotal {
        currency
        value
        __typename
      }
      total_shipping {
        currency
        value
        __typename
      }
      total_tax {
        currency
        value
        __typename
      }
      total_tp_discount {
        currency
        value
        __typename
      }
      __typename
    }
    __typename
  }
`;

/**
 * --------------------------------------------------------------- *
 * @constant GET_CUSTOMER_ORDERS_DETAIL
 * @summary 订单详情查询（供 account_purchases_detail 详情页使用）
 *
 * @notes
 * - 与列表页 account_purchases 的 GET_CUSTOMER_ORDERS 是同一个后端接口
 *   （customer.orders）的两个视图：变量与查询骨架相同，但本查询的
 *   fragment 字段是列表版的超集（额外含地址/支付/物流/发票/评论/促销等）。
 * - 详情页用 filter: {number: {eq: 订单号}} 只取单个订单。
 * - 注意不要合并成一个查询：列表页用本查询会拉取大量无用字段。
 * --------------------------------------------------------------- *
 */
export const GET_CUSTOMER_ORDERS_DETAIL = gql(
  filterGraphql(print(GetCustomerOrdersDetail)),
);

export const GET_INVOICE_URL = gql(
  filterGraphql(`
    query getInvoiceUrl($orderIncrementId: String!) {
      invoiceUrl(order_increment_id: $orderIncrementId)
    }
  `),
);

/**
 * --------------------------------------------------------------- *
 * @constant GET_DFI_RETURN_OPTIONS
 * @summary 退货方案 + 原因 + 媒体规则（Cancel & Return 文档 §1）
 * @notes 不需要登录态（auth-off），进入退货表单时查询一次。
 *        uid 每个环境不同，禁止写死。
 * --------------------------------------------------------------- *
 */
export const GET_DFI_RETURN_OPTIONS = gql`
  query dfiReturnOptions {
    dfiReturnOptions {
      solutions {
        code
        label
        reasons {
          uid
          label
          requires_text
        }
      }
      media {
        enabled
        min_files
        max_files
        max_video_files
        max_image_files
        video_required
        max_video_mb
        max_image_mb
        video_extensions
        image_extensions
      }
    }
  }
`;

/**
 * --------------------------------------------------------------- *
 * @constant REQUEST_RETURN
 * @summary 提交退货/退款申请（Cancel & Return 文档 §4）
 * @notes
 * - order_uid = 订单查询返回的 id（base64）；order_item_uid = items[].id
 * - solution / reason_uid 必填；requires_text 时带 reason_other_text
 * - attachment_tokens 来自 REST 上传接口的 token（§3）
 * - 错误在 errors[0].message，可直接展示
 * --------------------------------------------------------------- *
 */
export const REQUEST_RETURN = gql`
  mutation requestReturn($input: RequestReturnInput!) {
    requestReturn(input: $input) {
      return {
        uid
        number
        created_at
        status
        display_status
        solution {
          code
          label
        }
        reason {
          uid
          label
          requires_text
        }
        reason_other_text
        items {
          uid
          request_quantity
          order_item {
            product_name
            product_sku
          }
        }
        comments {
          text
          created_at
        }
        attachments {
          url
          type
          file_name
          size
          created_at
        }
      }
    }
  }
`;

/**
 * --------------------------------------------------------------- *
 * @constant GET_CUSTOMER_RETURN
 * @summary 退货详情（含进度/物流/退款信息，Cancel & Return 文档 §5 §9）
 * @notes attachments[].url 为签名链接，30 分钟过期——展示前实时查询，
 *        不要缓存 URL。
 * --------------------------------------------------------------- *
 */
export const GET_CUSTOMER_RETURN = gql`
  query getCustomerReturn($uid: ID!) {
    customer {
      return(uid: $uid) {
        uid
        number
        created_at
        display_status
        solution {
          code
          label
        }
        reason {
          uid
          label
          requires_text
        }
        reason_other_text
        items {
          uid
          request_quantity
          order_item {
            product_name
            product_sku
            refundable_unit_price {
              currency
              value
            }
            product {
              thumbnail {
                url
              }
            }
          }
        }
        comments {
          text
          created_at
        }
        attachments {
          url
          type
          file_name
          size
          created_at
        }
        dfi_timeline {
          code
          label
          state
          time
        }
        dfi_tracking {
          awb_number
          carrier
          events {
            status
            event
            message
            time
          }
        }
        dfi_refund {
          number
          amount {
            value
            currency
          }
          status
          created_at
        }
      }
    }
  }
`;

/**
 * --------------------------------------------------------------- *
 * @constant ADD_RETURN_COMMENT
 * @summary 给已有退货追加凭证/留言（Cancel & Return 文档 §6）
 * @notes 每条评论最多 3 个附件 token，不强制视频。
 * --------------------------------------------------------------- *
 */
export const ADD_RETURN_COMMENT = gql`
  mutation addReturnComment($input: AddReturnCommentInput!) {
    addReturnComment(input: $input) {
      return {
        uid
        comments {
          text
          created_at
        }
        attachments {
          url
          type
          file_name
          size
          created_at
        }
      }
    }
  }
`;

/**
 * --------------------------------------------------------------- *
 * @constant CANCEL_ORDER
 * @summary 取消退款中订单（core cancelOrder，Cancel & Return 文档 §7）
 * @notes 成功 = errorV2 为 null；失败信息在 errorV2.message，
 *        不能读 errors[]。
 * --------------------------------------------------------------- *
 */
export const CANCEL_ORDER = gql`
  mutation cancelOrder($id: ID!, $reason: String!, $note: String) {
    cancelOrder(input: {order_id: $id, reason: $reason, reason_note: $note}) {
      order {
        id
        number
        status
        status_label
        available_actions
        payment_countdown
      }
      errorV2 {
        code
        message
      }
    }
  }
`;

/**
 * --------------------------------------------------------------- *
 * @constant GET_ORDER_CANCEL_CONFIG
 * @summary 取消订单原因列表（storeConfig，Cancel & Return 文档 §7）
 * @notes 原因由后台配置，发送时将 description 原样作为 reason。
 * --------------------------------------------------------------- *
 */
export const GET_ORDER_CANCEL_CONFIG = gql`
  query cancelReasons {
    storeConfig {
      order_cancellation_enabled
      order_cancellation_reasons {
        description
      }
    }
  }
`;
