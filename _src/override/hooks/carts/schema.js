import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

const CART_ITEMS = {
  fragment: `
  fragment ProductListingFragment on Cart {
    id
    items {
      id
      product {
        name
        sku
        url_key
        stock_status
        is_flash_sale
        special_from_date
        special_to_date
        small_image {
          url
          __typename
        }
        ...ProductFragment
        ... on ConfigurableProduct {
          variants {
            attributes {
              uid
              __typename
            }
            product {
              id
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
      }
      prices {
        price {
          currency
          value
          __typename
        }
        __typename
      }
      quantity
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
          thumbnail {
            url
          }
          stock_item {
            salable_qty
            is_in_stock
          }
        }
        __typename
      }
      ... on SimpleCartItem {
        customizable_options {
          customizable_option_uid
          is_required
          sort_order
          label
          values {
            customizable_option_value_uid
            value
            label
            __typename
          }
          __typename
        }
        __typename
      }
      ... on BundleCartItem {
        bundle_options {
          id
          label
          values {
            id
            label
            price
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
  fragment ProductFragment on SimpleProduct {
    id
    thumbnail {
      url
      __typename
    }
    __typename
  }
  `,
};

const CART_ITEMS_CUSTOM_PRICE = {
  fragment: `
  fragment ProductListingFragmentCustom on Cart {
    id
    items {
      id
      is_free_gift
      is_gamification_free_gift
      free_gift_data {
        sku
        name
        url_key
        qty
        price {
          currency
          value
        }
        image_url
      }
      custom_price {
        row_total {
          currency
          value
        }
      }
      custom_cart_discount {
        promo_id
        discount_amount
      }
      product {
        is_flash_sale
        special_price
        special_from_date
        special_to_date
        promo
        name
        sku
        url_key
        stock_status
        stock_item {
          salable_qty
          min_sale_qty
          max_sale_qty
        }
        small_image {
          url
          __typename
        }
        ...ProductFragmentCustom
        ... on ConfigurableProduct {
          configurable_options {
            uid
            attribute_uid
            attribute_code
            attribute_id
            values {
              uid
              value_index
              store_label
              default_label
              swatch_data {
                ... on ImageSwatchData {
                  thumbnail
                }
                value
                __typename
              }
            }
          }
          variants {
            attributes {
              uid
              __typename
            }
            product {
              id
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
      }
      quantity
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
          thumbnail {
            url
          }
          stock_item {
            salable_qty
            is_in_stock
          }
        }
        __typename
      }
      ... on SimpleCartItem {
        customizable_options {
          customizable_option_uid
          is_required
          sort_order
          label
          values {
            customizable_option_value_uid
            value
            label
            __typename
          }
          __typename
        }
        __typename
      }
      ... on BundleCartItem {
        bundle_options {
          id
          label
          values {
            id
            label
            price
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
  fragment ProductFragmentCustom on SimpleProduct {
    id
    thumbnail {
      url
      __typename
    }
    __typename
  }
  `,
};

const CART_ITEMS_BLOCK_SUBTOTAL = {
  fragment: gql`
    fragment ProductListingFragmentSub on Cart {
      id
      prices {
        grand_total {
          currency
          value
          __typename
        }
      }
      items {
        id
        quantity
        is_free_gift
        is_gamification_free_gift
        free_gift_data {
          sku
          name
          url_key
          qty
          price {
            currency
            value
          }
          image_url
        }
        validOffers {
          id
          rule_code
          name
          description
          image
          promotion_type
        }
        custom_price {
          row_total {
            currency
            value
          }
        }
        custom_cart_discount {
          promo_id
          discount_amount
        }
        product {
          is_flash_sale
          special_price
          special_from_date
          special_to_date
          offers {
            id
            rule_code
            name
            description
            image
            promotion_type
          }
          name
          sku
          url_key
          small_image {
            url
            __typename
          }
          thumbnail {
            url
            __typename
          }
          price_range {
            maximum_price {
              regular_price {
                value
                currency
                __typename
              }
              final_price {
                value
                currency
                __typename
              }
              discount {
                amount_off
                percent_off
                __typename
              }
              __typename
            }
            __typename
          }
        }
        prices {
          price {
            value
            __typename
          }
          __typename
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
            thumbnail {
              url
            }
            stock_item {
              salable_qty
              is_in_stock
            }
          }
        }
        ... on BundleCartItem {
          bundle_options {
            id
            label
            values {
              id
              label
              price
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
  `,
};

