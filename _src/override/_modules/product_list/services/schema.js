import {gql} from '@apollo/client';

import {filterGraphql} from '@app/services/helper';

const price_range = `
  price_range {
    minimum_price {
      discount {
        amount_off
        percent_off
      }
      regular_price {
        value
        currency
      }
      final_price {
        currency
        value
      }
    }
    maximum_price {
      discount {
        amount_off
        percent_off
      }
      regular_price {
        value
        currency
      }
      final_price {
        currency
        value
      }
    }
  }
`;

const ProductFragment = {
  configurable: gql`
    fragment ConfigurableProductPLP on ConfigurableProduct {
      configurable_options {
        id
        attribute_id
        label
        position
        attribute_code
        values {
          value_index
          label
          default_label
          store_label
          use_default_value
        }
        product_id
      }

      variants {
        product {
          name
          id
          sku
          stock_status
          image {
            url
            label
          }
        }
      }
    }
  `,

  bundle: gql`
    fragment BundleProduct on BundleProduct {
      items {
        option_id
        title
        required
        type
        position
        sku
        options {
          id
          label
          quantity
          position
          price
          price_type
          product {
            id
            name
            sku
            description {
              html
            }
            image {
              url
              label
            }
            thumbnail {
              url
              label
            }
            ${price_range}
            stock_status
            url_key
          }
        }
      }
    }
  `,
};

export const GET_PRODUCTS_BY_CATEGORIES = gql`
  query getProductsByCategoryId(
    $categoryId: String
    $currentPage: Int
    $pageSize: Int
    $sortBy: ProductAttributeSortInput
  ) {
    products(
      filter: {category_id: {eq: $categoryId}}
      currentPage: $currentPage
      pageSize: $pageSize
      sort: $sortBy
    ) {
      total_count
      items {
        id
        name
        sku
        url_key
        small_image {
          url
          label
        }
        ${price_range}
      }
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`;

export const GET_PRODUCTS_BY_BRAND = gql`
  query getProductsByBrand(
    $attributeId: String
    $currentPage: Int
    $pageSize: Int
    $sortBy: ProductAttributeSortInput
  ) {
    products(
      filter: {brand: {eq: $attributeId}}
      currentPage: $currentPage
      pageSize: $pageSize
      sort: $sortBy
    ) {
      total_count
      items {
        id
        name
        sku
        url_key
        small_image {
          url
          label
        }
        ${price_range}
      }
      page_info {
        current_page
        total_pages
        page_size
      }
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query searchProducts(
    $search: String
    $currentPage: Int
    $pageSize: Int
    $sortBy: ProductAttributeSortInput
  ) {
    products(
      search: $search
      currentPage: $currentPage
      pageSize: $pageSize
      sort: $sortBy
    ) {
      total_count
      items {
        id
        name
        sku
        url_key
        small_image {
          url
          label
        }
        ${price_range}
      }
      page_info {
        current_page
        total_pages
        page_size
      }
    }
  }
`;

export const GET_PRODUCT_BY_URL_KEY = gql`
  ${ProductFragment.configurable}
  ${ProductFragment.bundle}
  query getProductByURL(
    $url_key: String
    $currentPage: Int
    $pageSize: Int
    $sortBy: ProductAttributeSortInput
  ) {
    products(
      filter: {url_key: {eq: $url_key}}
      currentPage: $currentPage
      pageSize: $pageSize
      sort: $sortBy
    ) {
      items {
        __typename
        brand
        name
        id
        is_gwp
        stock_status
        stock_item {
          min_sale_qty
          max_sale_qty
        }
        sku
        url_key
        description {
          html
        }
        ${price_range}
        image {
          url
        }
        media_gallery {
          url
          position
          label
          disabled
        }
        ...ConfigurableProductPLP
        ...BundleProduct
      }
    }
  }
`;

