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
    fragment ConfigurableProductPDP on ConfigurableProduct {
      configurable_options {
        uid
        attribute_uid
        attribute_code
        label
        position
        values {
          uid
          label
          default_label
          store_label
          value_index
          swatch_data {
            __typename
            value
            ... on ImageSwatchData {
              thumbnail
            }
          }
        }
      }
      variants {
        attributes {
          uid
          code
          label
          value_index
        }
        product {
          id
          is_flash_sale
          special_from_date
          special_to_date
          uid
          sku
          name
          offers {
            id
            rule_code
            name
            description
            image
            promotion_type
          }
          stock_status
          small_image {
            url
          }
          thumbnail {
            url
          }
          media_gallery {
            url
            position
            label
            disabled
          }
          stock_item {
            salable_qty
            is_in_stock
          }
          ${price_range}
        }
      }
      configurable_product_options_selection(
        configurableOptionValueUids: $configurableOptionValues
      ) {
        options_available_for_selection {
          attribute_code
          option_value_uids
        }
        configurable_options {
          uid
          attribute_code
          label
          values {
            uid
            label
            is_available
          }
        }
        media_gallery {
          url
          position
          label
          disabled
        }
        variant {
          uid
          sku
          name
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
          price_range {
            maximum_price {
              final_price {
                currency
                value
              }
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
            price_range {
              maximum_price {
                regular_price {
                  value
                  currency
                }
                final_price {
                  value
                  currency
                }
                discount {
                  amount_off
                  percent_off
                }
              }
            }
            stock_status
            url_key
          }
        }
      }
    }
  `,
};

export const GET_PRODUCTS_BY_CATEGORIES = gql(
  filterGraphql(`
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
        price_range {
          maximum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
      }
      page_info {
        page_size
        current_page
        total_pages
      }
    }
  }
`),
);

export const GET_PRODUCTS_BY_BRAND = gql(
  filterGraphql(`
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
        price_range {
          maximum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
      }
      page_info {
        current_page
        total_pages
        page_size
      }
    }
  }
`),
);

export const SEARCH_PRODUCTS = gql(
  filterGraphql(`
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
        price_range {
          maximum_price {
            regular_price {
              value
              currency
            }
            final_price {
              value
              currency
            }
            discount {
              amount_off
              percent_off
            }
          }
        }
      }
      page_info {
        current_page
        total_pages
        page_size
      }
    }
  }
`),
);

const getProductDetailForProductPage = gql`
  ${ProductFragment.configurable}

  query getProductDetailForProductPage(
    $url_key: String
    $configurableOptionValues: [ID!]
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
        id
        uid
        __typename
        type_id
        name
        sku
        url_key
        discount_percentage
        halal_indicator
        bpom_number
        allergens
        brand_info {
          name
          logo
          category_url
        }
        stock_status
        is_flash_sale
        special_from_date
        special_to_date
        small_image {
          url
        }
        media_gallery {
          url
          position
          label
          disabled
        }
        price_range {
          minimum_price {
            final_price {
              currency
              value
            }
            regular_price {
              currency
              value
            }
            discount {
              amount_off
              percent_off
            }
          }
          maximum_price {
            final_price {
              currency
              value
            }
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
        offers {
          id
          rule_code
          name
          description
          image
          promotion_type
        }
        ... on ConfigurableProduct {
          ...ConfigurableProductPDP
        }
      }
    }
  }
`;
export const GET_PRODUCT_BY_URL_KEY = gql(
  filterGraphql(getProductDetailForProductPage.loc.source.body),
);

export const GET_PRODUCT_CROSSSELL_BY_URL_KEY = gql(
  filterGraphql(`
  query getCrossellFromProduct(
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
        id
        is_flash_sale
        special_from_date
        special_to_date
        uid
        type_id
        url_key
        crosssell_products {
            id
            uid
            name
            offers {
              id
              rule_code
              name
              description
              image
              promotion_type
            }
            special_price
            price_range {
                maximum_price {
                    discount {
                        amount_off
                        percent_off
                    }
                    final_price {
                        currency
                        value
                    }
                    regular_price {
                        currency
                        value
                    }
                }
                minimum_price {
                    discount {
                        amount_off
                        percent_off
                    }
                    final_price {
                        currency
                        value
                    }
                    regular_price {
                        currency
                        value
                    }
                }
            }
            sku
            small_image {
                url
            }
            stock_status
            type_id
            url_key
            promo
            sale
        }
      }
    }
  }
`),
);

export const GET_PRODUCT_REVIEWS = gql(
  filterGraphql(`
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
`),
);

export const ADD_PRODUCT_REVIEW = gql(
  filterGraphql(`
  mutation addProductReview($input: ReviewInput!) {
    addProductReview(input: $input) {
      items {
        id
        entity_pk_value
        nickname
        detail
        ratings {
          rating_name
          value
          percent
        }
      }
    }
  }
`),
);
