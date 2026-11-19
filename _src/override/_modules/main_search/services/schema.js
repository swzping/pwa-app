import {gql} from '@apollo/client';
import {filterGraphql} from '@app/services/helper';
import {modules} from '@root/swift.config';

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

export const GET_AUTOCOMPLETE_RESULT = gql(
  filterGraphql(`
    query getAutocompleteResults($search: String!) {
      products(search: $search, currentPage: 1, pageSize: ${modules.main_search.config.show_product_limit}) {
        aggregations {
          label
          count
          attribute_code
          options {
            label
            value
          }
        }
        items {
          id
          name
          small_image {
            url
          }
          sku
          url_key
          url_suffix
          sale
          ${price_range}
          price {
            regularPrice {
              amount {
                value
                currency
              }
            }
          }
        }
        page_info {
          total_pages
        }
        total_count
      }
    }
  `),
);

export const GET_RECENT_SEARCHES = gql`
  query getRecentSearches($limit: Int) {
    searchBlockEnhancement {
      recent_searches(limit: $limit) {
        keyword
        updated_at
      }
    }
  }
`;

export const GET_HOT_KEYWORDS = gql`
  query getHotKeywords($limit: Int) {
    searchBlockEnhancement {
      hotKeywords(limit: $limit) {
        query_text
        num_results
        popularity
        redirect_url
        display_in_terms
        is_hot_keyword
        label
        __typename
      }
    }
  }
`;

export const CLEAR_RECENT_SEARCHES = gql`
  mutation clearRecentSearches {
    clearRecentSearches {
      success
      message
    }
  }
`;

export const GET_TOP_BRANDS = gql`
  query getTopBrands($limit: Int) {
    searchBlockEnhancement {
      topBrands(limit: $limit) {
        brand_url
        logo_url
        position
        label
        __typename
      }
    }
  }
`;