const CART_SHIPPING_ADDRESS = {
  fragment: `
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
  `,
};

const CART_BILLING_ADDRESS = {
  fragment: `
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
  `,
};

const CART_PRICE = {
  fragment: `
  fragment PriceSummaryFragment on Cart {
    id
    prices {
      ...TaxSummaryFragment
      ...DiscountSummaryFragment
      ...GrandTotalFragment
      ...AwRafDiscountFragment
      ...PromotionSummaryFragment
      grand_total {
        currency
        value
        __typename
      }
      subtotal_after_discounts {
        currency
        value
        __typename
      }
      loyalty_points {
        point
        loyalty_points_total {
          value
          currency
        }
        __typename
      }
      subtotal_excluding_tax {
        currency
        value
        __typename
      }
      __typename
    }
    __typename
  }
  fragment PromotionSummaryFragment on CartPrices {
    promotions {
        amount {
            currency
            value
            __typename
        }
        label
        __typename
    }
    __typename
  }
  fragment AwRafDiscountFragment on CartPrices {
    aw_raf_discount {
      status
      name
      value {
        currency
        discount_amount
        discount_base_amount
        percent_amount
        discount_type
        __typename
      }
      __typename
    }
    __typename
  }
  fragment DiscountSummaryFragment on CartPrices {
    discounts {
      amount {
        currency
        value
        __typename
      }
      label
      __typename
    }
    __typename
  }
  fragment GrandTotalFragment on CartPrices {
    grand_total {
      currency
      value
      __typename
    }
    __typename
  }
  fragment TaxSummaryFragment on CartPrices {
    applied_taxes {
      amount {
        currency
        value
        __typename
      }
      __typename
    }
    __typename
  }
  
  `,
};

/* eslint-disable-next-line no-unused-vars */
const CART_PRICE_SIMPLE = {
  fragment: `
  fragment PriceSummaryFragmentSimple on Cart {
    id
    prices {
      grand_total {
        currency
        value
        __typename
      }
      subtotal_after_discounts {
        currency
        value
        __typename
      }
      subtotal_excluding_tax{
        value
        currency
      }
      subtotal_with_discount_excluding_tax {
        currency
        value
      }
      discounts {
        label
        amount {
          value
        }
        
      }
    }
    
  }
  `,
};