export const GET_PRODUCT_REVIEWS = gql`
  query getProductReviews($sku: String!, $currentPage: Int, $pageSize: Int) {
    getProductReviews(
      sku: $sku
      currentPage: $currentPage
      pageSize: $pageSize
    ) {
      totalCount
      items {
        entity_pk_value
        nickname
        id
        detail
        created_at
        title
        ratings {
          rating_name
          value
        }
      }
    }
  }
`;

export const GET_PRODUCT_FILTER_PRODUCT_LIST = gql(
  filterGraphql(`
    query getProductFiltersByCategory($categoryIdFilter: FilterEqualTypeInput!) {
      products(filter: {category_id: $categoryIdFilter}) {
        aggregations {
          label
          count
          attribute_code
          options {
            label
            value
            count
            __typename
          }
          __typename
        }
        __typename
      }
    }
  `),
);

export const GET_PRODUCT_FILTER_BY_SEARCH = gql(
  filterGraphql(`
    query getProductFiltersBySearch($search: String!) {
    products(search: $search) {
      aggregations{
        label
        count
        attribute_code
        options{
          label
          value
          count
          __typename
        }
        __typename
      }
      __typename
    }
  }
  `),
);

export const GET_PRODUCTS_TOTAL_COUNT = gql(
  filterGraphql(`
    query PreviewFilterCount(
      $filters: ProductAttributeFilterInput!
      $search: String
    ) {
      products(filter: $filters, search: $search) {
        total_count
        __typename
      }
      __typename
    }
  `),
);

/**
 * GUID filter bootstrap: Admin-configured quick-filter
 * settings (label/attribute/value/condition per chip) +
 * the category facet allowed by the page context. Pass the
 * numeric category id on Category pages;
 * omit it on Search / root PLP to get the store's L1
 * categories. Empty category list on a Category page means
 * the node has no children -> hide the Category facet.
 */
export const GET_GUID_FILTER_BOOTSTRAP = gql(
  filterGraphql(`
    query GuidFilterBootstrap($categoryId: Int) {
      guidQuickFilterSettings {
        code
        label
        attribute_code
        condition_type
        value
        requires_option_selection
      }
      guidCategoryFacet(category_id: $categoryId) {
        id
        uid
        name
        url_key
      }
    }
  `),
);

export const GET_CATEGORIES_PRODUCT_LIST = gql(
  filterGraphql(`
    query GuidCategoryListing(
      $id: Int!
      $pageSize: Int!
      $currentPage: Int!
      $filters: ProductAttributeFilterInput!
      $sort: ProductAttributeSortInput
      $search: String
    ) {
      category(id: $id) {
        id
        ...CategoryFragmentPLP
      }
      products(
        pageSize: $pageSize
        currentPage: $currentPage
        filter: $filters
        sort: $sort
        search: $search
      ) {
        ...ProductsFragmentPLP
      }
    }
    fragment CategoryFragmentPLP on CategoryTree {
      id
      name
      meta_title
      meta_keywords
      meta_description
      image
      app_content {
        description
      }
    }
    fragment ProductsFragmentPLP on Products {
      items {
        id
        uid
        sku
        categories {
          id
          name
          level
        }
        name
        ${price_range}
        sku
        offers {
          id
          rule_code
          name
          description
          image
          promotion_type
        }
        special_price
        special_from_date
        special_to_date
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
        stock_item{
          min_sale_qty
          max_sale_qty
          salable_qty
          is_in_stock
        }
        type_id
        url_key
        url_suffix
        sale
        promo
        rating_summary
        is_flash_sale
        variant_parent_sku
        variant_parent_url
        variant_parent_url_key
        variant_parent_url_suffix
        variant_preselected_options
        discount_percentage
      }
      page_info {
        total_pages
      }
      total_count
    }
  `),
);