const cartSchema = () => {
  const getItems = gql(
    filterGraphql(`
    ${CART_ITEMS.fragment}
    query getCartItem($cartID: String!) {
      cart(cart_id: $cartID) {
        id
        email
        total_quantity
        ...ProductListingFragment      
      }
    }
  `),
  );

  // TODO: 待删除
  const getItemsCustomPrice = gql(
    filterGraphql(`
    ${CART_ITEMS_CUSTOM_PRICE.fragment}
    query getCartItemCustomPrice($cartID: String!) {
      cart(cart_id: $cartID) {
        id
        email
        total_quantity
        ...ProductListingFragmentCustom      
      }
    }
  `),
  );

  const getCartItemBlockSubtotal = gql`
    ${CART_ITEMS_BLOCK_SUBTOTAL.fragment}
    query getCartItemBlockSubtotal($cartID: String!) {
      cart(cart_id: $cartID) {
        id
        email
        total_quantity
        ...ProductListingFragmentSub
      }
    }
  `;

  const getItemsBlockSubtotal = gql(
    filterGraphql(getCartItemBlockSubtotal.loc.source.body),
  );

  const getItemsDiscount = gql(
    filterGraphql(`
    query getCartItemDiscount($cartID: String!) {
      cart(cart_id: $cartID) {
        id
        items{
          id
          custom_price {
            row_total {
              currency
              value
            }
          }
          custom_cart_discount{
            promo_id
            discount_amount
          }
        }  
      }
    }
  `),
  );

  // items 必须带出 configured_variant.sku：PLP 卡片与变体弹窗是按列表里的 item.sku
  // （即变体自己的 sku）去 rxProductIdCartItemIdMap 查已购数量的，缺这个字段会让
  // 已在购物车的变体商品仍显示 "Add" 而不是数量步进器。
  // updateProductCartItemMap 每次整体重建 map，而本查询在首页启动时最后写入，
  // 会把购物车页（CART_ITEMS 已含该字段）填好的变体 key 覆盖掉。
  const getCartInformation = gql(
    filterGraphql(`
      query getCartInformation($cartID: String!) {
        cart(cart_id: $cartID) {
          id
          email
          total_quantity
          items {
            id
            quantity
            is_free_gift
            product {
              id
              sku
            }
            ... on ConfigurableCartItem {
              configured_variant {
                sku
              }
            }
          }
        }
      }
  `),
  );

  const getAvailablePaymentMethod = gql(
    filterGraphql(`
        query getAvailablePaymentMethod($cartID: String!) {
            cart(cart_id: $cartID) {
                available_payment_methods {
                    code
                    title
                }
            }
        }
  `),
  );

  const getAppliedCoupon = gql(
    filterGraphql(`
      query getAppliedCoupon($cartID: String!) {
        cart(cart_id: $cartID) {
            applied_manual_coupon {
              coupon_code
              rule_id
            }
            applied_coupon {
              code
            }
            applied_coupons {
                code
                discount_amount
                is_free_gift_coupon
                is_cashback_coupon
                rule_name
                cashback_amount
            }
        }
      }
  `),
  );

  const getAppliedRewardPoint = gql(
    filterGraphql(`
        query getAppliedRewardPoint($cartID: String!) {
            cart(cart_id: $cartID) {
                applied_reward_points {
                    is_use_reward_points
                    reward_points
                    reward_points_amount
                }
            }
        }
    `),
  );

  const getAppliedStoreCredit = gql(
    filterGraphql(`
        query getAppliedStoreCredit($cartID: String!) {
            cart(cart_id: $cartID) {
                applied_store_credit {
                    is_use_store_credit
                    store_credit_amount
                }
            }
        }
    `),
  );

  const getAppliedGiftCard = gql(
    filterGraphql(`
      query getAppliedCoupon($cartID: String!) {
        cart(cart_id: $cartID) {
            applied_giftcard {
                giftcard_amount
                giftcard_detail {
                    giftcard_code
                    giftcard_amount_used
                }
            }
        }
      }
  `),
  );

  const getSelectedPaymentMethod = gql(
    filterGraphql(`
        query getSelectedPaymentMethod($cartID: String!) {
            cart(cart_id: $cartID) {
                selected_payment_method {
                    code
                    title
                }
            }
        }
  `),
  );

  const getAddress = gql(
    filterGraphql(`
      query getCartAddress($cartID: String!) {
        cart(cart_id: $cartID) {
          id
          email
          total_quantity
          ${CART_SHIPPING_ADDRESS.fragment}
          ${CART_BILLING_ADDRESS.fragment}
        }
      }
  `),
  );

  const getPrice = gql(
    filterGraphql(`
    ${CART_PRICE.fragment}
      query getCartPrice($cartID: String!) {
        cart(cart_id: $cartID) {
          id
          email
          total_quantity
          ...PriceSummaryFragment
          applied_reward_points {
            is_use_reward_points
            reward_points
            reward_points_amount
          }
          applied_store_credit {
            is_use_store_credit
            store_credit_amount
          }
          applied_giftcard {
            giftcard_amount
            giftcard_detail {
                giftcard_code
                giftcard_amount_used
            }
          }
          shipping_addresses {
            available_shipping_methods {
              amount {
                currency
                value
                __typename
              }
              amount_before_discount {
                currency
                value
                __typename
              }
              discount_fee {
                currency
                value
                __typename
              }
            }
            selected_shipping_method {
              amount {
                currency
                value
                __typename
              }
              amount_before_discount {
                currency
                value
                __typename
              }
              discount_fee {
                currency
                value
                __typename
              }
            }
          }
        }
      }
  `),
  );

  // TODO:
  const getCartPriceSimple = gql`
    query getCartPriceSimple($cartID: String!) {
      cart(cart_id: $cartID) {
        id
        email
        total_quantity
        tiering_nudge {
          voucher_code
          voucher_name
          action_type
          message
          is_applied
          is_best_tier
          current_tier {
            min_spend
            discount_value
            discount_label
            estimated_saving
          }
          next_tier {
            min_spend
            discount_value
            discount_label
            estimated_saving
            amount_needed
          }
        }
        prices {
          grand_total {
            currency
            value
            __typename
          }
          subtotal_after_discounts {
            currency
            value
            __typename
          }
          subtotal_excluding_tax {
            value
            currency
          }
          subtotal_with_discount_excluding_tax {
            currency
            value
          }
          discounts {
            label
            amount {
              value
            }
          }
          promotions {
            label
            amount {
              currency
              value
            }
          }
          loyalty_points {
            point
            loyalty_points_total {
              currency
              value
            }
            __typename
          }
        }
        items {
          id
          uid
          is_free_gift
          is_gamification_free_gift
          free_gift_data {
            sku
            name
            url_key
            qty
            price {
              currency
              value
            }
            image_url
          }
          custom_price {
            row_total {
              currency
              value
            }
          }
          custom_cart_discount {
            promo_id
            discount_amount
          }
          validOffers {
            id
            rule_code
            name
            description
            image
            promotion_type
          }
          product {
            is_flash_sale
            special_price
            special_from_date
            special_to_date
            offers {
              id
              rule_code
              name
              description
              image
              promotion_type
            }
            promo
            name
            sku
            url_key
            stock_status
            stock_item {
              salable_qty
              min_sale_qty
              max_sale_qty
            }
            small_image {
              url
              __typename
            }
            ... on SimpleProduct {
              id
              thumbnail {
                url
                __typename
              }
              __typename
            }
            ... on ConfigurableProduct {
              configurable_options {
                uid
                attribute_uid
                attribute_code
                attribute_id
                values {
                  uid
                  value_index
                  store_label
                  default_label
                  swatch_data {
                    ... on ImageSwatchData {
                      thumbnail
                    }
                    value
                    __typename
                  }
                }
              }
            }
          }
          quantity
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
              thumbnail {
                url
              }
              stock_item {
                salable_qty
                is_in_stock
              }
            }
            __typename
          }
          __typename
        }
        __typename
        shipping_addresses {
          selected_shipping_method {
            amount {
              currency
              value
              __typename
            }
            amount_before_discount {
              currency
              value
              __typename
            }
          }
        }
      }
    }
  `;
  const getPriceSimple = gql(filterGraphql(getCartPriceSimple.loc.source.body));

  const addSimpleItemToCart = gql`
    ${CART_ITEMS.fragment}
    ${CART_PRICE.fragment}
    mutation AddProductsToCart(
      $cartId: String!
      $cartItems: [CartItemInput!]!
    ) {
      addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
        cart {
          id
          email
          total_quantity
          ...ProductListingFragment
          ...PriceSummaryFragment
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

  const addBundleItemToCart = gql`
    ${CART_ITEMS.fragment}
    ${CART_PRICE.fragment}
    mutation addBundleProductsToCart($input: AddBundleProductsToCartInput) {
      addBundleProductsToCart(input: $input) {
        cart {
          id
          email
          total_quantity
          ...ProductListingFragment
          ...PriceSummaryFragment
        }
      }
    }
  `;

  const addConfigurableItemToCart = gql`
    ${CART_ITEMS.fragment}
    ${CART_PRICE.fragment}
    mutation AddProductsToCart(
      $cartId: String!
      $cartItems: [CartItemInput!]!
    ) {
      addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
        cart {
          id
          email
          total_quantity
          ...ProductListingFragment
          ...PriceSummaryFragment
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

  const addVirtualItemToCart = gql`
    ${CART_ITEMS.fragment}
    ${CART_PRICE.fragment}
    mutation addVirtualProductsToCart($input: AddVirtualProductsToCartInput) {
      addVirtualProductsToCart(input: $input) {
        cart {
          id
          email
          total_quantity
          ...ProductListingFragment
          ...PriceSummaryFragment
        }
      }
    }
  `;

  // 凡是喂给 updateProductCartItemMap 的 cart.items，都必须同时 select id 和
  // configured_variant.sku：前者是数量步进器加减的凭据（缺了会静默无反应），
  // 后者是 PLP 变体卡片查已购数量的 key（缺了卡片会退回 "Add"）。
  // 本 mutation 在列表卡片每次按 +/− 后重建整个 map，漏字段会当场把
  // 变体 key 抹掉，看起来就像“计数器又变回 Add 了”。
  const updateItemOnCart = gql`
    mutation updateCartItems($input: UpdateCartItemsInput) {
      updateCartItems(input: $input) {
        cart {
          id
          email
          total_quantity
          items {
            id
            quantity
            product {
              id
              sku
              stock_status
              stock_item {
                salable_qty
                min_sale_qty
                max_sale_qty
              }
            }
            ... on ConfigurableCartItem {
              configured_variant {
                sku
              }
            }
          }
        }
        user_errors {
          message
          code
        }
      }
    }
  `;

  const removeItemOnCart = gql`
    ${CART_ITEMS_CUSTOM_PRICE.fragment}
    mutation removeItemFromCart($input: RemoveItemFromCartInput) {
      removeItemFromCart(input: $input) {
        cart {
          id
          email
          total_quantity
          ...ProductListingFragmentCustom
        }
      }
    }
  `;

  const getCartDetailsBackup = gql(
    filterGraphql(
      `
    query GetCartDetails($cartID: String!) {
      cart(cart_id: $cartID) {
        id
        ...CartPageFragment
        __typename
      }
    }
    fragment CartPageFragment on Cart {
      id
      total_quantity
      ...AppliedCouponsFragment
      ...GiftCardFragment
      ...ProductListingGetDetailFragment
      ...PriceSummaryGetDetailFragment
      __typename
    }
    fragment AppliedCouponsFragment on Cart {
      id
      applied_coupons {
        code
        __typename
      }
      __typename
    }
    fragment GiftCardFragment on Cart {
      applied_giftcard {
        giftcard_amount
        giftcard_detail {
          giftcard_code
          giftcard_amount_used
          __typename
        }
        __typename
      }
      id
      __typename
    }
    fragment ProductListingGetDetailFragment on Cart {
      id
      items {
        id
      is_free_gift
        product {
          name
          sku
          url_key
          url_suffix
          small_image {
            url
            __typename
          }
          crosssell_products {
            ...ProductFragmentBackup
            price_range {
              minimum_price {
                regular_price {
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
          ...ProductFragmentBackup
          ... on ConfigurableProduct {
            variants {
              attributes {
                uid
                __typename
              }
              product {
                id
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
          ... on CustomizableProductInterface {
            options {
              __typename
              uid
              required
              sort_order
              title
              ... on CustomizableDropDownOption {
                uid
                required
                sort_order
                title
                __typename
                value {
                  uid
                  price
                  sku
                  title
                  sort_order
                  option_type_id
                  __typename
                }
              }
              ... on CustomizableCheckboxOption {
                uid
                required
                sort_order
                title
                __typename
                value {
                  uid
                  price
                  sku
                  title
                  sort_order
                  option_type_id
                  __typename
                }
              }
              ... on CustomizableRadioOption {
                uid
                required
                sort_order
                title
                __typename
                value {
                  uid
                  price
                  sku
                  title
                  sort_order
                  option_type_id
                  __typename
                }
              }
              ... on CustomizableMultipleOption {
                required
                sort_order
                title
                __typename
                value {
                  uid
                  price
                  sku
                  title
                  sort_order
                  option_type_id
                  __typename
                }
              }
            }
            __typename
          }
          __typename
        }
        prices {
          price {
            currency
            value
            __typename
          }
          __typename
        }
        quantity
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
            thumbnail {
              url
            }
            stock_item {
              salable_qty
              is_in_stock
            }
          }
          __typename
        }
        ... on SimpleCartItem {
          customizable_options {
            customizable_option_uid
            is_required
            sort_order
            label
            values {
              customizable_option_value_uid
              value
              label
              __typename
            }
            __typename
          }
          __typename
        }
        ... on BundleCartItem {
          bundle_options {
            id
            label
            values {
              id
              label
              price
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
    fragment ProductFragmentBackup on SimpleProduct {
      id
      categories {
        id
        name
        level
        __typename
      }
      thumbnail {
        url
        __typename
      }
      stock_status
      __typename
    }
    fragment PriceSummaryGetDetailFragment on Cart {
      id
      billing_address {
        firstname
        lastname
        country {
          code
          __typename
        }
        street
        city
        region {
          code
          __typename
        }
        postcode
        telephone
        __typename
      }
      selected_payment_method {
        title
        code
        __typename
      }
      items {
        id
        quantity
        __typename
      }
      ...ShippingSummaryFragment
      prices {
        ...TaxSummaryFragment
        ...DiscountSummaryFragment
        ...GrandTotalFragment
        ...AwRafDiscountFragment
        grand_total {
          currency
          value
          __typename
        }
        subtotal_after_discounts {
          currency
          value
          __typename
        }
        subtotal_excluding_tax {
          currency
          value
          __typename
        }
        __typename
      }
      ...GiftCardSummaryFragment
      __typename
    }
    fragment AwRafDiscountFragment on CartPrices {
      aw_raf_discount {
        status
        name
        value {
          currency
          discount_amount
          discount_base_amount
          percent_amount
          discount_type
          __typename
        }
        __typename
      }
      __typename
    }
    fragment DiscountSummaryFragment on CartPrices {
      discounts {
        amount {
          currency
          value
          __typename
        }
        label
        __typename
      }
      __typename
    }
    fragment GiftCardSummaryFragment on Cart {
      id
      applied_giftcard {
        giftcard_amount
        giftcard_detail {
          giftcard_code
          giftcard_amount_used
          __typename
        }
        __typename
      }
      __typename
    }
    fragment GrandTotalFragment on CartPrices {
      grand_total {
        currency
        value
        __typename
      }
      __typename
    }
    fragment ShippingSummaryFragment on Cart {
      id
      shipping_addresses {
        available_shipping_methods {
          amount {
            currency
            value
            __typename
          }
          amount_before_discount {
            currency
            value
            __typename
          }
          discount_fee {
            currency
            value
            __typename
          }
          __typename
        }
        selected_shipping_method {
          amount {
            currency
            value
            __typename
          }
          amount_before_discount {
            currency
            value
            __typename
          }
          discount_fee {
            currency
            value
            __typename
          }
          __typename
        }
        street
        __typename
      }
      __typename
    }
    fragment TaxSummaryFragment on CartPrices {
      applied_taxes {
        amount {
          currency
          value
          __typename
        }
        __typename
      }
      __typename
    }
  `,
    ),
  );

  const getMiniCartQuery = gql(
    filterGraphql(`
    query MiniCartQuery($cartId: String!) {
        cart(cart_id: $cartId) {
            id
        }
    }`),
  );

  // TODO: 待删除
  const getPriceSummary = gql(
    filterGraphql(`
    query getPriceSummary($cartId: String!) {
      cart(cart_id: $cartId) {
        id
      }
    }`),
  );

  return {
    getItems,
    getItemsCustomPrice,
    getItemsBlockSubtotal,
    getItemsDiscount,
    getPrice,
    getPriceSimple,
    getAddress,
    getCartDetailsBackup,
    getAppliedGiftCard,
    getCartInformation,
    getAppliedRewardPoint,
    getAppliedStoreCredit,
    getSelectedPaymentMethod,
    getAvailablePaymentMethod,
    getAppliedCoupon,
    addSimpleItemToCart,
    addVirtualItemToCart,
    addBundleItemToCart,
    addConfigurableItemToCart,
    updateItemOnCart,
    removeItemOnCart,
    getMiniCartQuery,
    getPriceSummary,
  };
};

export default cartSchema;

export const UPDATE_CONFIGURABLE_OPTIONS = gql`
  ${CART_ITEMS_CUSTOM_PRICE.fragment}
  mutation updateConfigurableOptions(
    $cartId: String!
    $cartItemId: ID!
    $parentSku: String!
    $variantSku: String!
    $quantity: Float!
  ) {
    removeItemFromCart(input: {cart_id: $cartId, cart_item_uid: $cartItemId}) {
      cart {
        id
        email
        total_quantity
        ...ProductListingFragmentCustom
      }
    }
    addConfigurableProductsToCart(
      input: {
        cart_id: $cartId
        cart_items: [
          {
            data: {quantity: $quantity, sku: $variantSku}
            parent_sku: $parentSku
          }
        ]
      }
    ) {
      cart {
        id
      }
    }
  }
`;