const productSearch = gql`
  query GuidCategoryListing(
    $currentPage: Int
    $inputText: String!
    $pageSize: Int
    $filters: ProductAttributeFilterInput!
    $sort: ProductAttributeSortInput
  ) {
    products(
      currentPage: $currentPage
      pageSize: $pageSize
      search: $inputText
      filter: $filters
      sort: $sort
    ) {
      items {
        id
        uid
        is_flash_sale
        discount_percentage
        special_from_date
        special_to_date
        name
        offers {
          id
          rule_code
          name
          description
          image
          promotion_type
        }
        ${price_range}
        sku
        special_price
        price {
          regularPrice {
            amount {
              currency
              value
              __typename
            }
            __typename
          }
          __typename
        }
        small_image {
          url
          __typename
        }
        stock_status
        stock_item {
          min_sale_qty
          max_sale_qty
          salable_qty
          is_in_stock
        }
        type_id
        url_key
        url_suffix
        sale
        promo
        __typename
        variant_parent_sku
        variant_parent_url
        variant_parent_url_key
        variant_parent_url_suffix
        variant_preselected_options
      }
      page_info {
        total_pages
        current_page
        __typename
      }
      total_count
      __typename
    }
  }
`;

export const GET_PRODUCT_SEARCH = gql(
  filterGraphql(productSearch.loc.source.body),
);

export const GET_PRODUCTS_ON_CATALOG_PRODUCTS = gql`
  query getProductsByCategoryId(
    $categoryId: String
    $currentPage: Int
    $pageSize: Int
    $sortBy: ProductAttributeSortInput
  ) {
    products(
      filter: {category_id: {eq: $categoryId}}
      currentPage: $currentPage
      pageSize: $pageSize
      sort: $sortBy
    ) {
      total_count
      items {
        id
        sku
        categories {
          id
          name
          level
        }
        name
        ${price_range}
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
        stock_item {
          min_sale_qty
          max_sale_qty
        }
        type_id
        url_key
        url_suffix
        sale
        promo
      }
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`;

export const GET_PRODUCTS_BY_URL_KEY = gql(
  filterGraphql(`
  query getProductsByUrlKey(
    $url_keys: [String]
    $pageSize: Int!
    $sortBy: ProductAttributeSortInput
  ) {
    products(
      filter: {url_key: {in: $url_keys}}
      pageSize: $pageSize
      sort: $sortBy
    ) {
      total_count
      items {
        id
        uid
        __typename
        discount_percentage
        offers {
          id
          rule_code
          name
          description
          image
          promotion_type
        }
        sku
        categories {
          id
          uid
          name
          level
        }
        name
        special_price
        ${price_range}
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
        stock_item {
          qty
          min_qty
          min_sale_qty
          max_sale_qty
          is_in_stock
          salable_qty
        }
        type_id
        url_key
        url_suffix
        promo
        sale
        variant_parent_sku
        variant_parent_url
        variant_parent_url_key
        variant_parent_url_suffix
        variant_preselected_options
      }
    }
  }
`),
);

export const GET_FLASH_SALE_PRODUCTS = gql(
  filterGraphql(`
    query getProductsByUrlKey(
      $is_flash_sale: String
      $pageSize: Int!
    ) {
      products(
        filter: { is_flash_sale: { eq: $is_flash_sale } }
        pageSize: $pageSize
      ) {
        total_count
        items {
          id
          uid
          discount_percentage
          offers {
            id
            rule_code
            name
            description
            image
            promotion_type
          }
          categories {
            id
            uid
            name
            level
            __typename
          }
          name
          is_flash_sale
          special_price
          special_from_date
          special_to_date
          ${price_range}
          sku
          small_image {
            url
            __typename
          }
          stock_status
          stock_item {
            qty
            min_qty
            min_sale_qty
            max_sale_qty
            backorders
            qty_increments
            manage_stock
            is_in_stock
            __typename
          }
          type_id
          url_key
          promo
          sale
          variant_parent_sku
          variant_parent_url
          variant_parent_url_key
          variant_parent_url_suffix
          variant_preselected_options
          __typename
        }
        __typename
      }
    }
  `),
);

export const URL_RESOLVER = gql(
  filterGraphql(`
    query getUrlResolverData($url:String!) {
      urlResolver(url:$url) {
        id
        type
        relative_url
        __typename
      }
    }
  `),
);
